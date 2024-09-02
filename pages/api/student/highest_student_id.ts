import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const highestStudentId = async (req, res,refresh_token) => {
    try {
        const { method } = req;
        const { school_id} = refresh_token;

        switch (method) {
            case 'GET':
                if(!school_id) throw new Error("permission denied");

                const sentSmsUsers = await prisma.$queryRaw`
                    SELECT student_id
                    FROM students
                    JOIN student_informations ON student_informations.id = students.student_information_id
                    WHERE student_informations.school_id = ${school_id}
                    ORDER BY CAST(student_id AS SIGNED) DESC
                    LIMIT 1;
                `;

                console.log(JSON.stringify(sentSmsUsers,null,4))

                //@ts-ignore
                if (sentSmsUsers.length === 0) {
                    return res.status(404).json({ message: 'No students found' });
                }

                res.status(200).json({ highestStudentId: sentSmsUsers[0].student_id });
                break;

            default:
                res.setHeader('Allow', ['GET']);
                logFile.error(`Method ${method} Not Allowed`);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message);
        res.status(500).json({ message: err.message });
    }
}

export default authenticate(highestStudentId);
