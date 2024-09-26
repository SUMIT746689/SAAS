import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const Get = async (req, res, refresh_token) => {
  try {
    const { school_id } = refresh_token;
    const gallaryInfo = await prisma.websiteUi.findFirst({
      where: {
        school_id
      },
      select: {
        video_gallery: true
      }
    });

    res.status(200).json({
      message: 'success',
      result: gallaryInfo.video_gallery || []
    });
  } catch (err) {
    logFile.error(err.message);
    console.log(err.message);
    res.status(404).json({ error: err.message });
  }
};

export default authenticate(Get);
