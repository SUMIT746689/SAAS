import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';
async function get(req, res, refresh_token) {
  const { section_id, academic_year_id, class_id } = req.query;
  const where = {};
  if (section_id) {
    const Id_s = section_id.split(',').map((id) => parseInt(id, 10));
    where['batches'] = {
      some:{
      in: Id_s
      }
    };
  }
  if (academic_year_id) where['academic_year_id'] = parseInt(academic_year_id);
  const students = await prisma.student.findMany({
    where: {
      class_id: parseInt(class_id),
      // batches:{
      //   some:{
      //     id:{ in: section_id.split(',').map((id) => parseInt(id, 10))

      //     }
      //   }
      // },
      ...where,
      is_separate: !true,
      student_info: {
        school_id: refresh_token.school_id,
        user: {
          is: {
            deleted_at: null
          }
        }
      },
      academic_year: {
        deleted_at: null
      }
    },
    include: {
      student_info: {
        include: {
          school: {
            select: {
              name: true
            }
          },
          user: {
            select: {
              username: true
            }
          }
        }
      },
      academic_year: true,
      discount: true,
      waiver_fees: true,
      class: {
        select: {
          id: true,
          name: true,
          has_section: true
        }
      },
      batches: {
        select: {
          id:true,
          name: true
        }
      },
      // section: {
      //   select: {
      //     id: true,
      //     name: true,
      //     class: {
      //       select: {
      //         id: true,
      //         name: true,
      //         has_section: true
      //       }
      //     }
      //   }
      // },
      group: {
        select: {
          title: true
        }
      }
    },
    orderBy: { id: 'desc' }
  });

  // res.status(200).json(students);
  return students;
}

async function patch(req, res, refresh_token) {
  const { student_ids } = req.body;

  const updateResult = await prisma.student.updateMany({
    where: {
      id: {
        in: student_ids
      }
    },
    data: {
      is_separate: true,
      updated_at: new Date()
    }
  });
  return updateResult;
}

async function separateStudents(req, res, refresh_token) {
  const { method } = req;
  switch (method) {
    case 'GET':
      try {
        const students = await get(req, res, refresh_token);
        res.status(200).json(students);
      } catch (error) {
        logFile.error(error?.message);
        res.status(404).json({
          message: error?.message || 'Something went wrong!'
        });
      }
      break;

    case 'PATCH':
      try {
        const updateResult = await patch(req, res, refresh_token);

        res.status(200).json({
          status: 'success',
          data: updateResult
        });
      } catch (error) {
        logFile.error(error?.message);
        res.status(404).json({
          message: error?.message || 'Something went wrong!'
        });
      }

      break;
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      logFile.error(`Method ${method} Not Allowed`);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default authenticate(separateStudents);
