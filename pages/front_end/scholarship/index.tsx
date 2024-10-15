import { Authenticated } from '@/components/Authenticated';
import Footer from '@/components/Footer';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageHeader from 'src/content/Management/Attendence/PageHeader';
import { useClientFetch } from '@/hooks/useClientFetch';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Grid } from '@mui/material';
import Head from 'next/head';
import { Data } from '@/models/front_end';
import Results from './Results';

const Packages = () => {
  const { data, reFetchData }: { data: Data; reFetchData: Function } = useClientFetch('/api/front_end/scholarship');

  console.log({ data });
  return (
    <>
      <Head>
        <title>Scholarship - Management</title>
      </Head>

      <PageTitleWrapper>
        <PageHeader title={'Scholarship - Management'} />
      </PageTitleWrapper>

      <Grid sx={{ px: { xs: 1, sm: 2, md: 3 } }} container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
        <Grid item>
          <Results data={data} reFetchData={reFetchData} />
        </Grid>
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
