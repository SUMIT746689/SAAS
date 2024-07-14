import prisma from "@/lib/prisma_client";
import { Prisma } from "@prisma/client";
import { logFile } from "utilities_api/handleLogFile";

const tables = Prisma.ModelName;

const role_title = async (req, res) => {

    try {
        const { method } = req;

        switch (method) {
            case 'GET':
          
    
                if (!req.query.role_title) {
                    res.status(400).json({ message: 'valid role_title required' })
                    break;
                }
                let tableName;
                for (const i in tables) {
                    if (i.toLowerCase() == req.query.role_title.toLowerCase()) {
                    
                        tableName = i;
                        break;
                    }
                }
          
                if (tableName) {
                    const select = {
                        id: true,
                        user_id: true,
                        first_name: true,
                        middle_name: true,
                        last_name: true
                    }
                
                    if(tableName.toLowerCase() === 'teacher'){
                        select['phone'] = true
                    }
                        //@ts-ignore
                    const data = await prisma[tableName]?.findMany({
                        where: {
                            school_id: parseInt(req.query.school_id)
                        },
                        select: {
                          ...select
                            
                        }
                    });
                    res.status(200).json(data);
                }
                else {
                    res.status(200).json({ message: 'table not found' })
                }



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