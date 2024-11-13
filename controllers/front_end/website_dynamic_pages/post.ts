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
    const pdfTpe = [ 'application/pdf'];
    const filterFiles = {
      feature_photo: fileType,
      pdf_url:pdfTpe
    }

    const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName });
    console.log({files})

    const { feature_photo ,pdf_url} = files;

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
        pdf_url: files['pdf_url'] ? `${uploadFolderName}/${files['pdf_url'].newFilename}` : undefined,
        status,
        school_id: refresh_token.school_id
      }
    })
    console.log({response})

    res.json({ data: response, success: true });

  } catch (err) {
    logFile.error(err.message)
    console.log({ err: err.message });
    res.status(404).json({ error: err.message });
  }
}

export default authenticate(post)