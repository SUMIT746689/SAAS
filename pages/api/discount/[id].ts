import prisma from "@/lib/prisma_client";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";

const id = async (req, res, refresh_token) => {
    try {
        const { method } = req;

        const id = req.query.id
        const academic_year_id = parseInt(req.query.academic_year_id)
        const school_id = parseInt(refresh_token.school_id)

        switch (method) {
            case 'GET':
                const discount = await prisma.discount.findFirst({
                    where: {
                        id: parseInt(id)
                    }
                })
                res.status(200).json(discount)
                break;

            case 'PATCH':
                const { type, amt } = req.body;
                const data: any = {};

                // if (fee_id) {
                //     data['fee_id'] = fee_id
                // }
                if (type) {
                    data['type'] = type
                }
                if (amt) {
                    data['amt'] = amt
                }
                // console.log(Number(id), Number(academic_year_id), Number(refresh_token.school_id));

                // const temp = await prisma.fee.findFirst({
                //     where: {
                //         id: fee_id,
                //         academic_year_id: academic_year_id,
                //         school_id: school_id
                //     }
                // })
                // if (!temp) throw new Error('Bad request !')

                await prisma.discount.updateMany({
                    where: {
                        discount_id: id,
                        school_id
                    },
                    data
                })

                // await prisma.$queryRaw`
                //     UPDATE Discount 
                //     JOIN fees on fees.id = Discount.fee_id
                //     SET
                //         ${data?.fee_id ? Prisma.sql`fee=${data?.fee_id},` : Prisma.empty}
                //         ${data?.amt ? Prisma.sql`amt=${data?.amt},` : Prisma.empty}
                //         ${data?.type ? Prisma.sql`type=${data?.type},` : Prisma.empty}

                //     WHERE Discount.id = ${id} and fees.academic_year_id = ${academic_year_id} and fees.school_id = ${school_id}`

                res.status(200).json({ success: true, message: 'Discount updated !!' })

                break;

            default:
                res.setHeader('Allow', ['GET', 'PATCH']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });
    }
}

export default authenticate(id);