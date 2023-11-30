import Head from 'next/head';
import { useState, useEffect } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from 'src/content/Management/Holidays/PageHeader';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid } from '@mui/material';
import type { Project } from 'src/models/project';
import Results from 'src/content/Management/Holidays/Results';
import { useClientFetch } from 'src/hooks/useClientFetch';
import { useAuth } from '@/hooks/useAuth';

function Managementschools() {
  // const isMountedRef = useRefMounted();
  const [datas, setDatas] = useState<Project[]>([]);
  const [editData, setEditData] = useState<Project>(null);
  const auth = useAuth();
  const { data, reFetchData, error } = useClientFetch('/api/holidays');

  useEffect(() => {
    if (data?.success) setDatas(data.data);
  }, [data, error]);
  // @ts-ignore
  const create_holiday = auth?.user?.permissions?.find(i => i?.value == 'create_holiday')

  return (
    <>
      <Head>
        <title>Holidays - Management</title>
      </Head>
      <PageTitleWrapper>
        {/* @ts-ignore */}


        <PageHeader
          contentPermission={{
            create_holiday
          }}
          editData={editData}
          seteditData={setEditData}
          reFetchData={reFetchData}
        />


      </PageTitleWrapper>

      <Grid
        sx={{ px: 2 }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={1}
      >
        <Grid item xs={12}>
          <Results datas={datas} setEditData={setEditData} reFetchData={reFetchData}/>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

Managementschools.getLayout = (page) => (
  <Authenticated name="holiday">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Managementschools;
