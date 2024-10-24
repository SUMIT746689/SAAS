import { authenticate } from 'middleware/authenticate';
import { certificateTemplateFolder, fileUpload } from '@/utils/upload';
import fs from 'fs';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';
async function post(req, res, refresh_token) {
  try {
    const uploadFolderName = "programs_page";
    await certificateTemplateFolder(uploadFolderName);
    const fileType = ['image/jpeg', 'image/jpg', 'image/png'];
    const filterFiles = {
      banner_photo: fileType,
    }
    const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName });
    if (files && (error)) for (const [key, value] of Object.entries(files)) {
      // @ts-ignore
      fs.unlink(value.filepath, (err) => { if (err) console.log({ err }) })
    };
    if (error) throw new Error(error);
    const notFoundFiles = [];
    console.log("...........fields",{fields})
    const { title, body, banner_photo } = fields;
    if (!title || !banner_photo || !body) throw new Error('provide all required fields')
    const response = await prisma.program.create({
      data: {
        title,
        body,
        banner_photo: files['banner_photo'] ? `${uploadFolderName}/${files['banner_photo'].newFilename}` : undefined,
        school_id: refresh_token.school_id
      }
    })
    res.json({ data: response, success: true });
    console.log("response............" , {response})
  } catch (err) {
    logFile.error(err.message)
    console.log({ err: err.message });
    res.status(404).json({ error: err.message });
  }
}
export default authenticate(post)


