import prisma from '@/lib/prisma_client';
import { unique_tracking_number } from '@/utils/utilitY-functions';
import axios from 'axios';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';


const handleTransaction = ({ data, status, account, voucher, school_id }) => {
    return new Promise(async (resolve, reject) => {
        try {

            await prisma.$transaction(async (trans) => {
                const tracking_number = unique_tracking_number('st-')

                const temp = await trans.studentFee.create({
                    data: {
                        student: { connect: { id: data.student_id } },
                        fee: { connect: { id: data.fee_id } },
                        collected_amount: data.collected_amount,
                        payment_method: 'Online Bkash',
                        transID: data.transID,
                        account: { connect: { id: account.id } },
                        // payment_method_list: { connect: { id: data.payment_method_id } },
                        collected_by_user: { connect: { id: data.collected_by } },
                        transaction: {
                            create: {
                                amount: data.collected_amount,
                                account_id: account.id,
                                voucher_id: voucher.id,
                                transID: data.transID,
                                school_id: school_id,
                                created_at: data.created_at,
                                payment_method: 'Online Bkash',
                                account_name: account.title,
                                acccount_number: account.account_number,
                                voucher_type: voucher.type,
                                voucher_name: voucher.title,
                                voucher_amount: voucher.amount,
                                tracking_number
                            }
                        },
                        status,
                        total_payable: data?.total_payable
                    }
                });

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
                    created_at: temp.created_at,
                    last_payment_date: temp.created_at,
                    account_name: account.title,
                    transID: data.transID,
                    payment_method: 'Online Bkash',
                    status: temp.status
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
    console.log("rrrrrrrrrr",req.query);

    if (status === 'cancel') {
        await prisma.session_store.delete({ where: { paymentID: paymentID } })
        res.redirect(`${process.env.base_url}/management/fees/student_payment?message=${status}`)
    }
    else if (status === 'failure') {
        res.redirect(`${process.env.base_url}/management/fees/student_payment?message=${status}`)
    }
    else if (status === 'success') {
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

                    if (paymentVerify.data && paymentVerify.data.statusCode === '0000') {
                        //@ts-ignore
                        const { student_id, collected_by_user, fee_id, collected_amount, total_payable, school_id } = session.data

                        const voucher = await prisma.voucher.findFirstOrThrow({
                            where: {
                                resource_type: 'fee',
                                resource_id: fee_id
                            }
                        })
                        const account = await prisma.accounts.findFirstOrThrow({
                            where: {
                                //@ts-ignore
                                id: session?.data?.account_id
                            },
                        })
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

                        return res.redirect(`${process.env.base_url}/management/fees/student_payment?message=${status}`)
                    } else {
                        return res.redirect(`${process.env.base_url}/management/fees/student_payment?message=${paymentVerify.data.statusMessage}`)
                    }
                    break;
                default:
                    res.setHeader('Allow', ['GET', 'POST']);
                    res.status(405).end(`Method ${method} Not Allowed`);
            }
        }
        catch (error) {
            logFile.error(error.message);
            console.log(error)
            return res.redirect(`${process.env.base_url}/error?message=${error.message}`)
        }

    }
}

export default (index);
