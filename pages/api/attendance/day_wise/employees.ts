import prisma from "@/lib/prisma_client";
import { authenticate } from "middleware/authenticate";
import { logFile } from "utilities_api/handleLogFile";
const index = async (req, res, refresh_token) => {
  try {
    const { method } = req;
    switch (method) {
      case 'GET':
        let { start_date, end_date } = req.query;
        const {school_id} = refresh_token;
        if (!start_date) throw new Error('required start date');
        if (!end_date) throw new Error('required end date');
        start_date = new Date(start_date);
        end_date = new Date(end_date);
        const totalStaff = await prisma.user.count({
          where: {
                  school_id: school_id,
                  deleted_at: null,
                  user_role:{
                    title: {notIn :["TEACHER","STUDENT" ]}
                  },
              },
        });
        // console.log(JSON.stringify(totalStaff,null,3))
        const todaysDate = await prisma.employeeAttendance.groupBy({
          by:["date"],
          where: {
            school_id: school_id,
            status:{ in :["present","late"]},
            user: {
              user_role:{
                title: {notIn :["TEACHER","STUDENT" ]}
              },
              deleted_at: null,
            },
            date: {
              gte: start_date,
              lte: end_date,
            },
          },
          _count: {
            user_id: true,
          },
        })
        // console.log({todaysDate})
        const percentageStaffByDate = todaysDate.map((singleDate) => {
          const percentage = (singleDate._count.user_id * 100) / totalStaff;
          return {
            date: singleDate.date,
            attendance_percent: percentage,
          };
        });
        const totalDays = percentageStaffByDate.length;
        const avgAttend = percentageStaffByDate.reduce((prev,curr)=> prev + curr.attendance_percent ,0) / totalDays;
        // console.log({avgAttend});
        res.status(200).json({ attendance_percent: avgAttend });
        break;
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    logFile.error(err.message);
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}
export default authenticate(index) 