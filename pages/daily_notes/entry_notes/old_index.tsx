import { Authenticated } from '@/components/Authenticated';
import Footer from '@/components/Footer';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Grid } from '@mui/material';
import Head from 'next/head';
import PageBodyWrapper from '@/components/PageBodyWrapper';
import { serverSideAuthentication } from '@/utils/serverSideAuthentication';
import prisma from '@/lib/prisma_client';
import PageHeader from '@/content/Management/EntryNote/PageHeader';
import { getToday } from '@/utils/getDay';

type Day = ['Sunday' | 'Monday', 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'];

export async function getServerSideProps(context: any) {
  const props: { periods: any } = { periods: [] };
  try {
    const refresh_token_varify: any = serverSideAuthentication(context);
    const { query } = context;

    // console.log({ refresh_token_varify })
    // commented code
    // if (!refresh_token_varify || refresh_token_varify?.role?.title !== 'TEACHER') return { props };

    const day: any = getToday();
    const data = {};
    let dailyNotes = [];
    let periods;
    if (query?.date) {
      let start_date_ = new Date(new Date(query?.date).setHours(0, 0, 0, 0));
      data['note_date'] = start_date_;
    }

    if (query?.date) {
      dailyNotes = await prisma.dailyNote.findMany({
        where: {
          ...data,
          period: {
            day: query?.day_name ? query?.day_name : day
            // commented code
            // teacher: { user_id: refresh_token_varify.id, deleted_at: null }
          }
        },
        include: {
          period: {
            include: { section: { include: { class: true } }, subject: true, room: true }
          }
        }
      });
      periods = dailyNotes.map((note) => note.period);
    } else {
      periods = await prisma.period.findMany({
        where: {
          day: query?.day_name ? query?.day_name : day
          // commented code
          // teacher: { user_id: refresh_token_varify.id, deleted_at: null }
        },
        include: { section: { include: { class: true } }, subject: true, room: true }
      });
    }

    // const periods = await prisma.period.findMany({
    //   where: {
    //     day: query?.day_name ? query?.day_name : day
    //     // commented code
    //     // teacher: { user_id: refresh_token_varify.id, deleted_at: null }
    //   },
    //   include: { section: { include: { class: true } }, subject: true, room: true }
    // });

    props['periods'] = JSON.parse(JSON.stringify(periods));
    // const classes = await prisma.$queryRaw`
    // WITH
    //   teacher AS
    //     (SELECT id AS teacher_id FROM teachers WHERE user_id = ${refresh_token_varify.id}),
    //   classes AS
    //     (SELECT classes.id, classes.name, has_section, dense_rank() OVER ( PARTITION by classes.id ORDER by sections.id ASC ) AS ranking
    //       FROM classes
    //       JOIN teacher
    //       JOIN sections ON sections.class_id = classes.id
    //       WHERE sections.class_teacher_id = teacher.teacher_id
    //     )
    // SELECT id, name, has_section
    // FROM classes
    // WHERE ranking = 1
    // `;

    // const classes = await prisma.class.findMany({ where: { class_teacher: { user_id: refresh_token_varify.id } }, select: { class: { select: { id: true, name: true } } } });
    // const classes = await prisma.class.findMany({ where: { school_id: refresh_token_varify.school_id }, select: { id: true, name: true, has_section: true, sections: { where: { class_teacher: { user_id: refresh_token_varify.id } }, select: { id: true, name: true } } } });
    // const classes = await prisma.class.findMany({ where: { school_id: refresh_token_varify.school_id }, select: { id: true, name: true, has_section: true, sections: { select: { id: true, name: true } } } });

    // props["classes"] = classes?.filter(cls => cls.sections.length > 0);
  } catch (error) {
    console.log({ error });
  }
  return { props };
}

const Packages = ({ periods }) => {
  return (
    <>
      <Head>
        <title>Daily Notes</title>
      </Head>
      <PageBodyWrapper>
        <Grid
          // minHeight={500}
          sx={{ mt: { xs: 1, ms: 0 }, mx: 1 }}
        >
          <PageHeader periods={periods} />
          {/* <Results periods={periods} /> */}
        </Grid>

        <Footer />
      </PageBodyWrapper>
    </>
  );
};

Packages.getLayout = (page) => (
  <Authenticated name="teacher_certificate">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Packages;
