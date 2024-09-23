import prisma from "@/lib/prisma_client";
import { fileUpload, unknownFileDelete } from "@/utils/upload";
import { imagePdfDocType } from "@/utils/utilitY-functions";
import { academicYearVerify, authenticate } from "middleware/authenticate";
import path from 'path';
import { logFile } from "utilities_api/handleLogFile";

export const config = {
    api: {
        bodyParser: false,
    },
};

const index = async (req, res, refresh_token, academic_year) => {
    try {
        const { method } = req;
        const { class_id, student_id, subject_id, date, skip, take, section_id } = req.query;
        const { id: academic_year_id } = academic_year;
        const { school_id } = refresh_token;
        switch (method) {
            case 'GET':
                const query = {};
                if (subject_id) query['subject_id'] = Number(subject_id);
                // if (student_id) query['student_id'] = Number(student_id);
                // old code
                // if (section_id) query['student'] = {
                //     section_id: Number(section_id)
                // }
                // updated code start
                if (class_id) {
                    query['class_id'] = Number(class_id);
                }
                if (section_id) {
                    query['section_id'] = Number(section_id);
                }
                if (school_id) {
                    query['school_id'] = Number(school_id);
                }

                // updated code end
                const homework = await prisma.homework.findMany({
                    where: {
                        OR: [
                            { student_id: Number(student_id), ...query },
                            { ...query, academic_year_id: Number(academic_year_id) }
                        ]

                        // academicYear: {
                        //     school_id: refresh_token.school_id
                        // },
                        // subject: {
                        //     class_id: Number(class_id)
                        // },
                    },
                    include: {
                        subject: true
                    }
                    // ...query,
                    // take: take ? Number(take) : 10
                });

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

                if (!fields?.subject_id || !homeworkFile || !fields?.date) {
                    unknownFileDelete(files, [])
                    throw new Error('subject or student or academic_year or homework field missing !!')
                }

                unknownFileDelete(files, ['homeworkFile'])

                await prisma.homework.create({
                    data: {
                        subject: { connect: { id: parseInt(fields?.subject_id) } },
                        // student: { connect: { id: Number(fields?.student_id) } },
                        academicYear: { connect: { id: parseInt(academic_year_id) } },
                        date: new Date(fields?.date),
                        file_path: path.join(uploadFolderName, homeworkFile?.newFilename),
                        school: { connect: { id: school_id } },
                        description: fields?.description || undefined,
                        live_class_link: fields?.live_class_link || undefined,
                        youtuble_class_link: fields?.youtuble_class_link || undefined,
                        class: { connect: { id: parseInt(fields?.class_id) } },
                        section: { connect: { id: parseInt(fields?.section_id) } }
                    }
                });

                res.status(200).json({ message: 'Home work submitted !!' });
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log({ err: err.message });
        logFile.error(err.message)
        res.status(500).json({ message: err.message });
    }
};

export default authenticate(academicYearVerify(index));
