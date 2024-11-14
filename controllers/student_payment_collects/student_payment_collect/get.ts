import prisma from '@/lib/prisma_client';
import { monthList, monthListType } from '@/utils/getDay';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const get = async (req, res, refresh_token, academic_year) => {
  try {
    let on_time_discount_total_arr = [];
    const { id, section_id, selected_month, fromDate, toDate, subject_ids } = req.query;
    const { id: academic_year_id } = academic_year;

    if (!section_id) throw new Error('batch not founds');

    const parseSectionIds = section_id.split(',').map(section_id => {
      const parseIntSectionId = parseInt(section_id);
      if (Number.isNaN(parseIntSectionId)) throw new Error('provide invalid section id')
      return parseInt(section_id)
    });

    if (!id) throw new Error('provide student_id');

    const parseSubjectIds = subject_ids ?
      subject_ids?.split(',').map((subject_id) => {
        const parseSubId = parseInt(subject_id);
        if (typeof parseSubId !== 'number') throw new Error('provide invalid subject id');
        return parseSubId;
      })
      :
      [];
    const lowerCaseMonth = selected_month ? selected_month.toLocaleLowerCase() : undefined;
    if (lowerCaseMonth && !monthList.includes(lowerCaseMonth)) throw new Error('provide a valid month');

    // multiple month related code start
    const selectedIndex = monthList.indexOf(lowerCaseMonth);
    const monthsBeforeSelected: monthListType[] = monthList.slice(0, selectedIndex + 1);
    // monthsBeforeSelected.push(selected_month.toLocaleLowerCase());
    // multiple month related code end

    const dateFilter = {},
      query = {};
    if (fromDate) dateFilter['gte'] = new Date(new Date(fromDate).setUTCHours(0, 0, 0, 0));
    if (toDate) dateFilter['lte'] = new Date(new Date(toDate).setUTCHours(23, 59, 59, 999));

    if (fromDate || toDate) query['created_at'] = dateFilter;

    const student_fee = await prisma.studentFee.findMany({
      where: {
        student_id: Number(id),
        ...query
      },
      include: {
        fee: true,
        collected_by_user: {
          select: {
            username: true
          }
        }
      }
    });


    let whereObj = {}
    if (monthsBeforeSelected.length > 0) {
      whereObj['fees_month'] = { in: monthsBeforeSelected }
      whereObj['OR'] = [
        {
          fees_type: "class_based"
        },
        parseSubjectIds ? {
          fees_type: "subject_based",
          subject_id: { in: parseSubjectIds }
        }
          :
          {},
        Array.isArray(parseSectionIds) && parseSectionIds.length > 0 ?
          {
            fees_type: "batch_based",
            batch_id: { in: parseSectionIds }
          }
          :
          {}
      ]
    }


    const all_fees = await prisma.student.findFirst({
      where: { id: Number(id), batches: { some: { id: { in: parseSectionIds } } } },
      select: {
        id: true,
        class_registration_no: true,
        class_roll_no: true,
        discount: true,
        waiver_fees: true,
        student_photo: true,
        // section_id: true,
        student_info: {
          select: {
            // id: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            father_name: true,
            phone: true
          }
        },
        group: {
          select: {
            title: true
          }
        },
        class: {
          select: {
            name: true,
            fees: {
              where: {
                academic_year_id,
                ...whereObj
              },
              include: {
                fees_head: true,
                batch:{
                  select:{
                    id:true,
                    name:true,
                  }
                },
                subject: true
              },
              orderBy: { fees_month: 'asc' }
            }
          }
        },
        batches: {
          select: {
            id: true,
            name: true,
          }
        }
        // batches: {
        //   select: {
        //     name: true,
        //     class: {
        //       select: {
        //         name: true,
        //         fees: {
        //           where: {
        //             academic_year_id,
        //             // old
        //             // fees_month: { in: monthsBeforeSelected },
        //             // OR: [
        //             //   {
        //             //     fees_type: "class_based"
        //             //   },
        //             //   parseSubjectIds ? {
        //             //     fees_type: "subject_based",
        //             //     subject_id: { in: parseSubjectIds }
        //             //   }
        //             //     :
        //             //     {}
        //             // ]
        //             ...whereObj
        //           },
        //           include: {
        //             fees_head: true,
        //             subject: true
        //           },
        //           orderBy: { fees_month: 'asc' }
        //         }
        //       }
        //     }
        //   }
        // }
      }
    });

    const waiver_fee = all_fees?.waiver_fees?.length > 0 ? all_fees?.waiver_fees?.map((i) => i.id) : [];

    // const fees = all_fees.section.class.fees
    const fees = all_fees.class.fees
      ?.filter((i) => !waiver_fee.includes(i.id))
      ?.map((fee) => {
        const findStudentFee: any = student_fee.filter((pay_fee) => pay_fee.fee?.id === fee.id);

        // updated on_time_discount calculation code start
        //  const findStudentFeeWithoutLastOne: any = student_fee.filter((pay_fee) => pay_fee.fee?.id === fee.id);
        if (findStudentFee.length > 0) {
          let discount_sum = 0;
          let fee_id;

          for (let i = 0; i < findStudentFee.length; i++) {
            discount_sum += Number(findStudentFee[i].on_time_discount);
            fee_id = findStudentFee[i].fee_id;
          }
          on_time_discount_total_arr.push({
            fee_id: fee_id,
            on_time_discount: discount_sum
          });
        }

        // updated on_time_discount calculation code end

        const late_fee = fee.late_fee ? fee.late_fee : 0;
        // console.log("fee", fee);
        // console.log("findStudentFee__", findStudentFee);

        const findStudentFeeSize = findStudentFee.length;

        if (findStudentFeeSize) {
          // console.log("findStudentFee__",findStudentFee);

          const discount = all_fees?.discount?.filter((i) => i.fee_id == fee.id);
          // console.log("discount1__", discount);

          const totalDiscount = discount.reduce((a, c) => {
            if (c.type == 'percent') return a + (c.amt * fee.amount) / 100;
            else return a + c.amt;
          }, 0);
          const feeAmount = fee.amount - totalDiscount;
          // old
          //  fee['amount'] = feeAmount;
          fee['amount'] = fee.amount;
          const paidAmount = findStudentFee.reduce((a, c) => a + c.collected_amount, 0);

          const last_date = new Date(fee.last_date);
          const last_trnsation_date = new Date(findStudentFee[findStudentFeeSize - 1].created_at);

          if (last_trnsation_date > last_date && paidAmount >= feeAmount + late_fee) {
            return {
              ...fee,
              last_payment_date: findStudentFee[findStudentFeeSize - 1].collection_date,
              on_time_discount: findStudentFee[findStudentFeeSize - 1].on_time_discount,
              status: 'paid late',
              paidAmount,
              collected_by_user: findStudentFee[findStudentFeeSize - 1]?.collected_by_user?.username
            };
          } else if (last_trnsation_date > last_date && feeAmount == paidAmount && late_fee > 0) {
            return {
              ...fee,
              last_payment_date: findStudentFee[findStudentFeeSize - 1].collection_date,
              on_time_discount: findStudentFee[findStudentFeeSize - 1].on_time_discount,
              status: 'fine unpaid',
              paidAmount,
              collected_by_user: findStudentFee[findStudentFeeSize - 1]?.collected_by_user?.username
            };
          } else if (last_date >= last_trnsation_date && feeAmount == paidAmount) {
            return {
              ...fee,
              last_payment_date: findStudentFee[findStudentFeeSize - 1].collection_date,
              on_time_discount: findStudentFee[findStudentFeeSize - 1].on_time_discount,
              status: 'paid',
              collected_by_user: findStudentFee[findStudentFeeSize - 1]?.collected_by_user?.username
            };
          } else if (paidAmount > 0) {
            return {
              ...fee,
              last_payment_date: findStudentFee[findStudentFeeSize - 1].collection_date,
              on_time_discount: findStudentFee[findStudentFeeSize - 1].on_time_discount,
              paidAmount: paidAmount,
              status: 'partial paid',
              collected_by_user: findStudentFee[findStudentFeeSize - 1]?.collected_by_user?.username
            };
          } else {
            return { ...fee, status: 'unpaid', on_time_discoun: 0 };
          }
        } else {
          const discount = all_fees?.discount?.filter((i) => i.fee_id == fee.id);
          // console.log("discount1__", discount);

          const totalDiscount = discount.reduce((a, c) => {
            if (c.type == 'percent') return a + (c.amt * fee.amount) / 100;
            else return a + c.amt;
          }, 0);
          // old
          // const feeAmount = fee.amount - totalDiscount;
          // fee['amount'] = feeAmount;
          fee['amount'] = fee.amount;
          return { ...fee, status: 'unpaid', on_time_discount: 0 };
        }
      });

    // remove deleted fees

    let filterDeletedFees = fees?.filter((item) => {
      return item.deleted_at === null;
    });



    let newFees = filterDeletedFees?.map((item) => {
      return {
        ...item,
        on_time_discount: 0
      };
    });

    if (on_time_discount_total_arr.length > 0 && newFees.length > 0) {
      for (let i = 0; i < on_time_discount_total_arr.length; i++) {
        for (let j = 0; j < newFees.length; j++) {
          if (on_time_discount_total_arr[i].fee_id === newFees[j].id) {
            newFees[j].on_time_discount = on_time_discount_total_arr[i].on_time_discount;
          }
        }
      }
    }

    const data = {
      ...all_fees.student_info,
      id: all_fees.id,
      section_id: all_fees.batches[0].id,
      student_photo: all_fees.student_photo,
      class_name: all_fees.class.name,
      section_name: all_fees.batches[0]?.name,
      group_title: all_fees.group?.title || null,
      class_registration_no: all_fees.class_registration_no,
      class_roll_no: all_fees.class_roll_no,
      discount: all_fees.discount,
      fees: newFees,
      // fees: newFees.filter((item) => {
      //   return item.status !== 'paid' && item.status !== 'paid late';
      // })
    };

    res.status(200).json({ data, success: true });
  } catch (err) {
    console.log(err.message)
    logFile.error(err.message);
    res.status(404).json({ error: err.message });
  }
};

export default authenticate(academicYearVerify(get));