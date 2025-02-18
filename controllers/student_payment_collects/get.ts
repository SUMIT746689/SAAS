import prisma from "@/lib/prisma_client";
import { logFile } from "utilities_api/handleLogFile";

export const get = async (req, res) => {
  try {
    const { student_id, fee_id }: any = req.body;

    if (!student_id) throw new Error('provide student_id');

    const student_fee = await prisma.studentFee.findMany({
      where: { student_id },
      include: {
        student: {
          select: {
            class:true,
            batches:true,
            // section: {
            //   include: {
            //     class: true
            //   }
            // },
            student_info: {
              select: {
                first_name: true,
                middle_name: true,
                last_name: true
              }
            }
          }
        },
        fee: true
      }
    });

    res.status(200).json({ data: student_fee, success: true });
  } catch (err) {
    logFile.error(err.message)
    res.status(404).json({ error: err.message });
  }
};
