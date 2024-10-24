import { useState } from 'react';
import Head from 'next/head';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from 'src/content/Management/TeacherShift/PageHeader';
import Footer from 'src/components/Footer';
import { Grid } from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Results from 'src/content/Management/TeacherShift/Results';
import { useClientFetch } from '@/hooks/useClientFetch';

function ManagementGroups() {
  const [editGroup, setEditGroup] = useState(null);

  const { data: groups, reFetchData } = useClientFetch(`/api/teacher_shifts`);

  return (
    <>
      <Head>
        <title>Teacher Shift - Management</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader
          editGroup={editGroup}
          seteditGroup={setEditGroup}
          reFetchData={reFetchData}
        />
      </PageTitleWrapper>

      <Grid
        sx={{ px: 4 }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}
      >
        <Grid item xs={12}>
          <Results setEditSection={setEditGroup} users={groups || []} reFetchData={reFetchData} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

ManagementGroups.getLayout = (page) => (
  <Authenticated name="section">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ManagementGroups;
