import { authenticate } from 'middleware/authenticate';
import { certificateTemplateFolder, fileUpload } from '@/utils/upload';
import fs from 'fs';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';

async function post(req, res, refresh_token) {
  try {
    const uploadFolderName = "website_dynamic_pages";

    await certificateTemplateFolder(uploadFolderName);

    const fileType = ['image/jpeg', 'image/jpg', 'image/png'];
    const filterFiles = {
      feature_photo: fileType,
    }

    const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName });

    const { feature_photo } = files;

    if (files && (error)) for (const [key, value] of Object.entries(files)) {
      // @ts-ignore
      fs.unlink(value.filepath, (err) => { if (err) console.log({ err }) })
    };

    if (error) throw new Error(error);
    const notFoundFiles = [];

    //fields checks 
    const { english_title, bangla_title, english_description, bangla_description, status } = fields;
    if (!english_title || !bangla_title || !english_description || !bangla_description || !status) throw new Error('provide all required fields')

    const response = await prisma.websiteDynamicPage.create({
      data: {
        english_title,
        bangla_title,
        english_description,
        bangla_description,
        feature_photo: files['feature_photo'] ? `${uploadFolderName}/${files['feature_photo'].newFilename}` : undefined,
        status,
        school_id: refresh_token.school_id
      }
    })

    res.json({ data: response, success: true });

  } catch (err) {
    logFile.error(err.message)
    console.log({ err: err.message });
    res.status(404).json({ error: err.message });
  }
}

export default authenticate(post)