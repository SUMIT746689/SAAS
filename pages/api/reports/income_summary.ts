import prisma from '@/lib/prisma_client';

import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { isDateValid } from 'utilities_api/handleDate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res) => {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        const { from_date, to_date } = req.query;

        if (!isDateValid(from_date) || !isDateValid(to_date)) throw new Error('required from date / to_date is not founds');

        const incomeData = await prisma.transaction.findMany({
          where: {
            created_at: {
              gte: from_date,
              lte: to_date
            },
            voucher_type: 'credit'
          },
          include: {
            voucher: true
          }
        });

        const result = incomeData.reduce(
          (acc, transaction) => {
            const resourceType = transaction.voucher.resource_type;
            const amount = transaction.amount;

            if (resourceType === 'fee' || resourceType === 'studentFee') {
              acc.fees += amount;
            } else {
              acc.other_fees += amount;
            }

            return acc;
          },
          { fees: 0, other_fees: 0 }
        );

        res.status(200).json({
          message: 'success',
          result
        });
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
