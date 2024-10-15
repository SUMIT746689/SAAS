import prisma from '@/lib/prisma_client';
import { handleGetMaxTrackingNumber, unique_tracking_number } from '@/utils/utilitY-functions';
import axios from 'axios';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';


const handleTransaction = ({ data, status, account, voucher, school_id }) => {
    return new Promise(async (resolve, reject) => {
        try {

            await prisma.$transaction(async (trans) => {
                const tracking_number = await handleGetMaxTrackingNumber(school_id);

                for (const vhr of voucher) {

                    const temp = await trans.studentFee.create({
                        data: {
                            student: { connect: { id: data.student_id } },
                            fee: { connect: { id: vhr.resource_id } },
                            collected_amount: data.collected_amount,
                            payment_method: 'bkash',
                            transID: data.transID,
                            account: { connect: { id: account.id } },
                            // payment_method_list: { connect: { id: data.payment_method_id } },
                            collected_by_user: { connect: { id: data.collected_by } },
                            transaction: {
                                create: {
                                    amount: data.collected_amount,
                                    account_id: account.id,
                                    voucher_id: vhr.id,
                                    transID: data.transID,
                                    school_id: school_id,
                                    created_at: data.created_at,
                                    payment_method: 'bkash',
                                    account_name: account.title,
                                    acccount_number: account.account_number,
                                    voucher_type: vhr.type,
                                    voucher_name: vhr.title,
                                    voucher_amount: vhr.amount,
                                    tracking_number
                                }
                            },
                            status,
                            total_payable: data?.total_payable
                        }
                    });
                };

                await trans.accounts.update({
                    where: {
                        id: account.id
                    },
                    data: {
                        balance: account.balance + data.collected_amount
                    }
                })

                resolve({
                    tracking_number,
                    // created_at: temp.created_at,
                    // last_payment_date: temp.created_at,
                    account_name: account.title,
                    transID: data.transID,
                    payment_method: 'bkash',
                    // status: temp.status
                })
            })

        } catch (err) {
            console.log(err);

            reject(new Error(`${err.message}`))
        }
    })
}

const index = async (req, res, refresh_token) => {

    const { method } = req;


    const { paymentID, status } = req.query
    console.log("rrrrrrrrrr", req.query);

    const resSessionStore = await prisma.session_store.findFirst({ where: { paymentID }, select: { data: true } });

    // if (!resSessionStore.data?.school_id) return res.redirect(`http://${schoolWebsite.domain}/fees-payments?message=${status}`);

    // @ts-ignore
    const schoolWebsite = await prisma.school.findFirst({ where: { id: resSessionStore.data.school_id }, select: { domain: true } });
    console.log({ schoolWebsite })
    if (status === 'cancel') {
        await prisma.session_store.delete({ where: { paymentID: paymentID } });
        return res.redirect(`http://${schoolWebsite.domain}/fees-payments?message=${status}`)
    }
    if (status === 'failure') {
        return res.redirect(`http://${schoolWebsite.domain}/fees-payments?message=${status}`)
    }
    if (status === 'success') {
        try {
            switch (method) {
                case 'GET':
                    const session = await prisma.session_store.findFirstOrThrow({
                        where: {
                            paymentID
                        },
                    })

                    //@ts-ignore
                    const paymentVerify = await axios.post(session?.data?.execute_payment_url, { paymentID }, {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            authorization: session.token,
                            //@ts-ignore
                            'x-app-key': session?.data?.X_App_Key
                        }
                    });

                    console.log("exe data__", paymentVerify.data);

                    if (paymentVerify.data
                        // && paymentVerify.data.statusCode === '0000'
                    ) {
                        //@ts-ignore
                        const { student_id, collected_by_user, fee_id, fee_ids, collected_amount, total_payable, school_id } = session.data

                        const voucher = await prisma.voucher.findMany({
                            where: {
                                resource_type: 'fees',
                                resource_id: { in: fee_ids }
                            }
                        })
                        console.log({ voucher });
                        const account = await prisma.accounts.findFirstOrThrow({
                            where: {
                                //@ts-ignore
                                id: session?.data?.account_id
                            },
                        });
                        console.log({ account });

                        const data = {
                            student_id,
                            fee_id,
                            collected_amount,
                            //@ts-ignore
                            // account_id: account.id,
                            // payment_method_id: 1,
                            //@ts-ignore
                            // payment_method: account?.payment_method[0]?.title,
                            transID: paymentVerify.data.trxID,
                            collected_by: parseInt(collected_by_user),
                            total_payable: parseInt(total_payable)
                        }
                        //@ts-ignore
                        await handleTransaction({ data, status: session.data.status, account, voucher, school_id })

                        await prisma.session_store.delete({ where: { paymentID: session.paymentID } })

                        return res.redirect(`http://${schoolWebsite.domain}/fees-payments?message=${status}`)
                    } else {
                        return res.redirect(`http://${schoolWebsite.domain}/fees-payments?message=${paymentVerify.data.statusMessage}`)
                    }
                    break;
                default:
                    res.setHeader('Allow', ['GET', 'POST']);
                    res.status(405).end(`Method ${method} Not Allowed`);
            }
        }
        catch (error) {
            console.log("------------------", schoolWebsite.domain)
            logFile.error(error.message);
            console.log(error)
            // return res.redirect(`http://${schoolWebsite.domain}/error?message=${error.message}`)
            return res.redirect(`http://${schoolWebsite.domain}/fees-payments?message=${error.message}`)

        }
    }
}

export default (index);
