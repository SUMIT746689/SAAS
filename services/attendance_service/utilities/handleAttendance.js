import prisma from "./prismaClient.js"

export const stdAlreadyAttendance = async ({ student_id, min_attend_datetime, max_attend_datetime }) => {
    console.log(JSON.stringify({ student_id, min_attend_datetime, min_attend_datetime }))
    const haveAttendance = await prisma.attendance.findFirst({
        where: { AND: [{ student_id }, { date: { gte: min_attend_datetime, lte: max_attend_datetime } }] },
        select: {
            id: true
        }
    });

    return haveAttendance;
}

export const empAlreadyAttendance = async (user_id) => {
    const haveAttendance = await prisma.employeeAttendance.findFirst({
        where: { user_id }
    });
    return haveAttendance;
}

export const updateAttendance = async ({ user_id, id, exit_time }) => {
    try {
        await prisma.attendance.update({
            where: { id },
            data: {
                exit_time
            }
        });
        return { error: null };
    }
    catch (err) {
        return { error: `user_id(${user_id}) student failed to update` };
    }
}

export const createAttendance = async (datas) => {
    const { student_id, status, section_id, school_id, first_name, middle_name, last_name, section_name, class_name, class_roll_no, entry_time, exit_time } = datas;
    try {
        if (!student_id || !status || !school_id || !first_name || !section_id || !section_name || !class_name || !class_roll_no || !entry_time) {
            return { error: `student_id(${student_id}) create attendance table failed ` }
        }
        const res = await prisma.attendance.create({
            data: {
                student_id,
                date: new Date(Date.now()),
                status,
                school_id,
                first_name,
                middle_name: middle_name,
                last_name: last_name,
                section_id,
                section_name,
                class_name,
                class_roll_no,
                entry_time,
                exit_time
            }
        });
        console.log({ res })
        return { error: null }
    }
    catch (err) {
        console.log({ err })
        return { error: `error: create attendaance student_id(${student_id})` }
    }
}

export const resEmployeeAttendance = async ({ user_id, min_attend_datetime, max_attend_datetime }) => {
    try {
        const res = await prisma.employeeAttendance.findFirst({
            where: { user_id, date: { gte: min_attend_datetime, lte: max_attend_datetime } }
        });
        return { error: null, data: res };
    }
    catch (err) {
        return { error: "", data: null };
    }
}

export const updateEmployeeAttendance = async ({ user_id, id, exit_time }) => {
    try {
        await prisma.employeeAttendance.update({
            where: { id },
            data: {
                exit_time
            }
        });
        return { error: null }
    }
    catch (err) {
        return { error: `employee user_id(${user_id}) failed to update` }
    }
}

export const createEmployeeAttendance = async ({ user_id, school_id, status, today, entry_time, exit_time }) => {
    try {
        await prisma.employeeAttendance.create({
            data: {
                user_id,
                school_id,
                date: today,
                status,
                entry_time,
                exit_time
            }
        });
        return { error: null }
    }
    catch (err) {
        return { error: err.message }
    }
}