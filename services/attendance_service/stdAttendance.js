import { createAttendance, stdAlreadyAttendance, updateAttendance } from "./utilities/handleAttendance.js";
import { deleteTblAttendanceQueues, resStdAttendanceQueues, userWiseAttendanceQueues, userWiseAttendanceQueuesWithStatus, userWiseMinMaxAttendanceQueues } from "./utilities/handleAttendanceQueue.js";
import { handleResStdInfo } from "./utilities/handleUserInfo.js";
import { logFile } from "./utilities/handleLog.js";
import { sentSms } from "./utilities/sent_sms.js";
import { createUTCAttendanceTimes, handleDateTimeUtcZeroFormat } from "./utilities/dateTime.js";

export const stdAttendance = async ({ min_attend_datetime, max_attend_datetime }) => {
    try {
        const iso_min_attend_datetime = min_attend_datetime.toISOString()
        const iso_max_attend_datetime = max_attend_datetime.toISOString()

        const { error, data } = await resStdAttendanceQueues(iso_min_attend_datetime, iso_max_attend_datetime);

        if (data) logFile.info(data);
        if (error) return logFile.error(error);
        if (data.length === 0) return logFile.info("student tbl_attendance_queue response array length is 0");

        data.forEach(async (userAttend) => {
            const { user_id } = userAttend;
            const { error, data: resStudent } = await handleResStdInfo({ user_id });
            if (error) return logFile.error(error);

            const { id, guardian_phone, batches, student_info, class_roll_no } = resStudent || {};
            if (!id) return logFile.error(`user_id(${user_id}) student not found, suggestion:check the academic year`);
            // if (!section?.std_entry_time || !section?.std_late_time || !section?.std_absence_time) return logFile.error(`user_id(${user_id}) section_id(${section?.id}) entry time, late time ,or absence time not found`);

            // const res
            if (!Array.isArray(batches) || batches.length === 0) return logFile.error(`user_id(${user_id}) student batches not founds`);

            const { error: s, data: stdAttendanceQueues } = await userWiseMinMaxAttendanceQueues({ user_id, min_attend_datetime, max_attend_datetime });

            const minEntryTimeQueue = handleDateTimeUtcZeroFormat(stdAttendanceQueues[0].entry_time, min_attend_datetime, max_attend_datetime).getTime();
            // const maxEntryTimeQueue = handleDateTimeUtcZeroFormat(stdAttendanceQueues[0].exit_time, min_attend_datetime, max_attend_datetime).getTime();
            
            // select a batch from all batches
            const resSelectBatch = (batches) => {

                const selectBatch = batches[0];
                const batchesLength = batches.length;
                if (batchesLength === 1) {
                    if (!selectBatch?.std_entry_time || !selectBatch?.std_late_time || !selectBatch?.std_absence_time) return { data: null, error: `user_id(${user_id}) section_id/batch_id(${selectBatch?.id}) entry time, late time ,or absence time not found` }

                    // make utc format custom attendance times 
                    const customEntryTime = createUTCAttendanceTimes(selectBatch.std_entry_time, min_attend_datetime, max_attend_datetime).getTime();
                    // const customLateTime = createUTCAttendanceTimes(selectBatch.std_late_time, min_attend_datetime, max_attend_datetime).getTime();
                    // const customAbsenceTime = createUTCAttendanceTimes(selectBatch.std_absence_time, min_attend_datetime, max_attend_datetime).getTime();
                    const customExitTime = createUTCAttendanceTimes(selectBatch.std_exit_time, min_attend_datetime, max_attend_datetime).getTime();

                    // console.log({ customEntryTime, customLateTime, customAbsenceTime, customExitTime });

                    return { data: selectBatch, error: null };
                }

                for (let i = 1; i < batchesLength; i++) {
                    if (!batches[i]?.std_entry_time || !batches[i]?.std_late_time || !batches[i]?.std_absence_time || !batches[i]?.std_exit_time) return { data: null, error: `user_id(${user_id}) section_id/batch_id(${batches[i]?.id}) entry time, late time ,or absence time not found` }

                    // make utc format custom attendance times 
                    const customEntryTime = createUTCAttendanceTimes(batches[i].std_entry_time, min_attend_datetime, max_attend_datetime).getTime();
                    // const customLateTime = createUTCAttendanceTimes(batches[i].std_late_time, min_attend_datetime, max_attend_datetime).getTime();
                    // const customAbsenceTime = createUTCAttendanceTimes(batches[i].std_absence_time, min_attend_datetime, max_attend_datetime).getTime();
                    const customExitTime = createUTCAttendanceTimes(batches[i].std_exit_time, min_attend_datetime, max_attend_datetime).getTime();

                    // console.log({ sss: minEntryTimeQueue < customEntryTime, ddd: minEntryTimeQueue < customExitTime, minEntryTimeQueue, customEntryTime, customExitTime });
                    if ( minEntryTimeQueue < customEntryTime  && minEntryTimeQueue < customExitTime) return { data: batches[i], error: null };
                }

                // console.log('test..............')
                const selectBatch_ = batches[batches.length - 1];
                return { data: selectBatch_, error: null };
            }

            const { data: section } = resSelectBatch(batches);
            // console.log({ section })
            // get auto attendende sent sms table
            const resAutoAttendanceSentSms = Array.isArray((resStudent.student_info.school.AutoAttendanceSentSms)) && resStudent.student_info.school.AutoAttendanceSentSms.length > 0 ? resStudent.student_info.school.AutoAttendanceSentSms[0] : {};
            if (!resAutoAttendanceSentSms?.is_attendence_active) return logFile.error(`user_id(${user_id}) section_id(${section?.id}) attendence is not active`);

            const isAlreadyAttendanceEntry = await stdAlreadyAttendance({ student_id: id, min_attend_datetime, max_attend_datetime })
            // console.log({ isAlreadyAttendanceEntry })
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

                // make utc format custom attendance times 
                const customEntryTime = createUTCAttendanceTimes(section.std_entry_time, min_attend_datetime, max_attend_datetime);
                const customLateTime = createUTCAttendanceTimes(section.std_late_time, min_attend_datetime, max_attend_datetime);
                const customAbsenceTime = createUTCAttendanceTimes(section.std_absence_time, min_attend_datetime, max_attend_datetime);

                const { error, data: stdAttendanceQ } = await userWiseAttendanceQueuesWithStatus({ user_id, entry_time: customEntryTime, late_time: customLateTime, absence_time: customAbsenceTime, min_attend_datetime: iso_min_attend_datetime, max_attend_datetime: iso_max_attend_datetime });
                // console.log({ stdAttendanceQ })

                if (error) return logFile.error(error);

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