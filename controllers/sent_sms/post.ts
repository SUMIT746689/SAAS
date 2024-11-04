import prisma from '@/lib/prisma_client';
import { Prisma } from '@prisma/client';
import { authenticate } from 'middleware/authenticate';
import { createCampaign, getUsers, sentSms } from './postContent/postContent';
import { logFile } from 'utilities_api/handleLogFile';
import { verifyIsMasking, verifyIsUnicode } from 'utilities_api/verify';
import { handleNumberOfSmsParts } from 'utilities_api/handleNoOfSmsParts';
async function post(req, res, refresh_token) {
  try {
    const { sms_gateway_id, campaign_name, recipient_type, role_id, class_id, section_id, name_ids: individual_user_ids, body: custom_body, sms_template_id } = req.body;
    const { school_id, id } = refresh_token;
    if (!sms_gateway_id || !recipient_type || !custom_body) throw new Error("required valid datas")

    const data = {
      sms_gateway_id,
      school: { connect: { id: refresh_token.school_id } }
    }

    // response from sms gateway response
    const smsGatewayRes = prisma.smsGateway.findFirst({ where: { school_id: school_id, id: sms_gateway_id } })

    // school information
    const schoolInfoRes = prisma.school.findFirst({ where: { id: school_id }, select: { name: true } })

    // school information
    const userRes = prisma.user.findFirst({ where: { id: parseInt(id) }, select: { username: true } })

    const resQueries = await Promise.all([smsGatewayRes, schoolInfoRes, userRes])

    const { details }: any = resQueries[0];
    const { sender_id, sms_api_key: api_key, is_masking } = details ?? {};
    if (!sender_id && !api_key) throw new Error("sender_id or api_key missing");

    const date = Date.now();
    const sms_shoot_id = String(id) + "_" + String(date)
    const { name: school_name } = resQueries[1];
    const { username } = resQueries[2];

    const isUnicode = verifyIsUnicode(custom_body || '');

    const number_of_sms_parts = handleNumberOfSmsParts({ isUnicode, textLength: custom_body.length })

    const sentSmsData = {
      sms_shoot_id,
      school_id,
      school_name,
      user_id: id,
      user_name: username,
      sender_id: sms_gateway_id,
      sender_name: sender_id,
      pushed_via: "gui",
      sms_type: isUnicode ? 'unicode' : 'text',
      sms_text: custom_body,
      submission_time: new Date(),
      sms_gateway_status: "pending",
      number_of_sms_parts
      // campaign_id,
      // campaign_name,
    }

    switch (recipient_type) {
      case "GROUP":
        if (!role_id) throw new Error("permission denied");

        const roles = await prisma.role.findMany({ where: { id: { in: role_id } }, select: { title: true, id: true } })

        // const roleArray = [];
        // get users persmissions
        // const user = await prisma.user.findFirst({ where: { id: refresh_token.id }, select: { role: { select: { permissions: { select: { value: true } } } }, permissions: { select: { value: true } } } })
        //get permissions
        // const permissions = user.role?.permissions ? user.role.permissions : user.permissions;

        // check user have that permission or not
        // const some = permissions.some(permission => permission.value === `create_${ role?.title?.toLowerCase() || '' } `)

        // if (!some) throw new Error("permissions denied");

        if (!Array.isArray(roles) || roles.length <= 0) throw new Error("Invalid role");

        const contactsArr = [];
        for (const role of roles) {

          let singleGroupUsers = null;

          //get users for sending sms 
          singleGroupUsers = await getUsers({ where: { school_id: Number(school_id), NOT: { phone: null } }, role })
          if (!singleGroupUsers || singleGroupUsers.length === 0) continue;

          const contacts_ = [];
          singleGroupUsers.array.forEach(user => {
            const isMasking = verifyIsMasking(user.phone);
            if (typeof verifyIsMasking(user.phone) === 'boolean' && !isMasking) {
              const updatePhoneNumber = user.phone.length === 11 ? 88 + user.phone : user.phone;
              contacts_.push(updatePhoneNumber);
            }
          });

          contactsArr.push(...contacts_);
        };

        const contacts = contactsArr.join(',');

        sentSmsData["contacts"] = contacts;
        sentSmsData["total_count"] = contactsArr.length;

        break;

      case "CLASS":

        const sections = section_id.join(", ");

        const resUsers: [{ phone: string }] | [] = await prisma.$queryRaw`
          SELECT student_informations.phone as phone FROM students
          JOIN student_informations ON student_informations.id = students.student_information_id
          JOIN sections ON students.section_id = sections.id
          WHERE class_id = ${class_id} AND school_id = ${refresh_token.school_id} AND phone IS NOT null
          ${(Array.isArray(section_id) && section_id.length > 0) ? Prisma.sql`AND section_id IN (${sections})` : Prisma.empty}
        `
        if (resUsers.length === 0) throw new Error("No user founds");

        const classContacts_ = [];
        resUsers.forEach(user => {
          const isMasking = verifyIsMasking(user.phone);
          if (typeof verifyIsMasking(user.phone) === 'boolean' && !isMasking) {
            const updatePhoneNumber = user.phone.length === 11 ? 88 + user.phone : user.phone;
            classContacts_.push(updatePhoneNumber);
          }
        });

        // contactsArr.push(...contacts_);

        sentSmsData["contacts"] = classContacts_.join(',');
        sentSmsData["total_count"] = resUsers.length;

        break;

      case "INDIVIDUAL":

        const role = await prisma.role.findFirstOrThrow({ where: { id: req.body.role_id } });
        const resIndividualUsers = await getUsers({ where: { school_id: Number(refresh_token.school_id), NOT: { phone: null }, user: { id: { in: individual_user_ids } } }, role })

        if (resIndividualUsers.length === 0) throw new Error("No contacts founds")

        const indContacts_ = [];
        resIndividualUsers.forEach(user => {
          const isMasking = verifyIsMasking(user.phone);
          if (typeof verifyIsMasking(user.phone) === 'boolean' && !isMasking) {
            const updatePhoneNumber = user.phone.length === 11 ? 88 + user.phone : user.phone;
            indContacts_.push(updatePhoneNumber);
          }
        });

        sentSmsData["contacts"] = indContacts_.join(',');
        sentSmsData["total_count"] = resIndividualUsers.length;

        break;

      default:
        throw new Error("invalid recipient type ");
    }

    // insert sent sms in sentsms table   
    await createCampaign({ recipient_type, campaign_name, sms_template_id, sms_gateway_id, school_id: refresh_token.school_id, custom_body });

    // users sending sms handle 
    sentSms(sentSmsData, is_masking);

    // throw new Error("invalid recipient type ")
    return res.json({ message: 'success' });

  } catch (err) {
    logFile.error(err.message)
    console.log({ err: err.message })
    res.status(404).json({ error: err.message });
  }
}

export default authenticate(post)