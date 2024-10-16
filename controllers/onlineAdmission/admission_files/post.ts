import { authenticate } from 'middleware/authenticate';
import path from 'path';
import { fileUpload } from '@/utils/upload';
import prisma from '@/lib/prisma_client';
import fs from 'fs';
import { logFile } from 'utilities_api/handleLogFile';
const post = async (req: any, res: any, refresh_token) => {
    try {
        if (!refresh_token.school_id) throw new Error('permission denied');
        const uploadFolderName = "online_admission";
        const { id, school_id } = refresh_token;
        console.log({ id, school_id })

        const fileType = ['application/pdf', 'application/vnd.ms-excel'];
        const filterFiles = {
            photo: fileType,
        }

        const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName });
        if (error) throw new Error(error);

        const { studentAdmission } = files;

        if (!studentAdmission) return res.status(404).json({ message: 'file missing !!' });

        const uploadPath = path.join(uploadFolderName, studentAdmission?.newFilename);

        const resAdmissionForm = await prisma.studentAdmissionForm.findFirst({
            where: { school_id }
        });

        if (!resAdmissionForm) {
            const response = await prisma.studentAdmissionForm.create({
                data: {
                    file_url: uploadPath,
                    school_id
                }
            })
            res.status(200).json({ success: 'created successfully' });
        }


        const datas = path.join(process.cwd(), `${process.env.FILESFOLDER}`, resAdmissionForm.file_url);
        fs.unlinkSync(datas)

        

        const response = await prisma.studentAdmissionForm.update({
            where: { id: resAdmissionForm.id },
            data: {
                file_url: uploadPath
            }
        })
        if (!response) throw new Error('failed to create');
        return res.status(200).json({ success: 'added successfully' });

    } catch (err) {
        logFile.error(err.message)
        console.log(err.message);
        res.status(404).json({ err: err.message });
    }
};

export default authenticate(post);
