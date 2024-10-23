import { createSmsQueueTableHandler } from "./createSmsQueueTableHandler.js";
import { customizeDateWithTime } from "./dateTime.js";
import { findMatches } from "./findMatches.js";
import { logFile } from "./handleLog.js";
import { handleNumberOfSmsParts } from "./handleNoOfSmsParts.js";
import { verifyIsUnicode } from "./handleVerifyUnicode.js";

export const sentSms = (data, isAlreadyAttendanceEntry, studentDatas, user_id, submission_time, status) => {
    try {

        const { name, SmsGateway, masking_sms_count, non_masking_sms_count } = studentDatas?.student_info?.school ?? {};
        const { id: smsGatewayId, details } = Array.isArray(SmsGateway) && SmsGateway?.length > 0 ? SmsGateway[0] : {};
        const { sender_id, is_masking } = details ?? {};
        if (!sender_id) return logFile.error(`student sent sms, user_id(${user_id}) sender_id not founds`);
        if (!data.is_sms_active) return logFile.error(`student sent sms, user_id(${user_id}) school_id(${studentDatas.student_info.school_id}) sent sms is not active`);
        if (!data.every_hit && isAlreadyAttendanceEntry?.id) return logFile.error(`student sent sms, user_id(${user_id}) school_id(${studentDatas.student_info.school_id}) every_hit(${data.every_hit}) already sent sms automatic attendance`);
        if (!studentDatas?.student_info?.phone) return logFile.error(`student sent sms, user_id(${user_id}) phone number not founds`)

        if (!data[`${status}_body`]) return logFile.error(`student sent sms, user_id(${user_id}) sms ${status}_body not found`)

        if (!data[`is_${status}_sms_active`]) return logFile.error(`student status:${status} sent sms is not active, user_id(${user_id}) `)
        let body = data[`${status}_body`];

        const allMatchesArray = findMatches(body);

        studentDatas["relation_with_guardian"] = studentDatas?.student_info?.gender ? studentDatas.student_info.gender === "male" ? 'son' : 'daughter' : ''

        for (const element of allMatchesArray) {
            body = body.replaceAll(`#${element}#`, studentDatas[element] || studentDatas.student_info[element] || element === 'submission_time' && customizeDateWithTime(submission_time) || '')
        }
        body = body.replace(/ +(?= )/g, '');

        const isUnicode = verifyIsUnicode(body);

        // verify no of parts a sms
        const sms_available_count = is_masking ? masking_sms_count : non_masking_sms_count;
        const number_of_sms_parts = handleNumberOfSmsParts({ isUnicode, textLength: body.length });
        if (sms_available_count < number_of_sms_parts) return logFile.error(`student sent sms, user_id(${user_id}) school_id(${studentDatas.student_info.school_id}) ${is_masking ? 'masking' : 'non masking'} sms count is ${sms_available_count}`);

        const smsQTableHandlerDatas = {
            user_id,
            contacts: studentDatas.student_info.phone,
            sms_text: body,
            submission_time: Date.now(),
            school_id: studentDatas.student_info.school_id,
            school_name: name,
            sender_id: smsGatewayId,
            sender_name: sender_id,
            sms_type: isUnicode ? 'unicode' : 'text',
            index: user_id,
            number_of_sms_parts,
            charges_per_sms: 0,
            is_masking,
        };
        createSmsQueueTableHandler(smsQTableHandlerDatas);
    }
    catch (err) {
        console.log({ err })
    }
}