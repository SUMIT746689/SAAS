import prisma from '@/lib/prisma_client';
import deletePeriod from 'controllers/period/deletePeriod';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const WebsiteMenu = async (req, res, refresh_token) => {
  try {
    const { method } = req;
    const data = {};

    if (parseInt(req.body.parent_id) > 0) {
      data['parent_id'] = req.body.parent_id;
    }
    if (parseInt(req.body.parent_id) === 0) {
      data['parent_id'] = null;
    }

    switch (method) {
      case 'DELETE':
        await prisma.websiteMenu.delete({
          where: {
            id: parseInt(req.query.id)
          }
        });
        res.status(204).json({ message: 'website menu deleted successfull!!' });

        // updated code end
        break;

      case 'PATCH':
        try {
          const { id } = req.query;

          if (!id) {
            logFile.error('Invalid id !');
            return res.status(400).send({ message: "Missing 'id' in request." });
          }

          const menuInfo = await prisma.websiteMenu.findFirst({
            where: {
              id: parseInt(id)
            }
          });

          if (!menuInfo) {
            logFile.error('Invalid id !');
            return res.status(400).send({ message: `Document is not found.` });
          }

          await prisma.websiteMenu.update({
            where: {
              id: parseInt(id)
            },
            data: {
              ...data,
              english_title: req.body.english_title,
              bangla_title: req.body.bangla_title,
              link_type: req.body.link_type?.toLowerCase(),
              website_link: req.body.website_link,
              status: req.body.status?.toLowerCase()
            }
          });

          res.status(200).json({ message: 'website menu updated successfull!!' });
          // updated code end
        } catch (err) {
          logFile.error(err.message);
          console.log(err.message);
          res.status(404).json({ error: err.message });
        }
        break;
      default:
        res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
        logFile.error(`Method ${method} Not Allowed`);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.log(err);
    logFile.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default authenticate(WebsiteMenu);
