import { authenticate } from 'middleware/authenticate';
import path from 'path';
import { fileUpload } from '@/utils/upload';
import prisma from '@/lib/prisma_client';
import fs from 'fs';
import fsP from "fs/promises";
import { logFile } from 'utilities_api/handleLogFile';

async function put(req, res, refresh_token) {
    const uploadFolderName = "frontendPhoto";

    const fileType = ['image/jpeg', 'image/jpg', 'image/png'];
    const filterFiles = {
        gallery_image: fileType,
    }

    const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName, uniqueFileName: false });

    const allFiles = []
    try {

        if (error) throw new Error('image upload failed !')
        const { gallery_image } = files;
        const { english_content_name, bangla_content_name } = fields;
        if (!gallery_image) return res.status(404).json({ message: 'gallery image missing !!' });

        const websiteUirow = await prisma.websiteUi.findFirst({
            where: {
                school_id: refresh_token?.school_id
            },
            select: {
                id: true,
                gallery: true
            }
        })

        const query: any = { gallery: Array.isArray(websiteUirow?.gallery) ? websiteUirow?.gallery : [] };
        const imageNewName = Date.now().toString() + '_' + gallery_image.originalFilename;

        await fsP.rename(files.gallery_image.filepath, path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, imageNewName))
            .then(() => {
                const temp = path.join(uploadFolderName, imageNewName)
                allFiles.push(temp)
                query['gallery'].push({
                    id: new Date(Date.now()).getTime(),
                    number: query.gallery.length === 0 ? 1 : query.gallery[query.gallery.length - 1].number + 1,
                    originalFilename: gallery_image.originalFilename,
                    url: temp,
                    english_content_name,
                    bangla_content_name,
                    created_at: new Date(Date.now()),

                })
            })
            .catch(err => {
                console.log("error____", err);
                const temp = path.join(uploadFolderName, gallery_image?.newFilename)
                allFiles.push(temp)
                query['gallery'].push({
                    id: new Date(Date.now()).getTime(),
                    number: query.gallery.length === 0 ? 1 : query.gallery[query.gallery.length - 1].number + 1,
                    originalFilename: gallery_image.originalFilename,
                    url: temp,
                    english_content_name,
                    bangla_content_name,
                    created_at: new Date(Date.now()),
                })
            })

        if (!websiteUirow) {
            await prisma.websiteUi.create({
                data: {
                    eiin_number: query?.eiin_number || '',
                    ...query,
                }
            });

            return res.status(200).json({ "message": "gallery image added successfully" })
        }

        await prisma.websiteUi.update({
            where: { id: websiteUirow.id },
            data: query
        })
        res.status(200).json({ message: 'Gallery iamge updated !' });

    } catch (error) {
        console.log("error__", error);
        for (const i of allFiles) {
            const filePath = path.join(process.cwd(), i)
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        }
        logFile.error(error.message)
        res.status(404).json({ Error: error.message });
    }
}
export default authenticate(put);