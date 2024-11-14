import prisma from '@/lib/prisma_client';
import { handleGetMaxTrackingNumber } from '@/utils/utilitY-functions';
import { logFile } from 'utilities_api/handleLogFile';
import { post_other_fees } from './other_fees';

// global variable

export let new_student_fees_id = [];
export let new_transaction_fees_id = [];
export let account_table_update_info = [];

// accounts table update code start
const handleAccounts = async (resultsArr) => {
  // account.balance + data.collected_amount

  try {
    let sum = 0;
    for (let i = 0; i < resultsArr.length; i++) {
      sum = sum + resultsArr[i].account_balance + resultsArr[i].collect_amount;
    }

    const r = await prisma.accounts.update({
      where: {
        id: resultsArr[0].account_id
      },
      data: {
        balance: sum
      }
    });
    account_table_update_info = resultsArr;

    return null;
  } catch (err) {
    // new_student_fees_id.forEach(async (item) => {
    //   await prisma.studentFee.delete({
    //     where: {
    //       id: item.id
    //     }
    //   });
    // });
    // new_transaction_fees_id.forEach(async (item) => {
    //   await prisma.transaction.delete({
    //     where: {
    //       id: item.id
    //     }
    //   });
    // });
    throw new Error("unable to update account's balance");
  }
};
// accounts table update code end

const handleTransaction = ({ collection_date, data, status, account, voucher, refresh_token, sent_sms, tracking_number, fee }) => {
  return new Promise(async (resolve, reject) => {
    try {
      await prisma.$transaction(async (trans) => {
        // const tracking_number = unique_tracking_number('st-');

        const temp = await trans.studentFee.create({
          data: {
            student: { connect: { id: data.student_id } },
            fee: { connect: { id: data.fee_id } },
            collected_amount: data.collected_amount,
            payment_method: data.payment_method,
            transID: data.transID,
            collection_date: collection_date,
            on_time_discount: data?.on_time_discount,
            account: { connect: { id: data.account_id } },
            payment_method_list: { connect: { id: data.payment_method_id } },
            collected_by_user: { connect: { id: data.collected_by } },
            transaction: {
              create: {
                amount: data.collected_amount, // done
                account_id: account.id, // done
                payment_method_id: account?.payment_method[0]?.id, // done
                voucher_id: voucher.id,
                transID: data.transID,
                school_id: refresh_token.school_id,
                created_at: data.created_at,
                payment_method: account?.payment_method[0]?.title,
                account_name: account.title,
                acccount_number: account.account_number,
                voucher_type: voucher.type,
                voucher_name: voucher.title,
                voucher_amount: voucher.amount,
                tracking_number: tracking_number
              }
            },
            status,
            total_payable: data?.total_payable
          }
        });

        new_student_fees_id.push(temp.id);
        new_transaction_fees_id.push(temp.transaction_id);

        resolve({
          fee_id: temp.fee_id,
          id: temp.id,
          account_id: account.id,
          account_balance: account.balance,
          collect_amount: data.collected_amount,
          tracking_number,
          collection_date,
          created_at: temp.created_at,
          on_time_discount: temp.on_time_discount,
          //  last_payment_date: temp.created_at,
          last_payment_date: temp.collection_date,
          account_name: account.title,
          transID: data.transID,
          payment_method: account?.payment_method[0]?.title,
          status: temp.status,
          last_date: fee.last_date,
          late_fee: fee.late_fee,
          amount: fee.amount,
          paidAmount: temp.collected_amount,
          title: fee.title,
          subject_id: fee.subject_id
        });
      });
    } catch (err) {
      reject(new Error(`${err.message}`));
    }
  });
};
export const post = async (req, res, refresh_token) => {
  // updated code start

  try {
    const { id: user_id, school_id } = refresh_token;
    let {
      studentClass,
      collection_date,
      student_id,
      fee_id,
      account_id,
      payment_method_id,
      collected_by_user,
      transID,
      total_payable,
      sent_sms,
      collect_filter_data
    }: any = req.body;


    // create a single trancking_number
    const tracking_number = await handleGetMaxTrackingNumber(school_id);

    if (student_id && fee_id.length > 0 && account_id && payment_method_id && collected_by_user) {
      const promises = collect_filter_data.map(async (item) => {
        try {
          let collected_amount = null;
          let fee_id = item.id;
          let total_payable = item.total_payable;
          let on_time_discount = item.on_time_discount;

          if (!item?.collected_amount) {
            collected_amount = Number(req.body.collected_amount);
          } else {
            collected_amount = Number(item.collected_amount);
          }

          if (!student_id || !fee_id || (typeof collected_amount !== 'number' && collected_amount < 0)) {
            throw new Error('provide valid informations');
          }

          const voucher = await prisma.voucher.findFirstOrThrow({
            where: {
              resource_type: 'fees',
              resource_id: fee_id
            }
          });

          const account = await prisma.accounts.findFirstOrThrow({
            where: {
              id: Number(account_id)
            },
            include: {
              payment_method: {
                where: {
                  id: Number(payment_method_id)
                }
              }
            }
          });

          const fee = await prisma.fee.findFirst({
            where: { id: fee_id, deleted_at: null }
          });

          const AllDiscount = await prisma.student.findFirst({
            where: {
              id: student_id
            },
            select: {
              discount: true
            }
          });

          const discount = AllDiscount?.discount?.filter((i) => i.fee_id == fee_id);

          const totalDiscount = discount.reduce((a, c) => {
            if (c.type == 'percent') return a + (c.amt * fee.amount) / 100;
            else return a + c.amt;
          }, 0);

          const feeAmount = fee.amount - totalDiscount;

          const isAlreadyAvaliable = await prisma.studentFee.aggregate({
            where: {
              deleted_at: null,
              student_id,
              fee_id
            },
            _sum: {
              collected_amount: true
            },
            _max: {
              created_at: true
            }
          });

          const data = {
            student_id,
            fee_id,
            collected_amount,
            account_id,
            payment_method_id,
            payment_method: account?.payment_method[0]?.title,
            transID,
            collected_by: Number(collected_by_user),
            total_payable: Number(total_payable),
            on_time_discount: Number(on_time_discount)
          };

          const last_date = new Date(fee.last_date);

          const totalPaidAmount = isAlreadyAvaliable._sum.collected_amount ? isAlreadyAvaliable._sum.collected_amount : 0;
          // old
          // const last_trnsation_date = isAlreadyAvaliable._max.created_at
          //   ? new Date(isAlreadyAvaliable._max.created_at)
          //   : new Date();
          const last_trnsation_date = isAlreadyAvaliable._max.created_at ? new Date(isAlreadyAvaliable._max.created_at) : new Date(collection_date);

          const late_fee = fee.late_fee ? fee.late_fee : 0;

          const paidAmount = totalPaidAmount + collected_amount;

          let status;

          if (isAlreadyAvaliable._sum.collected_amount && isAlreadyAvaliable._sum.collected_amount > 0) {
            const last_date = new Date(fee.last_date);
            // old
            // const new_trnsation_date = new Date();
            const new_trnsation_date = new Date(collection_date);

            if (new_trnsation_date > last_date && paidAmount >= feeAmount + late_fee) status = 'paid late';
            else if (new_trnsation_date > last_date && feeAmount == paidAmount && late_fee > 0) status = 'fine unpaid';
            else if (last_date >= new_trnsation_date && feeAmount == paidAmount) status = 'paid';
            else if (paidAmount > 0) {
              status = 'partial paid';
            } else status = 'unpaid';
          } else {
            if (item?.collected_amount === item?.total_payable) {
              status = 'paid';
            } else if (paidAmount > 0) {
              status = 'partial paid';
            } else status = 'unpaid';
          }
          const last_trnsation_time = new Date(last_trnsation_date).getTime();
          const last_date_time = new Date(last_date).getTime();

          if (last_trnsation_time > last_date_time) {
            if (totalPaidAmount >= feeAmount + late_fee) {
              throw new Error('Already Paid in Late');
            } else if (totalPaidAmount < feeAmount + late_fee) {
              if (collected_amount + totalPaidAmount > feeAmount + late_fee) {
                throw new Error(`Only pay ${feeAmount + late_fee - totalPaidAmount} !`);
              } else {
                return await handleTransaction({
                  collection_date,
                  data,
                  account,
                  status,
                  voucher,
                  refresh_token,
                  sent_sms,
                  tracking_number,
                  fee
                });
              }
            }
          } else {
            // Mehedi vai checking part
            if (totalPaidAmount === feeAmount) {
              throw new Error('Already Paid !');
            } else if (totalPaidAmount + collected_amount > feeAmount) {
              throw new Error(`you paid ${totalPaidAmount},now pay ${feeAmount - totalPaidAmount} amount !`);
            } else {
              return await handleTransaction({
                collection_date,
                data,
                account,
                status,
                voucher,
                refresh_token,
                sent_sms,
                tracking_number,
                fee
              });
            }
          }
        } catch (error) {
          //     here have a problem

          throw new Error(`${error.message}`);
        }
      });
      const results = await Promise.all(promises);
      let successfulResults = results.filter((result) => result !== null);

      if (successfulResults.length > 0) {
        for (const successfulResult of successfulResults) {
          await teacherPayamount(successfulResult, school_id);
        }

        // Expected outpu
        const calculate_result = await handleAccounts(successfulResults);

        if (calculate_result !== null) {
          throw new Error("unable to update account's balance");
        }

        if (req.body?.other_fees_data !== null) {
          const post_other_fees_res = await post_other_fees(
            studentClass,
            collection_date,
            req.body.other_fees_data,
            res,
            refresh_token,
            tracking_number
          );

          if (Object.keys(post_other_fees_res).length === 0) {
            // console.log("Object is empty");
          } else {
            successfulResults.push(post_other_fees_res);
            res.status(200).json({
              success: true,
              result: successfulResults
            });
          }
        } else {
          res.status(200).json({
            success: true,
            result: successfulResults
          });
        }
      } else {
        // successfulResults.forEach(async (item) => {
        //   await prisma.studentFee.delete({
        //     where: {
        //       id: item.id
        //     }
        //   });

        //   const lastRecord = await prisma.transaction.findFirst({
        //     orderBy: { id: 'desc' }
        //   });

        //   await prisma.transaction.delete({
        //     where: { id: lastRecord.id }
        //   });
        // });

        throw new Error('failed to insert student fees');
      }
    } else if (req.body?.other_fees_data !== null) {
      const post_other_fees_res = await post_other_fees(studentClass, collection_date, req.body.other_fees_data, res, refresh_token, tracking_number);

      if (Object.keys(post_other_fees_res).length === 0) {
        // console.log("Object is empty");
      } else {
        res.status(200).json({
          success: true,
          result: [post_other_fees_res]
        });
      }
    } else {
      throw new Error('other fees related error');
    }
    // Only for other fees part code end
  } catch (error) {
    // if happend any error then this part will be execute start

    // student_fees delete from student_fees table
    new_student_fees_id.forEach(async (item) => {
      await prisma.studentFee.delete({
        where: {
          id: item
        }
      });
    });

    // transaction delete from transaction table
    new_transaction_fees_id.forEach(async (item) => {
      await prisma.transaction.delete({
        where: {
          id: item
        }
      });
    });

    // if happend any error then this part will be execute start

    logFile.error(error.message);
    res.status(500).json({ error: error.message });
  }
  // updated code end
};

const teacherPayamount = async (data, school_id) => {
  const {
    fee_id,
    id: student_fee_id,
    account_id,
    account_balance,
    collect_amount,
    tracking_number,
    collection_date,
    created_at,
    on_time_discount,
    last_payment_date,
    account_name,
    transID,
    payment_method,
    status,
    last_date,
    late_fee,
    amount,
    paidAmount,
    title,
    subject_id
  } = data;

  if (!subject_id) return;

  const teacherFindPay = await prisma.teacherSalaryStructure.findFirst({
    where: {
      subject_id: subject_id || undefined,
      deleted_at: null,
      school_id
    }
  });

  if (!teacherFindPay) return;

  const totalAmt = amount + late_fee;

  // calculate teacher should pay from student fee
  const calcTeacherPayAmt =
    teacherFindPay.payment_type === 'percentage'
      ? (paidAmount * teacherFindPay.percentage_amount) / 100
      : (paidAmount * teacherFindPay.fixed_amount) / totalAmt;

  return await prisma.studentFeeWiseTeacherPay
    .create({
      data: {
        school_id: school_id,
        teacher_id: teacherFindPay.teacher_id,
        teacher_pay_type: teacherFindPay.payment_type,
        subject_id,
        student_fee_id,
        amount: calcTeacherPayAmt,
        collection_date,
        percentage_amount: teacherFindPay.percentage_amount ? Number(teacherFindPay.percentage_amount) : 0,
        fixed_amount: teacherFindPay.fixed_amount ? Number(teacherFindPay.fixed_amount) : 0
      }
    })
    .then((res) => {
      console.log(res);
    });
};
