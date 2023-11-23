import prisma from '@/lib/prisma_client';
import { refresh_token_varify } from 'utilities_api/jwtVerify';

export const get = async (req, res) => {
  try {
    if (!req.cookies.refresh_token) throw new Error('refresh token not founds');

    const refresh_token: any = refresh_token_varify(req.cookies.refresh_token);

    if (!refresh_token) throw new Error('invalid user');

    const user = await prisma.user.findFirst({
      where: {
        id: refresh_token.id,

        deleted_at: null

      },
      include: {
        role: true
      }
    });
    const { role } = req.query;

    const AND = [];
    AND.push({
      deleted_at: null
    })
    if (user.role.title === 'SUPER_ADMIN') AND.push({
      role: {
        title: 'ADMIN'
      }
    });
    else if (user.role.title === 'ADMIN') {
      AND.push(
        { school_id: user.school_id },
        {
          NOT: {
            role: {
              title: 'ADMIN'
            }
          }
        }
      );
      if (role && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        AND.push({
          role: {
            title: role
          }
        })
      }

    }
    else throw new Error('Only role 1 and 2 is allowed to see validate data')
    // : [{ school_id: user.school_id }, { id: { not: user.id } }]

    const users = await prisma.user.findMany({
      where: {
        AND,

      },
      select: {
        id: true,
        username: true,
        user_role: {
          select: {
            id: true,
            title: true
          }
        },
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
    console.log(err);

    res.status(404).json({ error: err.message });
  }
};
