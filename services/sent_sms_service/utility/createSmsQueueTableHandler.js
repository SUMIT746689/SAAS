import { logFile } from "./handleLog.js";
import prisma from "./prismaClient.js";


export const createSmsQueueTableHandler = ({ user_id, contacts, sms_text, submission_time, school_id, school_name, sender_id, sms_type, index, number_of_sms_parts, charges_per_sms }) => {

  const currentDate = new Date().getTime();
  const sms_shoot_id = [String(school_id), String(currentDate), String(index)].join("_");

  prisma.$transaction([
    prisma.tbl_queued_sms.create({
      data: {
        sms_shoot_id,
        user_id: parseInt(user_id),
        school_id,
        school_name,
        sender_id,
        sms_type,
        sms_text,
        // // sender_id: 1,
        // // sender_name: "",
        submission_time: new Date(submission_time),
        contacts,
        pushed_via: '',
        // // status: status,
        // // route_id: 1,
        // // coverage_id: 1,
        charges_per_sms,
        total_count: 1,
        number_of_sms_parts
        // // is_black_list: 2,
        //fail_count: 3,
        //priority: 4
      }
    }),
    prisma.tbl_sent_sms.create({
      data: {
        sms_shoot_id,
        user_id: parseInt(user_id),
        school_id,
        school_name,
        sender_id,
        sms_type,
        sms_text,
        // // sender_id: 1,
        // // sender_name: "",
        submission_time: new Date(submission_time),
        contacts,
        pushed_via: '',
        // // status: status,
        // // route_id: 1,
        // // coverage_id: 1,
        charges_per_sms,
        total_count: 1,
        number_of_sms_parts
        // // is_black_list: 2,
        //fail_count: 3,
        //priority: 4
      }
    }),
    prisma.school.update({
      where: { id: school_id },
      data: {
        masking_sms_count: sms_type === "masking" ? { decrement: 1 } : undefined,
        non_masking_sms_count: sms_type === "non_masking" ? { decrement: 1 } : undefined
      }
    })
  ])
    .then(res => { logFile.error(`tbl_queue_sms, tbl_sent_sms created & school_id(${school_id}) update sucessfully`) })
    .catch(err => { logFile.error("error tbl_queue_sms or tbl_sent_sms create", err) })
}