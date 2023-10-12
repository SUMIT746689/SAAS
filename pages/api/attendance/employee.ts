import prisma from "@/lib/prisma_client";
import { authenticate } from "middleware/authenticate";

const index = async (req, res) => {
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                let query = {};
                if (req.query.date) {
                    query['date'] = { equals: new Date(req.query.date) }
                }
                else if (req.query.from_date && req.query.to_date) {
                    query['date'] = {
                        gte: new Date(req.query.from_date),
                        lte: new Date(req.query.to_date)
                    }
                }
                const where = {
                    school_id: parseInt(req.query.school_id),
                    ...query,
                    user: {
                        role_id: parseInt(req.query.role_id)
                    },
                }
                const data = await prisma.employeeAttendance.findMany({
                    where,
                    select: {
                        status: true,
                        date: true,
                        remark: true,
                        user_id: true
                    }
                });
                res.status(200).json(data)
                break;
            case 'POST':

                const { date, status, school_id, user_id, role_id } = req.query;

                const roleBaseUser = await prisma.user.findMany({
                    where: {
                        role_id: parseInt(role_id)
                    },
                    select: {
                        id: true
                    }
                })


                const pastAttendence = await prisma.employeeAttendance.findMany({
                    where: {
                        school_id: parseInt(school_id),
                        date: new Date(date),
                        user: {
                            role_id: parseInt(role_id)
                        }
                    },
                    select: {
                        id: true,
                        user_id: true
                    }
                })


                for (const i of roleBaseUser) {

                    const found = pastAttendence.find(j => j.user_id == i.id)

                    if (found) {
                        await prisma.employeeAttendance.update({
                            where: {
                                id: found.id

                            },
                            data: {
                                status
                            }
                        })
                    }
                    else {
                        await prisma.employeeAttendance.create({
                            data: {
                                date: new Date(date),
                                status,
                                school_id: parseInt(school_id),
                                user: {
                                    connect: {
                                        id: i.id
                                    }
                                }
                            }
                        })
                    }

                }

                res.status(200).json({ message: "attendence updated" })

                break;
            case 'PATCH':

                const user = await prisma.employeeAttendance.findFirst({
                    where: {
                        school_id: parseInt(req.query.school_id),
                        date: new Date(req.query.date),
                        user_id: parseInt(req.query.user_id),
                    }
                })


                if (user) {
                    const data = {
                        status: req.body.status ? req.body.status : req.query.status
                    }
                    if (req.body.remark) {
                        data['remark'] = req.body.remark
                    }
                    await prisma.employeeAttendance.update({
                        where: {
                            id: user.id

                        },
                        data
                    })
                }
                else {
                    const data = {
                        user_id: parseInt(req.query.user_id),
                        date: new Date(req.body.exam_id ? '0' : req.query.date),
                        status: req.body.status ? req.body.status : req.query.status,
                        school_id: parseInt(req.query.school_id),

                    }

                    if (req.body.remark) {
                        data['remark'] = req.body.remark
                    }

                    await prisma.employeeAttendance.create({
                        data
                    })
                }

                res.status(200).json({ message: "attendence updated" })
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });

    }

}

export default authenticate(index) 