import prisma from '@/lib/prisma_client';
import patch from 'controllers/students/patch';
import Delete from 'controllers/students/delete';
import { logFile } from 'utilities_api/handleLogFile';

export const config = {
    api: {
        bodyParser: false
    }
};

const id = async (req, res) => {
    try {
        const { method } = req;
        const student_id = parseInt(req.query.id)

        if (!student_id) {
            return res.status(400).json({ message: 'valid id required' })

        }
        switch (method) {
            case 'GET':
                const user = await prisma.student.findUnique({
                    where: {
                        id: student_id,

                    },
                    include: {
                        batches: {
                            include: {
                                class_teacher: {
                                    where: { deleted_at: null },
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                username: true,
                                            }

                                        }
                                    }
                                },
                                class: true,
                            }
                        },
                        // section: {
                        //     include: {
                        //         class_teacher: {
                        //             where: { deleted_at: null },
                        //             include: {
                        //                 user: {
                        //                     select: {
                        //                         id: true,
                        //                         username: true,
                        //                     }

                        //                 }
                        //             }
                        //         },
                        //         class: true,
                        //     }
                        // }
                    }
                })
                res.status(200).json(user);
                break;

            case 'PATCH':
                patch(req, res)
                break;
            case 'DELETE':
                Delete(req, res);
                break;
            default:
                res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });

    }
}

export default id