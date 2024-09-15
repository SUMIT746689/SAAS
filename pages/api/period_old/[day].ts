import prisma from "@/lib/prisma_client";
import deletePeriod from "controllers/period/deletePeriod";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";

const Day = async (req, res, refresh_token) => {
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                const { school_id } = refresh_token;
                const { day, teacher_id } = req.query;
                const where = {
                    school_id: parseInt(school_id),
                    day
                };
                if (teacher_id) where['teacher_id'] = parseInt(teacher_id);

                const schedule = await prisma.period.findMany({
                    where,
                    include: {
                        room: true,
                        teacher: {
                            where: { deleted_at: null },
                            select: {
                                id: true,
                                first_name: true
                            }
                        },
                        section: {
                            select: {
                                name: true,
                                class: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                })
                res.status(200).json(schedule);
                break;
            case 'DELETE':
                deletePeriod(req, res, refresh_token);
                break;
            default:
                res.setHeader('Allow', ['GET', 'DELETE']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });

    }
}

export default authenticate(Day)