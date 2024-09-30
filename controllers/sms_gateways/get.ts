import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

async function get(req, res, refresh_token) {
  try {

    const { is_active } = req.query;
    const { role, school_id } = refresh_token;

    const where = {};
    if (role?.title !== 'ASSIST_SUPER_ADMIN') where["school_id"] = Number(school_id);

    if (is_active) where["is_active"] = is_active === "true" ? true : false;

    const response = await prisma.smsGateway.findMany({ where, include: { school: { select: { name: true } } } })

    return res.json({ data: response, success: true });

  } catch (err) {
    logFile.error(err.message)
    res.status(404).json({ error: err.message });
  }
}

export default authenticate(get)