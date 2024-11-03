import Head from 'next/head';
import { useState } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from 'src/content/Management/EntryOtherUsers/PageHeader';
import Results from 'src/content/Management/EntryOtherUsers/Results';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid } from '@mui/material';
import type { Project } from 'src/models/project';
import { useClientFetch } from 'src/hooks/useClientFetch';

function Managementschools() {
  const [editSchool, setEditSchool] = useState<Project>(null);

  const {
    data: teachers,
    setData: setTeachers,
    reFetchData,
    error
  } = useClientFetch('/api/other_users');
  return (
    <>
      <Head>
        <title>Staffs - Management</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader
          editSchool={editSchool}
          setEditSchool={setEditSchool}
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
          <Results
            schools={teachers || []}
            setTeachers={setTeachers}
            editSchool={editSchool}
            setEditSchool={setEditSchool}
            reFetchData={reFetchData}
          />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

Managementschools.getLayout = (page) => (
  <Authenticated
    requiredPermissions={[
      'create_staff',
      'create_accountant',
      'create_librarian',
      'create_receptionist'
    ]}
  >
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Managementschools;
