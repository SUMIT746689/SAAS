import { userWiseAttendanceQueues, deleteTblAttendanceQueues, userWiseAttendanceQueuesWithStatus, teacherUserWiseAttendanceQueuesWithStatus, resTeacherAttendanceQueues } from "./utilities/handleAttendanceQueue.js"
import { createEmployeeAttendance, resEmployeeAttendance, updateEmployeeAttendance } from "./utilities/handleAttendance.js"
import { logFile } from "./utilities/handleLog.js";
import { createUTCAttendanceTimes } from "./utilities/dateTime.js";

export const empAttendance = async ({ today, min_attend_datetime, max_attend_datetime }) => {

    const iso_min_attend_datetime = min_attend_datetime.toISOString()
    const iso_max_attend_datetime = max_attend_datetime.toISOString()

    // const { error, data: resEmp } = await resEmpAttendanceQueues({ min_attend_datetime: iso_min_attend_datetime, max_attend_datetime: iso_max_attend_datetime });
    const { error, data: resEmp } = await resTeacherAttendanceQueues({ user_role_title: 'TEACHER', min_attend_datetime: iso_min_attend_datetime, max_attend_datetime: iso_max_attend_datetime });

    if (error) return logFile.error(error);
    if (resEmp.length === 0) return logFile.info("today's employee tbl_attendance_queue response array length is 0");


    resEmp.forEach(async (empAttend) => {
        logFile.info(JSON.stringify(empAttend))
        const { user_id, school_id, user_role_title, entry_time: shift_entry_time, late_time: shift_late_time, absence_time: shift_absence_time } = empAttend;
        const { error, data: isEmpAlreadyEntryAttend } = await resEmployeeAttendance({ user_id, min_attend_datetime, max_attend_datetime })
        if (error) return logFile.error(error)

        if (isEmpAlreadyEntryAttend) {
            const { error, data: tblAttendanceQ } = await userWiseAttendanceQueues({ user_id, min_attend_datetime, max_attend_datetime });
            // logFile.error( error, tblAttendanceQ })
            if (error) return logFile.error(error);

            const { error: errorEmpAttendanceUpdate } = await updateEmployeeAttendance({ user_id, id: isEmpAlreadyEntryAttend.id, exit_time: tblAttendanceQ[0].exit_time })
            if (errorEmpAttendanceUpdate) return logFile.error(errorEmpAttendanceUpdate)
            logFile.info(`user_id(${user_id}) employee attendance updated successfully`)

            const deleteIds = tblAttendanceQ.map((e) => e.id);
            const { error: errorDeleteTblAttendance } = await deleteTblAttendanceQueues({ ids: deleteIds })
            if (error) return logFile.error(errorDeleteTblAttendance)
            logFile.info("tbl_attendance_queue deleted successfully")
        }
        else {
            // employee entry time and exit time needed to includes
            // const emp_entry_time = new Date();

            // make utc format custom attendance times 
            const customEntryTime = createUTCAttendanceTimes(shift_entry_time, min_attend_datetime, max_attend_datetime);
            const customLateTime = createUTCAttendanceTimes(shift_late_time, min_attend_datetime, max_attend_datetime);
            const customAbsenceTime = createUTCAttendanceTimes(shift_absence_time, min_attend_datetime, max_attend_datetime);

            const { error: errTblAttendanceQ, data: tblAttendanceQ } = await userWiseAttendanceQueuesWithStatus({ user_id, user_role_title, entry_time: customEntryTime, late_time: customLateTime, absence_time: customAbsenceTime, min_attend_datetime: iso_min_attend_datetime, max_attend_datetime: iso_max_attend_datetime })
            console.log({ tblAttendanceQ });
            logFile.info(tblAttendanceQ);
            if (error) return logFile.error(errTblAttendanceQ)
            // let entry_time;
            // let exit_time;
            // if (Array.isArray(tblAttendanceQ) && tblAttendanceQ.length > 0) {
            //     entry_time = tblAttendanceQ[0].entry_time;
            //     exit_time = tblAttendanceQ.length > 1 ? tblAttendanceQ[0].exit_time : undefined;
            // }
            // const status = "present";
            const { status, entry_time, exit_time } = tblAttendanceQ[0];
            console.log({ status })
            
            const { error: errorCreateEmpAttendance } = await createEmployeeAttendance({ user_id, school_id, today, status, entry_time, exit_time });
            if (errorCreateEmpAttendance) return logFile.error(errorCreateEmpAttendance);
            logFile.info(`user_id(${user_id}) employee attendance created successfully`)

            const deleteIds = tblAttendanceQ.map((e) => e.id);
            const { error: errorDeleteTblAttendance } = await deleteTblAttendanceQueues({ ids: deleteIds })
            if (errorDeleteTblAttendance) return logFile.error(errorDeleteTblAttendance)
            logFile.info("tbl_attendance_queue delete successfull")
        }

    });
}