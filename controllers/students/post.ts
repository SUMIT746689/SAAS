import bcrypt from 'bcrypt';
import { authenticate } from 'middleware/authenticate';
import path from 'path';
import fsp from 'fs/promises';
import axios from 'axios';
import prisma from '@/lib/prisma_client';
import fs from 'fs';

import { fileRename, fileUpload } from '@/utils/upload';
import { logFile } from 'utilities_api/handleLogFile';
import { verifyNumeric } from 'utilities_api/verify';
import { handleConvBanNum } from 'utilities_api/convertBanFormatNumber';

const postHandle = async (req, res, refresh_token) => {
  try {
    if (!refresh_token?.school_id) throw new Error('permission denied');
    const { admin_panel_id } = refresh_token;
    const subscription = await prisma.subscription.findFirstOrThrow({
      where: {
        AND: [
          { school_id: parseInt(refresh_token.school_id) },
          { is_active: true }
        ]
      },
      include: { package: true }
    });

    const studentCount = await prisma.student.count({
      where: {
        student_info: { school_id: parseInt(refresh_token.school_id) }
      }
    });

    if (studentCount >= subscription?.package?.student_count) throw new Error('Your package maximum students capacity has already been filled, please update your package');

    const uploadFolderName = 'studentsPhoto';

    const fileType = ['image/jpeg', 'image/jpg', 'image/png'];
    const filterFiles = {
      logo: fileType,
      signature: fileType,
      background_image: fileType,
    }

    const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName });

    console.log({ files, fields });

    if (error) {
      throw new Error('Server Error !')
    }
    const filePathQuery = fields?.filePathQuery ? JSON.parse(fields?.filePathQuery) : {}

    for (let i in filePathQuery) {
      const oldPath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, filePathQuery[i]);
      const newPath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, filePathQuery[i]?.substring(filePathQuery[i].indexOf('\\') + 1))
      console.log({ oldPath, newPath });

      fs.rename(oldPath, newPath, (err) => {
        if (err) throw err
        console.log('Successfully moved file!')
      })
    }
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
    console.log({ filePathQuery });

    if (
      !fields.first_name ||
      !fields.class_id ||
      !fields.section_id ||
      !fields.password ||
      // !fields.admission_date ||
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

    const hashPassword = await bcrypt.hash(
      fields?.password,
      Number(process.env.SALTROUNDS)
    );
    const account = await prisma.accounts.findFirstOrThrow({
      where: {
        school_id: refresh_token?.school_id
      },
      select: {
        id: true,
        payment_method: {
          take: 1
        }
      }
    })
    const account_id = account?.id
    const payment_method_id = account?.payment_method[0]?.id
    if (!payment_method_id) throw new Error('Payment method not added')

    await prisma.$transaction(async (transaction) => {

      const student_role = await transaction.role.findFirst({
        where: {
          title: 'STUDENT'
        }
      })
      const studentInformation = await transaction.studentInformation.create({
        // @ts-ignore
        data: {
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
          phone: fields.phone,
          email: fields?.email,
          national_id: fields?.national_id,
          student_id: fields?.student_id || undefined,

          father_name: fields?.father_name,
          father_phone: fields?.father_phone,
          father_profession: fields?.father_profession,
          father_nid: fields?.father_nid,
          // @ts-ignore
          father_photo: filePathQuery?.father_photo_path,
          mother_name: fields?.mother_name,
          mother_phone: fields?.mother_phone,
          mother_profession: fields?.mother_profession,
          // @ts-ignore
          mother_photo: filePathQuery?.mother_photo_path,
          mother_nid: fields?.mother_nid,

          student_permanent_address: fields?.student_permanent_address,
          previous_school: fields?.previous_school,
          card_no: fields?.card_no || undefined,

          school: {
            connect: { id: parseInt(fields.school_id) }
          },
          user: {
            create: {
              username: fields.username,
              password: hashPassword,
              // @ts-ignore
              user_photo: filePathQuery?.student_photo_path,
              user_role: { connect: { id: student_role.id } },
              role: { connect: { id: student_role.id } },
              school: { connect: { id: parseInt(fields.school_id) } },
              adminPanel: { connect: { id: admin_panel_id } }
            }
          }
        }
      });
      const group = {}
      if (fields?.group_id) group['group'] = {
        connect: {
          id: parseInt(fields?.group_id)
        }
      }
      const extra_section = {};
      if (fields?.extra_section_id) extra_section['extra_section'] = {
        connect: { id: parseInt(fields?.extra_section_id) }
      };

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

      const student = await transaction.student.create({
        data: {
          class_roll_no: fields?.roll_no,
          class_registration_no: String(fields?.registration_no),
          // @ts-ignore
          student_photo: filePathQuery?.student_photo_path,
          guardian_name: fields?.guardian_name,
          guardian_phone: fields?.guardian_phone,
          guardian_profession: fields?.guardian_profession,
          // @ts-ignore
          guardian_photo: filePathQuery?.guardian_photo_path,
          guardian_nid: filePathQuery?.guardian_nid,

          relation_with_guardian: fields?.relation_with_guardian,
          student_present_address: fields?.student_present_address,

          ...group,
          ...extra_section,
          subjects,
          // section: {
          //   connect: { id: parseInt(fields?.section_id) }
          // },
          batches: {
            connect: { id: parseInt(fields?.section_id) }
          },
          class: {
            connect: { id: parseInt(fields?.class_id) }
          },
          academic_year: {
            connect: { id: parseInt(fields?.academic_year_id) }
          },
          student_info: {
            connect: { id: studentInformation.id }
          }
        }
      });

    });

    const sms_res_gatewayinfo: any = await prisma.smsGateway.findFirst({
      where: {
        school_id: refresh_token?.school_id,
        is_active: true
      }
    })

    try {
      const sms_res = await axios.post(`https://${sms_res_gatewayinfo?.details?.sms_gateway}/smsapi?api_key=${sms_res_gatewayinfo?.details?.sms_api_key}&type=text&contacts=${fields?.phone}&senderid=${sms_res_gatewayinfo?.details?.sender_id}&msg=${encodeURIComponent(`Dear ${fields.first_name}, Your username: ${fields.username} and password: ${fields.password}`)}`)

      if (sms_res.data == 1015) {
        return res.status(200).json({ success: 'student created successfully but sms sending failed' });
      }
      else if (sms_res.data.startsWith('SMS SUBMITTED')) {
        return res.status(200).json({ success: 'student created successfully' });
      }
      else {
        return res.status(200).json({ success: 'student created successfully' });
      }

    } catch (err) {
      res.status(200).json({ success: 'student created successfully but sms sending failed' });
    }

    // res.status(200).json({ success: 'student created successfully but sms sending failed' });
  } catch (err) {
    logFile.error(err.message)
    
    if(err.message.includes('Unique constraint failed on the constraint: `student_informations_student_id_school_id_key`')){
      return res.status(404).json({error:"Student id is already used, use a unique student id"})
    }
    if(err.message.includes('`students_class_registration_no_key`')){
      return res.status(404).json({error:"Student registration number is already used, use a unique class registration number"})
    }
    logFile.error(err.message)
    res.status(404).json({ error: err.message });
  }
};

const removeFiles = (files) => {
  for (const i in files) {
    fs.unlinkSync(files[i].filepath)
  }
}

export default authenticate(postHandle);
