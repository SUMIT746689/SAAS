import Head from 'next/head';

import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';

import PageHeader from 'src/content/Management/Routine/PageHeader';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Grid } from '@mui/material';

import ExampRoutine from '@/content/Management/Routine/ExamRoutine';
import { serverSideAuthentication } from '@/utils/serverSideAuthentication';
import prisma from '@/lib/prisma_client';
import SingleStudentExamRoutine from '@/content/Management/Routine/SingleStudentExamRoutine';

export async function getServerSideProps(context: any) {
  let student: any = null;
  let data: any = null;
  try {
    const refresh_token_varify: any = serverSideAuthentication(context)
    if (!refresh_token_varify) return { props: { student } };

    if (refresh_token_varify.role.title === 'STUDENT') {

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

      data = {
        ...student.student_info,
        section_id: student.section.id,
        name: [student.student_info.first_name, student.student_info.middle_name, student.student_info.last_name].join(' '),
        class: student.section.class.name,
        section: student.section.class.has_section ? student.section.name : 'No section',
        class_registration_no: student.class_registration_no,
        class_roll_no: student.class_roll_no,
        student_id: student.id
      };
    }
  }
  catch (error) {
    console.log({ error })
  }
  const parse = JSON.parse(JSON.stringify({ data }));
  return { props: parse }
}

function ExamRoutine({ data }) {

  // const { user }: any = useAuth();

  return (
    <>
      <Head>
        <title>Routine</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader title={'Exam routine'} />
      </PageTitleWrapper>

      <Grid
        sx={{ px: 4, minHeight: 'calc(100vh - 304px) !important' }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}

      >
        <Grid item xs={12}>
          {
            data ?
              <SingleStudentExamRoutine data={data} />
              :
              <ExampRoutine />
          }

        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

ExamRoutine.getLayout = (page) => (
  <Authenticated name="exam_routine">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ExamRoutine;
