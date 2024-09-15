import prisma from "@/lib/prisma_client";
import { authenticate } from 'middleware/authenticate';
import { logFile } from "utilities_api/handleLogFile";

const Get = async (req, res, refresh_token) => {
    try {
        const {class_id, section_id} = req.query;

        if(!class_id && !section_id){
            return res.status(404).send({ message: "No class or section found!" })
        }
       
        if (class_id) {
            const class_info = await prisma.class.findFirst({
                where: {
                    id: parseInt(class_id),
                   
                }
            })
            if (!class_info) {
                logFile.error("Invalid class !")
                return res.status(409).send({ message: "Invalid class !" })
            }
        }

        if (section_id) {
            const section_info = await prisma.section.findFirst({
                where: {
                    id: parseInt(section_id),
                   
                }
            })
            if (!section_info) {
                logFile.error("Invalid section !")
                return res.status(409).send({ message: "Invalid section !" })
            }
        }
     
        // updated code start
        const periods = await prisma.period.findMany({
            where:{
                school_id: refresh_token?.school_id,
                class_id:parseInt(class_id),
                section_id: parseInt(section_id)
            },
            select:{
                day:true,
                class_id:true,
                section_id: true,
                teacher_id: true,
                subject_id: true,
                class:{
                    select:{
                        name:true,
                        
                    }
                },
                section:{
                    select:{
                        name:true,
                    }
                },
                subject:{
                    select:{
                        name:true
                    }
                },
                teacher:{
                    select:{
                        first_name:true,
                        middle_name:true,
                        last_name:true,
                    }
                },
                start_time:true,
                end_time:true,
                id:true
            }
        })




        
   
    const result = [];

    periods.forEach(item => {
      let dayObject = result.find(r => r.day === item.day);
      const teacherName = [item.teacher.first_name, item.teacher.middle_name, item.teacher.last_name].filter(Boolean).join(' ');
  
      const routineItem = {
        day: item.day,
        class_id: item.class_id,
        section_id: item.section_id,
        teacher_id: item.teacher_id,
        subject_id: item.subject_id,
        class: item.class.name,
        section: item.section.name,
        teacher: teacherName,
        subject: item.subject.name,
        start_time: item.start_time,
        end_time: item.end_time,
        id: item.id
      };
  
      if (dayObject) {
        dayObject.routine_info.push(routineItem);
      } else {
        dayObject = {
          day: item.day,
          routine_info: [routineItem]
        };
        result.push(dayObject);
      }
    });
  



       const daysOfWeekOrder = ["Saturday","Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

       const daysArray =result;
       
       const sortedDaysArray = daysArray.sort((a, b) => {
         return daysOfWeekOrder.indexOf(a.day) - daysOfWeekOrder.indexOf(b.day);
       });

  
       
        res.status(200).json({
            message:"success",
            result:sortedDaysArray
        })
        // updated code end
        // old code
        // const periods = await prisma.period.findMany({
        //     where: {
        //         school_id: refresh_token?.school_id,
        //     },
        //     include: {
        //         room: {
        //             select: {
        //                 id: true,
        //                 name: true,
        //             }
        //         },
        //         section: {
        //             select: {
        //                 id: true,
        //                 name: true,
        //                 class: {
        //                     select: {
        //                         id: true,
        //                         name: true
        //                     }
        //                 }
        //             }
        //         },
        //         teacher: {
        //             select: {
        //                 id: true,
        //                 first_name: true,
        //                 middle_name: true,
        //                 last_name: true
        //             }
        //         },
        //         subject: {
        //             select: {
        //                 id: true,
        //                 name: true
        //             }
        //         }
        //     }
        // })
        // res.status(200).json(periods?.map(i => {
        //     return {
        //         id: i.id,
        //         room: i.room.name,
        //         teacher: [i.teacher.first_name, i.teacher.middle_name, i.teacher.last_name].join(' '),
        //         class: i.section.class.name,
        //         section: i.section.name,
        //         subject: i.subject.name,
        //         day: i.day,
        //         start_time: new Date(Date.parse(i.start_time + "+0000")),
        //         end_time: new Date(Date.parse(i.end_time + "+0000")),
        //     }
        // }));

    } catch (err) {
        logFile.error(err.message)
        console.log(err.message);
        res.status(404).json({ error: err.message });
    }
};

export default authenticate(Get);