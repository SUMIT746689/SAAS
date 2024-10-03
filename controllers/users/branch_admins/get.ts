import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';
import { refresh_token_varify } from 'utilities_api/jwtVerify';
import { ref } from 'yup';

export const get = async (req, res, refresh_token) => {
  try {
    const { school_id, admin_panel_id } = refresh_token;
    console.log({ refresh_token })

    if (refresh_token?.role.title !== 'ADMIN') throw new Error('permission denied');

    const users = await prisma.user.findMany({
      where: {
        user_role: { title: "BRANCH_ADMIN" },
        OR: [
          { school_id },
          {
            school: {
              parent_school_id: school_id
            }
          }
        ]
      },
      select: {
        id: true,
        username: true,
        adminPanel: {
          select: {
            domain: true,
            logo: true,
            copy_right_txt: true,
            is_active: true
          }
        },
        user_role: {
          select: {
            id: true,
            title: true
          }
        },
        user_role_id: true,
        role_id: true,
        school_id: true,
        school: {
          select: {
            name: true
          }
        },
        // @ts-ignore
        is_enabled: true,
        permissions: true,
        user_photo: true,
        created_at: true
      }
    });
    
    res.status(200).json(users);
  } catch (err) {
    logFile.error(err.message)
    console.log(err);
    res.status(404).json({ error: err.message });
  }
};
