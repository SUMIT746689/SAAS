import prisma from "@/lib/prisma_client";
import { logFile } from "utilities_api/handleLogFile";

const index = async (req, res) => {
    try {
        const { method } = req;

        switch (method) {
            case 'POST':
                // console.log("req.body___", req.body, typeof (req.body));
                console.log(typeof req.body);
                console.log(req.body);
                
                let body = [];
                if (typeof req.body === 'string') body = JSON.parse(req.body);
                if (typeof req.body === 'object') body = JSON.parse(JSON.stringify(req.body));

                console.log({ body });
                // body.forEach(element => {
                //     console.log("element", element)
                // });
                // const user_ = await prisma

                // const data2 = body.map(i => {

                //     prisma.user.findFirst({
                //         where: { id: parseInt(i?.userID) },
                //         select: {
                //             id: true,
                //             user_role: true
                //         }
                //     })
                //     .then((user_) => {
                //         if (!user_) return;

                //         if (user_.user_role.title === 'SCHOOL') {
                //             prisma.student.findFirst({
                //                 where: {
                //                     // id: user_.id
                //                     student_info: {
                //                         user_id: user_.id
                //                     }
                //                 },
                //                 select: {
                //                     id: true,
                //                     section: {
                //                         select: {
                //                             id: true,
                //                             name: true,
                //                             class: {
                //                                 select: {
                //                                     id: true,
                //                                     name: true,
                //                                 }
                //                             }
                //                         }
                //                     },
                //                     class_roll_no: true,
                //                     student_info: {
                //                         select: {
                //                             first_name: true,
                //                             middle_name: true,
                //                             last_name: true,
                //                             school_id: true,
                //                         }
                //                     }
                //                 }

                //             })
                //                 .then(student => {
                //                     prisma.attendance.create({
                //                         data: {
                //                             student_id: student.id,
                //                             first_name: student.student_info.first_name,
                //                             middle_name: student.student_info.middle_name,
                //                             last_name: student.student_info.last_name,
                //                             class_name: student.section.class.name,
                //                             section_name: student.section.name,
                //                             class_roll_no: student.class_roll_no,
                //                             date: new Date(),
                //                             status: "row_status",
                //                             section_id: student.section.id,
                //                             school_id: student.student_info.school_id,
                //                         }
                //                     })
                //                         .then((attendance) => {
                //                             console.log({ attendance })
                //                         })
                //                         .catch(err => {
                //                             console.log({ "err create attendance": err.message });
                //                         })

                //                 })
                //                 .catch(err => {
                //                     console.log({ "student err": err.message })
                //                 })
                //         }
                //     })
                //     .catch(err => { console.log(err) });
                //     return ({
                //         user_id: parseInt(i.userID),
                //         school_id: i.schoolID,
                //         submission_time: new Date(Date.now() || i.timestamp),
                //         status: i.status,
                //         machine_id: i.machineID,
                //     })
                // }
                // )
                // console.log({data2})

                // await prisma.tbl_attendance_queue.createMany({
                //     data: data2
                // })

                if (!Array.isArray(body)) {
                    logFile.error("attendance_table_queue required array")
                    return res.status(405).end(`required array`);
                }

                body.map((attendance) => {
                    // save attendence files
                    const { userID, schoolID, timestamp, status, machineID } = attendance || {};
                    const time = {
                        normal: new Date(timestamp),
                        utcString: new Date(timestamp).toUTCString(),
                        string: new Date(timestamp).toString(),
                        isoString: new Date(timestamp).toISOString(),
                        timeZoneOffset: new Date(timestamp).getTimezoneOffset(),
                        custom: new Date(new Date(timestamp).setUTCHours(0, 0, 0, 0)).getTimezoneOffset()
                    }

                    const offsetTime = new Date(timestamp).getTimezoneOffset();

                    const date = new Date(timestamp);
                    const time_ = date.getTime();
                    const offsetMinutes = 360;
                    // verify offset time and make utc zero
                    const customUtcZeroFormat = offsetTime === 0 ? new Date(time_ - offsetMinutes * 60 * 1000) : date;

                    console.log({ time, customUtcZeroFormat })

                    if (schoolID) prisma.attendence_info.create({ data: { type: "automatic", body: { ...attendance, customUtcZeroFormat }, school_id: schoolID } })
                        .then(async () => {
                            if (!userID || !schoolID || !timestamp || !status || !machineID) return logFile.error(`for creating attendance_table_queue missing required fields`);
                            await prisma.tbl_attendance_queue.create({
                                data: {
                                    user_id: parseInt(attendance.userID),
                                    school_id: attendance.schoolID,
                                    submission_time: customUtcZeroFormat,
                                    status: attendance.status,
                                    machine_id: attendance.machineID,
                                }
                            })
                                .catch(err => {
                                    console.log({ err })
                                    logFile.error(err.message);
                                })
                        })
                        .catch(err => {
                            logFile.error(err.message)
                        });


                })
                res.status(200).json({ statusCode: '200', message: 'success' })

                break;
            default:
                res.setHeader('Allow', ['POST']);
                logFile.error(`Method ${method} Not Allowed`);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        logFile.error(err.message);
        console.log(err);
        res.status(405).json({ statusCode: '405', message: err.message });
    }

}

export default (index) 