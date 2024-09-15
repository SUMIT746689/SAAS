import prisma from "@/lib/prisma_client";
import deletePeriod from "controllers/period/deletePeriod";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";

const Day = async (req, res, refresh_token) => {
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                const { school_id } = refresh_token;
                const { day, teacher_id } = req.query;
                const where = {
                    school_id: parseInt(school_id),
                    day
                };
                if (teacher_id) where['teacher_id'] = parseInt(teacher_id);

                const schedule = await prisma.period.findMany({
                    where,
                    include: {
                        room: true,
                        teacher: {
                            where: { deleted_at: null },
                            select: {
                                id: true,
                                first_name: true
                            }
                        },
                        section: {
                            select: {
                                name: true,
                                class: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                })
                res.status(200).json(schedule);
                break;
            case 'DELETE':
                // previous code 
                // deletePeriod(req, res, refresh_token);
                // updated code start
            
                await prisma.period.delete({
                    where:{
                        id: parseInt(req.query.day)
                    }
                 })
                 res.status(204).json({ message: "class routine deleted successfull!!" });

                // updated code end
                break;
            case 'PATCH':
                try {
                  
                 const {day} = req.query;
              
                    // updated code start
            
                    if (req.body.class_id) {
                        const class_info = await prisma.class.findFirst({
                            where: {
                                id: parseInt(req.body.class_id),
                               
                            }
                        })
                        if (!class_info) {
                            logFile.error("Invalid class !")
                            return res.status(409).send({ message: "Invalid class !" })
                        }
                    }
                    if (req.body.section_id) {
                        const section_info = await prisma.section.findFirst({
                            where: {
                                id: parseInt(req.body.section_id),
                               
                            }
                        })
                        if (!section_info) {
                            logFile.error("Invalid section !")
                            return res.status(409).send({ message: "Invalid section !" })
                        }
                    }
                    if (req.body.subject_id) {
                        const subject_info = await prisma.subject.findFirst({
                            where: {
                                id: parseInt(req.body.subject_id),
                               
                            }
                        })
                        if (!subject_info) {
                            logFile.error("Invalid subject !")
                            return res.status(409).send({ message: "Invalid subject !" })
                        }
                    }
                    if(req.body.days.length === 0){
                        return res.status(404).send({ message: "No days found!" })
                    }
            
                    if(!req.body.start_time){
                        return res.status(404).send({ message: "No start_time found!" })
                    }
                    if(!req.body.end_time){
                        return res.status(404).send({ message: "No end_time found!" })
                    }




                   await prisma.period.update({
                        where: {
                          id: parseInt(day)
                        },
                        data: {
                            class_id: req.body.class_id,
                             section_id: req.body.section_id,
                             teacher_id: req.body.teacher_id,
                             subject_id: req.body.subject_id,
                             school_id: refresh_token.school_id,
                             day:  req.body.days[0],
                             start_time: req.body.start_time,
                             end_time: req.body.end_time
                        },
                      })
            
                 
                    
                    
                     res.status(200).json({ message: "class routine updated successfull!!" });
                    // updated code end
            
                } catch (err) {
                    logFile.error(err.message)
                    console.log(err.message);
                    res.status(404).json({ error: err.message });
                }
                break;
            default:
                res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });

    }
}

export default authenticate(Day)