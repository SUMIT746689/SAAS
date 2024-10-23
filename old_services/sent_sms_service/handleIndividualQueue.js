import { createSmsQueueTableHandler } from "./utility/createSmsQueueTableHandler.js";
import { handleClassWiseStudents } from "./utility/handleResClassWiseStudents.js";
import { handleSmsGateWay } from "./utility/handleSmsGateway.js";
import prisma from "./utility/prismaClient.js";
import { logFile } from "./utility/handleLog.js";
import { verifyIsUnicode } from "./utility/handleVerifyUnicode.js";
import { findMatches } from "./utility/findMatches.js";
import { customizeDateWithTime } from "./utility/dateTime.js";
import { createAttendance, stdAlreadyAttendance } from "./utility/handleAttendance.js";
import { handleNumberOfSmsParts } from "./utility/handleNoOfSmsParts.js";

export const handleIndividualQueue = async ({ student_attendace_queue, std_min_attend_date_wise, std_max_attend_date_wise }) => {
  try {
    const { id, class_id, section_id, school_id, academic_year_id, sent_sms_std_status, created_at } = student_attendace_queue;

    // verify sms gateway
    const { error, data: smsGatewayData } = await handleSmsGateWay({ school_id });
    if (error) return (error);
    const { id: smsGatewayId, sender_id, is_masking } = smsGatewayData;

    //get students via school class section academic year wise
    const whereSection = {};
    if (section_id) whereSection["id"] = section_id;
    const { error: student_err, data: studentsViaClass } = await handleClassWiseStudents({ school_id, class_id, whereSection, academic_year_id });
    if (student_err) return logFile.error(student_err);

    const { name: class_name, school } = studentsViaClass;
    const { name: school_name, masking_sms_price, masking_sms_count, non_masking_sms_price, non_masking_sms_count, AutoAttendanceSentSms } = school ?? {};

    const sms_count = is_masking ? masking_sms_count : non_masking_sms_count;
    const sms_price = is_masking ? masking_sms_price : non_masking_sms_price;

    // verify sms price
    // if (!sms_price || sms_price < 0) return logFile.error(`error school_id(${school_id}) have not ${sms_type} sms price`);

    // verify school have enough balance 
    let totalSmsCount = 0;
    studentsViaClass.sections.forEach((section, index) => {
      if (Array.isArray(section?.students)) totalSmsCount += section?.students.length;
    });

    if (sms_count < totalSmsCount) return logFile.error(`error school_id(${school_id}) have not enough ${is_masking ? 'masking' : 'non masking'} sms `);

    if (AutoAttendanceSentSms.length === 0) return logFile.error(`error school_id(${school_id}) auto_attendance_sent_sms table datas not founds  `);

    // delete queue
    prisma.tbl_student_sent_sms_queue.delete({ where: { id } }).catch(err => { logFile.error("error delete tbl_manual_student_attendace_queue", err) });

    studentsViaClass.sections.forEach((section, index) => {
      const { id: section_id, name: section_name } = section;

      section.students?.forEach(async student => {

        const { id, guardian_phone, class_roll_no, student_info } = student;
        const { user_id, first_name, middle_name, last_name, gender, phone } = student_info ?? {};

        if (!phone) return logFile.error(`phone number not found student_id(${id})`);

        // find attendance
        const haveAttendance = await stdAlreadyAttendance({ student_id: student.id, gte: std_min_attend_date_wise, lte: std_max_attend_date_wise })
        const { id: attedanceId, status: attendance_status } = haveAttendance || {}
        logFile.info(JSON.stringify(haveAttendance));

        if (!attedanceId) {
          const createAttendaceDatas = {
            student_id: student.id,
            date: new Date(Date.now()),
            status: 'absence',
            school_id,
            first_name,
            middle_name,
            last_name,
            section_id,
            section_name,
            class_name,
            class_roll_no,
            // entry_time,
            // exit_time
          }
          const { error } = await createAttendance(createAttendaceDatas)
          if (error) logFile.error(error)
          else logFile.info(`school_id(${school_id}), student_id(${student.id}) attendance created successfully`)
        }

        // get sent sms configurations
        const resAutoAttendanceSentSms = Array.isArray((AutoAttendanceSentSms)) && AutoAttendanceSentSms.length > 0 ? AutoAttendanceSentSms[0] : {};

        // add custom kwy values 
        student["relation_with_guardian"] = gender ? gender === "male" ? 'son' : 'daughter' : ''

        let select_sent_sms_status = attendance_status || "absence";
        if (sent_sms_std_status !== "all_type" && sent_sms_std_status !== attendance_status) return logFile.info(`student_id(${student.id}) attendence status(${attendance_status}), sent_sms_status(${sent_sms_std_status}) `)
        // if (sent_sms_std_status !== "all_type") select_sent_sms_status = select_sent_sms_status;
        // select sms body 
        let sms_text = resAutoAttendanceSentSms[`${select_sent_sms_status}_body`];
        if (!sms_text) return logFile.error(`${select_sent_sms_status}_body is not founds`);

        //dynamic values replace
        const allMatchesArray = findMatches(sms_text);
        for (const element of allMatchesArray) {
          sms_text = sms_text.replaceAll(`#${element}#`, student[element] || student_info[element] || (element === 'attendance_status' && (attendance_status || 'absence')) || element === 'submission_time' && customizeDateWithTime(created_at) || '')
        }

        // sms type verify
        const isUnicode = verifyIsUnicode(sms_text);
        const sms_type = isUnicode ? 'unicode' : 'text';

        // remove extra spaces
        sms_text = sms_text.replace(/ +(?= )/g, '');
        logFile.info(JSON.stringify(sms_text))

        // calculate part of sms
        const number_of_sms_parts = handleNumberOfSmsParts({ isUnicode, textLength: sms_text.length })

        // create sent sms queue, tbl sent sms and update school 
        const smsQueueHandlerParameters = {
          user_id,
          contacts: phone,
          submission_time: created_at,
          school_id,
          school_name,
          sender_id: smsGatewayId,
          sender_name: sender_id,
          index,
          sms_type,
          charges_per_sms: sms_price,
          sms_text,
          is_masking,
          number_of_sms_parts
        };

        createSmsQueueTableHandler(smsQueueHandlerParameters);
      })
    })
  }
  catch (err) {
    logFile.error(err.message)
  }
}