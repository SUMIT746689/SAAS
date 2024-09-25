import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token) => {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        let query = {}
        if (req.query.class_id) {
          query = { class_id: { equals: parseInt(req.query.class_id) } }
        }
        const groups = await prisma.group.findMany({
          where: {
            ...query,
            class: {
              school_id: parseInt(refresh_token.school_id)
            }
          },
          include: {
            class: true
          }
        });
        res.status(200).json(groups);
        break;
      case 'POST':
        await prisma.group.create({
          data: {
            title: req.body.title,
            class_id: parseInt(req.body.class_id)
          }
        })
        res.status(200).json({
          message: 'Group created succesfully!!'
        })
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        logFile.error(`Method ${method} Not Allowed`)
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.log(err);
    logFile.error(err.message)
    res.status(500).json({ message: err.message });
  }
};

export default authenticate(index);
