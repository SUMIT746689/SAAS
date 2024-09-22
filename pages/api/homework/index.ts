import prisma from "@/lib/prisma_client";
import { fileUpload, unknownFileDelete } from "@/utils/upload";
import { imagePdfDocType } from "@/utils/utilitY-functions";
import { authenticate } from "middleware/authenticate";
import path from 'path';
import { logFile } from "utilities_api/handleLogFile";

export const config = {
    api: {
        bodyParser: false,
    },
};

const index = async (req, res, refresh_token) => {
    try {
        const { method } = req;
        const { academic_year_id, class_id, student_id, subject_id, date, skip, take, section_id } = req.query;

        switch (method) {
            case 'GET':

                const query = {}
                if (subject_id) query['subject_id'] = parseInt(subject_id)
                if (student_id) query['student_id'] = parseInt(student_id)
                if (section_id) query['student'] = {
                    batches: {
                        some: { id: parseInt(section_id) }
                    }
                }
                // if (subject_id) query['subject_id'] = parseInt(subject_id)
                // if (student_id) query['student_id'] = parseInt(student_id)
                // if (class_id) query['student'] = { class_id: parseInt(class_id) }
                // if (section_id) query['batches'] = { id: parseInt(section_id) }

                const homework = await prisma.homework.findMany({
                    where: {
                        academic_year_id: Number(academic_year_id),
                        ...query,
                        // student: { batches: { some: { id: parseInt(section_id) } } },
                        academicYear: {
                            school_id: refresh_token.school_id
                        },
                        subject: {
                            class_id: Number(class_id)
                        },

                    },
                    include: {
                        subject: true
                    }
                    // ...query,
                    // take: take ? Number(take) : 10
                })
                res.status(200).json(homework);
                break;
            case 'POST':
                const uploadFolderName = 'homework';

                const fileType = imagePdfDocType;
                const filterFiles = {
                    file: fileType,
                }

                const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName });
                // console.log("files, fields__", files, fields);

                if (error) throw new Error('Error')
                res.status(200)
                const { homeworkFile } = files;

                if (!fields?.subject_id || !fields?.student_id || !fields?.academic_year_id || !homeworkFile || !fields?.date) {
                    unknownFileDelete(files, [])
                    throw new Error('subject or student or academic_year or homework field missing !!')
                }

                unknownFileDelete(files, ['homeworkFile'])

                await prisma.homework.create({
                    data: {
                        subject: { connect: { id: Number(fields?.subject_id) } },
                        student: { connect: { id: Number(fields?.student_id) } },
                        academicYear: { connect: { id: Number(fields?.academic_year_id) } },
                        date: new Date(fields?.date),
                        file_path: path.join(uploadFolderName, homeworkFile?.newFilename)
                    }
                })

                res.status(200).json({ message: 'Home work submitted !!' });
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log({err:err.message});
        logFile.error(err.message)
        res.status(500).json({ message: err.message });
    }
};

export default authenticate(index);
