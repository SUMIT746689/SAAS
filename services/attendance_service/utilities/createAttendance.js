// import prisma from "./prisma_client.js"
import { isUserAttend } from "./verifyUserAttend.js"

export const student_attendence = async ({ student, last_time, user_id }) => {
    console.log({ student })
    const verify = await isUserAttend({ user_id, std_min_attend_date_wise: new Date(), entry_time: last_time })
    console.log({ verify })
}