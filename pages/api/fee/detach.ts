import prisma from "@/lib/prisma_client";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";

const index = async (req, res, token) => {
    try {
        const { method } = req;

        switch (method) {
            case 'PUT':
                const { fee_id, student_id } = req.body;
                if (!fee_id || !student_id) throw new Error('fee_id Or student_id missing !')

                await prisma.student.update({
                    where: {
                        id: Number(student_id),
                    },
                    data: {
                        waiver_fees: {
                            disconnect: { id: Number(fee_id) }
                        }
                    }
                })

                return res.json({ message: "permission detached" })

            default:
                res.setHeader('Allow', ['PUT']);
                logFile.error(`Method ${method} Not Allowed`);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });

    }

}

export default authenticate(index) 