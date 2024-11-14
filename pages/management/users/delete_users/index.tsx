import { useState } from 'react';
import Head from 'next/head';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import Results from 'src/content/Management/Users/DeleteUsers/Results';
import PageHeader from 'src/content/Management/Users/DeleteUsers/PageHeader';
import PageHeaderForAdmin from 'src/content/Management/Users/DeleteUsers/PageHeaderForAdmin';
import Footer from 'src/components/Footer';
import { Grid } from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { useClientFetch } from '@/hooks/useClientFetch';
import { useAuth } from '@/hooks/useAuth';

function ManagementUsers() {
  const { data: allUsers, reFetchData } = useClientFetch('/api/user?show_deleted_at=true');
  const { data: roles } = useClientFetch('/api/role/school_other_role');
  const [editUser, setEditUser] = useState(null);
  const auth = useAuth();
  console.log({ user: auth?.user?.user_role?.title });
  return (
    <>
      <Head>
        <title>Delete Users - Management</title>
      </Head>
      <PageTitleWrapper>
        {auth?.user?.user_role?.title === 'ADMIN' ? (
          <PageHeaderForAdmin editUser={editUser} setEditUser={setEditUser} reFetchData={reFetchData} />
        ) : (
          <PageHeader editUser={editUser} setEditUser={setEditUser} reFetchData={reFetchData} />
        )}
      </PageTitleWrapper>

      <Grid sx={{ px: 4, minHeight: 'calc(100vh)' }} container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
        <Grid item xs={12}>
          <Results users={allUsers || []} roleOptions={roles?.map((i) => i.title) || []} reFetchData={reFetchData} setEditUser={setEditUser} />
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
