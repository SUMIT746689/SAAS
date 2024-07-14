import prisma from "@/lib/prisma_client";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";

const index = async (req, res) => {
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                let query = {};
                if (req.query.date) {

                    const gte = new Date(req.query.date)
                    gte.setHours(0, 0, 0, 0);
                    const lte = new Date(req.query.date)
                    lte.setHours(23, 59, 59, 999);

                    query['date'] = {
                        gte,
                        lte
                    }
                    // query['date'] = { equals: new Date(req.query.date) }
                }
                else if (req.query.from_date && req.query.to_date) {
                    query['date'] = {
                        gte: new Date(req.query.from_date),
                        lte: new Date(req.query.to_date)
                    }
                }

                const exam = {}
                if (req.query.exam_id) exam['exam_id'] = parseInt(req.query.exam_id)


                const where = {
                    school_id: parseInt(req.query.school_id),
                    section_id: parseInt(req.query.section_id),
                    ...query,
                    ...exam
                }
                const data = await prisma.attendance.findMany({
                    where,
                    select: {
                        student_id: true,
                        status: true,
                        date: true,
                        remark: true,
                    }
                });
                // res.status(200).json({size:data.length,data})
                res.status(200).json(data)
                break;
            case 'POST':

                const { date, status, school_id, section_id, exam_id } = req.query;

                const gte = new Date(req.query.date)
                gte.setHours(0, 0, 0, 0);
                const lte = new Date(req.query.date)
                lte.setHours(23, 59, 59, 999);

                const { sectionAttendence } = req.body;

                const fullSectionStudents = await prisma.student.findMany({
                    where: {
                        batches: { some: { id: parseInt(section_id) } }
                        // section_id: parseInt(section_id)
                    },
                    select: {
                        id: true
                    }
                })
                const exam_id_query = {};
                if (exam_id) {
                    exam_id_query['exam_id'] = parseInt(exam_id)
                }

                const fullSectionStudentAttendence = await prisma.attendance.findMany({
                    where: {
                        school_id: parseInt(school_id),
                        section_id: parseInt(section_id),
                        date: { gte, lte },
                        ...exam_id_query
                    },
                    select: {
                        id: true,
                        student_id: true
                    }
                })

                if (sectionAttendence) {

                    for (const i of sectionAttendence) {

                        const updatequery = {
                            status: i.status,
                        }
                        if (i?.remark) {
                            updatequery['remark'] = i.remark
                        }
                        const found = fullSectionStudentAttendence.find(j => j.student_id === i.student_id)
                        if (found) {
                            await prisma.attendance.update({
                                where: {
                                    id: found.id

                                },
                                data: updatequery
                            })
                        }
                        else {
                            const rr = await prisma.attendance.create({
                                data: {
                                    student_id: i.student_id,
                                    date: new Date(date),
                                    status: i.status,
                                    school_id: parseInt(school_id),
                                    section_id: parseInt(section_id),
                                    exam_id: exam_id ? parseInt(exam_id) : null
                                }
                            })
                            console.log(date, "rr__", rr)
                        }
                    }

                }
                else if (status) {
                    for (const i of fullSectionStudents) {
                        const found = fullSectionStudentAttendence.find(j => j.student_id === i.id)
                        if (found) {
                            await prisma.attendance.update({
                                where: {
                                    id: found.id

                                },
                                data: {
                                    status
                                }
                            })
                        }
                        else {
                            await prisma.attendance.create({
                                data: {
                                    student_id: i.id,
                                    date: new Date(date),
                                    status,
                                    school_id: parseInt(school_id),
                                    section_id: parseInt(section_id),
                                    exam_id: exam_id ? parseInt(exam_id) : null
                                }
                            })
                        }

                    }
                }



                res.status(200).json({ message: "attendence updated" })

                break;
            case 'PATCH':
                let temp = {}
                if (!req.body.exam_id) {
                    temp = {
                        date: new Date(req.query.date)
                    }
                } else {
                    temp = {
                        exam_id: parseInt(req.body.exam_id)
                    }
                }
                // console.log({
                //     school_id: parseInt(req.query.school_id),
                //     section_id: parseInt(req.query.section_id),
                //     ...temp,
                //     student_id: parseInt(req.query.student_id),
                // });

                const user = await prisma.attendance.findFirst({
                    where: {
                        school_id: parseInt(req.query.school_id),
                        section_id: parseInt(req.query.section_id),
                        ...temp,
                        student_id: parseInt(req.query.student_id),
                    }
                })


                if (user) {
                    const data = {
                        status: req.body.status
                    }
                    if (req.body.remark) {
                        data['remark'] = req.body.remark
                    }
                    if (req.body.exam_id) {
                        data['exam_id'] = parseInt(req.body.exam_id)
                    }
                    await prisma.attendance.update({
                        where: {
                            id: user.id

                        },
                        data
                    })
                }
                else {
                    const data = {
                        student_id: parseInt(req.query.student_id),
                        date: new Date(req.body.exam_id ? '0' : req.query.date),
                        status: req.body.status ? req.body.status : req.query.status,
                        school_id: parseInt(req.query.school_id),
                        section_id: parseInt(req.query.section_id)
                    }

                    if (req.body.remark) {
                        data['remark'] = req.body.remark
                    }
                    if (req.body.exam_id) {

                        data['exam_id'] = parseInt(req.body.exam_id)
                    }

                    await prisma.attendance.create({
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
        logFile.error(err.message);
        console.log(err);
        res.status(500).json({ message: err.message });

    }

}

export default authenticate(index) 