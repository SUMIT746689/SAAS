import prisma from "@/lib/prisma_client";
import { ContactsOutlined } from "@mui/icons-material";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";
const index = async (req, res, refresh_token) => {
  try {
    const { method } = req;
    const {school_id} = refresh_token;
    switch (method) {
      case 'GET': 
        let { start_date, end_date } = req.query;
        if (!start_date) throw new Error('required start date');
        if (!end_date) throw new Error('required end date');
        start_date = new Date(start_date);
        end_date = new Date(end_date);
        console.log({start_date},  {end_date })
        const totalStudents = await prisma.student.count({
          where: {
            is_separate: false,
            academic_year:{
              curr_active: true
            },
            student_info: {
              school_id,
              user: {
                deleted_at: null
              }
            }
          },
        });
        // console.log({totalStudents})
        const todaysDate = await prisma.attendance.groupBy({
          by:["date"],
          where: {
            school_id,  
            status:{ in :["present","late"]}, 
            date: {
              gte: start_date,
              lte: end_date,
            },
          },
          _count: {
            id:true
          }
      })
        // console.log({todaysDate})
        const percentageTeacherByDate = todaysDate.map((singleDate) => {
          const percentage = ((singleDate._count.id * 100) / totalStudents);
          return {
            date: singleDate.date,
            attendance_percent: percentage,
          };
        });
        // console.log({ percentageTeacherByDate });
        const totalDays = percentageTeacherByDate.length;
        const avgAttend = percentageTeacherByDate.reduce((prev,curr)=> prev + curr.attendance_percent ,0) / totalDays;
        console.log();
        res.status(200).json({ attendance_percent: avgAttend });



        break;
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }} catch (err) {
    logFile.error(err.message);
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}
export default authenticate(index) 