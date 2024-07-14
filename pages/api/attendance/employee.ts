import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token) => {
  try {
    const { method } = req;
    const { date, status, school_id, user_id, role_id } = req.query;
    switch (method) {
      case 'GET':
        let query = {};
        if (req.query.date) {
          query['date'] = { equals: new Date(req.query.date) };
        } else if (req.query.from_date && req.query.to_date) {
          query['date'] = {
            gte: new Date(req.query.from_date),
            lte: new Date(req.query.to_date)
          };
        }
        const where = {
          school_id: parseInt(refresh_token.school_id),
          ...query,
          user: {
            role_id: parseInt(req.query.role_id)
          }
        };
        const data = await prisma.employeeAttendance.findMany({
          where,
          select: {
            status: true,
            date: true,
            remark: true,
            user_id: true
          }
        });

        res.status(200).json(data);
        break;

      case 'POST':
        const errors = [];
        const gte = new Date(req.query.date);
        gte.setHours(0, 0, 0, 0);
        const lte = new Date(req.query.date);
        lte.setHours(23, 59, 59, 999);

        if (req.query.status) {
          try {
            if (req.body.attendence.length !== 0) {
              // created code start
              await Promise.all(
                req.body.attendence?.map(async (status) => {
                  const { employee_id } = status;
                  const { status: userStatus } = req.query;

                  if (typeof employee_id !== 'number' || typeof userStatus !== 'string') {
                    errors.push(`Invalid data for employee_id : ${employee_id}`);
                    return;
                  }

                  try {
                    await prisma.employeeAttendance.create({
                      data: {
                        user_id: employee_id,
                        date: new Date(new Date(req.query.date).setUTCHours(0, 0, 0, 0)),
                        // @ts-ignore
                        status: userStatus,
                        school_id: parseInt(req.query.school_id),
                        remark: status?.remark ? status.remark : null
                      }
                    });
                  } catch (error) {
                    errors.push(`Creating employee_id ${employee_id}: ${error.message}`);
                  }
                })
              );

              // created code end
            } else {
              // updated code start
              await prisma.employeeAttendance.updateMany({
                where: {
                  AND: [
                    {
                      school_id: parseInt(school_id)
                    },
                    {
                      date: { gte, lte }
                    }
                  ]
                },
                data: {
                  date: new Date(new Date(req.query.date).setUTCHours(0, 0, 0, 0)),
                  // @ts-ignore
                  status: req.query.status.toLowerCase()
                }
              });
              // updated code end
            }
          } catch (error) {
            errors.push(`${error.message}`);
          }
        } else {
          //  employee ids array
          const employeeIds = req?.body?.attendence?.map((user) => parseInt(user.employee_id));

          // updated database code start

          const employees = await prisma.employeeAttendance.findMany({
            where: {
              AND: [
                {
                  user_id: {
                    in: employeeIds
                  }
                },
                {
                  school_id: parseInt(school_id)
                },
                {
                  date: { gte, lte }
                }
              ]
            }
          });
          // remove existing employee from array
          const userIds = employees?.map((user) => user?.user_id);
          const filteredEmployees = req?.body?.attendence.filter((employee) => !userIds.includes(employee.employee_id));
          const existingEmployees = req?.body?.attendence.filter((employee) => userIds.includes(employee.employee_id));

          // Create a map for fast lookup based on user_id
          const map = new Map();
          employees.forEach((item) => {
            map.set(item.user_id, item);
          });

          // Merge the arrays based on employee_id and user_id
          const mergedArray = existingEmployees
            .map((item) => {
              const match = map.get(item.employee_id);
              if (match) {
                return {
                  ...match,
                  employee_id: item.employee_id,
                  status: item.status,
                  remark: item.remark
                };
              }
              return null; // Return null if no match found
            })
            .filter((item) => item !== null); // Filter out null entries
          mergedArray?.map(async (status) => {
            const { employee_id, status: userStatus } = status;

            if (typeof employee_id !== 'number' || typeof userStatus !== 'string') {
              errors.push(`Invalid data for employee_id : ${employee_id}`);
              return;
            }

            try {
              await prisma.employeeAttendance.update({
                where: {
                  id: status.id
                },

                data: {
                  date: new Date(new Date(req.query.date).setUTCHours(0, 0, 0, 0)),
                  // @ts-ignore
                  status: userStatus,
                  remark: status?.remark ? status.remark : null
                }
              });
            } catch (error) {
              errors.push(`Creating employee_id ${employee_id}: ${error.message}`);
            }
          });

          // updated database code end

          if (employees.length === 0 || filteredEmployees.length !== 0) {
            let body = req?.body?.attendence || [];
            if (filteredEmployees.length !== 0) {
              body = filteredEmployees;
            }

            // employee insert code start

            await Promise.all(
              body?.map(async (status) => {
                const { employee_id, status: userStatus } = status;

                if (typeof employee_id !== 'number' || typeof userStatus !== 'string') {
                  errors.push(`Invalid data for employee_id : ${employee_id}`);
                  return;
                }

                try {
                  await prisma.employeeAttendance.create({
                    data: {
                      user_id: employee_id,
                      date: new Date(new Date(req.query.date).setUTCHours(0, 0, 0, 0)),
                      // @ts-ignore
                      status: userStatus,
                      school_id: parseInt(req.query.school_id),
                      remark: status?.remark ? status.remark : null
                    }
                  });
                } catch (error) {
                  errors.push(`Creating employee_id ${employee_id}: ${error.message}`);
                }
              })
            );

            // employee insert code end
          }
        }
        if (errors.length > 0) {
          return res.status(500).json({ message: 'Errors occurred during create', errors });
        }

        res.status(200).json({ message: 'attendence updated' });
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    logFile.error(err.message);
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export default authenticate(index);
