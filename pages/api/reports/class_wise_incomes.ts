import prisma from '@/lib/prisma_client';
import dayjs from 'dayjs';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { isDateValid } from 'utilities_api/handleDate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token, dcrypt_academic_year) => {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        const { school_id } = refresh_token;
        const { id: academic_year_id } = dcrypt_academic_year;
        const { from_date, to_date, class_ids } = req.query;
        const class_ids_ = class_ids.split(',').map((cls_id) => Number(cls_id));

        if (!isDateValid(from_date) || !isDateValid(to_date)) throw new Error('required from date / to_date is not founds');

        if (!class_ids) throw new Error('classes fields is not founds');

        const studentFees = await prisma.studentFee.findMany({
          where: {
            collection_date: {
              gte: from_date,
              lte: to_date
            },
            student: {
              academic_year_id,
              // section: {
              //   class_id: { in: class_ids_ }
              // },
              class_id: { in: class_ids_ },
              student_info: {
                school_id
              }
            }
          },
          select: {
            id: true,
            collected_amount: true,

            student: {
              select: {
                class_id: true,
                class: {
                  select: {
                    name: true
                  }
                },
                batches: {
                  select: { name: true, }
                },
                // section: {
                //   select: {
                //     class_id: true,
                //     class: {
                //       select: {
                //         name: true
                //       }
                //     }
                //   }
                // }
              }
            }
          }
        });



        const classesRes = class_ids_.map((cls_id: number) => {
          // console.log({  })
          let total_collected_amt = 0;
          studentFees.forEach((fees) => {
            if (cls_id !== fees?.student?.class_id) return;
            total_collected_amt += fees.collected_amount;
          });
          return {
            class_id: cls_id,
            total_collected_amt
          };
        });
        // console.log({ classesRes })
        // console.log({})
        res.status(200).json(classesRes);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        logFile.error(`Method ${method} Not Allowed`);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.log(err);
    logFile.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default authenticate(academicYearVerify(index));
