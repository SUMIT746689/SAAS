import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

async function post(req, res, refresh_token) {
  try {
    const { school_id } = refresh_token;
    const { parent_id, english_title, bangla_title, link_type, website_link, dynamic_page_link_id, status } = req.body;
    const data = {};

    const singleMenuItem = await prisma.websiteMenu.findFirst({
      where: {
        id: parseInt(parent_id)
      }
    });

    if (singleMenuItem) data['parent_id'] = parseInt(parent_id);
    if (bangla_title) data['bangla_title'] = bangla_title;
    if (!english_title) return res.status(404).send({ message: 'No english title found!' });
    if (!link_type) return res.status(404).send({ message: 'No link type found!' });
    if (link_type?.toLowerCase() === 'dynamic page link') {
      if (!dynamic_page_link_id) return res.status(404).send({ message: 'No dynamic page id found!' });
    } else {
      if (!website_link) return res.status(404).send({ message: 'No website link found!' });
    }
    if (!status) return res.status(404).send({ message: 'No status found!' });

    await prisma.websiteMenu.create({
      data: {
        ...data,
        english_title,
        link_type: link_type.toLowerCase(),
        website_link,
        status: status.toLowerCase(),
        dynamic_page_id: dynamic_page_link_id,
        school_id
      }
    });

    return res.json({ message: 'website menu created successfully!' });
  } catch (err) {
    logFile.error(err.message);
    res.status(404).json({ error: err.message });
  }
}

export default authenticate(post);
