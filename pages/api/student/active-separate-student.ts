
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';
const index = async (req, res) => {
    const { method } = req;
    try{
    switch (method) {
      case 'POST':
        const { student_id } = req.body;
        console.log("ssssssssssssssss",req.body)
        const separatedStudent = await prisma.student.update({
          where: {
            id: parseInt(student_id)

          },
          data: {
            is_separate: false,
          }
        });
        console.log({separatedStudent})
        return res.status(200).json({ message: "success"});
        default:
          res.setHeader('Allow', [ 'POST']);
          logFile.error(`Method ${method} Not Allowed`)
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }

  catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }}


export default index;
