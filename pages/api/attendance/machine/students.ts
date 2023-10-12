import prisma from "@/lib/prisma_client";

const index = async (req, res) => {
    try {
        const { method } = req;

        switch (method) {
            case 'POST':
                // console.log("req.body___", req.body, typeof (req.body));
                const body = JSON.parse(req.body);

                // body.forEach(element => {
                //     console.log("element", element)
                // });
                console.log({ body });
                // const user_ = await prisma

                const data2 = body.map(i => {

                    prisma.user.findFirst({
                        where: { id: parseInt(i?.userID) },
                        select: {
                            id: true,
                            user_role: true
                        }
                    })
                    .then((user_) => {
                        if (!user_) return;

                        if (user_.user_role.title === 'SCHOOL') {
                            prisma.student.findFirst({
                                where: {
                                    // id: user_.id
                                    student_info: {
                                        user_id: user_.id
                                    }
                                },
                                select: {
                                    id: true,
                                    section: {
                                        select: {
                                            id: true,
                                            name: true,
                                            class: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                }
                                            }
                                        }
                                    },
                                    class_roll_no: true,
                                    student_info: {
                                        select: {
                                            first_name: true,
                                            middle_name: true,
                                            last_name: true,
                                            school_id: true,
                                        }
                                    }
                                }

                            })
                                .then(student => {
                                    prisma.attendance.create({
                                        data: {
                                            student_id: student.id,
                                            first_name: student.student_info.first_name,
                                            middle_name: student.student_info.middle_name,
                                            last_name: student.student_info.last_name,
                                            class_name: student.section.class.name,
                                            section_name: student.section.name,
                                            class_roll_no: student.class_roll_no,
                                            date: new Date(),
                                            status: "row_status",
                                            section_id: student.section.id,
                                            school_id: student.student_info.school_id,
                                        }
                                    })
                                        .then((attendance) => {
                                            console.log({ attendance })
                                        })
                                        .catch(err => {
                                            console.log({ "err create attendamce": err.message });
                                        })

                                })
                                .catch(err => {
                                    console.log({ "student err": err.message })
                                })
                        }
                    })
                    .catch(err => { console.log(err) });

                    return ({
                        user_id: parseInt(i.userID),
                        school_id: i.schoolID,
                        submission_time: new Date(Date.now() || i.timestamp),
                        status: i.status,
                        machine_id: i.machineID,
                    })
                }
                )
                console.log({data2})
                
                await prisma.tbl_attendance_queue.createMany({
                    data: data2
                })

                res.status(200).json({ statusCode: '200', message: 'success' })

                break;
            default:
                res.setHeader('Allow', ['POST']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ statusCode: '500', message: err.message });
    }

}

export default (index) 