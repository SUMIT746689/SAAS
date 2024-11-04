import { Authenticated } from '@/components/Authenticated';
import Footer from '@/components/Footer';
import { useClientFetch } from '@/hooks/useClientFetch';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Grid } from '@mui/material';
import Head from 'next/head';
import PageBodyWrapper from '@/components/PageBodyWrapper';
import { useState } from 'react';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageHeader from 'WebsiteDynamicPage/PageHeader';
import Results from 'WebsiteDynamicPage/Results';

const EmailTemplates = () => {
  const [editData, setEditData] = useState();
  const { data: emailTemplates, reFetchData } = useClientFetch('/api/front_end/website_dynamic_pages');

  return (
    <>
      <Head>
        <title>Website Dynamic Pages</title>
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

          <Results sessions={emailTemplates?.data || []} setEditData={setEditData} reFetchData={reFetchData} />
        </Grid>
        <Footer />
      </PageBodyWrapper>
    </>
  );
};

EmailTemplates.getLayout = (page) => (
  <Authenticated name="certificate_template">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default EmailTemplates;
