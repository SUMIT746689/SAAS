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

                const resFeesHeadWise = await prisma.$queryRaw`
                SELECT fees_head.id as id, fees_head.title as title, SUM(student_fees.collected_amount) AS total_collected_amt
                FROM fees_head
                LEFT JOIN fees ON fees.fees_head_id = fees_head.id
                LEFT JOIN student_fees ON student_fees.fee_id = fees.id AND student_fees.collection_date >= ${from_date} AND student_fees.collection_date <= ${to_date}
                WHERE fees_head.school_id = ${school_id}
                GROUP BY fees_head.id
                `;

                return res.status(200).json(resFeesHeadWise)

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

