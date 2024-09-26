import { authenticate } from 'middleware/authenticate';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';
async function put(req, res, refresh_token) {
  try {
    const id = parseInt(req.query.id);
    if (Number.isNaN(id)) throw new Error('Provide invalid id ');
    const { school_id } = refresh_token;
    const {youtube_link,english_title,bangla_title} = req.body;

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

export default authenticate(put)