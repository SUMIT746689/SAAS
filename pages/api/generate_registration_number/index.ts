import prisma from '@/lib/prisma_client';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token, dcryptAcademicYear) => {
    try {
        const { method } = req;
        // console.log({ method });
        const { id: academic_year_id } = dcryptAcademicYear;

        switch (method) {
            case 'GET':
                // const { name } = req.query;
                // const searchUserRegExp = `${name}\d*[0-9]*$`

                // if (!name) throw new Error('name field not founds')

                const getMaxRegNumber = await prisma.$queryRaw`
                    SELECT class_registration_no FROM students
                    WHERE academic_year_id = ${academic_year_id}
                    ORDER BY CAST(class_registration_no AS UNSIGNED) DESC , class_registration_no DESC
                    LIMIT 1
                `;
                console.log({ getMaxRegNumber })

                // @ts-ignore
                if (getMaxRegNumber.length === 0) return res.json("1")

                const regNumber = parseInt(getMaxRegNumber[0].class_registration_no) + 1;

                // const regexObj = new RegExp(regNumber, "i");
                // const extraNumberParts = regNumber.replace(regexObj, "");
                // const numberIncreament = extraNumberParts ? parseInt(extraNumberParts) + 1 : 0;
                // const newUsername = [regNumber, String(numberIncreament)].join('')


                // console.log({ regexObj })
                // console.log({ extraNumberParts, numberIncreament })
                // console.log([String(numberIncreament)].join(''))
                res.json(regNumber);
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
export default authenticate(academicYearVerify(index));
