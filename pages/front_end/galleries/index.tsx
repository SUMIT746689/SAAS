import { Authenticated } from '@/components/Authenticated';
import Footer from '@/components/Footer';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import Gallery from '@/content/Management/Gallery/Result';
import { useClientFetch } from '@/hooks/useClientFetch';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Grid } from '@mui/material';
import Head from 'next/head';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';

const Packages = () => {
  const { data, reFetchData, error } = useClientFetch('/api/front_end/galleries');
  const { id, gallery } = data || {};

  return (
    <>
      <Head>
        <title>Website Gallery - Management</title>
      </Head>

      <PageTitleWrapper>
        <PageHeaderTitleWrapper
          name={'Website Gallery'}
          handleCreateClassOpen={false}
          actionButton={' '}
        />
      </PageTitleWrapper>

      <Grid
        display="grid"
        gridTemplateColumns="1fr"
        columnGap={1}
        mx={1}
        minHeight={'calc(100vh - 330px)'}
      >
        <Gallery refetchBanner={reFetchData} id={id} galleries={gallery || []} />
      </Grid>

      <Footer />
    </>
  );
};

Packages.getLayout = (page) => (
  <Authenticated name="teacher">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Packages;
