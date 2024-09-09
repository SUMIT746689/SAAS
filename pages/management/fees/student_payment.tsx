import Head from 'next/head';

import { useState, useEffect, useCallback, useRef } from 'react';

import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';

import Footer from 'src/components/Footer';

import { Button, Card, Grid } from '@mui/material';
import type { Project } from 'src/models/project';
import StudentPayment from 'src/content/Management/Fees/StudentPayment';
// import { useClientFetch } from 'src/hooks/useClientFetch';
// import PaymentInvoice from '@/content/Management/StudentFeesCollection/PaymentInvoice';
import { useReactToPrint } from 'react-to-print';
import prisma from '@/lib/prisma_client';
import { serverSideAuthentication } from '@/utils/serverSideAuthentication';
import dayjs from 'dayjs';
// import { ButtonWrapper } from '@/components/ButtonWrapper';

export async function getServerSideProps(context: any) {
  let student: any = null;
  let data: any = null;
  try {
    const refresh_token_varify: any = serverSideAuthentication(context)
    if (!refresh_token_varify) return { props: { student } };


    student = await prisma.student.findFirst({
      where: {
        student_info: {
          user_id: Number(refresh_token_varify.id),
          school_id: refresh_token_varify.school_id
        }
      },
      select: {
        id: true,
        student_photo: true,
        batches: true,
        // section_id: true,
        class_registration_no: true,
        student_present_address: true,
        discount: true,
        student_info: {
          select: {
            first_name: true,
            middle_name: true,
            last_name: true,
            school: {
              select: {
                name: true
              }
            }
          }
        },
        academic_year: true,
        class: {
          select: {
            id: true,
            name: true,
            has_section: true,
            fees: true
          }
        },
        // section: {
        //   select: {
        //     id: true,
        //     name: true,
        //     class: {
        //       select: {
        //         id: true,
        //         name: true,
        //         has_section: true,
        //         fees: true,
        //       }
        //     }
        //   }

        // },
        guardian_phone: true,
        class_roll_no: true
      }
    });

    // fees getting
    const student_fee = await prisma.studentFee.findMany({
      where: { student_id: student.id },
      include: {
        fee: true
      }
    });

    const fees = student.section.class.fees.map((fee) => {
      const findStudentFee: any = student_fee.filter(pay_fee => pay_fee.fee.id === fee.id);

      const findStudentFeeSize = findStudentFee.length
      if (findStudentFeeSize) {
        const paidAmount = findStudentFee.reduce((a, c) => a + c.collected_amount, 0)
        // console.log("paidAmount__", paidAmount);
        const last_date = dayjs(fee.last_date).valueOf()
        const last_trnsation_date = dayjs(findStudentFee[findStudentFeeSize - 1].created_at).valueOf()
        const late_fee = fee.late_fee ? fee.late_fee : 0;


        if (last_trnsation_date > last_date && fee.amount == paidAmount) {
          return ({ ...fee, last_payment_date: findStudentFee[findStudentFeeSize - 1].created_at, status: 'Fine unpaid', paidAmount })
        }
        else if (last_trnsation_date > last_date && paidAmount >= fee.amount + late_fee) {
          return ({ ...fee, last_payment_date: findStudentFee[findStudentFeeSize - 1].created_at, status: 'paid late', paidAmount })
        }

        else if (last_date >= last_trnsation_date && fee.amount == paidAmount) {
          return ({ ...fee, last_payment_date: findStudentFee[findStudentFeeSize - 1].created_at, status: 'paid' })
        }
        else {
          return ({
            ...fee,
            last_payment_date: findStudentFee[findStudentFeeSize - 1].created_at,
            paidAmount: paidAmount,
            status: 'partial paid'
          })
        }

      }
      else return ({ ...fee, status: 'unpaid' })
    })

    data = {
      student_id: student.id,
      ...student.student_info,
      name: [student.student_info.first_name, student.student_info.middle_name, student.student_info.last_name].join(' '),
      class: student.section.class.name,
      section: student.section.class.has_section ? student.section.name : '',
      class_registration_no: student.class_registration_no,
      class_roll_no: student.class_roll_no,
      discount: student.discount,
      fees
    };

  }
  catch (error) {
    console.log({ error })
  }
  const parse = JSON.parse(JSON.stringify({ student, data }));
  return { props: parse }
}


function ManagementStudentPayment({ data }) {
  // const isMountedRef = useRefMounted();
  const [datas, setDatas] = useState<Project[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [students, setStudents] = useState<[object?]>([]);
  const [printFees, setPrintFees] = useState<[object?]>([]);
  const [filteredFees, setFilteredFees] = useState<any>([]);

  // const { data, error } = useClientFetch('/api/student_payment_collect');

  useEffect(() => {
    if (data) {
      setDatas({
        ...data,
        fees: data?.fees?.map((fee, index) => {

          const last_payment_date = fee?.status !== 'unpaid' ? fee?.last_payment_date : ''
          const last_date = new Date(fee.last_date)
          const today = new Date()
          const status_color = { p: 0.5 };
          let due, total_payable_amt, payableAmount = 0;

          if (fee?.status == 'paid' || fee?.status === 'paid late') {
            due = 0
            total_payable_amt = ""
          }
          else {
            const late_fee = fee.late_fee ? fee.late_fee : 0
            if (late_fee && today > last_date) {
              payableAmount = (Number(fee?.amount) + Number(fee?.late_fee))
              total_payable_amt = `${Number(fee?.amount).toFixed(1)} + ${Number(fee?.late_fee).toFixed(1)} = ${payableAmount.toFixed(2)}`;
            }
            else {
              total_payable_amt = ""
            }

            due = (fee?.amount + late_fee - (fee.paidAmount ? fee.paidAmount : ((fee?.status == 'unpaid') ? 0 : fee?.amount)))

            console.log(fee.title, "due__", due, today < last_date);

            if (today < last_date) {
              due -= late_fee
            }
          }


          if (fee?.status === 'paid' || fee?.status === 'paid late') {
            status_color['color'] = 'green'
          }
          else if (fee?.status === 'partial paid') {
            status_color['color'] = 'blue'
          }
          else {
            status_color['color'] = 'red'
          }


          fee['last_payment_date'] = last_payment_date
          fee['due'] = due
          fee['total_payable_amt'] = total_payable_amt
          fee['payableAmount'] = payableAmount
          fee['status_color'] = status_color
          fee['sl'] = index + 1
          return fee
        })
      }

      )
    }
  }, [data])

  const printPageRef = useRef();
  const printAllPageARef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printPageRef.current
  });
  const handlePrintAll = useReactToPrint({
    content: () => printAllPageARef.current
  });
  return (
    <>
      <Head>
        <title>Student Fee Payment - Management</title>
      </Head>

      <Grid
        sx={{ px: 4, mt: 1 }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={1}
      >
        <Grid item xs={12}>
          <StudentPayment
            sessions={datas}
            setSessions={setDatas}
            // students={students}
            // setStudents={setStudents}
            // selectedStudent={selectedStudent}
            // setSelectedStudent={setSelectedStudent}
            setPrintFees={setPrintFees}
            filteredFees={filteredFees}
            setFilteredFees={setFilteredFees}
          />
        </Grid>
      </Grid>
      {/* <Grid px={4} mt={1}>
        <Card sx={{ pt: 1, px: 1, display: 'grid', justifyContent: 'center', columnGap: 1, gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" } }}>
          <ButtonWrapper
            handleClick={() => setPrintFees([])}
            variant="contained"
            color="warning"
          >
            {'Reset'}
          </ButtonWrapper>

          <ButtonWrapper
            sx={{
              ':disabled': {
                backgroundColor: 'silver'
              }
            }}
            disabled={printFees.length === 0}
            handleClick={handlePrint}
            variant="contained"
          >
            {'Collect Invoice Print'}
          </ButtonWrapper>

          <ButtonWrapper
            sx={{
              ':disabled': {
                backgroundColor: 'silver'
              }
            }}
            disabled={filteredFees.length === 0}
            handleClick={handlePrintAll}
            variant="contained"
          >
            {'Print All'}
          </ButtonWrapper>
        </Card>
      </Grid>
      <Grid sx={{ display: 'none' }}>
        <Grid ref={printPageRef}>
          <PaymentInvoice printFees={printFees} student={selectedStudent} />
          <PaymentInvoice printFees={printFees} student={selectedStudent} />
        </Grid>
        <Grid ref={printAllPageARef}>
          <PaymentInvoice printFees={filteredFees} student={selectedStudent} />
          <PaymentInvoice printFees={filteredFees} student={selectedStudent} />
        </Grid>
      </Grid> */}
      <Footer />
    </>
  );
}

ManagementStudentPayment.getLayout = (page) => (
  <Authenticated name='student_fee_payment'>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ManagementStudentPayment;
