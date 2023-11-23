import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';

const get = async (req, res, refresh_token) => {
  try {

    const user = await prisma.user.findFirst({
      where: { id: refresh_token.id },
      include: {
        role: true
      }
    });
    const { by, token, limit } = req.query;
    console.log({ by, token, limit });
    const AND = [];

    if (by) AND.push({ [by]: { contains: token || '' } });
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
    }
    else throw new Error('Only role 1 and 2 is allowed to see validate data');

    const takeUser = {};
    if (limit) {
      takeUser['take'] = Number(limit) ? Number(limit) : 10
    }
    const users = await prisma.user.findMany({
      where: {
        AND
      },
      select: {
        id: true,
        username: true,
        role: true,
        school_id: true,
        permissions: true
      },
      ...takeUser
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
export default authenticate(get)