import prisma from '@/lib/prisma_client';
import { unique_tracking_number } from '@/utils/utilitY-functions';
import { logFile } from 'utilities_api/handleLogFile';

const createSmsQueueTableHandler = ({
  user_id,
  contacts,
  sms_text,
  submission_time,
  school_id,
  school_name,
  sender_id,
  sms_type,
  index,
  number_of_sms_parts,
  charges_per_sms
}) => {
  const currentDate = new Date().getTime();
  const sms_shoot_id = [
    String(school_id),
    String(currentDate),
    String(index)
  ].join('_');

  prisma
    .$transaction([
      prisma.tbl_queued_sms.create({
        data: {
          sms_shoot_id,
          user_id: parseInt(user_id),
          school_id,
          school_name,
          sender_id,
          sms_type,
          sms_text,
          // // sender_id: 1,
          // // sender_name: "",
          submission_time: new Date(submission_time),
          contacts,
          pushed_via: '',
          // // status: status,
          // // route_id: 1,
          // // coverage_id: 1,
          charges_per_sms,
          total_count: 1,
          number_of_sms_parts
          // // is_black_list: 2,
          //fail_count: 3,
          //priority: 4
        }
      }),
      prisma.tbl_sent_sms.create({
        data: {
          sms_shoot_id,
          user_id: parseInt(user_id),
          school_id,
          school_name,
          sender_id,
          sms_type,
          sms_text,
          // // sender_id: 1,
          // // sender_name: "",
          submission_time: new Date(submission_time),
          contacts,
          pushed_via: '',
          // // status: status,
          // // route_id: 1,
          // // coverage_id: 1,
          charges_per_sms,
          total_count: 1,
          number_of_sms_parts
          // // is_black_list: 2,
          //fail_count: 3,
          //priority: 4
        }
      }),
      prisma.school.update({
        where: { id: school_id },
        data: {
          masking_sms_count:
            sms_type === 'masking' ? { decrement: 1 } : undefined,
          non_masking_sms_count:
            sms_type === 'non_masking' ? { decrement: 1 } : undefined
        }
      })
    ])
    .then((res) => {
      console.log(
        `tbl_queue_sms, tbl_sent_sms created & school_id(${school_id}) update sucessfully`
      );
    })
    .catch((err) => {
      console.log('error tbl_queue_sms or tbl_sent_sms create', err);
    });

  // .then(res => { logFile.error(`tbl_queue_sms, tbl_sent_sms created & school_id(${school_id}) update sucessfully`) })
  // .catch(err => { logFile.error("error tbl_queue_sms or tbl_sent_sms create", err) })
};

const handleTransaction = ({
  data,
  status,
  account,
  voucher,
  refresh_token,
  sent_sms
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log({ sent_sms })
      // createSmsQueueTableHandler(user)

      await prisma.$transaction(async (trans) => {
        const tracking_number = unique_tracking_number('st-');

        const temp = await trans.studentFee.create({
          data: {
            student: { connect: { id: data.student_id } },
            fee: { connect: { id: data.fee_id } },
            collected_amount: data.collected_amount,
            payment_method: data.payment_method,
            transID: data.transID,
            account: { connect: { id: data.account_id } },
            payment_method_list: { connect: { id: data.payment_method_id } },
            collected_by_user: { connect: { id: data.collected_by } },
            transaction: {
              create: {
                amount: data.collected_amount,
                account_id: account.id,
                payment_method_id: account?.payment_method[0]?.id,
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
        });

        resolve({
          tracking_number,
          created_at: temp.created_at,
          last_payment_date: temp.created_at,
          account_name: account.title,
          transID: data.transID,
          payment_method: account?.payment_method[0]?.title,
          status: temp.status
        });
      });
    } catch (err) {
      reject(new Error(`${err.message}`));
    }
  });
};

export const post = async (req, res, refresh_token) => {
  try {
    const {
      student_id,
      fee_id,
      account_id,
      payment_method_id,
      collected_by_user,
      transID,
      total_payable,
      sent_sms
    }: any = req.body;
    // console.log({ sent_sms })
    const collected_amount = Number(req.body.collected_amount);

    if (!student_id || !fee_id || !collected_amount)
      throw new Error('provide valid informations');
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
      where: { id: fee_id }
    });

    const AllDiscount = await prisma.student.findFirst({
      where: {
        id: student_id
      },
      select: {
        discount: true
      }
    });
    console.log('AllDiscount__', AllDiscount);

    const discount = AllDiscount?.discount?.filter((i) => i.fee_id == fee_id);
    console.log('discount1__', discount);

    const totalDiscount = discount.reduce((a, c) => {
      if (c.type == 'percent') return a + (c.amt * fee.amount) / 100;
      else return a + c.amt;
    }, 0);
    console.log(fee.amount, 'totalDiscount___', totalDiscount);

    const feeAmount = fee.amount - totalDiscount;

    const isAlreadyAvaliable = await prisma.studentFee.aggregate({
      where: {
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
    console.log('isAlreadyAvaliable__', isAlreadyAvaliable);

    //  return res.send(isAlreadyAvaliable)

    const data = {
      student_id,
      fee_id,
      collected_amount,
      account_id,
      payment_method_id,
      payment_method: account?.payment_method[0]?.title,
      transID,
      collected_by: Number(collected_by_user),
      total_payable: Number(total_payable)
    };

    const last_date = new Date(fee.last_date);

    const totalPaidAmount = isAlreadyAvaliable._sum.collected_amount
      ? isAlreadyAvaliable._sum.collected_amount
      : 0;
    const last_trnsation_date = isAlreadyAvaliable._max.created_at
      ? new Date(isAlreadyAvaliable._max.created_at)
      : new Date();

    const late_fee = fee.late_fee ? fee.late_fee : 0;

    // console.log(totalPaidAmount, '     ', collected_amount, '     ', feeAmount);
    const paidAmount = totalPaidAmount + collected_amount;
    let status;
    if (
      isAlreadyAvaliable._sum.collected_amount &&
      isAlreadyAvaliable._sum.collected_amount > 0
    ) {
      const last_date = new Date(fee.last_date);
      const new_trnsation_date = new Date();

      if (new_trnsation_date > last_date && paidAmount >= feeAmount + late_fee)
        status = 'paid late';
      else if (
        new_trnsation_date > last_date &&
        feeAmount == paidAmount &&
        late_fee > 0
      )
        status = 'fine unpaid';
      else if (last_date >= new_trnsation_date && feeAmount == paidAmount)
        status = 'paid';
      else if (paidAmount > 0) status = 'partial paid';
      else status = 'unpaid';
    } else {
      if (paidAmount > 0) status = 'partial paid';
      else status = 'unpaid';
    }
    if (last_trnsation_date > last_date) {
      if (totalPaidAmount >= feeAmount + late_fee)
        throw new Error('Already Paid in Late');
      else if (totalPaidAmount < feeAmount + late_fee) {
        if (collected_amount + totalPaidAmount > feeAmount + late_fee)
          throw new Error(
            `Only pay ${feeAmount + late_fee - totalPaidAmount} !`
          );
        else {
          // console.log({ data, account, status, voucher, refresh_token });
          const tr = await handleTransaction({
            data,
            account,
            status,
            voucher,
            refresh_token,
            sent_sms
          });
          console.log({ tr });
          res.status(200).json({
            success: true,
            // @ts-ignore
            ...tr
          });
        }
      }
    } else {
      if (totalPaidAmount === feeAmount) throw new Error('Already Paid !');
      else if (totalPaidAmount + collected_amount > feeAmount)
        throw new Error(
          `you paid ${totalPaidAmount},now pay ${
            feeAmount - totalPaidAmount
          } amount !`
        );
      else {
        const tr = await handleTransaction({
          data,
          account,
          status,
          voucher,
          refresh_token,
          sent_sms
        });
        res.status(200).json({
          success: true,
          // @ts-ignore
          ...tr
        });
        console.log({ ssssssssssss: tr });
      }
    }
  } catch (err) {
    logFile.error(err.message);
    res.status(404).json({ error: err.message });
  }
};
