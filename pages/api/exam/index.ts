import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token) => {
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                const { with_addtional_mark } = req.query
                let query = {}
                if (req.query.academic_year) {
                    query = {
                        academic_year: {
                            id: parseInt(req.query.academic_year),
                            deleted_at: null
                        }
                    }
                }

                const exams = await prisma.exam.findMany({
                    where: {
                        school: {
                            id: refresh_token.school_id
                        },
                        ...query
                    },
                    include: {
                        examAddtinalMark: with_addtional_mark === "true" ? { select: { id: true, total_mark: true, addtionalMarkingCategorie: { select: { id: true, title: true } } } } : false,
                        section: {
                            select: {
                                id: true,
                                name: true,
                                class: {
                                    select: {
                                        id: true,
                                        name: true,
                                        has_section: true
                                    }
                                }
                            }
                        },
                        academic_year: {
                            select: {
                                title: true
                            }
                        },
                        exam_details: {
                            select: {
                                subject: true,
                                subject_total: true,
                                exam_date: true,
                                exam_room: {
                                    where: {
                                        deleted_at: null
                                    }
                                }
                            }
                        }
                    }
                });
                res.status(200).json(exams);
                break;
            case 'POST':
                /* input:
                -------------
                    {
                        "title": "1st terminal",
                        "section_id": 1,
                        "class_id":2
                        "academic_year_id": 1,
                        "school_id": 1,
                        "subject_id_list": [
                           {id:1,mark:23.54,exam_date} ,
                           {id:2,mark:24.54,exam_date} ,
                           {id:3,mark:23.54,exam_date} ,
                        ],
                        "final_percent": 20
                    } 
                    */


                if (!req.body.title || !req.body.section_id || !req.body.academic_year_id || !req.body.subject_id_list) {
                    return res.status(400).send({ message: "parameter missing" })
                }
                const { title, section_id, academic_year_id, subject_id_list, class_id, final_percent, exam_date, exam_term_id } = req.body;

                for (let i of subject_id_list) {
                    const temp = await prisma.subject.findFirst({
                        where: {
                            class_id: parseInt(class_id),
                            id: parseInt(i.id)
                        }
                    })
                    if (!temp) {
                        return res.status(400).send({ message: "selected subjects are not for the selected class" });
                    }
                }
                console.log("exam_date__", exam_date);

                const exam = await prisma.exam.create({
                    // @ts-ignore
                    data: {
                        title: title,
                        section: {
                            connect: {
                                id: parseInt(section_id)
                            }
                        },
                        academic_year: {
                            connect: { id: parseInt(academic_year_id) }
                        },
                        school: {
                            connect: { id: refresh_token.school_id }
                        },
                        examTerm: {
                            connect: { id: exam_term_id }
                        },
                        final_percent: final_percent ? parseInt(final_percent) : null
                    }
                })

                for (let i of subject_id_list) {
                    const exam_room = {}
                    if (i?.exam_room) {
                        exam_room['connect'] = i.exam_room
                    }
                    await prisma.examDetails.create({
                        data: {
                            exam: {
                                connect: { id: exam.id }
                            },
                            subject: {
                                connect: { id: parseInt(i.id) },

                            },
                            subject_total: parseFloat(i.mark),
                            exam_date: new Date(i.exam_date),
                            exam_room
                        }
                    })
                }


                res.status(200).json({ success: true, message: "exam created successfully" });
                break;
            case 'PUT':
                // console.log(req.body);

                const isResultPublished = await prisma.studentResult.findFirst({
                    where: {
                        exam_id: parseInt(req.body.exam_id)
                    }
                })
                // console.log("isResultPublished___", isResultPublished);


                if (!isResultPublished) {


                    if (req.body.exam_id && req.body.subject_id_list && req.body.subject_id_list.length > 0) {

                        await prisma.examDetails.deleteMany({
                            where: {
                                exam_id: parseInt(req.body.exam_id)
                                // exam:{
                                //     id: parseInt(req.body.exam_id)
                                // }
                            }
                        }).catch((err) => {
                            if (!err) return;
                            if (err.message.search('Foreign key constraint failed on the field: `exam_details_id`')) throw new Error('failed to delete for already using this exam on seat plans or questions ');
                            throw new Error('falied to delete...');
                        });

                        for (let i of req.body.subject_id_list) {
                            const query = {}
                            if (i?.exam_room?.length > 0) {
                                query['exam_room'] = { connect: i?.exam_room }
                            }
                            await prisma.examDetails.create({
                                data: {
                                    exam_id: parseInt(req.body.exam_id),
                                    subject_id: parseInt(i.id),
                                    subject_total: parseFloat(i.mark),
                                    exam_date: new Date(i.exam_date),
                                    ...query
                                }
                            })
                        }
                        await handleUpdate(req, res);
                        return res.status(200).json({ message: "updated!" })
                    }
                    else {
                        const temp = await handleUpdate(req, res);
                        if (temp) {
                            return res.status(200).json({ message: "updated exam title or final percent" })
                        }
                        return res.status(422).json({ message: "exam_id or subject_id_list missing!" })
                    }
                }
                else {
                    const temp = await handleUpdate(req, res);
                    if (temp) {
                        return res.status(400).json({ message: "Only updated title or final percent! Can not Update exam details! This exam result is published" })
                    } else {
                        res.status(400).json({ message: "Can not Update exam details! This exam result is published" })
                    }

                }
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });
    }
};

const handleUpdate = async (req, res) => {
    try {
        const { exam_term_id } = req.body;

        const updateQuery = {};
        if (req.body.title) updateQuery['title'] = req.body.title;
        if (exam_term_id) updateQuery['exam_term_id'] = exam_term_id;
        if (req.body.final_percent || req.body.final_percent == 0) updateQuery['final_percent'] = req.body.final_percent == 0 ? null : req.body.final_percent;
        const temp = await prisma.exam.update({
            where: {
                id: parseInt(req.body.exam_id)
            },
            data: updateQuery
        })
        if (temp) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        logFile.error(err.message)
        return res.status(500).json({ message: err.message });
    }

}
export default authenticate(index);
