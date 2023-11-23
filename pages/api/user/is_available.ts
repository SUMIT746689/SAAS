
import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';


const index = async (req, res) => {
    try {
        const { method } = req;
        const { username } = req.query;
        switch (method) {
            case 'GET':
                const user = await prisma.user.findFirst({ where: { username }, select: { id: true } })
                if (!user) res.status(200).json({ message: 'username is available' })
                else res.status(409).json({ message: 'This username is taken,give another' });
                break;

            default:
                res.setHeader('Allow', ['GET']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

export default authenticate(index);
