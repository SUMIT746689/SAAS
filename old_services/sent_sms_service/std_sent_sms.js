// import { createSmsQueueTableHandler } from "./utility/createSmsQueueTableHandler.js";
import { todayMinMaxDateTime } from "./utility/dateTime.js";
import { handleIndividualQueue } from "./handleIndividualQueue.js";
import prisma from "./utility/prismaClient.js";
import { logFile } from "./utility/handleLog.js";

const main = async () => {
  try {
    prisma.tbl_student_sent_sms_queue.findMany()
      .then((res_tbl_student_sent_sms_queue) => {
        
        if (!res_tbl_student_sent_sms_queue || res_tbl_student_sent_sms_queue?.length === 0) logFile.info("manual attendace queue is empty");

        const { std_min_attend_date_wise, std_max_attend_date_wise } = todayMinMaxDateTime();

        // manually send attendance for students
        res_tbl_student_sent_sms_queue.forEach(individual_student_attendace_queue => {
          handleIndividualQueue({ student_attendace_queue: individual_student_attendace_queue, std_min_attend_date_wise, std_max_attend_date_wise })
        });
      })
      .catch(err => {
        logFile.error(err.message)
      })
  }

  catch (err) {
    prisma.$disconnect();
    logFile.error(err.message)
  }
}

main();
