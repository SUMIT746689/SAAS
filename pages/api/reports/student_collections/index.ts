import prisma from '@/lib/prisma_client';
import dayjs from 'dayjs';
import { isDateValid } from 'utilities_api/handleDate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res) => {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        const { from_date, to_date, selected_class, selected_group, selected_section } = req.query;

        if (!isDateValid(from_date) || !isDateValid(to_date)) throw new Error('required from date / to_date is not founds');
        if (!selected_section) throw new Error('provide required information');

        const groupWise = {};

        if (selected_group) {
          groupWise['group_id'] = { in: selected_group?.split(',').map(Number) };
        }

        const fetchStdFees = await prisma.studentFee.findMany({
          where: {
            student: {
              batches: {
                some: {
                  id: {
                    in: selected_section?.split(',').map(Number)
                  }
                }
              },
              ...groupWise
            },
            collection_date: {
              gte: from_date,
              lte: to_date
            }
          },
          select: {
            on_time_discount: true,
            fee: {
              select: {
                id: true,
                Discount: true,
                amount: true
              }
            },
            transaction: {
              select: {
                voucher_name: true
              }
            },
            total_payable: true,
            collected_amount: true,
            student: {
              select: {
                class_roll_no: true,
                student_info: {
                  select: {
                    student_id: true,
                    first_name: true,
                    middle_name: true,
                    last_name: true
                  }
                },
                batches: {
                  select: {
                    name: true
                  }
                },
                // section: {
                //   select: {
                //     name: true
                //   }
                // },
                group: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        });

        res.status(200).json({
          status: true,
          result: fetchStdFees
        });
        break;

      default:
        res.setHeader('Allow', ['GET']);
        logFile.error(`Method ${method} Not Allowed`);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    logFile.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default index;
