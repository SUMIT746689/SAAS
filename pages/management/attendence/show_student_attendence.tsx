import Head from 'next/head';

import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';

import PageHeader from 'src/content/Management/Routine/PageHeader';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Grid } from '@mui/material';

import ShowStudentAttendence from '@/content/Management/Attendence/ShowStudentAttendenceResult';
import { getStudentInfo } from '@/utils/serverSidePropsFunctions';
import ShowSelectStudentAttendenceResult from '@/content/Management/Attendence/ShowSelectStudentAttendenceResult';

export async function getServerSideProps(context: any) {
  return await getStudentInfo(context);
}

function ExamRoutine({ data }) {
  console.log({ data });
  // const { user }: any = useAuth();

  return (
    <>
      <Head>
        <title>Attendence</title>
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
          {data ? <ShowStudentAttendence data={data} /> : <ShowSelectStudentAttendenceResult />}
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

ExamRoutine.getLayout = (page) => (
  <Authenticated name="show_student_exam_attendence">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ExamRoutine;
