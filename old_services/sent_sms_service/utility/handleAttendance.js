import prisma from "./prismaClient.js"

export const stdAlreadyAttendance = async ({ student_id, gte, lte }) => {
    const haveAttendance = await prisma.attendance.findFirst({
        where: { AND: [{ student_id }, { date: { gte, lte } }] },
        select: {
            id: true,
            status: true,
        }
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
    try {
        const { student_id, status, section_id, school_id, first_name, middle_name, last_name, section_name, class_name, class_roll_no, entry_time, exit_time } = datas;
        if (!student_id || !status || !school_id || !first_name || !section_id || !section_name || !class_name || !class_roll_no ) {
            return { error: `student_id(${student_id}) create attendance table failed ` }
        }
        const res = await prisma.attendance.create({
            data: {
                student_id,
                date: new Date(Date.now()),
                status,
                school_id,
                first_name,
                middle_name,
                last_name,
                section_id,
                section_name,
                class_name,
                class_roll_no,
                entry_time,
                exit_time
            }
        });
        return { error: null }
    }
    catch (err) {
        console.log({ err })
        return { error: `error: create attendaance student_id(${student_id})` }
    }
}

