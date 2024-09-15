import prisma from '@/lib/prisma_client';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token, dcryptAcademicYear) => {
    try {
        const { method } = req;
        const { class_id } = req.query;
        const { id: academic_year_id } = dcryptAcademicYear;

        switch (method) {
            case 'GET':
                const query = {}
                // @ts-ignore
                if (class_id) {
                    // @ts-ignore
                    query['class_id'] = Number(class_id)
                }
                const discount = await prisma.discount.findMany({
                    where: {
                        fee: {
                            school_id: refresh_token.school_id,
                            academic_year_id: academic_year_id,
                            ...query
                        },
                    },
                    include: {
                        fee: {
                            select: {
                                class: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                title: true,
                                fees_head: true,
                            }
                        },
                    },
                });

                const discount_ = await prisma.feesHaed.findMany({
                    where: {
                        Fee: {
                            some: {
                                school_id: refresh_token.school_id,
                                academic_year_id: academic_year_id,
                                ...query
                            }
                        },
                    },
                    include: {
                        Fee: {
                            select: {
                                title: true,
                                class_id: true,
                                class: true
                            }
                        }
                    },
                    // },

                    // include: {
                    //     fee: {
                    //         select: {
                    //             class: {
                    //                 select: {
                    //                     id: true,
                    //                     name: true
                    //                 }
                    //             },
                    //             title: true,
                    //             fees_head: true,
                    //         }
                    //     },
                    // },
                });

                const dis = await prisma.fee.groupBy({
                    by: ['class_id'],
                    // _count: {
                    //     includes: {
                    //         class: true
                    //     }
                    // }
                });

                console.log(JSON.stringify(dis, null, 3))

                res.status(200).json(discount)
                break;
            case 'POST':
                const { class_id, fee_id, type, amt, title } = req.body;
                console.log({ class_id, fee_id, type, amt, title });

                const temp = await prisma.fee.findMany({
                    where: {
                        class_id,
                        // id: fee_id,
                        academic_year_id: academic_year_id,
                        school_id: refresh_token?.school_id
                    },
                    select: {
                        id: true
                    }
                })
                console.log(JSON.stringify(temp, null, 3))

                if (!temp) throw new Error('Bad request !')

                temp.forEach(async fee => {
                    await prisma.discount.create({
                        data: {
                            title,
                            fee: {
                                connect: {
                                    id: Number(fee.id)
                                }
                            },
                            type,
                            amt: Number(amt),
                        }
                    })
                });
                // await prisma.discount.create({
                //     data: {
                //         title,
                //         fee: {
                //             connect: {
                //                 id: Number(fee_id)
                //             }
                //         },
                //         type,
                //         amt: Number(amt),
                //     }
                // })
                res.status(200).json({ message: 'Discount created successful !!' })
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                logFile.error(`Method ${method} Not Allowed`)
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message)
        res.status(500).json({ message: err.message });
    }
};

export default authenticate(academicYearVerify(index));