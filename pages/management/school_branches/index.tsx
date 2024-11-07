import Head from 'next/head';
import { useState } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from 'src/content/Management/SchoolBranches/PageHeader';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid } from '@mui/material';
import Results from 'src/content/Management/SchoolBranches/Results';
import { useClientFetch } from 'src/hooks/useClientFetch';
function Managementschools() {
  const [editSchool, setEditSchool] = useState(null);
  const { data: schools, reFetchData, error } = useClientFetch('/api/school/school_branches');
  const [openSubscriptionModal, setOpenopenSubscriptionModal] = useState(false);
  return (
    <>
      <Head>
        <title>School - Management</title>
      </Head>
      <Grid
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        sx={{
          height: 'calc(100vh - 80px)',
          overflowY: 'scroll'
        }}
      >
        <Grid>
          <PageTitleWrapper>
            <PageHeader editSchool={editSchool} setEditSchool={setEditSchool} reFetchData={reFetchData} />
          </PageTitleWrapper>

          {/* <Grid>
            <ManageSubcriptions
              open={openSubscriptionModal}
              setOpen={setOpenopenSubscriptionModal}
              reFetchData={reFetchData}
            />
          </Grid> */}

          <Grid sx={{ px: 4 }} container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
            <Grid item xs={12}>
              <Results
                reFetchData={reFetchData}
                schools={schools || []}
                editSchool={editSchool}
                setEditSchool={setEditSchool}
                setOpenopenSubscriptionModal={setOpenopenSubscriptionModal}
              />
            </Grid>
          </Grid>
        </Grid>
        <Footer />
      </Grid>
    </>
  );
}
Managementschools.getLayout = (page) => (
  <Authenticated name="user">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);
export default Managementschools;
