import prisma from "./prismaClient.js";

export const resStdAttendanceQueues = async (from, to) => {
    try {
        const res = await prisma.$queryRaw`
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
                WHERE user_role.id = users.role_id AND TIMESTAMP(${from}) <= TIMESTAMP(taq.submission_time)  AND TIMESTAMP(${to}) >= TIMESTAMP(taq.submission_time)  
                GROUP BY taq.user_id
                )

            SELECT * FROM attendance_queue;
        `

        if (!Array.isArray(res)) return { error: "student tbl_attendance_queue response is not array", data: null };
        return { error: null, data: res };
    }
    catch (err) {
        return { error: "tbl_attendance_queue fetch error", data: null }
    }
}

export const userWiseAttendanceQueues = async ({ user_id, min_attend_datetime, max_attend_datetime }) => {
    try {
        const res = await prisma.$queryRaw`
            SELECT
            id,school_id,
            MIN(submission_time) OVER() AS entry_time,
            MAX(submission_time) OVER() AS exit_time
            FROM tbl_attendance_queue
            WHERE user_id = ${user_id} AND submission_time >=${min_attend_datetime} AND submission_time <= ${max_attend_datetime}
        `
        if (res.length === 0) return { error: `attendence not found for update user_id(${user_id})`, data: null };
        return { error: null, data: res }
    }
    catch (err) {
        return { error: err.message, data: null }
    }
}

export const userWiseMinMaxAttendanceQueues = async ({ user_id, min_attend_datetime, max_attend_datetime }) => {
    try {
        const res = await prisma.$queryRaw`
            SELECT
            MIN(submission_time) AS entry_time,
            MAX(submission_time) AS exit_time
            FROM tbl_attendance_queue
            WHERE user_id = ${user_id} AND submission_time >=${min_attend_datetime} AND submission_time <= ${max_attend_datetime}
            GROUP BY user_id
        `
        if (res.length === 0) return { error: `attendence not found for update user_id(${user_id})`, data: null };
        return { error: null, data: res }
    }
    catch (err) {
        return { error: err.message, data: null }
    }
}

export const deleteTblAttendanceQueues = async ({ ids }) => {
    try {
        const res = await prisma.tbl_attendance_queue.deleteMany({ where: { id: { in: ids } } })
        return { error: null };

    } catch (err) {
        return { error: `error delete tbl_attendance_queue ids${deleteIds} ${err.message}` }
    }
}

export const userWiseAttendanceQueuesWithStatus = async ({ user_id, entry_time, late_time, absence_time, min_attend_datetime, max_attend_datetime }) => {
    try {
        const res = await prisma.$queryRaw`
        SELECT
            id,
            (
                CASE 
                WHEN TIME(MIN(submission_time) OVER()) <= TIME(${late_time}) THEN "present"
                WHEN TIME(MIN(submission_time) OVER()) <= TIME(${absence_time}) THEN "late"
                ELSE "absence"
                END
            ) AS status,
            MIN(submission_time) OVER() AS entry_time,
            MAX(submission_time) OVER() AS exit_time
        FROM tbl_attendance_queue
        WHERE user_id = ${user_id} AND submission_time >=${min_attend_datetime} AND submission_time <= ${max_attend_datetime}
    `
        return ({ error: null, data: res })
    }
    catch (err) {
        return { error: `error get tbl_attendance_queue user_id(${user_id}) : ${err.message}`, data: null }
    }
}

export const resEmpAttendanceQueues = async () => {
    try {
        const res = await prisma.$queryRaw`
        WITH 
        user_role as (
            SELECT id, title FROM Role
            WHERE title="STUDENT"
        ),
        attendance_queue as (
            SELECT users.user_role_id,user_id,users.school_id as school_id
            FROM tbl_attendance_queue as taq
            JOIN user_role
            JOIN users ON taq.user_id = users.id
            WHERE user_role.id != users.role_id AND DATE(taq.submission_time) = DATE(NOW())
            GROUP BY taq.user_id
            )

        SELECT * FROM attendance_queue;
    `
        if (!Array.isArray(res)) return { error: "tbl_attendance_queue response is not array", data: null };
        return { error: null, data: res };
    }
    catch (err) {
        return { error: "getting all emmployees from tbl_attendance_queue", data: null }
    }
}