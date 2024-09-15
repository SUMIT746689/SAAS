import { Authenticated } from '@/components/Authenticated';
import Footer from '@/components/Footer';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Grid } from '@mui/material';
import Head from 'next/head';
import PageBodyWrapper from '@/components/PageBodyWrapper';
import { serverSideAuthentication } from '@/utils/serverSideAuthentication';
import prisma from '@/lib/prisma_client';
import PageHeader from '@/content/Management/ShowNote/PageHeader';
import Results from '@/content/Management/ShowNote/Results';
import { useState } from 'react';

export async function getServerSideProps(context: any) {
  // const props: { periods: any } = { periods: [] };
  const props: { classes: any } = { classes: [] };
  try {
    const refresh_token_varify: any = serverSideAuthentication(context);
    const { school_id } = refresh_token_varify;

    if (!refresh_token_varify || refresh_token_varify?.role?.title !== 'ADMIN') return { props };
    const classes = await prisma.class.findMany({ where: { school_id }, include: { sections: true } });
    props['classes'] = JSON.parse(JSON.stringify(classes));
    // const periods = await prisma.period.findMany({ where: { teacher: { user_id: refresh_token_varify.id, } }, include: { section: { include: { class: true } }, subject: true, room: true } })
    // console.log({ periods });
    // props["periods"] = JSON.parse(JSON.stringify(periods))
  } catch (error) {
    console.log({ error });
  }
  return { props };
}

const ShowNotes = ({ classes }) => {
  const [notes, setNotes] = useState([]);

  return (
    <>
      <Head>
        <title>Show Notes</title>
      </Head>
      <PageBodyWrapper>
        <Grid px={{ xs: 1, sm: 3 }}>
          {/* <PageHeader periods={periods} /> */}
          <Results classes={classes} notes={notes} setNotes={setNotes} />
        </Grid>
        <Footer />
      </PageBodyWrapper>
    </>
  );
};

ShowNotes.getLayout = (page) => (
  <Authenticated name="teacher_certificate">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ShowNotes;
