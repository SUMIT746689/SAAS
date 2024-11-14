import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';
import { refresh_token_varify } from 'utilities_api/jwtVerify';
import { ref } from 'yup';
export const get = async (req, res, refresh_token) => {
  try {
    const { admin_panel_id } = refresh_token;
    // const {} = req.query
    console.log("req.query..................////////////",  req.query)
    const user = await prisma.user.findFirst({
      where: {
        id: refresh_token.id,
        deleted_at: null
      },
      include: {
        user_role: true
      }
    });
    const { role, is_enabled } = req.query;
    const AND = [];
    AND.push({
      deleted_at: null
    })
    if (user.user_role.title === 'SUPER_ADMIN') AND.push({
      role: {
        title: 'ASSIST_SUPER_ADMIN'
      }
    });
    else if (user.user_role.title === 'ASSIST_SUPER_ADMIN') AND.push(
      { admin_panel_id: admin_panel_id || { not: null } },
      {
        role: {
          title: { in: ['ADMIN', 'BRANCH_ADMIN'] }
        }
      }
    );
    else if (user.user_role.title === 'ADMIN') {
      AND.push(
        { admin_panel_id: admin_panel_id || { not: null } },
        { school_id: user.school_id },
        {
          NOT: {
            role: {
              title: 'ADMIN'
            }
          }
        }
      );
      if (role && role !== 'SUPER_ADMIN' && role !== 'ASSIST_SUPER_ADMIN' && role !== 'ADMIN') {
        AND.push({
          user_role: {
            title: role
          }
        })
      }

    }
    else throw new Error('Only role 1 and 2 is allowed to see validate data')
    console.log({ is_enabled })
    if (is_enabled) AND.push({ is_enabled: is_enabled === 'true' ? true : false })
    const users = await prisma.user.findMany({
      where: {
        AND,

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
