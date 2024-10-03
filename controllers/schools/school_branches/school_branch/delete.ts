import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

async function deleteHandler(req, res, refresh_token) {
    try {

        const { id, remove_user_id } = req.query;
        const { role, school_id } = refresh_token;

        if (role.title !== 'ADMIN') throw new Error('Your role have no permissions');

        const schools = await prisma.school.update({
            where: {
                id: parseInt(id),
                parent_school_id: school_id,
            },
            data: {
                admins: { disconnect: [{ id: parseInt(remove_user_id) }] }
            }
        });
        
        res.status(200).json(schools);

    } catch (err) {
        logFile.error(err.message)
        res.status(404).json({ error: err.message });
    }
}

export default authenticate(deleteHandler);
