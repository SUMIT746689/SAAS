import prisma from "@/lib/prisma_client";
import { handleGetMaxTrackingNumber, unique_tracking_number } from "@/utils/utilitY-functions";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";

const index = async (req, res, refresh_token) => {
  try {
    const { method } = req;
    const { id: user_id, school_id } = refresh_token;
    console.log({ refresh_token })

    switch (method) {
      case 'DELETE':

        const { id } = req.query;

        const findStdFee = await prisma.studentFee.findFirst({
          where: {
            id: parseInt(id),
            fee: {
              school_id
            }
          },
          include: {
            account: true,
            transaction: true
          }
        });

        // create a single trancking_number
        const tracking_number = await handleGetMaxTrackingNumber(school_id);
        
        if (!findStdFee) throw new Error('provided invalid student fee');

        await prisma.$transaction(async (trans) => {
          await trans.transaction.create({
            data: {
              amount: findStdFee.collected_amount,
              payment_method_id: findStdFee.payment_method_id,
              voucher_id: findStdFee.transaction.voucher_id,
              // transID: undefined,
              school_id,
              created_at: new Date(Date.now()),
              payment_method: findStdFee.payment_method,
              account_id: findStdFee.account_id,
              account_name: findStdFee.account.title,
              acccount_number: findStdFee.account.account_number,
              voucher_type: 'debit',
              voucher_name: findStdFee.transaction.voucher_name,
              voucher_amount: findStdFee.transaction.voucher_amount,
              tracking_number
            }
          });

          await trans.accounts.update({
            where: {
              id: findStdFee.account_id
            },
            data: {
              balance: {
                decrement: findStdFee.collected_amount
              }
            }
          })

          // console.log({ findStdFee })
          // throw new Error('testing...')
          await trans.studentFee.update({
            where: {
              id: parseInt(id)
            },
            data: {
              deleted_at: new Date(Date.now()),
              deleted_by: user_id
            }
          });
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
