import prisma from '@/lib/prisma_client';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token, dcrypt_academic_year) => {
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                const { school_id } = refresh_token;
                const { from_date, to_date } = req.query;

                if (!from_date || !to_date) throw new Error("required fields is not founds")

                const isoFromDate = new Date(new Date(from_date).setHours(0, 0, 0, 0)).toISOString();
                const isoToDate = new Date(new Date(to_date).setHours(23, 59, 59, 999)).toISOString();

                const resvoucherTrans = await prisma.$queryRaw`
                    SELECT 
                    voucher_id, MIN(voucher_name) as voucher_name, SUM(amount) as total_amount, 
                    GROUP_CONCAT(DISTINCT(payment_method)) as payment_methods, max(created_at) as created_at
                    FROM transactions
                    WHERE school_id=${school_id} AND created_at >= ${isoFromDate} AND created_at <= ${isoToDate}
                    GROUP BY voucher_id
                    ORDER BY max(created_at) DESC
                `;

                return res.status(200).json(resvoucherTrans)

            default:
                res.setHeader('Allow', ['GET']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });
    }
};

export default authenticate(academicYearVerify(index));

