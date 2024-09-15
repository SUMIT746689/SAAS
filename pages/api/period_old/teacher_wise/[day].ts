import prisma from "@/lib/prisma_client";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";

const Day = async (req, res, refresh_token) => {
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                const { id, school_id, role } = refresh_token;

                if (!id || !school_id || role?.title !== "TEACHER") throw new Error("unauthorized user ")

                const { day, section_id } = req.query;

                if (!day || !section_id) throw new Error("required fields missing")

                const schedule = await prisma.period.findMany({
                    where: {
                        section_id: parseInt(section_id),
                        school_id: parseInt(school_id),
                        teacher: { user_id: parseInt(id) },
                        day,

                        room: { deleted_at: null }
                    },
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
}

export default authenticate(Day)