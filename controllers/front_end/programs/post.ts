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
    // const { banner_photo } = files;
    if (files && (error)) for (const [key, value] of Object.entries(files)) {
      // @ts-ignore
      fs.unlink(value.filepath, (err) => { if (err) console.log({ err }) })
    };
    if (error) throw new Error(error);
    const notFoundFiles = [];
    //fields checks 
    const { title, body, banner_photo } = fields;
    if (!title || !banner_photo || !body) throw new Error('provide all required fields')
    const response = await prisma.program.create({
      data: {
        title,
        // banner_photo,
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




// import prisma from '@/lib/prisma_client';
// import { authenticate } from 'middleware/authenticate';
// import { logFile } from 'utilities_api/handleLogFile';
// import { refresh_token_varify } from 'utilities_api/jwtVerify';
// async function post(req, res, refresh_token) {
//   try {
//     const { school_id } = refresh_token;
//     console.log("school_id.........", {school_id})
//     if (!school_id) throw new Error('Provide valid data');
//     const { title, body, banner_photo } = req.body;
//     console.log("req.body..................",req.body)
//     const response = await prisma.program.create({
//       data: {
//         title,
//         banner_photo,
//         body,
//         school_id,
//       }});
//     console.log(".....................ms",{response})
//     if (!response) throw new Error('Invalid to create exam term');
//     res.json({ success: true });
//   } catch (err) {
//     logFile.error(err.message)
//     res.status(404).json({ error: err.message });
//   }}
// export default authenticate(post);