import prisma from "./prismaClient.js";

export const handleClassWiseStudents = async ({ school_id, class_id, whereSection, academic_year_id }) => {
    try {
        const responseStudentsViaClass = await prisma.class.findFirst({
            where: {
                school_id,
                id: class_id,
            },
            select: {
                name: true,
                school: {
                    select: {
                        name: true,
                        masking_sms_price: true,
                        masking_sms_count: true,
                        non_masking_sms_price: true,
                        non_masking_sms_count: true,
                        AutoAttendanceSentSms: true
                    }
                },
                sections: {
                    where: whereSection,
                    select: {
                        id: true,
                        name: true,
                        std_entry_time: true,
                        std_exit_time: true,
                        students: {
                            where: {
                                academic_year_id
                            },
                            select: {
                                id: true,
                                guardian_phone: true,
                                class_roll_no: true,
                                student_info: {
                                    select: {
                                        first_name: true,
                                        middle_name: true,
                                        last_name: true,
                                        phone: true,
                                        user_id: true,
                                        gender: true
                                    }
                                }
                            }
                        },
                    }
                }
            }
        });
        if (!responseStudentsViaClass?.sections || responseStudentsViaClass.sections.length === 0) throw new Error("No students founds");

        return { error: null, data: responseStudentsViaClass };
    }
    catch (err) {
        return { error: err.message, data: null }
    }
}