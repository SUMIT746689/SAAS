import { formidable } from 'formidable';
import bcrypt from 'bcrypt';
import { readFile, utils } from "xlsx";
import dayjs from 'dayjs';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { generateUsername, registration_no_generate, } from '@/utils/utilitY-functions';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';
import { handleDeleteFile } from 'utilities_api/handleDeleteFiles';
import * as XLSX from 'xlsx/xlsx.mjs';
import { createReadStream } from 'fs';
import { handleConvBanNum } from 'utilities_api/convertBanFormatNumber';

export const config = {
    api: {
        bodyParser: false
    }
};

const gettingFile = (req) => {
    const options: formidable.Options = {};
    // options.maxFileSize = 4000 * 1024 * 1024;
    const form = formidable(options);

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            // console.log(files);

            resolve({ fields, files });
        });
    });
};



const handlePost = async (req, res, refresh_token, dcryptAcademicYear) => {

    try {
        const { id: user_id, school_id, admin_panel_id } = refresh_token;
        const student_role = await prisma.role.findFirst({
            where: {
                title: 'STUDENT'
            }
        })
        const { fields, files }: any = await gettingFile(req);
        const { class_id, section_id } = fields;

        // class_id/section_id verify
        if (!class_id || !section_id) throw new Error("class/section id not founds");

        const { students } = files;

        // get school max students create no
        const schoolPackage = await prisma.subscription.findFirst({
            where: {
                school_id: parseInt(refresh_token?.school_id),
                is_active: true
            },
            select: {
                package: {
                    select: {
                        student_count: true
                    }
                }
            }
        })

        const customStudentsData = [];

        // get datas from excel or csv file
        const today = Date.now();
        await getDatasExcelOrCsvFile(students.filepath)
            .then(async res => {
                const keys = Object.keys(res[0])
                if (keys.length === 0) return;
                for (const student of res) {

                    if (!student['Students ID'] || !student['Student Name'] || !student.Gender || !student['Mobile (SMS)']) return;
                    // verify and convert number to 13 digits
                    const { number, err } = handleConvBanNum(String(student['Mobile (SMS)']));
                    if (err) return;

                    const hashPassword = await bcrypt.hash(number, Number(process.env.SALTROUNDS));

                    const userName = generateUsername(student['Student Name']);

                    const studentData = {
                        student_id: String(student['Students ID']),
                        first_name: student['Student Name'],
                        father_name: student["Father's Name"],
                        mother_name: student["Mother's Name"],
                        phone: number,
                        admission_date: new Date(Date.now()),
                        admission_status: "approved",
                        gender: student.Gender,
                        school: {
                            connect: { id: school_id }
                        },
                        user: {
                            create: {
                                username: userName,
                                password: hashPassword,
                                user_role_id: student_role.id,
                                role_id: student_role.id,
                                school_id: school_id,
                                admin_panel_id
                            }
                        }
                    };
                    customStudentsData.push(studentData);
                    // if (!err) finalContacts.push(number);
                }
            })
            .catch(err => { console.log({ getFileErr: err }) })

        const admittedStudentCount = await prisma.studentInformation.count({
            where: {
                school_id: parseInt(refresh_token?.school_id)
            }
        });

        const requestedStudentAdmissionCount = customStudentsData.length;
        if (requestedStudentAdmissionCount === 0) throw new Error("no valid students row founds");

        if (requestedStudentAdmissionCount + admittedStudentCount > schoolPackage?.package?.student_count) {
            return res.status(406).json({ message: 'Your package maximum students capacity has already been filled, please update your package !' });
        }

        let faildedSmS = [], successSmS = [];
        let faildedCreateStd = [], succesCreateStd = [];

        const allPromise = customStudentsData.map((customStudentInfo, index) => {
            return new Promise(async (resolve, reject) => {
                await prisma.$transaction(async (transaction) => {
                    const stdInfo = await transaction.studentInformation.create({
                        data: customStudentInfo
                    });
                    const resStd = await transaction.student.create({
                        data: {
                            class_roll_no: String(today) + index,
                            class_registration_no: registration_no_generate(index),
                            section: { connect: { id: parseInt(section_id) } },
                            academic_year: { connect: { id: dcryptAcademicYear.id } },
                            student_info: { connect: { id: stdInfo.id } }
                        }
                    });
                    const fees = await transaction.fee.findMany({
                        where: {
                            class_id: parseInt(class_id),
                            academic_year_id: dcryptAcademicYear.id
                        },
                        select: {
                            id: true
                        }
                    });

                    let StudentFeeContainer = [];
                    for (let i of fees) {
                        StudentFeeContainer.push({
                            student_id: resStd?.id,
                            fee_id: i.id,
                            collected_amount: 0,
                            payment_method: 'pending'
                        });
                    }
                    await transaction.studentFee.createMany({
                        data: StudentFeeContainer
                    })
                })
                    .then(res => {
                        console.log({ tran: res })
                        succesCreateStd.push(customStudentInfo.student_id);
                        // resolve({ isSuccess: true, student_id: customStudentInfo.student_id });
                        resolve(true);
                    })
                    .catch(err => {
                        faildedCreateStd.push(customStudentInfo.student_id);
                        logFile.error(`user_id=${user_id}` + err.message)
                        if (err.message === '\n' + 'Invalid `prisma.studentInformation.create()` invocation:\n' + '\n' + '\n' + 'Unique constraint failed on the constraint: `student_informations_student_id_school_id_key`') {
                            // resolve({ isSuccess: false, error: 'student id already used', student_id: customStudentInfo.student_id })
                            resolve(false)
                        }
                        // resolve({ isSuccess: false, error: err.message, student_id: customStudentInfo.student_id });
                        resolve(false)

                    })
            })

        });
        Promise
            .all(allPromise)
            .then(resp => {
                console.log({ resp })
                if (resp.includes(true)) return res.status(200).json({ message: 'students data inserted', faildedCreateStd, succesCreateStd });
                // if (resp[0].isSuccess) return res.status(200).json({ message: 'students data inserted', faildedCreateStd, succesCreateStd });
                res.status(404).json({ error: 'failed insert all students' });
            })
            .catch(err => {
                console.log({ "promise All error": err })
                res.status(404).json({ error: err.message });
            })
    } catch (err) {
        logFile.error(err.message)
        res.status(404).json({ error: err.message });
    }
};


const getDatasExcelOrCsvFile = (file_path): Promise<any> => {
    return new Promise(function (resolve, reject) {

        const datas = createReadStream(file_path, { highWaterMark: (128 * 100) });
        let buffer_part = 0;
        const bufferList = [];

        datas.on("data", (buffer) => {
            bufferList.push(buffer)
            buffer_part += 1;
        });

        datas.on("end", async () => {

            const totalBuffer = Buffer.concat(bufferList);

            const uint8 = new Uint8Array(totalBuffer)
            const workbook = XLSX.read(uint8, { type: "array" })
            /* DO SOMETHING WITH workbook HERE */
            const firstSheetName = workbook.SheetNames[0]
            /* Get worksheet */
            const worksheet = workbook.Sheets[firstSheetName];
            const excelArrayDatas = XLSX.utils.sheet_to_json(worksheet, { raw: true })

            if (excelArrayDatas.length > 30000) {
                handleDeleteFile(file_path);
                reject("large file, maximum support 30,000 row")
            }
            resolve(excelArrayDatas);
        });

        datas.on("error", (err) => {
            handleDeleteFile(file_path);
            reject(err);
        });
    });
}

export default authenticate(academicYearVerify(handlePost));