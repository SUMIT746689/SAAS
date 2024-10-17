import { authenticate } from 'middleware/authenticate';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';

async function put(req, res, refresh_token) {
    
    try {
        const {english_scholarship_name, bangla_scholarship_name,classes, is_scholarship_active} = req.body;  
        const {school_id} = refresh_token;

        if (!english_scholarship_name || !bangla_scholarship_name) return res.status(404).json({ message: 'english scholarship name/bangla scholarship name fields missing !!' });

        const websiteUirow = await prisma.websiteUi.findFirst({
            where: {
                school_id
            },
            select: {
                id: true,
                scholarshipClasses:{
                    select:{
                        id: true
                    }
                }
            }
        });

        const scholarshipClasses = {};
        if(classes && Array.isArray(classes)) {
            scholarshipClasses["disconnect"] = websiteUirow.scholarshipClasses?.map(cls=>({id:cls.id})) || {}
            scholarshipClasses["connect"] = classes.map(cls=>{
                if(typeof cls !== "number") throw new Error('provided invalid class id')
                return {id:cls}     
            });
        };

        if(websiteUirow) {
            
            await prisma.websiteUi.update({
                where:{
                    id:websiteUirow.id
                },
                data:{
                    english_scholarship_name: english_scholarship_name || undefined,
                    bangla_scholarship_name: bangla_scholarship_name || undefined,
                    is_scholarship_active: typeof is_scholarship_active === "boolean" ? is_scholarship_active : undefined,
                    scholarshipClasses
                }
            }).then(res=>{console.log({res})})
       
        return res.status(200).json({ message: 'updated successfully !' });

        }

        await prisma.websiteUi.create({
            data:{
                eiin_number:'',
                school_id,
                english_scholarship_name: english_scholarship_name || undefined,
                bangla_scholarship_name: bangla_scholarship_name || undefined,
                is_scholarship_active: typeof is_scholarship_active === "boolean" ? is_scholarship_active : undefined,
                scholarshipClasses
            }
        });
        return res.status(200).json({message:"created sucessfully"})
        
    } catch (error) {
        console.log("error__", error);
        logFile.error(error.message)
        res.status(404).json({ Error: error.message });
    }
}
export default authenticate(put);