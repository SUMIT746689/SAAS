import prisma from '@/lib/prisma_client';
import { customizeDate, customizeDateWithTime } from '@/utils/customizeDate';
import { certificateTemplateFolder } from '@/utils/upload';
import fs from 'fs';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import path from 'path';
import { logFile } from 'utilities_api/handleLogFile';
async function get(req, res, refresh_token, dcryptAcademicYear) {
    try {
        const { id: academic_year_id, title: academic_year_title } = dcryptAcademicYear;
        const { id: user_id, school_id } = refresh_token;
        const { format, is_all_student } = req.query;

        const uploadFolderName = 'student_list';
        await certificateTemplateFolder(uploadFolderName);

        const date = customizeDateWithTime((new Date()).toUTCString()).split(/[ ,]+/).join('-');
        const fileName = date + `-${user_id}` + "-students.xls";

        const resStd = await prisma.student.findMany({
            where: { academic_year_id, student_info: { school_id } },
            include: {
                student_info: true,
                // section: {
                //     select: {
                //         name: true,
                //         class: { select: { name: true, has_section: true, subjects: true } },
                //     }
                // },
                class: { select: { name: true, subjects: true } },
                batches: {
                    select: {
                        name: true,
                    }
                },
                group: {
                    select: { title: true }
                },
                // academic_year: { select: { title: true } }
            }
        });



        console.log("resStd..........................", {resStd}, null,3 )

        const uploadFilePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, fileName);

        generateExcelFile(resStd, academic_year_title, uploadFilePath)
            .then((update_file_path: string) => {

                res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
                res.setHeader('Content-Type', 'application/vnd.ms-excel');
                res.setHeader("File-Name", fileName);

                const createReadStream = fs.createReadStream(update_file_path);

                // let totalLen = 0;
                // let datas = '';
                createReadStream.on("data", (data) => {
                    // totalLen += res.length;
                    // datas += res;
                    res.send(data);
                });
                createReadStream.on("end", () => {

                    // res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
                    // res.setHeader('Content-Type', 'application/vnd.ms-excel');
                    // res.setHeader("Content-Length", `${totalLen}`);
                    // res.setHeader("File-Name", fileName);

                    // res.send(datas);

                    // after sending done removing the file
                    removeFiles(update_file_path)

                });

                createReadStream.on("error", err => {
                    logFile.error(err.message)
                    res.status(404).json({ error: err.message });
                });

                // res.setHeader("File-Name", fileName);
                // res.setHeader('Content-Type', 'application/vnd.ms-excel');
                // createReadStream.pipe(res);
                // removeFiles(update_file_path)
            })
            .catch(err => {
                logFile.error(err.message)
                res.status(404).json({ error: err.message });
            })

    } catch (err) {
        logFile.error(err.message)
        res.status(404).json({ error: err.message });
    }
}

export default authenticate(academicYearVerify(get));


const generateExcelFile = (datas, academic_year_title, uploadFilePath) => {
    return new Promise((resolve, reject) => {

        const writeStream = fs.createWriteStream(uploadFilePath);
        const headerList = [
            "Student Id", "Student Name", "Academic Year", "Class",  "Group",

            // "Shift", "Section", 
            "Branch", "Roll", "Subjects", "Blood Group", "Father Name", "Mother Name", "Guardian Name"
            , "Guardian Mobile Number", "Address"
        ]
        let header = headerList.join("\t") + "\n";
        writeStream.write(header);

        datas.forEach(student => {
            const subjects = JSON.stringify(student.class?.subjects?.map(subject => subject?.name).join(", "));

            const batches = JSON.stringify(student.batches?.map(batch => batch?.name).join(", "));

            const row = [
                student.student_info.student_id || '',
                student.student_info?.first_name,
                academic_year_title,
                student.class?.name,
                student.group?.title || '',
                // student.section.class.has_section ? student.section.name : '',
                batches,
                student.class_roll_no,

                subjects,
                student.student_info.blood_group || '',
                student.student_info.father_name || '',
                student.student_info.mother_name || '',
                student.guardian_name || '',
                student.guardian_phone || '',
                student.student_present_address || ''
            ];
            writeStream.write(row.join('\t') + "\n");
        });
        writeStream.close((err) => {
            if (err) return reject(err);
            resolve(uploadFilePath);
        });
    })
};

const removeFiles = (path) => {
    fs.unlinkSync(path)
};
