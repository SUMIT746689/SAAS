import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

async function getHandler(req, res, refresh_token) {
  try {

    const { school_id } = refresh_token;
    // if (role.title !== 'ASSIST_SUPER_ADMIN' || !admin_panel_id) throw new Error('Your role have no permissions');

    const schools = await prisma.school.findMany({
      where: {
        // admin_panel_id,
        parent_school_id: school_id
      },
      include: {
        subscription: {
          where: { is_active: true },
          include: { package: true }
        },
        // @ts-ignore
        admins: {
          where: {
            role: {
              title: { in: ['ADMIN', 'BRANCH_ADMIN'] }
            }
          },
          select: {
            id: true,
            username: true,
            role: true,
            created_at: true,
            updated_at: true,
            school_id: true
          }
        }
      }
    });
    console.log(JSON.stringify(schools, null, 3))
    res.status(200).json(schools);

  } catch (err) {
    logFile.error(err.message)
    res.status(404).json({ error: err.message });
  }
}

export default authenticate(getHandler);
