import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token) => {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        // let query = {}
        // if (req.query.school_id) {
        //   query = { class_id: parseInt(req.query.class_id) }
        // }
        const teacherShifts = await prisma.teacherShift.findMany({
          where: {
            // ...query,
            // class: {
            school_id: parseInt(refresh_token.school_id)
            // }
          },
          // include: {
          // class: true
          // }

        });
        res.status(200).json(teacherShifts);
        break;
      case 'POST':
        await prisma.teacherShift.create({
          data: {
            title: req.body.title,
            entry_time: req.body.entry_time ? new Date(req.body.entry_time) : undefined,
            late_time: req.body.entry_time ? new Date(req.body.late_time) : undefined,
            absence_time: req.body.entry_time ? new Date(req.body.absence_time) : undefined,
            exit_time: req.body.entry_time ? new Date(req.body.exit_time) : undefined,
            school_id: parseInt(refresh_token.school_id),
          }
        })
        res.status(200).json({
          message: 'Teacher Shift created succesfully!!'
        })
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
