import { useEffect, useState } from 'react';
import Head from 'next/head';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from 'src/content/Management/Users/PageHeader';
import Footer from 'src/components/Footer';
import { Grid } from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Results from 'src/content/Management/Users/Results';
import { useClientFetch } from '@/hooks/useClientFetch';

function ManagementUsers() {
  const { data: allUsers, reFetchData } = useClientFetch('/api/user')
  const { data: roles } = useClientFetch('/api/role/school_other_role')
  const [editUser, setEditUser] = useState(null);
  console.log({ roles });

  return (
    <>
      <Head>
        <title>Users - Management</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader
          editUser={editUser}
          setEditUser={setEditUser}
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
            users={allUsers || []}
            roleOptions={roles?.map(i => i.title) || []}
            reFetchData={reFetchData} setEditUser={setEditUser} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

ManagementUsers.getLayout = (page) => (
  <Authenticated name="user">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ManagementUsers;
