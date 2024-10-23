import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';
async function get(req, res, refresh_token) {
  try {
    const { school_id } = refresh_token;
    const response = await prisma.program.findMany({
      where: { school_id }
    })
    res.json({ data: response, success: true });
  } catch (err) {
    logFile.error(err.message)
    res.status(404).json({ error: err.message });
  }
}
export default authenticate(get)