
import { authenticate } from 'middleware/authenticate';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';

async function put(req, res, refresh_token) {
  try {
    const id = parseInt(req.query.id);
    if (Number.isNaN(id)) throw new Error('Provided invalid id');
    
    const { school_id } = refresh_token;
    const { youtube_link, english_title, bangla_title } = req.body;
    const resWebsiteUi = await prisma.websiteUi.findFirst({
      where: {
        school_id
      }
    });

    if (!resWebsiteUi) {
      throw new Error(`school_id ${school_id} not found`);
    }
    const updatedVedioGallery = resWebsiteUi.video_gallery?.map(vg => {
      if (vg.id === id) {
        return {
          ...vg,
          youtube_link: youtube_link || vg.youtube_link,
          english_title: english_title || vg.english_title,
          bangla_title: bangla_title || vg.bangla_title
        };
      }
      return vg;
    });
    const updatedRecord = await prisma.websiteUi.updateMany({
      where: {
        school_id
      },
      data: {
        video_gallery: updatedVedioGallery
      }
    });

    res.json({ data: updatedRecord, success: true });
  } catch (err) {
    logFile.error(err.message);
    console.log({ err: err.message });
    res.status(404).json({ error: err.message });
  }
}

export default authenticate(put);
