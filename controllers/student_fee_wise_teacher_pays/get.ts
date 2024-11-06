import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { isDateValid } from 'utilities_api/handleDate';
import { logFile } from 'utilities_api/handleLogFile';

async function get(req, res, refresh_token) {
  try {
   
    const {from_date, to_date, selected_teacher} = req.query;
  
    if (!isDateValid(from_date) || !isDateValid(to_date)) throw new Error('required from date / to_date is not founds');
    
    const where = {}
    if(selected_teacher) {
        where['teacher_id'] = Number(selected_teacher)
      
    }
    
    if(from_date && to_date){
      
       
        const response = await prisma.studentFeeWiseTeacherPay.findMany({
            where: {
                created_at: {
                    gte:from_date,
                    lte:to_date,
                  },
                  ...where
            },
            include:{
                teacher:true,
                school:true,
                studentFee:{
                    include:{
                        fee:{
                            include:{
                                fees_head: true
                            }
                        },
                       
                    },
                  
                },
                subject:{
                    include:{
                        class: true
                    }
                }
            }
          })
      
          return res.json({
            total_page: response?.length,
            response
        });
    }

    const response = await prisma.studentFeeWiseTeacherPay.findMany({
      where: {
        school_id: Number(refresh_token.school_id)
      },
      include:{
        teacher:true,
        school:true,
        studentFee:{
            include:{
                fee:{
                    include:{
                        fees_head: true
                    }
                },
              
            },
          
        },
        subject:{
            include:{
                class:true
            }
        }
    }
    })
 
    

    return res.json({
        total_page: response?.length,
        response
    });

  } catch (err) {
    logFile.error(err.message)
    res.status(404).json({ error: err.message });
  }
}

export default authenticate(get)