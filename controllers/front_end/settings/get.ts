import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

async function get(req, res, refresh_token) {
  try {
    const { school_id } = refresh_token;
    const websiteUirow = await prisma.websiteUi.findFirst({
      where: {
        school_id
      },
      select: {
        branch_wise_addmission: true,
      }
    });;

    res.status(200).json(websiteUirow);

  } catch (error) {
    logFile.error(error.message);
    res.status(404).json({ Error: error.message });
  }
}

export default authenticate(get)