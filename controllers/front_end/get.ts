import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';
import { refresh_token_varify } from 'utilities_api/jwtVerify';

export default async function get(req, res) {
  try {
    const findSchool = await prisma.school.findFirst({
      where: { domain: { equals: req.headers.host } },
      include: { websiteui: true }
    });

    if (findSchool?.id && Array.isArray(findSchool?.websiteui) && findSchool?.websiteui?.length === 0) throw new Error('website ui not founds');
    if (findSchool?.id) return res.status(200).json(findSchool.websiteui[0]);

    if (!req.cookies.refresh_token)
      throw new Error('refresh token not founds');

    const refresh_token: any = refresh_token_varify(
      req.cookies.refresh_token
    );

    if (!refresh_token) throw new Error('invalid user');
    const ui = await prisma.websiteUi.findFirst({
      where: { school_id: refresh_token.school_id }
    });

    res.status(200).json(ui);

  } catch (error) {
    logFile.error(error.message);
    res.status(404).json({ Error: error.message });
  }
}
