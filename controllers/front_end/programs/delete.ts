import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

async function delete_(req, res, refresh_token) {
    try {
        const id = parseInt(req.query.id);
        if (Number.isNaN(id)) throw new Error('Provide invalid id ');

        const { school_id } = refresh_token;

        await prisma.websiteUi.delete({
            where: {
                id,
                school_id
            }
        });
        res.status(200).json({ success: 'Video Gallary deleted successfully!' });

    } catch (err) {
        logFile.error(err.message)
        res.status(404).json({ error: err.message });
    }
}

export default authenticate(delete_)