import prisma from "@/lib/prisma_client";
import { authenticate } from 'middleware/authenticate';
import { logFile } from "utilities_api/handleLogFile";

const id = async (req, res, refresh_token) => {
  try {
    const { method } = req;
    const id = parseInt(req.query.id);
    if(Number.isNaN(id)) throw new Error('provide valid id');

    switch (method) {
      case 'GET':
        const group = await prisma.teacherShift.findUnique({
          where: {
            id: id,
          }
        });
        res.status(200).json(group);
        break;

      case 'PATCH':

        await prisma.teacherShift.update({
          where: {
            id: id,
          },
          data: {
            title: req.body.title,
            school_id: parseInt(refresh_token.school_id),
            entry_time: req.body.entry_time ? new Date(req.body.entry_time) : undefined,
            late_time: req.body.entry_time ? new Date(req.body.late_time) : undefined,
            absence_time: req.body.entry_time ? new Date(req.body.absence_time) : undefined,
            exit_time: req.body.entry_time ? new Date(req.body.exit_time) : undefined
          }
        });
        res.status(200).json({ success: 'Teacher Shift Successfully Updated' });
        break;

      case 'DELETE':
        await prisma.teacherShift.delete({
          where: {
            id: id,
            school_id: refresh_token?.school_id
          }
        });
        res.status(200).json({ success: 'Group deleted successfully!' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        logFile.error(`Method ${method} Not Allowed`)
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.log(err);
    logFile.error(err.message)
    res.status(500).json({ message: err.message });
  }
};

export default authenticate(id);
