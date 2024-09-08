import prisma from "@/lib/prisma_client";
import { logFile } from "utilities_api/handleLogFile";

export const get = async (req, res) => {
  try {
    const { student_id }: any = req.query;

    console.log('sssss', Array.isArray(req.rawHeaders));
    console.log('sssss', req.rawHeaders.indexOf('origin'));

    const domain = req.rawHeaders[req.rawHeaders.indexOf('origin') + 1];
    const finalDomain = domain.replace(/(https:\/\/|http:\/\/)/, "");

    // console.log({ finalDomain });
    // console.log({ domain, body: req.query });

    if (!student_id) throw new Error('provide student id');

    const resStd = await prisma.student.findFirst({
      where:
      {
        // academic_year: { curr_active: true },
        student_info: { student_id }
      }, select: {
        id: true,
        class_roll_no: true,
        student_info: {
          select: {
            first_name: true, middle_name: true, last_name: true, student_id: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            has_section: true
          },
        },
        subjects: true,
        // section: {
        //   select:
        //   {
        //     name: true,
        //     class: {
        //       select: {
        //         id: true,
        //         name: true,
        //         has_section: true
        //       }
        //     }
        //   }
        // },
        discount: true
        // {
        //   select: {
        //     id: true
        //   }
        // }
      }
    });
    console.log("heoo..", JSON.stringify(resStd, null, 4))
    if (!resStd) throw new Error('student not founds...')

    const resFee = await prisma.fee.findMany({
      where: {
        school: { domain: finalDomain },
        class_id: resStd.class.id
      },
      include: {
        fees_head: { select: { title: true } },
        student_fees: {
          where: { student: { student_info: { student_id } } },
          include: {
            student: {
              select: {
                // section: {
                //   select: {
                //     class: {
                //       select: {
                //         name: true,
                //       }
                //     }
                //   }
                // },
                class_roll_no: true,
                student_info: {
                  select: {
                    first_name: true,
                    middle_name: true,
                    last_name: true,
                  }
                },
                discount: true
              }
            }
          },
          orderBy: { id: "desc" },
          // take: 1,
        }
      }
    });

    // console.log("heoo..", JSON.stringify(resFee, null, 4))

    const today = new Date(Date.now()).getTime();

    const customizeFees: any = [];
    const resStdIds = resStd.subjects.map(subject => subject.id);

    resFee.forEach(fee => {

      // console.log("fee subject",fee.subject_id && !resStdIds.includes(fee.subject_id));

      if (fee.subject_id && !resStdIds.includes(fee.subject_id)) return;
      const lastDate = new Date(fee.last_date).getTime();
      const subject_name = fee.subject_id ? resStd.subjects.find(subject => subject.id === fee.subject_id)?.name : undefined;

      // on time discount
      let on_time_discount = 0;

      if (Array.isArray(fee.student_fees) && fee.student_fees.length > 0) {
        on_time_discount = fee.student_fees.reduce((accumulator, currentValue) => accumulator + currentValue.on_time_discount, 0);
      }

      // discount 
      let findDiscount = null;
      let discount = 0;
      findDiscount = resStd.discount.find(disc => disc.fee_id === fee.id);
      // @ts-ignore
      if (findDiscount) discount = findDiscount.type === "flat" ? findDiscount.amt : (fee.amount * findDiscount.amt) / 100;

      const is_late = lastDate < today ? true : false;
      const total_collected_amt = (Array.isArray(fee.student_fees) && fee.student_fees.length > 0) ?
        fee.student_fees.reduce((accumulator, currentValue) => accumulator + currentValue.collected_amount, 0) : 0;
      const due = is_late ? (fee.amount + fee.late_fee) - (total_collected_amt + discount + on_time_discount) : fee.amount - (total_collected_amt + discount + on_time_discount);

      if (due <= 0) return;

      customizeFees.push({
        id: fee.id,
        fees_head: fee.fees_head.title,
        fees_month: fee.fees_month,
        subject_name,
        late_fee: fee.late_fee,
        last_date: fee.last_date,
        amount: fee.amount,
        is_late,
        total_collected_amt,
        total_discount: discount + on_time_discount,
        due,
      });
    })
    // console.log(customizeFees)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // replace this your actual origin
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    res.status(200).json({ data: { stdInfo: resStd, fees: customizeFees }, success: true });

  } catch (err) {
    console.log({ err })
    logFile.error(err.message)
    res.status(404).json({ error: err.message });
  }
};
