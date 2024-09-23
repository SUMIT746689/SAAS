import prisma from '@/lib/prisma_client';
import { fileDelete } from '@/utils/upload';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const id = async (req, res, refresh_token) => {
  try {
    const { method } = req;
    const { id, academic_year_id } = req.query;
    const { school_id } = refresh_token;
    switch (method) {
      case 'DELETE':
        const deletedHomeWork = await prisma.homework.delete({
          where: {
            id: parseInt(id),
            academic_year_id: parseInt(academic_year_id),
            school_id: school_id
            // old code
            // student: {
            //     student_info: {
            //         user_id: refresh_token.id,
            //         school_id: refresh_token.school_id
            //     }
            // }
          }
        });
        if (deletedHomeWork?.file_path) {
          fileDelete([deletedHomeWork?.file_path]);
        }

        res.status(200).json({ message: 'Home work deleted!' });
        break;
      default:
        res.setHeader('Allow', ['PATCH']);
        logFile.error(`Method ${method} Not Allowed`);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.log(err);
    logFile.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default authenticate(academicYearVerify(id));
