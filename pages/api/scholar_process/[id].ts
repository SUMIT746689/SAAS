import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token) => {
  try {
    const { method } = req;

    const { id } = req.query;

    switch (method) {
      case 'GET':
        const { with_students } = req.query;

        const query = {};
        query['where'] = { id: parseInt(id), school_id: refresh_token.school_id };

        if (with_students === 'true') {
          query['select'] = {
            sections: {
              select: {
                students: true
              }
            }
          };
        }
        else {
          query['include'] = {
            sections: true
          };
        }
        const data = await prisma.class.findFirst({
          ...query
        });
        res.status(200).json(data);
        break;

      case 'PATCH':
        const { name, code, is_extra, std_entry_time, std_exit_time } = req.body;
        const class_ = await prisma.class.findFirst({
          where: { id: parseInt(id) },
          select: { has_section: true }
        });


        const quries = {
          where: { id: parseInt(id) },
          data: {}
        };

        if (name) quries.data['name'] = name;
        if (code) quries.data['code'] = code;
        if (typeof is_extra === "boolean") quries.data['is_extra'] = is_extra;

        await prisma.class.update({
          ...quries
        });

        if (!class_.has_section && (std_entry_time || std_entry_time)) {
          const sectionQuery = {};

          if (std_entry_time) sectionQuery['std_entry_time'] = new Date(std_entry_time);
          if (std_exit_time) sectionQuery['std_exit_time'] = new Date(std_exit_time);

          await prisma.section.updateMany({
            where: { class_id: parseInt(id) },
            data: sectionQuery
          })
        }

        res.status(200).json({ success: 'update successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        logFile.error(`Method ${method} Not Allowed`)
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.log(err);
    logFile.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default authenticate(index);
