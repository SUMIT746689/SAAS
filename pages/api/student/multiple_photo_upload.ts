import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma_client';
import { patch } from 'controllers/users/user/patch';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function multiplePhotoUpoad(req, res, refresh_token) {
  const { method } = req;
  switch (method) {
    case 'PATCH':
      const customOptions = {
        keepExtensions: true,
        allowEmptyFiles: false,
        maxFileSize: 2 * 1024 * 1024 ///  1
      };

      const form = new formidable.IncomingForm(customOptions);
      const uploadFolderName = 'studentsPhoto';
      form.uploadDir = path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName);
      form.keepExtensions = true;

      form.parse(req, async (err, fields, files) => {
        const checkError = err?.message?.includes('maxFileSize');

        if (checkError) {
          return res.status(500).json({ error: 'File size exceeds 2 MB' });
        }

        if (err) {
          return res.status(500).json({ error: 'File upload error' });
        }
        let file_arr = [];
        let studnetIdArr = [];
        for (let key in files) {
          // file = files[key];
          file_arr.push(files[key]);
          studnetIdArr.push(key);
        }

        if (file_arr.length === 0) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check file extension
        const validExtensions = ['jpeg', 'jpg', 'png'];

        const photoUploadResponseArr = file_arr.map(async (file, i) => {
          return new Promise(async (resolve, reject) => {
            try {
              const originalFilename = file.originalFilename;
              const fileExtension = originalFilename.split('.').pop().toLowerCase();
              if (!validExtensions.includes(fileExtension)) {
                // return res.status(400).json({ error: 'Invalid file type' });
                reject(new Error(`Invalid file type`));
              }

              const oldPath = `${file.filepath}`;
              const newFilename = `${file.newFilename}.${fileExtension}`;
              const newPath = path.join(form.uploadDir, newFilename);
              fs.renameSync(oldPath, newPath);

              const data: { url: string; studentId?: string } = {
                url: `${uploadFolderName}/${file.newFilename}.${fileExtension}`
              };

              let personObj = {
                student_photo: false,
                guardian_photo: false,
                father_photo: false,
                mother_photo: false,
                studentId: null
              };

              Object.keys(fields).forEach((key) => {
                data[key] = fields[key];
                personObj = {
                  ...personObj,
                  [key]: fields[key] === 'true'
                };
                data.studentId = studnetIdArr[i];
              });

              // target user
              const targetUser = await prisma.student.findFirst({
                where: { student_information_id: parseInt(data?.studentId) },
                include: {
                  student_info: true
                }
              });

              let photo_url;
              for (let key in fields) {
                if (key === 'student_photo') {
                  photo_url = targetUser?.student_photo;
                }
                if (key === 'guardian_photo') {
                  photo_url = targetUser?.guardian_photo;
                }
                if (key === 'father_photo') {
                  photo_url = targetUser?.student_info?.father_photo;
                }
                if (key === 'mother_photo') {
                  photo_url = targetUser?.student_info?.mother_photo;
                }
              }

              const filePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, `${photo_url}`);

              const res = await prisma.student.update({
                // old
                //  where: { id: parseInt(data?.studentId) },
                // update
                where: { id: targetUser.id },

                data: {
                  student_photo: personObj?.student_photo ? data.url : undefined,
                  guardian_photo: personObj?.guardian_photo ? data.url : undefined,
                  student_info: {
                    update: {
                      data: {
                        father_photo: personObj?.father_photo ? data.url : undefined,
                        mother_photo: personObj?.mother_photo ? data.url : undefined
                      }
                    }
                  }
                }
              });
              if (res) {
                fs.unlink(filePath, (err) => {
                  if (err) console.log('user_photo deletion failed');
                  else console.log('user_photo deleted');
                });

                resolve(res);
              } else {
                reject(new Error(`Upload Failed`));
              }
            } catch (err) {
              reject(new Error(`${err.message}`));
            }
          });
        });

        try {
          const results = await Promise.all(photoUploadResponseArr);
          if (results) {
            res.status(200).json({ message: `images updated successfully`, results });
          } else {
            throw new Error('Something went wrong!');
          }
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      });

      break;
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      logFile.error(`Method ${method} Not Allowed`);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
