import prisma from '@/lib/prisma_client';
import axios from 'axios';
import { logFile } from 'utilities_api/handleLogFile';

const handleTransaction = (
    {
        student_id, user_id,
        collected_by_user,
        // fee_id,
        fee_ids,
        collected_amount,
        total_payable, status, school_id
    },
    bkash_credential
) => {
    console.log({ bkash_credential })
    return new Promise(async (resolve, reject) => {
        try {

            // const bkash_credential = await prisma.payment_gateway_credential.findFirstOrThrow({
            //     where: {
            //         title: 'bkash',
            //         school_id
            //     }
            // })
            // @ts-ignore
            const token = await axios.post(bkash_credential?.details?.grant_token_url, { app_key: bkash_credential?.details?.X_App_Key, app_secret: bkash_credential?.details?.app_secret }, {
                // const token = await axios.post(process.env.grant_token_url, { app_key: process.env.bkash_X_App_Key, app_secret: process.env.bkash_app_secret }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    // @ts-ignore
                    username: bkash_credential?.details?.username, password: bkash_credential?.details?.password,
                    // username: process.env?.bkash_username, password: process.env.bkash_password,

                }
            })
            console.log({ token });
            // @ts-ignore
            const payment = await axios.post(bkash_credential?.details?.create_payment_url, {
                // const payment = await axios.post(process.env.bkash_create_payment_url, {
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
                    // 'x-app-key': process.env.bkash_X_App_Key,
                }
            })

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
                        // fee_id,
                        fee_ids,
                        account_id: bkash_credential?.account_id,
                        // account_id: "test",
                        collected_amount,
                        total_payable,
                        status,
                        school_id,  // @ts-ignore
                        execute_payment_url: bkash_credential?.details?.execute_payment_url, X_App_Key: bkash_credential?.details?.X_App_Key,
                        // execute_payment_url: process.env.bkash_execute_payment_url, X_App_Key: process.env.bkash_X_App_Key
                    }
                }
            })

            resolve({ bkashURL: payment.data.bkashURL })

        } catch (err) {
            console.log(err);

            reject(err.message);
            // reject(new Error(`${err.message}`))
        }
    })
}


const index = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // replace this your actual origin
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,DELETE,PATCH,POST,PUT'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    // console.log(res)
    try {
        const { method } = req;
        console.log({ method })
        switch (method) {
            case 'POST':

                const { user_id, student_id, pay_fees } = JSON.parse(req.body);
                console.log({ student_id, pay_fees });

                const resUser = await prisma.user.findFirst({
                    where: { id: user_id }, select: {
                        school_id: true, school: {
                            select: {
                                Payment_gateway_credential: true
                            }
                        }
                    }
                });

                const studentRes = {
                    student_id,
                    user_id: user_id,
                    collected_by_user: user_id,
                    // fee_id: feesP.fee_id ,
                    fee_ids: [],
                    // collected_amount: feesP.paid_amount,
                    collected_amount: 0,
                    total_payable: 0,
                    status: "paid",
                    school_id: resUser.school_id
                };
                // console.log({ s })


                await pay_fees.forEach(async (feesP) => {
                    studentRes.fee_ids.push(feesP.fee_id);
                    studentRes.collected_amount += feesP.paid_amount
                });

                // console.log({ feesP });
                const resStd = await handleTransaction(studentRes, resUser.school.Payment_gateway_credential[0]);
                // .then(res => { console.log({ res }) }).catch(err => { console.log({ err }) })
                console.log({ resStd });
                // @ts-ignore
                res.status(200).json({ bkashURL: resStd.bkashURL });


                break;

            default:
                res.setHeader('Allow', ['POST']);
                res.status(405).JSON(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message);
        res.status(500).json({ message: err.message });
    }
};

export default index;
