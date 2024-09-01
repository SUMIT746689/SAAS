import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';
import { dcrypt } from 'utilities_api/hashing';

async function get(req, res, refresh_token) {
  try {
    const { section_id, academic_year_id, class_id } = req.query;
    const { role, school_id } = refresh_token;
    const where = {};

    if (class_id) where['class_id'] = parseInt(class_id);

    if (section_id) {
      const parseSectionIds = section_id.split(',').map((id) => parseInt(id, 10));
      if (parseSectionIds.length > 0) where['batches'] = { some: { id: { in: parseSectionIds } } };
    }

    if (academic_year_id) where['academic_year_id'] = parseInt(academic_year_id);

    const students = await prisma.student.findMany({
      where: {
        ...where,
        is_separate: false,
        student_info: {
          school_id,
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
                id: true,
                username: true,
                // ...role?.title === 'ADMIN' && { password: true }
              }
            }
          }
        },
        academic_year: true,
        discount: true,
        waiver_fees: true,
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
        class: true,
        batches: true,
        group: {
          select: {
            title: true
          }
        }
      },
      orderBy: { id: "desc" }
    });

    res.status(200).json(students);
  } catch (err) {
    logFile.error(err.message);
    res.status(404).json({ error: err.message });
  }
}

export default authenticate(get);
