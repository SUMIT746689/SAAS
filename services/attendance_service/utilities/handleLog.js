import path from "path";
import { fileURLToPath } from "url";
import winston from "winston";
import 'winston-daily-rotate-file';

const handleLogFile = () => {
    const { combine, timestamp, printf, align } = winston.format;

    const __filename = fileURLToPath(import.meta.url);
    const logfilePath = process.env.SCRIPT_ATTENDANCE_LOG_PATH || path.join(__filename, '../../logs');

    const fileRotateTransport = new winston.transports.DailyRotateFile({
        // filename: 'logs/application-%DATE%.log',
        filename:  `${logfilePath}/attendance-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: '5d',
    });

    const logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: combine(
            timestamp({
                format: 'YYYY-MM-DD hh:mm:ss.SSS A',
            }),
            align(),
            printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
        ),
        transports: [fileRotateTransport],
    });

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // month is zero-based
    let dd = today.getDate();

    // const __filename = fileURLToPath(import.meta.url);
    // const logfilePath = process.env.SCRIPT_ATTENDANCE_LOG_PATH || path.join(__filename, '../../logs');
    // logger.add(new winston.transports.File({
    //     // filename: `${logfilePath}/attendance_${mm}_${dd}_${yyyy}.log`, 
    //     filename: 'logs/application-%DATE%.log',
    //     datePattern: `YYYY-MM-DD-HH`,
    //     zippedArchive: true,
    //     maxFiles: "5d",
    // }));

    return logger;
}

export const logFile = handleLogFile();