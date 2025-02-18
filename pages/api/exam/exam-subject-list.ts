import prisma from "@/lib/prisma_client";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";

const index = async (req, res, refresh_token) => {
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                const examSubjects = await prisma.examDetails.findMany({
                    where: {
                        exam: {
                            id: parseInt(req.query.exam_id),
                            school_id: refresh_token.school_id,
                        },
                    },
                    include: {
                        subject: true,
                        exam_room: {
                            where: {
                                deleted_at: null
                            }
                        }
                    }
                });
                res.status(200).json(examSubjects);
                break;

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


export default authenticate(index);
