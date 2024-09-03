import bcrypt from 'bcrypt';
import { authenticate } from 'middleware/authenticate';
import prisma from '@/lib/prisma_client';
import fs from 'fs';

import { fileDelete, fileRename, fileUpload } from '@/utils/upload';
import { logFile } from 'utilities_api/handleLogFile';
import { handleConvBanNum } from 'utilities_api/convertBanFormatNumber';
import { verifyNumeric } from 'utilities_api/verify';

const patchHandle = async (req, res, authenticate_user) => {
    try {
        const student_id = parseInt(req.query.id)

        const uploadFolderName = 'studentsPhoto';

        const fileType = ['image/jpeg', 'image/jpg', 'image/png'];
        const filterFiles = {
            logo: fileType,
            signature: fileType,
            background_image: fileType,
        }

        const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName });

        if (
            !fields.first_name ||
            !fields.section_id ||
            !fields.admission_date ||
            // !fields.date_of_birth ||
            !fields.roll_no ||
            !fields.registration_no ||
            !fields.school_id ||
            !fields.academic_year_id ||
            !fields.phone
        ) {
            removeFiles(files);
            throw new Error('Required field value missing !!')
        }

        const isNumber = verifyNumeric(fields.phone);
        if (!isNumber) {
            removeFiles(files);
            throw new Error('number filed only numbers allowed')
        };
        const { number, err } = handleConvBanNum(fields.phone);
        if (err) {
            removeFiles(files)
            throw new Error(err)
        }
        fields.phone = number;

        if (fields.father_phone) {
            const isNumber = verifyNumeric(fields.father_phone);
            if (!isNumber) {
                removeFiles(files);
                throw new Error('number field only numbers allowed')
            };
            const { number, err } = handleConvBanNum(fields.father_phone);
            if (err) {
                removeFiles(files)
                throw new Error('father phone field: ' + err)
            }
            fields.father_phone = number;
        }
        if (fields.mother_phone) {
            const isNumber = verifyNumeric(fields.mother_phone);
            if (!isNumber) {
                removeFiles(files);
                throw new Error('number field only numbers allowed')
            };
            const { number, err } = handleConvBanNum(fields.mother_phone);
            if (err) {
                removeFiles(files)
                throw new Error('mother phone field: ' + err)
            }
            fields.mother_phone = number;
        }

        if (fields.guardian_phone) {
            const isNumber = verifyNumeric(fields.guardian_phone);
            if (!isNumber) {
                removeFiles(files);
                throw new Error('number field only numbers allowed')
            };
            const { number, err } = handleConvBanNum(fields.guardian_phone);
            if (err) {
                removeFiles(files)
                throw new Error('guardian phone field: ' + err)
            }
            fields.guardian_phone = number;
        }


        const hashPassword = fields?.password && fields?.password != '' ? await bcrypt.hash(
            fields?.password,
            Number(process.env.SALTROUNDS)
        ) : null;

        const filePathQuery = {}

        if (files?.student_photo?.newFilename) {
            filePathQuery['student_photo_path'] = await fileRename(files,
                uploadFolderName, "student_photo",
                Date.now().toString() + '_' + files?.student_photo?.originalFilename)
        }
        if (files?.father_photo?.newFilename) {
            filePathQuery['father_photo_path'] = await fileRename(files,
                uploadFolderName, "father_photo",
                Date.now().toString() + '_' + files?.father_photo?.originalFilename)
        }
        if (files?.mother_photo?.newFilename) {
            filePathQuery['mother_photo_path'] = await fileRename(files,
                uploadFolderName, "mother_photo",
                Date.now().toString() + '_' + files?.mother_photo?.originalFilename)
        }
        if (files?.guardian_photo?.newFilename) {
            filePathQuery['guardian_photo_path'] = await fileRename(files,
                uploadFolderName, "guardian_photo",
                Date.now().toString() + '_' + files?.guardian_photo?.originalFilename)
        }

        await prisma.$transaction(async (transaction) => {


            const userUpdateQuery = {
                username: fields.username
            }
            if (hashPassword) {
                userUpdateQuery['password'] = hashPassword
            }
            //@ts-ignore
            if (filePathQuery?.student_photo_path) {
                //@ts-ignore
                userUpdateQuery['user_photo'] = filePathQuery?.student_photo_path
            }

            const studentPast = await transaction.student.findFirst({
                where: {
                    id: student_id
                },
                select: {
                    student_photo: true,
                    guardian_photo: true,
                    student_info: {
                        select: {
                            father_photo: true,
                            mother_photo: true,
                        }
                    }
                }
            })
            //@ts-ignore
            if (filePathQuery?.student_photo_path && studentPast?.student_photo) {
                fileDelete([studentPast?.student_photo])
            }//@ts-ignore
            if (filePathQuery?.father_photo_path && studentPast?.student_info?.father_photo) {
                fileDelete([studentPast?.student_info?.father_photo])
            }//@ts-ignore
            if (filePathQuery?.mother_photo_path && studentPast?.student_info?.mother_photo) {
                fileDelete([studentPast?.student_info?.mother_photo])
            }//@ts-ignore
            if (filePathQuery?.guardian_photo_path && studentPast?.guardian_photo) {
                fileDelete([studentPast?.guardian_photo])
            }
            const group = {}
            if (fields?.group_id) {
                group['group'] = {
                    connect: {
                        id: parseInt(fields?.group_id)
                    }
                }
            }

            const extra_section_datas = {}
            if (fields?.extra_section_id) {
                extra_section_datas["extra_section"] = {
                    connect: { id: parseInt(fields.extra_section_id) },
                }
            }

            // subjects 
            const { subject_ids } = fields;

            const subjects = {}
            if (subject_ids && typeof subject_ids === "string") {
                const customSubjectList = subject_ids.split(',').map(subject_id => {
                    const parseId = parseInt(subject_id)
                    if (Number.isNaN(parseId)) throw new Error("provided invalid subject id")
                    return { id: parseId }
                });
                subjects["connect"] = customSubjectList;
            };


            await transaction.student.update({
                where: {
                    id: student_id
                },
                data: {
                    // student_info: studentInformation,
                    // student_information_id: studentInformation.id,
                    class_roll_no: fields?.roll_no,
                    // academic_year_id: 1,
                    class_registration_no: fields?.registration_no,
                    //@ts-ignore
                    student_photo: filePathQuery?.student_photo_path,
                    guardian_name: fields?.guardian_name,
                    guardian_phone: fields?.guardian_phone,
                    guardian_profession: fields?.guardian_profession,
                    //@ts-ignore
                    guardian_photo: filePathQuery?.guardian_photo_path,
                    guardian_nid: fields?.guardian_nid,

                    relation_with_guardian: fields?.relation_with_guardian,
                    student_present_address: fields?.student_present_address,
                    // section: {
                    //     connect: { id: parseInt(fields?.section_id) }
                    // },
                    ...group,
                    academic_year: {
                        connect: { id: parseInt(fields?.academic_year_id) }
                    },
                    ...extra_section_datas,
                    subjects,
                    student_info: {
                        // connect: { id: studentInformation.id }
                        update: {
                            first_name: fields?.first_name,
                            middle_name: fields?.middle_name,
                            last_name: fields?.last_name,
                            admission_no: fields?.admission_no,
                            admission_date: new Date(fields?.admission_date),
                            admission_status: fields?.admission_status,
                            date_of_birth: fields?.date_of_birth ? new Date(fields?.date_of_birth) : undefined,
                            gender: fields?.gender,
                            blood_group: fields?.blood_group,
                            religion: fields?.religion,
                            phone: fields?.phone,
                            email: fields?.email,
                            national_id: fields?.national_id,

                            father_name: fields?.father_name,
                            father_phone: fields?.father_phone,
                            father_profession: fields?.father_profession,
                            //@ts-ignore
                            father_photo: filePathQuery?.father_photo_path,
                            //@ts-ignore
                            father_nid: fields?.father_nid,

                            mother_name: fields?.mother_name,
                            mother_phone: fields?.mother_phone,
                            mother_profession: fields?.mother_profession,
                            //@ts-ignore
                            mother_photo: filePathQuery?.mother_photo_path,
                            mother_nid: fields?.mother_nid,

                            student_permanent_address: fields?.student_permanent_address,
                            previous_school: fields?.previous_school,
                            student_id: fields?.student_id || undefined,
                            user: {
                                update: userUpdateQuery
                            }
                        }
                    }
                }
            });

        })

        res.status(200).json({ success: 'student updated successfully but sms sending failed' });
    } catch (err) {
        logFile.error(err.message)
        res.status(404).json({ error: err.message });
    }
};

const removeFiles = (files) => {
    for (const i in files) {
        fs.unlinkSync(files[i].filepath)
    }
}

export default authenticate(patchHandle);
