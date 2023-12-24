import prisma from '@/lib/prisma_client';
import { unique_tracking_number } from '@/utils/utilitY-functions';
import axios from 'axios';
import { authenticate } from 'middleware/authenticate';


const handleTransaction = ({ session, paymentVerifyData }) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log({ session, paymentVerifyData });

            await prisma.$transaction(async (trans) => {

                const subscription = await trans.subscription.findFirstOrThrow({
                    where: {
                        school_id: session.data.school_id
                    },
                    select: {
                        package_id: true
                    }
                })
                const { paymentID, paymentExecuteTime, trxID, merchantInvoiceNumber, customerMsisdn } = paymentVerifyData
                await trans.package_transaction.create({
                    data: {
                        package_id: subscription.package_id,
                        paymentID: paymentID,
                        amount: Number(session.data.collected_amount),
                        paymentExecuteTime: new Date(paymentExecuteTime.slice(0, 19)) || new Date(),
                        pay_via: 'Bkash',
                        trxID: trxID,
                        merchantInvoiceNumber: merchantInvoiceNumber,
                        customerMsisdn: customerMsisdn,
                        school_id: session.data.school_id
                    }
                });

                const end = new Date(session.data.subscription_end)
                end.setDate(end.getDate() + session.data.subscription_duration);

                await trans.subscription.update({
                    where: {
                        id: session.data.subscription_id
                    },
                    data: {
                        end_date: end,
                        Subscription_history: {
                            create: {
                                edited_at: new Date(),
                                edited_by: session.user_id
                            }
                        }
                    }
                })

                resolve('done')
            })

        } catch (err) {
            reject(new Error(`${err.message}`))
        }
    })
}

const index = async (req, res, refresh_token) => {

    const { method } = req;


    const { paymentID, status } = req.query
    console.log(req.query);

    if (status === 'cancel') {
        await prisma.session_store.delete({ where: { paymentID: paymentID } })
        res.redirect(process.env.base_url + `/settings/package_request?message=${status}`)
    }
    else if (status === 'failure') {
        res.redirect(process.env.base_url + `/settings/package_request?message=${status}`)
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

                    const paymentVerify = await axios.post(process.env.bkash_execute_payment_url, { paymentID }, {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            authorization: session.token,
                            'x-app-key': process.env.bkash_X_App_Key
                        }
                    })
                    console.log("exe data__", paymentVerify.data);

                    if (paymentVerify.data && paymentVerify.data.statusCode === '0000') {

                        await handleTransaction({
                            session,
                            paymentVerifyData: paymentVerify.data
                        })

                        await prisma.session_store.delete({ where: { paymentID: session.paymentID } })

                        return res.redirect(process.env.base_url + `/settings/package_request?message=${status}`)
                    } else {
                        return res.redirect(process.env.base_url + `/settings/package_request?message=${paymentVerify.data.statusMessage}`)
                    }
                    break;
                default:
                    res.setHeader('Allow', ['GET', 'POST']);
                    res.status(405).end(`Method ${method} Not Allowed`);
            }
        }
        catch (error) {
            console.log(error)
            return res.redirect(process.env.base_url + `/error?message=${error.message}`)
        }

    }
}

export default (index);
