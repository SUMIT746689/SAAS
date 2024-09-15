import prisma from "@/lib/prisma_client";
import { Prisma } from "@prisma/client";
import { logFile } from "utilities_api/handleLogFile";
const tables = Prisma.ModelName;

const role_title = async (req, res) => {
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                const {role_title} = req.query;
                if (!req.query.role_title) return res.status(400).json({ message: 'valid role_title required' });

                if(role_title === "TEACHER") {
                    const data = await prisma.teacher?.findMany({
                        where: {
                            school_id: parseInt(req.query.school_id)
                        },  
                        select: {
                            id: true,
                            user_id: true,
                            // user_roll_id: true,
                            first_name: true,
                            middle_name: true,  
                            last_name: true
                        }
                    });   

                    return  res.status(200).json(data);
                }
                // console.log(prisma.otherUsersInfo)
                const data = await prisma.otherUsersInfo?.findMany({
                        where: {
                            school_id: parseInt(req.query.school_id),
                            user: {
                                user_role:{
                                    title: role_title
                                }
                            }
                        },  
                        select: {
                            id: true,
                            // employee_id:true,
                            user_id: true,
                            first_name: true,
                            middle_name: true,  
                            last_name: true
                        }
                    });
                    res.status(200).json(data);

                break;

            default:
                res.setHeader('Allow', ['GET']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });

    }
}

export default role_title