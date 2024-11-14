import prisma from "@/lib/prisma_client";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";

const index = async (req, res,refresh_token) => {
  try {
    const { method } = req;
    const { id:user_id  } = refresh_token;
    console.log({refresh_token})

    switch (method) {
      case 'DELETE':

        const { id } = req.query;

       await prisma.studentFee.update({
        where:{
            id:parseInt(id)
        },
        data:{
            deleted_at: new Date(Date.now()),
            deleted_by:  user_id
        }
       });

        res.status(200).json({ message: 'Student Fees Deleted Successfully' });
        break;
      default:
        res.setHeader('Allow', ['DELETE']);
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
