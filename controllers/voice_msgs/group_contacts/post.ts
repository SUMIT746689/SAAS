import prisma from '@/lib/prisma_client';
import { certificateTemplateFolder, fileUpload } from '@/utils/upload';
import { Prisma } from '@prisma/client';
import { getUsers } from 'controllers/sent_sms/postContent/postContent';
import { readFileSync } from 'fs';
import { authenticate } from 'middleware/authenticate';
import path from 'path';
import { handleConvBanNum } from 'utilities_api/convertBanFormatNumber';
import { handleGetFileDuration } from 'utilities_api/fileDuration';
import { handleDeleteFile } from 'utilities_api/handleDeleteFiles';
import { logFile } from 'utilities_api/handleLogFile';

async function post(req, res, refresh_token) {
    let voice_file_path;
    try {

        const { id: auth_user_id, name: auth_user_name, school_id } = refresh_token;
        if (!school_id) throw new Error("Invalid User");

        const uploadFolderName = "voice_templates";

        await certificateTemplateFolder(uploadFolderName);

        const fileType = ['audio/wav', 'audio/x-wav'];

        const filterFiles = {
            voice_file: fileType,
        }

        const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName });

        if (files && error) {
            // @ts-ignore
            for (const [key, value] of Object.entries(files)) fs.unlink(value.filepath, (err) => { if (err) logFile.error(err) })
        }
        if (error) throw new Error(error);

        const { gateway_id, recipient_type, role_id, section_id, class_id } = fields;
        const { voice_file } = files;

        if (!gateway_id || !recipient_type || !voice_file) throw new Error("provide all required datas");
        voice_file_path = voice_file.filepath;


        const findGateway = await prisma.voiceGateway.findFirst({ where: { id: parseInt(gateway_id), school_id }, select: { details: true } });

        //@ts-ignore
        if (!findGateway || !findGateway?.details?.sender_id) throw new Error("sms gateway/serder_id not founds")

        const { details: { sender_id } }: any = findGateway

        const formData = new FormData();
        const blob = new Blob([readFileSync(voice_file.filepath)]);

        // voice file duration 
        const [duration, durationErr] = await handleGetFileDuration(voice_file_path);

        if (durationErr) throw new Error(durationErr);

        const dateNow = new Date()
        const createUniqueMagId = String(auth_user_id) + String(dateNow.getTime());

        const role_ids = role_id.split(',').map(str => Number(str))

        const finalContacts = await handleGetContact({ recipient_type, role_id: role_ids, school_id, section_id, class_id });

        if (finalContacts.length === 0) throw new Error("no valid contact founds");

        const total_contact_count = finalContacts.length;

        // get school voice transactions datas
        const respVoiceSmsPrices = await prisma.school.findFirst({ where: { id: school_id }, select: { voice_sms_balance: true, voice_sms_price: true, voice_pulse_size: true } });
        if (!respVoiceSmsPrices.voice_sms_price || !respVoiceSmsPrices.voice_pulse_size) throw new Error(' voice sms price / voice pulse size not founds ');

        const number_of_sms_pulses = respVoiceSmsPrices.voice_pulse_size >= duration ? 1 : Math.ceil(duration / respVoiceSmsPrices.voice_pulse_size);

        const calculateTotalVoiceSmsPrice = number_of_sms_pulses * respVoiceSmsPrices.voice_sms_price * finalContacts.length;

        // check balance availability  
        if (respVoiceSmsPrices.voice_sms_balance < calculateTotalVoiceSmsPrice) throw new Error(" balance insufficient")

        const respCreateVoiceSms = await prisma.tbl_sent_voice_sms.create({
            data: {
                message_id: createUniqueMagId,
                send_by_user_id: auth_user_id,
                send_by_user_name: auth_user_name,
                voice_url: path.join(uploadFolderName, voice_file?.newFilename),
                contacts: finalContacts.join(','),
                sender_id,
                pushed_via: "group_contact",
                // is_masking,
                voice_duration: duration,
                status: 2,
                school_id,
                pulse_size: respVoiceSmsPrices.voice_pulse_size,
                charges_per_pulses: respVoiceSmsPrices.voice_sms_price,
                number_of_sms_pulses,
                total_count: finalContacts.length
            }
        });

        formData.set("message_id", createUniqueMagId)
        formData.set("receivers", finalContacts.join(','))
        formData.set("total_contact_count", String(total_contact_count))
        formData.set("type", total_contact_count > 1 ? "single" : "group")

        formData.set("audio_file", blob, voice_file.newFilename)
        formData.set("duration", String(duration))
        // formData.set("sender_id", "8809677602858")
        formData.set("sender_id", sender_id)
        formData.set("base_url", process.env.base_url)

        let respJson;
        let errResp;
        const resp = await fetch(process.env.voice_sms_api,
            {
                headers: { 'Authorization': 'Bearer PktcjYCSqYgM6zR1uhozUmd0unVr5LnB' },
                method: "POST",
                body: formData,
            }
        ).then(async res => {
            respJson = await res.json()
        }).catch(err => {
            errResp = err.message
        })

        // update voice sms data
        await prisma.tbl_sent_voice_sms.update({
            where: { id: respCreateVoiceSms.id },
            data: {
                status: respJson?.code === 200 ? 0 : 3,
                logs: respJson?.data || errResp,
                updated_at: new Date(),
            }
        });

        if (respJson?.code !== 200) {
            voice_file_path = null;
            throw new Error(respJson?.data || errResp);
        }

        // school cut voice price and add transaction table for tracking
        const resUpdateSchool = await prisma.school.update({
            where: { id: school_id },
            data: {
                voice_sms_balance: { decrement: calculateTotalVoiceSmsPrice },
            }
        });

        await prisma.smsTransaction.create({
            data: {
                user_id: auth_user_id,
                user_name: auth_user_name,
                voice_sms_balance: resUpdateSchool.voice_sms_balance,
                prev_voice_sms_balance: respVoiceSmsPrices.voice_sms_balance,
                is_voice: true,
                pushed_via: "gui voice group contact",
                school_id
            }
        })


        return res.json({ data: respJson.data, success: true });

    } catch (err) {
        if (voice_file_path) handleDeleteFile(voice_file_path)
        logFile.error(err.message)
        res.status(404).json({ error: err.message });
    }
}

export default authenticate(post);


const handleGetContact = async ({ recipient_type, role_id, school_id, section_id, class_id }) => {
    const contactsArr = [];
    try {
        switch (recipient_type) {
            case "GROUP":
                if (!role_id) throw new Error("permission denied");

                const roles = await prisma.role.findMany({ where: { id: { in: role_id } }, select: { title: true, id: true } })

                if (!Array.isArray(roles) || roles.length <= 0) throw new Error("Invalid role");

                for (const role of roles) {

                    let singleGroupUsers = null;

                    //get users for sending sms 
                    singleGroupUsers = await getUsers({ where: { school_id: Number(school_id), NOT: { phone: null } }, role })
                    if (!singleGroupUsers || singleGroupUsers.length === 0) continue;

                    const contacts_ = [];
                    singleGroupUsers.forEach(user => {
                        const { number, err } = handleConvBanNum(user.phone);
                        if (err) return;
                        contacts_.push(number);
                    });

                    contactsArr.push(...contacts_);
                };
                return contactsArr;
                break;

            case "CLASS":

                const resUsers: [{ phone: string }] | [] = await prisma.$queryRaw`
                    SELECT student_informations.phone as phone FROM students
                    JOIN student_informations ON student_informations.id = students.student_information_id
                    JOIN sections ON students.section_id = sections.id
                    WHERE class_id = ${class_id} AND school_id = ${school_id} AND phone IS NOT null
                    ${section_id ? Prisma.sql`AND section_id IN (${section_id})` : Prisma.empty}
                  `
                // ${(Array.isArray(section_id) && section_id.length > 0) ? Prisma.sql`AND section_id IN (${sections})` : Prisma.empty}
                if (resUsers.length === 0) throw new Error("No user founds");

                const classContacts_ = [];
                resUsers.forEach(user => {
                    const { number, err } = handleConvBanNum(user.phone);
                    if (err) return;
                    classContacts_.push(number);
                });

                contactsArr.push(...classContacts_);
                return contactsArr;
                break;
            default:
                throw new Error("invalid recipient type ");
        }
    } catch (err) {
        logFile.error(err.message)
        console.log({ err: err.message })
        return contactsArr
    }
}