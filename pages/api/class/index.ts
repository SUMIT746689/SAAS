import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token) => {
  try {
    const { method } = req;


    switch (method) {
      case 'GET':
        const classes = await prisma.class.findMany({
          where: {
            school_id: refresh_token.school_id
          },
          include: {
            sections: {
              select: {
                id: true,
                name: true,
                std_entry_time: true,
                std_exit_time: true
              }
            },
            Group: true,
            subjects:true
          },
        });
        res.status(200).json(classes);
        break;
      case 'POST':
        const { name: name_, code, section_name, is_extra, std_entry_time, std_exit_time } = req.body;
        const { school_id } = refresh_token;
        const name = name_.trim();

        const isExists = await prisma.class.findFirst({
          where: {
            name,
            school_id
          }
        })
        if (isExists) throw new Error('This class is already exists !');

        const newClass = await prisma.class.create({
          data: {
            name,
            code: code && '',
            school_id,
            is_extra: typeof is_extra === "boolean" ? is_extra : undefined,
            // has_section: true,
          }
        });
        const sectionName = section_name ? section_name : `default-${name}`;

        const sectionQuery = {
          name: sectionName,
          class_id: newClass.id
        };
        if (std_entry_time) sectionQuery["std_entry_time"] = new Date(std_entry_time);
        if (std_exit_time) sectionQuery["std_exit_time"] = new Date(std_exit_time);

        await prisma.section.create({
          data: {
            name: sectionName,
            class_id: newClass.id
          }
        });
        res.status(200).json({ message: 'class and section created successfull!!' });
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
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
