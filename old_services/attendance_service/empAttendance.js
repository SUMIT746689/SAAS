import { resEmpAttendanceQueues, userWiseAttendanceQueues, deleteTblAttendanceQueues, userWiseAttendanceQueuesWithStatus } from "./utility/handleAttendanceQueue.js"
import { createEmployeeAttendance, resEmployeeAttendance, updateEmployeeAttendance } from "./utility/handleAttendance.js"
import { logFile } from "./utility/handleLog.js";

export const empAttendance = async ({ today, min_attend_datetime, max_attend_datetime }) => {
    const { error, data: resEmp } = await resEmpAttendanceQueues();
    if (error) return logFile.error(error);
    if (resEmp.length === 0) return logFile.info("today's employee tbl_attendance_queue response array length is 0");

    resEmp.forEach(async (empAttend) => {
        logFile.info(JSON.stringify(empAttend))
        const { user_id, school_id } = empAttend;
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
            const emp_entry_time = new Date();

            const { error: errTblAttendanceQ, data: tblAttendanceQ } = await userWiseAttendanceQueuesWithStatus({ user_id, entry_time: emp_entry_time, min_attend_datetime, max_attend_datetime })
            if (error) return logFile.error(errTblAttendanceQ)
            let entry_time;
            let exit_time;
            if (Array.isArray(tblAttendanceQ) && tblAttendanceQ.length > 0) {
                entry_time = tblAttendanceQ[0].entry_time;
                exit_time = tblAttendanceQ.length > 1 ? tblAttendanceQ[0].exit_time : undefined;
            }
            const status = "present";
            const { error: errorCreateEmpAttendance } = await createEmployeeAttendance({ user_id, school_id, today, status, entry_time, exit_time });
            if (errorCreateEmpAttendance) return logFile.error(errorCreateEmpAttendance)
            logFile.info(`user_id(${user_id}) employee attendance created successfully`)

            const deleteIds = tblAttendanceQ.map((e) => e.id);
            const { error: errorDeleteTblAttendance } = await deleteTblAttendanceQueues({ ids: deleteIds })
            if (errorDeleteTblAttendance) return logFile.error(errorDeleteTblAttendance)
            logFile.info("tbl_attendance_queue delete successfull")
        }

    });
}