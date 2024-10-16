import { School } from './../../../src/models/user';
import { fileRename, fileUpload } from '@/utils/upload';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma_client';
import fs from 'fs';
import path from 'path';
import get from 'controllers/onlineAdmission/get';
import { logFile } from 'utilities_api/handleLogFile';

export const config = {
  api: {
    bodyParser: false
  }
};

const index = async (req, res) => {
  const filePathQuery = {};
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
        const {first_name,middle_name,last_name,classes,date_of_birth,phone,father_name,father_phn_no,mother_name,mother_phn_no,} = fields
        
        console.log({fields,cccccccccc: fields.classes})  

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
        console.log(JSON.stringify(fields,null,3))
        const parseCls = JSON.parse(fields.classes);
        await prisma.onlineAdmission.create({
          data: {
            student: {
              ...fields,
              class_name:parseCls.name,
              classes:JSON.parse(fields.classes)
              // first_name,
              // middle_name,
              // last_name,
              // classes,
              // date_of_birth,
              // phone,
              // father_name,
              // father_phn_no,
              // mother_name,
              // mother_phn_no,
              // filePathQuery
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
          message: 'Admission Application submitted !!'
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
