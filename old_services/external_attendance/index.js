import axios from "axios";
import { logFile } from "./utilities/handleLog.js";
import prisma from "./utilities/prismaClient.js";
import { handleDateTimeUtcZeroFormat } from "./utilities/handletime.js";

let max_date;
let max_time;
let resAutoAttdnceSentSms = [];

const handleGetAutoAttdnceSentSms = () => {
    prisma.autoAttendanceSentSms.findMany({
        where: {
            use_system_type: "external_api",
            is_attendence_active: true,
        },
        select: {
            external_api_info: true,
            school: {
                select: {
                    name: true
                }
            },
            school_id: true
        }
    }).then((res) => resAutoAttdnceSentSms = res);
}

handleGetAutoAttdnceSentSms();

setInterval(() => {
    handleGetAutoAttdnceSentSms();
}, 60000 * 5)

const main = async () => {
    try {
        console.log(resAutoAttdnceSentSms)
        // const resAutoAttdnceSentSms = await prisma.autoAttendanceSentSms.findMany({
        //     where: {
        //         use_system_type: "external_api",
        //         is_attendence_active: true,
        //     },
        //     select: {
        //         external_api_info: true,
        //         school: {
        //             select: {
        //                 name: true
        //             }
        //         },
        //         school_id: true
        //     }
        // });
        resAutoAttdnceSentSms?.forEach(async singleResp => {

            const { external_api_info, school, school_id } = singleResp;
            const { url_params } = external_api_info || {};

            const date = new Date(Date.now() - 60000 * 3);
            const today = date.toLocaleDateString('en-CA');
            const start_time = date.toLocaleTimeString('en-US', { hour12: false });

            let auth_user
            let auth_code

            url_params.forEach(({ key, value }) => {
                switch (key) {
                    case "auth_user":
                        auth_user = value;
                        break;
                    case "auth_code":
                        auth_code = value;
                        break;
                }
            });

            if (!auth_user || !auth_code) return logFile.error(`school(${school?.name})auth_user or auth_code field not founds`)

            // const smsBody = {
            //     operation: "fetch_log",
            //     auth_user: "TUAMS",
            //     auth_code: "8c3dwtsz1r2e8y5y5r4cj3qcie4nit3",
            //     start_date: "2024-02-27",
            //     end_date: "2024-02-29",
            //     start_time: "12:00:00",
            //     end_time: "23:59:59"
            // };
            // console.log({ today, start_time })
            const smsBody = {
                operation: "fetch_log",
                auth_user: auth_user,
                auth_code: auth_code,
                start_date: today,
                end_date: today,
                start_time: start_time,
                end_time: "23:59:59"
            }
            const { data } = await axios.post("https://rumytechnologies.com/rams/json_api", smsBody);
            // console.log(data)
            if (!Array.isArray(data?.log)) return logFile.error(`auth_user(${auth_user}) response(${data})`);


            data?.log.forEach(async attendance_stat => {
                const { registration_id, user_name, access_id, unit_id, card, access_time, access_date } = attendance_stat;

                // save attendence files
                prisma.attendence_info.create({ data: { type: "external_api", body: attendance_stat, school_id } })
                    .catch(err => { logFile.error(` user_name(${user_name}) ${err}`) })

                const datas = await prisma.student.findFirst({
                    where: {
                        student_info: {
                            card_no: card,
                            school_id
                        },
                        academic_year: { curr_active: true },
                    },
                    select: {
                        id: true,
                        student_info: {
                            select: {
                                user_id: true
                            }
                        }
                    }
                })

                if (!datas) {
                    return logFile.error(`auth_user(${auth_user}), user not founds username(${user_name}) `);
                    // continue;
                };
                console.log({ access_date, access_time });

                const time = new Date(access_date);
                const access_time_ = access_time.split(':');
                time.setUTCHours(access_time_[0]);
                time.setUTCMinutes(access_time_[1]);
                time.setUTCSeconds(access_time_[2]);
                const customTime = handleDateTimeUtcZeroFormat(time)
                
                console.log({ customTime });

                // tbl_attendance_queue_datas.push({
                //     school_id: datas.school_id,
                //     machine_id: `${registration_id}_${access_id}_${unit_id}_${card}`,
                //     user_id: datas.id,
                //     status: 1,
                //     submission_time: time
                // });

                await prisma.tbl_attendance_queue.create({
                    data: {
                        school_id,
                        // machine_id: `${registration_id}_${access_id}_${unit_id}_${card}`,
                        machine_id: unit_id,
                        user_id: datas.student_info.user_id,
                        status: 1,
                        submission_time: customTime
                    }
                }).catch((err) => {
                    logFile.error(`user_id(${datas?.id})` + err.message)
                });
            }
            );

        });
    }
    catch (err) {
        logFile.error(err.message)
    }
}

setInterval(() => {
    main();
}, 60000 * 2)