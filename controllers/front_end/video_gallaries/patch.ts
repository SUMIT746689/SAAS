import { authenticate } from 'middleware/authenticate';
import { certificateTemplateFolder, fileUpload } from '@/utils/upload';
import fs from 'fs';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';

async function post(req, res, refresh_token) {
  try {
    const id = parseInt(req.query.id);
    if (Number.isNaN(id)) throw new Error('Provide invalid id ');
    const { school_id } = refresh_token;
    const uploadFolderName = "video_gallary";

    await certificateTemplateFolder(uploadFolderName);  

    const fileType = ['image/jpeg', 'image/jpg', 'image/png'];
    const filterFiles = {
      feature_photo: fileType,
    }

    const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName });



    if (files && (error)) for (const [key, value] of Object.entries(files)) {
      // @ts-ignore
      fs.unlink(value.filepath, (err) => { if (err) console.log({ err }) })
    };

    if (error) throw new Error(error);
    const notFoundFiles = [];

    //fields checks 
    const { youtube_link, english_title, bangla_title} = fields;
    // if (!english_title || !bangla_title || !english_description || !bangla_description || !status) throw new Error('provide all required fields')

    const response = await prisma.websiteUi.update({
      where: {
        id,
        school_id
      },
      data: {
        video_gallery: [{
        youtube_link: youtube_link || undefined,
        english_title: english_title || undefined,
        bangla_title: bangla_title || undefined,
        }]
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