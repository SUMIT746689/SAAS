import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';
async function post(req, res, refresh_token) {
  try {
    const { school_id } = refresh_token;
    const { youtube_link, english_title, bangla_title } = req.body;
    console.log({ youtube_link, english_title, bangla_title });
    const resWebsiteUi = await prisma.websiteUi.findFirst({
      where: {
        school_id
      },
      select: {
        id: true,
        video_gallery: true
      }
    });
    console.log({ resWebsiteUi });
    if (resWebsiteUi) {
      const updatedVideoGallery = resWebsiteUi.video_gallery && Array.isArray(resWebsiteUi) ? resWebsiteUi.video_gallery : [];
      updatedVideoGallery.push({
        id: new Date().getTime(),
        youtube_link,
        english_title,
        bangla_title,
        created_at: new Date(Date.now())
      });

      console.log({ updatedVideoGallery });

      await prisma.websiteUi.update({
        where: {
          id: resWebsiteUi.id
        },
        data: {
          eiin_number: '',
          video_gallery: updatedVideoGallery,
          school_id
        }
      });
      return res.json({ message: 'Video Gallary created successfully!' });
    }

    await prisma.websiteUi.create({
      data: {
        eiin_number: '',
        video_gallery: [
          {
            // id: 1,
            id: new Date().getTime(),
            youtube_link,
            english_title,
            bangla_title,
            created_at: new Date(Date.now())
          }
        ],
        school_id
      }
    });
    return res.json({ message: 'Video Gallary created successfully!' });
  } catch (err) {
    console.log({ err });
    logFile.error(err.message);
    res.status(404).json({ error: err.message });
  }
}
export default authenticate(post);
