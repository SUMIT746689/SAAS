import prisma from "./utility/prismaClient.js";
import { todayMinMaxDateTime, todayMinMaxDateTimeUtcZeroFormat } from "./utility/dateTime.js";
import { stdAttendance } from "./stdAttendance.js";
import { empAttendance } from "./empAttendance.js";
import { logFile } from "./utility/handleLog.js";

const attendance = async () => {
    try {

        const { today, min_attend_datetime, max_attend_datetime } = todayMinMaxDateTimeUtcZeroFormat();

        // student attendance processing 
        stdAttendance({ min_attend_datetime, max_attend_datetime });

        // employees attendance processing
        empAttendance({ today, min_attend_datetime, max_attend_datetime });
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