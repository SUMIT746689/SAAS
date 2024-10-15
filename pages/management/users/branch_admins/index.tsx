import { useState } from 'react';
import Head from 'next/head';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeaderForAdmin from 'src/content/Management/Users/BranchAdmins/PageHeader';
import Footer from 'src/components/Footer';
import { Grid } from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Results from 'src/content/Management/Users/BranchAdmins/Results';
import { useClientFetch } from '@/hooks/useClientFetch';
import { useAuth } from '@/hooks/useAuth';

function ManagementUsers() {
  const { data: allUsers, reFetchData } = useClientFetch('/api/user/branch_admins');
  // const { data: roles } = useClientFetch('/api/role/school_other_role?selected_title=BRANCH_ADMIN');
  const [editUser, setEditUser] = useState(null);
  const auth = useAuth();

  return (
    <>
      <Head>
        <title>Branch Admin - Management</title>
      </Head>
      <PageTitleWrapper>
        <PageHeaderForAdmin
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
            roleOptions={
              // roles?.map((i) => i.title) || 
              []}
            reFetchData={reFetchData}
            setEditUser={setEditUser}
          />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

ManagementUsers.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_branch_admin']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ManagementUsers;
