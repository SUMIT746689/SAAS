import prisma from "./utility/prisma_client.js";
import { stdAlreadyAttendance, empAlreadyAttendance } from './attendance_utility/findAlreadyAttendance.js'
// import cron from "node-cron"

const attendance = async () => {
    try {
        const today = new Date(Date.now());
        // utc day start time 
        const std_min_attend_date_wise = new Date(today);
        std_min_attend_date_wise.setHours(0, 0, 0, 0);
        console.log({ std_min_attend_date_wise });

        // utc day end time
        const std_max_attend_date_wise = new Date(today);
        std_max_attend_date_wise.setHours(23, 59, 59, 999);
        console.log({ std_max_attend_date_wise });

        // student attendance processing 
        prisma.$queryRaw`
            WITH 
            user_role as (
                SELECT id, title FROM Role
                WHERE title="STUDENT"
            ),
            attendance_queue as (
                SELECT users.user_role_id,user_id
                FROM tbl_attendance_queue as taq
                JOIN user_role
                JOIN users ON taq.user_id = users.id
                WHERE user_role.id = users.role_id AND DATE(taq.submission_time) = DATE(NOW())
                GROUP BY taq.user_id
                )

            SELECT * FROM attendance_queue;
        `
            .then((res) => {
                // console.log({ res });
                if (!Array.isArray(res)) return console.log("student tbl_attendance_queue response is not array");
                if (res.length === 0) return console.log("student tbl_attendance_queue response array length is 0 ");

                res.forEach((userAttend) => {
                    const { user_id } = userAttend;

                    prisma.student.findFirst({ where: { AND: [{ student_info: { user_id } }, { academic_year: { curr_active: true } }] }, select: { id: true, guardian_phone: true, class_roll_no: true, section: { select: { id: true, name: true, std_entry_time: true, std_exit_time: true, class: { select: { name: true } } } }, student_info: { select: { first_name: true, middle_name: true, last_name: true, school_id: true } } } })
                        .then(async (resStudent) => {
                            const { id, guardian_phone, section, student_info, class_roll_no } = resStudent ?? {};

                            if (!id || !section?.std_entry_time) return console.log(`user_id(${user_id}) is not found`);
                            const isAlreadyAttendanceEntry = await stdAlreadyAttendance({ student_id: id, std_min_attend_date_wise, std_max_attend_date_wise })

                            if (isAlreadyAttendanceEntry && isAlreadyAttendanceEntry?.id) {
                                prisma.$queryRaw`
                                    SELECT
                                    id,school_id,
                                    MAX(submission_time) OVER() AS exit_time
                                    FROM tbl_attendance_queue
                                    WHERE user_id = ${user_id} AND submission_time >=${std_min_attend_date_wise} AND submission_time <= ${std_max_attend_date_wise}
                                `
                                    .then(stdAttendanceQ => {
                                        if (stdAttendanceQ.length === 0) return console.log(`student attendence not found for update user_id(${user_id})`);

                                        prisma.attendance.update({
                                            where: { id: isAlreadyAttendanceEntry.id },
                                            data: {
                                                exit_time: stdAttendanceQ[0].exit_time
                                            }
                                        })
                                            .then(() => {
                                                console.log(`user_id(${user_id}) student update successfull`);
                                                const deleteIds = stdAttendanceQ.map((e) => e.id);
                                                prisma.tbl_attendance_queue.deleteMany({ where: { id: { in: deleteIds } } })
                                                    .then(res => { console.log("tbl_attendance_queue delete successfull") })
                                                    .catch(err => { console.log(`error delete student tbl_attendance_queue ids${deleteIds}`, err.message) })

                                            })
                                            .catch((err) => `user_id(${user_id}) student failed to update`)
                                    })
                                    .catch(err => { console.log({ "error failed student tbl_attendance_queue ": err.message }) })
                            }
                            else {
                                prisma.$queryRaw`
                                    SELECT
                                        id,
                                        (
                                            CASE 
                                            WHEN TIME(MIN(submission_time) OVER()) < TIME(${section.std_entry_time}) THEN "present"
                                            ELSE "late"
                                            END
                                        ) AS status,
                                        MIN(submission_time) OVER() AS entry_time,
                                        MAX(submission_time) OVER() AS exit_time
                                    FROM tbl_attendance_queue
                                    WHERE user_id = ${user_id} AND submission_time >=${std_min_attend_date_wise} AND submission_time <= ${std_max_attend_date_wise}
                                `
                                    .then(stdAttendanceQ => {
                                        let entry_time;
                                        let exit_time;
                                        if (Array.isArray(stdAttendanceQ) && stdAttendanceQ.length > 0) {
                                            entry_time = stdAttendanceQ[0].entry_time;
                                            exit_time = stdAttendanceQ.length > 1 ? stdAttendanceQ[0].exit_time : undefined;
                                        };
                                        prisma.attendance.create({
                                            data: {
                                                student_id: id,
                                                date: new Date(Date.now()),
                                                status: stdAttendanceQ[0].status,
                                                // status: "absent",
                                                section_id: section.id,
                                                school_id: student_info.school_id,
                                                first_name: student_info.first_name,
                                                middle_name: student_info.middle_name || undefined,
                                                last_name: student_info.last_name || undefined,
                                                section_name: section.name,
                                                class_name: section.class.name,
                                                class_roll_no,
                                                entry_time,
                                                exit_time
                                            }
                                        })
                                            .then(res__ => {
                                                console.log({ "success_request": res__ });
                                                const deleteIds = stdAttendanceQ.map((e) => e.id);
                                                prisma.tbl_attendance_queue.deleteMany({ where: { id: { in: deleteIds } } })
                                                    .then(res => { console.log("tbl_attendance_queue delete successfull") })
                                                    .catch(err => { console.log(`error delete student tbl_attendance_queue ids${deleteIds}`, err.message) })
                                            })
                                            .catch((err) => {
                                                console.log(`error: create attendaance student_id(${id})`)
                                            })
                                    })
                                    .catch(err => {
                                        console.log(`error get tbl_attendance_queue student_id(${id}) : ${err.message}`)
                                    })
                            }
                        })
                        .catch(err => { console.log(`student user_id(${user_id}) fetch error:`, err) })
                })

            })
            .catch((err) => { console.log("tbl_attendance_queue fetch error:", err) })




        // employees attendance processing
        prisma.$queryRaw`
            WITH 
            user_role as (
                SELECT id, title FROM Role
                WHERE title="STUDENT"
            ),
            attendance_queue as (
                SELECT users.user_role_id,user_id
                FROM tbl_attendance_queue as taq
                JOIN user_role
                JOIN users ON taq.user_id = users.id
                WHERE user_role.id != users.role_id AND DATE(taq.submission_time) = DATE(NOW())
                GROUP BY taq.user_id
                )

            SELECT * FROM attendance_queue;
        `
            .then((resEmp) => {
                if (!Array.isArray(resEmp)) return console.log("tbl_attendance_queue response is not array");
                if (resEmp.length === 0) return console.log("today's tbl_attendance_queue response array length is 0 ");

                resEmp.forEach(async (empAttend) => {
                    const isEmpAlreadyEntryAttend = await prisma.employeeAttendance.findFirst({
                        where: { user_id: empAttend.user_id, date: { gte: std_min_attend_date_wise, lte: std_max_attend_date_wise } }
                    })

                    if (isEmpAlreadyEntryAttend) {
                        prisma.$queryRaw`
                            SELECT
                                id,school_id,
                                MAX(submission_time) OVER() AS exit_time
                            FROM tbl_attendance_queue
                            WHERE user_id = ${empAttend.user_id} AND submission_time >=${std_min_attend_date_wise} AND submission_time <= ${std_max_attend_date_wise}
                        `
                            .then(tblAttendanceQ => {

                                if (tblAttendanceQ.length === 0) return console.log(`employee attendence not found for update user_id(${isEmpAlreadyEntryAttend.user_id})`);
                                prisma.employeeAttendance.update({
                                    where: { id: isEmpAlreadyEntryAttend.id },
                                    data: {
                                        exit_time: tblAttendanceQ[0].exit_time
                                    }
                                })
                                    .then(() => {
                                        console.log(`employee user_id(${isEmpAlreadyEntryAttend.user_id}) update successfull`);

                                        const deleteIds = tblAttendanceQ.map((e) => e.id);

                                        prisma.tbl_attendance_queue.deleteMany({ where: { id: { in: deleteIds } } })
                                            .then(res => { console.log("tbl_attendance_queue delete successfull") })
                                            .catch(err => { console.log(`error delete employee tbl_attendance_queue ids${deleteIds}`, err.message) })

                                    })
                                    .catch((err) => `employee user_id(${isEmpAlreadyEntryAttend.user_id}) failed to update`)
                            })
                            .catch(err => { console.log({ "error failed employee tbl_attendance_queue ": err.message }) })
                    }
                    else {
                        prisma.$queryRaw`
                            SELECT
                                id,school_id,
                                MIN(submission_time) OVER() AS entry_time,
                                MAX(submission_time) OVER() AS exit_time
                            FROM tbl_attendance_queue
                            WHERE user_id = ${empAttend.user_id} AND submission_time >=${std_min_attend_date_wise} AND submission_time <= ${std_max_attend_date_wise}
                        `
                            .then(tblAttendanceQ => {
                                if (tblAttendanceQ.length === 0) return console.log(`tbl_attendance_queue for user_id(${empAttend.user_id})`);
                                let entry_time;
                                let exit_time;
                                if (Array.isArray(tblAttendanceQ) && tblAttendanceQ.length > 0) {
                                    entry_time = tblAttendanceQ[0].entry_time;
                                    exit_time = tblAttendanceQ.length > 1 ? tblAttendanceQ[0].exit_time : undefined;
                                }
                                prisma.employeeAttendance.create({
                                    data: {
                                        user_id: empAttend.user_id,
                                        school_id: tblAttendanceQ[0].school_id,
                                        date: today,
                                        status: "late",
                                        entry_time,
                                        exit_time
                                    }
                                })
                                    .then(res => {
                                        console.log(`create employee attendance user_id(${res.user_id})`);
                                        const deleteIds = tblAttendanceQ.map((e) => e.id);

                                        prisma.tbl_attendance_queue.deleteMany({ where: { id: { in: deleteIds } } })
                                            .then(res => { console.log("tbl_attendance_queue delete successfull") })
                                            .catch(err => { console.log(`error delete employee tbl_attendance_queue ids${deleteIds}`, err.message) })

                                    })
                                    .catch(err => { console.log(`error create employee attendance user_id(${res.user_id})`); })
                            })
                            .catch(err => { console.log("error employee tbl_qttendance_queue :", err.message) })

                    }
                })
            })
            .catch(err => {
                console.log(`error getting all emmployees from tbl_attendance_queue`)
            })

        // const resAttendance = await prisma.tbl_attendance_queue.findMany({
        //     // where: {
        //     //     school_id
        //     // }
        //     include: {
        //         user: {
        //             include: {
        //                 student: {
        //                     include: {
        //                         variance: {
        //                             where: { academic_year: { curr_active: true } },
        //                             include: { section: true },
        //                             take: 1
        //                         }
        //                     }
        //                 },
        //                 teacher: true,
        //             }
        //         }
        //     }
        // });
        // console.log({ resAttendance });
        // resAttendance.forEach(async (attendance_) => {
        //     const { user } = attendance_;
        //     const { teacher, student } = user ?? {};
        //     const { variance } = student ?? {};
        //     console.log({ attendance_ })
        //     let haveAttendance;
        //     // const { }
        //     // console.log({ student, teacher });
        //     if (student && (!Array.isArray(variance) || !variance[0]?.section?.std_entry_time)) {
        //         console.log(`error:= section std_entry_time not found`)
        //         return;
        //     }
        //     if (student) {
        //         const { section } = Array.isArray(variance) ? variance[0] : [];
        //         console.log(section);

        //         const date = new Date(Date.now());
        //         // const entry_time =

        //         haveAttendance = await stdAlreadyAttendance({ student_id: student.id, today: date, last_time: section.std_entry_time, school_id: user.school_id, section_id: section.id })
        //         // .then((res) => { console.log({ res }) })
        //         // .catch((err) => { console.log({ err }) })

        //         if (!haveAttendance) {
        //             // const verify = await isUserAttend({ user_id: user.id, std_min_attend_date_wise: section?.std_entry_time, entry_time: section?.std_entry_time, today: date })
        //             // console.log({ verify })
        //             // student_attendence({ student: variance[0], last_time: section?.std_entry_time, user_id: student.user_id });
        //         }
        //     }
        //     else haveAttendance = await empAlreadyAttendance(user.id);
        //     console.log({ haveAttendance });
        // })
    }
    catch (err) {
        prisma.$disconnect();
        console.log({ "server": err.message })
    }
}

// setInterval(()=>{
attendance();
// },60000)

// cron.schedule('* * * * *', () => {
// console.log('running every minute...');
//   });