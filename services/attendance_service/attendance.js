import prisma from "./utilities/prismaClient.js";
import { todayMinMaxDateTime, todayMinMaxDateTimeUtcZeroFormat } from "./utilities/dateTime.js";
import { stdAttendance } from "./stdAttendance.js";
import { empAttendance } from "./empAttendance.js";
import { logFile } from "./utilities/handleLog.js";

const attendance = async () => {
    try {

        const { curr_time, min_attend_datetime, max_attend_datetime } = todayMinMaxDateTimeUtcZeroFormat();

        // student attendance processing 
        stdAttendance({curr_time, min_attend_datetime, max_attend_datetime });

        // employees attendance processing
        empAttendance({ today:curr_time, min_attend_datetime, max_attend_datetime });
    }
    catch (err) {
        prisma.$disconnect();
        logFile.error({ "server": err.message })
    }
}

// setInterval(()=>{
attendance();
// },60000)

// cron.schedule('* * * * *', () => {
// console.log('running every minute...');
//   });