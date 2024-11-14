
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';
const index = async (req, res) => {
    const { method } = req;
    try{
    switch (method) {
      case 'POST':
        const { student_id } = req.body;
        console.log("ssssssssssssssss",req.body)
        const restoreUser = await prisma.user.update({
          where: {
            // id: parseInt(id)

          },
          data: {
            // is_restore: true,
          }
        });
        console.log({restoreUser})
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
