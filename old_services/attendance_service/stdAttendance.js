import path from "path";
import { createAttendance, stdAlreadyAttendance, updateAttendance } from "./utility/handleAttendance.js";
import { deleteTblAttendanceQueues, resStdAttendanceQueues, userWiseAttendanceQueues, userWiseAttendanceQueuesWithStatus, userWiseMinMaxAttendanceQueues } from "./utility/handleAttendanceQueue.js";
import { handleResStdInfo } from "./utility/handleUserInfo.js";
import { logFile } from "./utility/handleLog.js";
import { sentSms } from "./utility/sent_sms.js";

export const stdAttendance = async ({ min_attend_datetime, max_attend_datetime }) => {
    try {
        const { error, data } = await resStdAttendanceQueues(min_attend_datetime, max_attend_datetime);
        if (error) return logFile.error(error);
        if (data.length === 0) return logFile.info("student tbl_attendance_queue response array length is 0");

        data.forEach(async (userAttend) => {
            const { user_id } = userAttend;

            const { error, data: resStudent } = await handleResStdInfo({ user_id });
            console.log({ resStudent: JSON.stringify(resStudent, null, 3) })
            if (error) return logFile.error(error);

            const { id, guardian_phone, batches, student_info, class_roll_no } = resStudent || {};

            if (!id) return logFile.error(`user_id(${user_id}) student not found, suggestion:check the academic year`);

            // const res
            if (!Array.isArray(batches) || batches.length === 0) return logFile.error(`user_id(${user_id}) student batches not founds`);

            const { error: s, data: stdAttendanceQueues } = await userWiseMinMaxAttendanceQueues({ user_id, min_attend_datetime, max_attend_datetime });
            console.log({ stdAttendanceQueues: stdAttendanceQueues })

            // select a batch from all batches
            const resSelectBatch = (batches) => {

                const selectBatch = batches[batches.length - 1];
                const batchesLength = batches.length;
                if (batchesLength === 1) {
                    if (!selectBatch?.std_entry_time || !selectBatch?.std_late_time || !selectBatch?.std_absence_time) return { error: `user_id(${user_id}) section_id/batch_id(${selectBatch?.id}) entry time, late time ,or absence time not found` }
                    return { data: selectBatch };
                }

                for (let i = 0; i < (batchesLength - 1); i++) {
                    if (!batches[i]?.std_entry_time || !batches[i]?.std_late_time || !batches[i]?.std_absence_time) return { error: `user_id(${user_id}) section_id/batch_id(${batches[i]?.id}) entry time, late time ,or absence time not found` }
                    // if(batches[i].std_entry_time < batches. )
                    // console.lof({batches.})
                    return { data: batches[i] };
                }
            }

            const { data: section } = resSelectBatch(batches);
            console.log({ section, max_attend_datetime, min_attend_datetime })


            // get auto attendende sent sms table
            const resAutoAttendanceSentSms = Array.isArray((resStudent.student_info.school.AutoAttendanceSentSms)) && resStudent.student_info.school.AutoAttendanceSentSms.length > 0 ? resStudent.student_info.school.AutoAttendanceSentSms[0] : {};
            if (!resAutoAttendanceSentSms?.is_attendence_active) return logFile.error(`user_id(${user_id}) section_id(${section?.id}) attendence is not active`);

            const isAlreadyAttendanceEntry = await stdAlreadyAttendance({ student_id: id, min_attend_datetime, max_attend_datetime })

            if (isAlreadyAttendanceEntry && isAlreadyAttendanceEntry?.id) {

                const { error, data: stdAttendanceQ } = await userWiseAttendanceQueues({ user_id, min_attend_datetime, max_attend_datetime });
                if (error) return logFile.error(error);
                const { error: errorAttend } = await updateAttendance({ id: isAlreadyAttendanceEntry.id, exit_time: stdAttendanceQ[0].exit_time })
                if (errorAttend) return logFile.error(error);

                logFile.info(`user_id(${user_id}) student update successfull`);

                const deleteIds = stdAttendanceQ.map((e) => e.id);
                const { error: errDeleteTblAttendanceQueues } = await deleteTblAttendanceQueues({ ids: deleteIds })
                if (errDeleteTblAttendanceQueues) logFile.error(error);

                logFile.info("tbl_attendance_queue delete successfull");

                // sent sms
                // sentSms(resAutoAttendanceSentSms, isAlreadyAttendanceEntry, resStudent, user_id, stdAttendanceQ[0].exit_time, status);

            }
            else {
                const { error, data: stdAttendanceQ } = await userWiseAttendanceQueuesWithStatus({ user_id, entry_time: section.std_entry_time, late_time: section.std_late_time, absence_time: section.std_absence_time, min_attend_datetime, max_attend_datetime });
                if (error) return logFile.error(error)

                let entry_time;
                let exit_time;
                if (Array.isArray(stdAttendanceQ) && stdAttendanceQ.length > 0) {
                    entry_time = stdAttendanceQ[0].entry_time;
                    exit_time = stdAttendanceQ.length > 1 ? stdAttendanceQ[0].exit_time : undefined;
                };
                if (!stdAttendanceQ.length === 0) return logFile.error(`today student user_id(${user_id}) attendence list not founds `)
                const createAttendanceDatas = {
                    student_id: id,
                    status: stdAttendanceQ[0].status,
                    section_id: section.id,
                    school_id: student_info.school_id,
                    first_name: student_info.first_name,
                    middle_name: student_info.middle_name || undefined,
                    last_name: student_info.last_name || undefined,
                    section_name: section.name,
                    class_name: section.class.name,
                    class_roll_no,
                    entry_time,
                    exit_time
                };
                const { error: errorCreateAttnd } = await createAttendance(createAttendanceDatas);
                if (errorCreateAttnd) return logFile.error(errorCreateAttnd)
                logFile.info("create attendance successfull");

                const deleteIds = stdAttendanceQ.map((e) => e.id);
                const { error: errorDeletetblAttQueues } = await deleteTblAttendanceQueues({ ids: deleteIds })
                if (errorDeletetblAttQueues) return logFile.error(errorDeletetblAttQueues);
                logFile.info("tbl_attendance_queue delete successfull");

                if (!resAutoAttendanceSentSms?.is_sms_active) return logFile.info(`school id(${student_info.school_id}) "is_sms_active" is false for sent sms student_id(${id})  `)
                // sent sms
                // const resAutoAttendanceSentSms = Array.isArray((resStudent.student_info.school.AutoAttendanceSentSms)) && resStudent.student_info.school.AutoAttendanceSentSms.length > 0 ? resStudent.student_info.school.AutoAttendanceSentSms[0] : {};
                sentSms(resAutoAttendanceSentSms, isAlreadyAttendanceEntry, resStudent, user_id, stdAttendanceQ[0].exit_time, stdAttendanceQ[0].status);

            }
        })
    }
    catch (err) {
        logFile.error(err.message);
    }
} 