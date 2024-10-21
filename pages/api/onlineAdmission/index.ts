import { School } from './../../../src/models/user';
import { fileRename, fileUpload } from '@/utils/upload';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma_client';
import fs from 'fs';
import path from 'path';
import get from 'controllers/onlineAdmission/get';
import { logFile } from 'utilities_api/handleLogFile';
import generateUsername from '@/utils/generateUsername';

export const config = {
  api: {
    bodyParser: false
  }
};

const index = async (req, res) => {
  const filePathQuery:any = {};
  try {
    const { method } = req;
    switch (method) {
      case 'GET':
        get(req, res);
        break;
      case 'POST':
        const reqDomain = new URL(req.headers.origin).host;

        const school = await prisma.school.findFirst({
          where: {
            domain: reqDomain
          },
          select: {
            id: true
          }
        });
        if (!school) {
          throw new Error('Bad request !');
        }
        const uploadFolderName = 'onlineAdmission';

        const fileType = ['image/jpeg', 'image/jpg', 'image/png'];
        const filterFiles = {
          logo: fileType,
          signature: fileType,
          background_image: fileType
        };
        const { files, fields, error } = await fileUpload({
          req,
          filterFiles,
          uploadFolderName
        });
        const { first_name, middle_name, last_name, classes, date_of_birth, phone, father_name, father_phn_no, mother_name, mother_phn_no } = fields;

        const domain = req.rawHeaders[req.rawHeaders.indexOf('origin') + 1];
        const finalDomain = domain.replace(/(https:\/\/|http:\/\/)/, "");

        console.log({ domain, finalDomain });

        const resSchool = await prisma.school.findFirst({
          where: {
            domain: finalDomain
          },
          select: {
            academic_years: {
              where: { curr_active: true }
            }
          }
        });

        console.log('ggggggggggg', JSON.stringify(resSchool, null, 3));
        console.log('files', JSON.stringify(files, null, 3));

        const username = await generateUsername(first_name);


        if (error) {
          throw new Error('Server Error !');
        }

        if (files?.student_photo?.newFilename) {
          filePathQuery['student_photo_path'] = await fileRename(
            files,
            uploadFolderName,
            'student_photo',
            Date.now().toString() + '_' + files?.student_photo?.originalFilename
          );
        }
        if (files?.father_photo?.newFilename) {
          filePathQuery['father_photo_path'] = await fileRename(
            files,
            uploadFolderName,
            'father_photo',
            Date.now().toString() + '_' + files?.father_photo?.originalFilename
          );
        }
        if (files?.mother_photo?.newFilename) {
          filePathQuery['mother_photo_path'] = await fileRename(
            files,
            uploadFolderName,
            'mother_photo',
            Date.now().toString() + '_' + files?.mother_photo?.originalFilename
          );
        }
        if (files?.guardian_photo?.newFilename) {
          filePathQuery['guardian_photo_path'] = await fileRename(
            files,
            uploadFolderName,
            'guardian_photo',
            Date.now().toString() +
            '_' +
            files?.guardian_photo?.originalFilename
          );
        }
        console.log(JSON.stringify(fields, null, 3))
        const parseCls = JSON.parse(fields.classes);
        const resOnlineAdd = await prisma.onlineAdmission.create({
          data: {
            student: {
              ...fields,
              class_name: parseCls.name,
              classes: JSON.parse(fields.classes),
              username,
              password: phone,
              academic_year_id: resSchool.academic_years[0].id,
              academic_year_title: resSchool.academic_years[0].title,
              student_photo_path:filePathQuery?.student_photo_path,
              father_photo_path:filePathQuery?.father_photo_path,
              mother_photo_path:filePathQuery?.mother_photo_path,
              guardian_photo_path:filePathQuery?.guardian_photo_path
            },
            school_id: school.id
          }
        });
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*'); // replace this your actual origin
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET,DELETE,PATCH,POST,PUT'
        );
        res.setHeader(
          'Access-Control-Allow-Headers',
          'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );
        res.status(200).json({
          success: true,
          message: 'Admission Application submitted !!',
          datas: resOnlineAdd
        });
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        logFile.error(`Method ${method} Not Allowed`);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    for (const i in filePathQuery) {
      fs.unlinkSync(path.join(process.cwd(), filePathQuery[i]));
    }
    console.log(err);
    logFile.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default index;
