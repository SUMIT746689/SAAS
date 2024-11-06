import prisma from '@/lib/prisma_client';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { isDateValid } from 'utilities_api/handleDate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token, dcrypt_academic_year) => {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        const { school_id } = refresh_token;
        const { from_date, to_date } = req.query;

        if (!isDateValid(from_date) || !isDateValid(to_date)) throw new Error('required from date / to_date is not founds');

        const resvoucherTrans = await prisma.$queryRaw`
              WITH voucherWiseTranGroup AS 
                (
                  SELECT 
                  voucher_id, MIN(voucher_name) as voucher_name, SUM(amount) as total_amount, 
                  GROUP_CONCAT(DISTINCT(payment_method)) as payment_methods, max(created_at) as created_at
                  FROM transactions
                  WHERE voucher_type = "credit" 
                  AND school_id=${school_id} 
                  AND created_at >= ${from_date} AND created_at <= ${to_date}
                  GROUP BY voucher_id
                  ORDER BY max(created_at) DESC
                ),
                
                withClsName AS (
                  SELECT voucherWiseTranGroup.*, classes.name AS class_name FROM voucherWiseTranGroup
                  JOIN vouchers ON vouchers.id = voucherWiseTranGroup.voucher_id
                  LEFT JOIN fees ON vouchers.resource_type="fees" AND fees.id = vouchers.resource_id
                  LEFT JOIN classes ON classes.id = fees.class_id
                )
                
                SELECT * FROM withClsName;
              `;

        return res.status(200).json(resvoucherTrans);

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
