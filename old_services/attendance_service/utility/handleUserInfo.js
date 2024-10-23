import prisma from "./prismaClient.js";

export const handleResStdInfo = async ({ user_id }) => {
    try {
        const res = await prisma.student.findFirst({
            where: {
                AND: [
                    { student_info: { user_id } },
                    { academic_year: { curr_active: true } }
                ]
            }, select: {
                id: true,
                guardian_phone: true,
                class_roll_no: true,
                // section: {
                //     select:
                //     {
                //         id: true,
                //         name: true,
                //         std_entry_time: true,
                //         std_late_time: true,
                //         std_absence_time: true,
                //         std_exit_time: true,
                //         class: {
                //             select:
                //                 { name: true }
                //         }
                //     }
                // },
                student_info: {
                    select:
                    {
                        first_name: true,
                        middle_name: true,
                        last_name: true,
                        school_id: true,
                        phone: true,
                        gender: true,
                        school: {
                            select: {
                                name: true,
                                AutoAttendanceSentSms: true,
                                SmsGateway: true,
                                masking_sms_count: true,
                                non_masking_sms_count: true,
                            }
                        }
                    }
                },
                batches: {
                    orderBy: { std_entry_time: "asc" }
                }
            }
        })
        return { error: null, data: res }
    }
    catch (err) {
        return { error: `student user_id(${user_id}) fetch error`, data: null }
    }

}