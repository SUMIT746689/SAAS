import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res) => {
    try {
        const { method } = req;
        // console.log({ method });

        switch (method) {
            case 'GET':
                const { name } = req.query;
                const searchUserRegExp = `${name}\d*[0-9]*$`
                
                if (!name) throw new Error('name field not founds')

                const sentSmsUsers = await prisma.$queryRaw`
                    SELECT id,username
                    FROM users
                    WHERE username REGEXP ${searchUserRegExp}
                    ORDER BY CAST(SUBSTRING(username, CHAR_LENGTH(${name}) + 1) AS UNSIGNED) DESC , username DESC
                    LIMIT 1
                `;
                // @ts-ignore
                if (sentSmsUsers.length === 0) return res.json(name)

                const username = sentSmsUsers[0].username;

                const regexObj = new RegExp(name,"i");
                const extraNumberParts = username.replace(regexObj, "");
                const numberIncreament = extraNumberParts ? parseInt(extraNumberParts) + 1 : 0;
                const newUsername = [name, String(numberIncreament)].join('')
                // console.log({ sentSmsUsers, regexObj })
                // console.log({ extraNumberParts, numberIncreament })
                // console.log([name, String(numberIncreament)].join(''))
                res.json(newUsername);
                break;
            default:
                res.setHeader('Allow', ['GET']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        logFile.error(err.message)
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

// export default index;
export default authenticate(index);
