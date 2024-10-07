import { Authenticated } from '@/components/Authenticated';
import Footer from '@/components/Footer';
import PageHeader from '@/content/FrontEnd/Notice/PageHeader';
import Results from '@/content/FrontEnd/Notice/Results';
import { useClientFetch } from '@/hooks/useClientFetch';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Grid } from '@mui/material';
import Head from 'next/head';
import PageBodyWrapper from '@/components/PageBodyWrapper';
import { useState } from 'react';
import PageTitleWrapper from '@/components/PageTitleWrapper';

const Notice = () => {
  const [editData, setEditData] = useState();
  const { data: notices, reFetchData } = useClientFetch('/api/notices');

  return (
    <>
      <Head>
        <title>Notice</title>
      </Head>
      <PageBodyWrapper>
        <Grid
          // sx={{ display: 'flex', marginX: 'auto' }}
          // justifyContent="center"
          gap={2}
          px={1}
        >
          <PageTitleWrapper>
            <PageHeader editData={editData} setEditData={setEditData} reFetchData={reFetchData} />
          </PageTitleWrapper>

          <Results sessions={notices?.data || []} setEditData={setEditData} reFetchData={reFetchData} />
        </Grid>
        <Footer />
      </PageBodyWrapper>
    </>
  );
};

Notice.getLayout = (page) => (
  <Authenticated name="notice">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Notice;
