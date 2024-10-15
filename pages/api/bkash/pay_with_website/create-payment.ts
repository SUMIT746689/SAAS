import prisma from '@/lib/prisma_client';
import { unique_tracking_number } from '@/utils/utilitY-functions';
import axios from 'axios';
import { authenticate } from 'middleware/authenticate';
import dayjs from 'dayjs';
import { logFile } from 'utilities_api/handleLogFile';

const handleTransaction = ({ student_id, user_id,
    collected_by_user,
    fee_id,
    collected_amount,
    total_payable, status, school_id }) => {
    return new Promise(async (resolve, reject) => {
        try {

            const bkash_credential = await prisma.payment_gateway_credential.findFirstOrThrow({
                where: {
                    title: 'bkash',
                    school_id
                }
            })
            // @ts-ignore
            const token = await axios.post(bkash_credential?.details?.grant_token_url, { app_key: bkash_credential?.details?.X_App_Key, app_secret: bkash_credential?.details?.app_secret }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    // @ts-ignore
                    username: bkash_credential?.details?.username, password: bkash_credential?.details?.password,
                }
            })
            // @ts-ignore
            const payment = await axios.post(bkash_credential?.details?.create_payment_url, {
                mode: '0011',
                payerReference: "fee payment",
                callbackURL: `${process.env.base_url}/api/bkash/pay_with_website/execute_payment`,
                amount: Number(collected_amount),
                currency: "BDT",
                intent: 'sale',
                merchantInvoiceNumber: 'Inv' + '134235'
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    authorization: token?.data?.id_token,
                    // @ts-ignore
                    'x-app-key': bkash_credential?.details?.X_App_Key,
                }
            })
            console.log("payment__", payment.data);

            if (!payment.data?.paymentID || !token.data?.id_token) throw Error(payment.data.statusMessage)

            await prisma.session_store.create({

                data: {
                    paymentID: payment.data.paymentID,
                    created_at: new Date(payment.data?.paymentCreateTime.slice(0, 19)) || new Date(),
                    user_id: user_id,
                    token: token.data.id_token,
                    data: {
                        student_id,
                        collected_by_user,
                        fee_id,
                        account_id: bkash_credential.account_id,
                        collected_amount,
                        total_payable,
                        status,
                        school_id,  // @ts-ignore
                        execute_payment_url: bkash_credential?.details?.execute_payment_url, X_App_Key: bkash_credential?.details?.X_App_Key
                    }
                }
            })

            resolve({ bkashURL: payment.data.bkashURL })

        } catch (err) {
            console.log(err);
            
            reject(new Error(`${err.message}`))
        }
    })
}


const index = async (req, res, refresh_token) => {
    try {
        const { method } = req;

        switch (method) {
            case 'POST':
                const { student_id,
                    collected_by_user,
                    fee_id,
                    total_payable } = req.body;
                console.log("req.body__", req.body);

                if (!student_id || !collected_by_user || !fee_id || !req.body.collected_amount || !total_payable) {
                    throw new Error('student_id or collected_by_user or fee_id or collected_amount or total_payable missing !!')
                }


                const collected_amount = Number(req.body.collected_amount);

                if (!collected_amount) throw new Error('provide valid amount !');

                const fee = await prisma.fee.findFirst({
                    where: { id: fee_id }
                });


                const AllDiscount = await prisma.student.findFirst({
                    where: {
                        id: student_id,
                    },
                    select: {
                        discount: true
                    }
                })
                console.log("AllDiscount__", AllDiscount);

                const discount = AllDiscount?.discount?.filter(i => i.fee_id == fee_id);
                console.log("discount1__", discount);

                const totalDiscount = discount.reduce((a, c) => {
                    if (c.type == 'percent') return a + (c.amt * fee.amount) / 100
                    else return a + c.amt
                }, 0)
                console.log(fee.amount, "totalDiscount___", totalDiscount);

                const feeAmount = fee.amount - totalDiscount;

                const isAlreadyAvaliable = await prisma.studentFee.aggregate({
                    where: {
                        student_id,
                        fee_id,
                    },
                    _sum: {
                        collected_amount: true,
                    },
                    _max: {
                        created_at: true
                    }
                })
                console.log("isAlreadyAvaliable__", isAlreadyAvaliable);



                const last_date = new Date(fee.last_date)

                const totalPaidAmount = isAlreadyAvaliable._sum.collected_amount ? isAlreadyAvaliable._sum.collected_amount : 0;
                const last_trnsation_date = isAlreadyAvaliable._max.created_at ? new Date(isAlreadyAvaliable._max.created_at) : new Date();

                const late_fee = fee.late_fee ? fee.late_fee : 0;

                // console.log(totalPaidAmount, '     ', collected_amount, '     ', feeAmount);
                const paidAmount = totalPaidAmount + collected_amount
                let status = '';
                if (isAlreadyAvaliable._sum.collected_amount && isAlreadyAvaliable._sum.collected_amount > 0) {

                    const last_date = new Date(fee.last_date)
                    const new_trnsation_date = new Date()

                    if (new_trnsation_date > last_date && paidAmount >= feeAmount + late_fee) status = 'paid late'
                    else if (new_trnsation_date > last_date && feeAmount == paidAmount && late_fee > 0) status = 'fine unpaid'
                    else if (last_date >= new_trnsation_date && feeAmount == paidAmount) status = 'paid'
                    else if (paidAmount > 0) status = 'partial paid'
                    else status = 'unpaid'

                }
                else {
                    if (paidAmount > 0) status = 'partial paid'
                    else status = 'unpaid'
                }
                if (last_trnsation_date > last_date) {

                    if (totalPaidAmount >= feeAmount + late_fee) throw new Error('Already Paid in Late');

                    else if (totalPaidAmount < feeAmount + late_fee) {
                        if (collected_amount + totalPaidAmount > feeAmount + late_fee) throw new Error(`Only pay ${feeAmount + late_fee - totalPaidAmount} !`)
                        else {
                            const tr = await handleTransaction({
                                student_id,
                                user_id: refresh_token.id,
                                collected_by_user,
                                fee_id,
                                collected_amount,
                                total_payable,
                                status,
                                school_id: refresh_token.school_id
                            })
                            //@ts-ignore
                            return res.status(200).json({ bkashURL: tr.bkashURL })
                        }

                    }
                }
                else {
                    if (totalPaidAmount === feeAmount) throw new Error('Already Paid !')
                    else if (totalPaidAmount + collected_amount > feeAmount) throw new Error(`you paid ${totalPaidAmount},now pay ${feeAmount - totalPaidAmount} amount !`)
                    else {
                        const tr = await handleTransaction({
                            student_id,
                            user_id: refresh_token.id,
                            collected_by_user,
                            fee_id,
                            collected_amount,
                            total_payable,
                            status,
                            school_id: refresh_token.school_id
                        })
                        //@ts-ignore
                        return res.status(200).json({ bkashURL: tr.bkashURL })
                    }
                }

                break;




            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message);
        res.status(500).json({ message: err.message });
    }
};

export default authenticate(index);
