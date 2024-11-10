import prisma from '@/lib/prisma_client';
import dayjs from 'dayjs';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { isDateValid } from 'utilities_api/handleDate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token, academic_year) => {
    try {
        const { method } = req;
        const { school_id } = refresh_token;
        const { id: academic_year_id } = academic_year;
        console.log({ refresh_token })

        switch (method) {
            case 'GET':
                const { from_date, to_date, payment_method, collected_by, account_id, student_id } = req.query;

                if (!isDateValid(from_date) || !isDateValid(to_date)) throw new Error('required from date / to_date is not founds');

                const query = {};
                if (payment_method) {
                    query['payment_method'] = payment_method
                }
                if (account_id) {
                    query['account_id'] = Number(account_id)
                }
                if (student_id) {
                    query['student_id'] = Number(student_id)
                }
                if (collected_by) {
                    query['collected_by'] = collected_by
                }

                const data = await prisma.studentFee.findMany({
                    where: {
                        fee: { school_id, academic_year_id },
                        created_at: {
                            gte: from_date,
                            lte: to_date,
                            // gte: new Date(new Date(from_date).setUTCHours(0, 0, 0, 0)),
                            // lte: new Date(new Date(to_date).setUTCHours(23, 59, 59, 999))
                        },
                        ...query

                    },
                    include: {
                        collected_by_user: {
                            select: {
                                id: true,
                                username: true,
                            }
                        },
                        student: {
                            select: {
                                id: true,
                                class_roll_no: true,
                                class_registration_no: true,
                                discount: true,
                                student_info: {
                                    select: {
                                        first_name: true,
                                        middle_name: true,
                                        last_name: true
                                    }
                                },
                                class: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                },
                                batches: {
                                    select: {
                                        name: true,
                                        std_entry_time: true
                                    }
                                },
                            }
                        },
                        fee: {
                            select: {
                                Discount: true,
                                fees_head: true,
                                id: true,
                                title: true,
                                last_date: true,
                                late_fee: true,
                                amount: true,
                            }
                        },
                        transaction: {
                            select: {
                                tracking_number: true
                            }
                        },
                        account: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                })

                res.status(200).json(data)
                break;

            default:
                res.setHeader('Allow', ['GET']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });
    }
};

export default authenticate(academicYearVerify(index))
