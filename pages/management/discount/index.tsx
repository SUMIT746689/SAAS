import { useContext, useState } from 'react';
import Head from 'next/head';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from 'src/content/Management/Discount/PageHeader';
import Footer from 'src/components/Footer';
import { Grid } from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Results from 'src/content/Management/Discount/Results';
import { useClientFetch } from '@/hooks/useClientFetch';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';

function ManagementClasses() {
  const [editDiscount, setEditDiscount] = useState(null);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const { data: classes } = useClientFetch(`/api/class`);
  const { data: discount, reFetchData } = useClientFetch(`/api/discount?academic_year_id=${academicYear?.id}`);
  // const { data: fees } = useClientFetch(`/api/fee?academic_year_id=${academicYear?.id}`);

  console.log({ classes });

  return (
    <>
      <Head>
        <title>Discount - Management</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader
          editDiscount={editDiscount}
          setEditDiscount={setEditDiscount}
          reFetchData={reFetchData}
          classes={
            classes?.map(i => ({
              label: i?.name,
              value: i.id,
              sections:i.sections.map(sec=>({
                label: sec.name,
                value:sec.id
              }))
            })) || []
          }
        // fees={fees?.data?.map(i => ({
        //   label: `${i?.title} (${i?.class?.name})`,
        //   value: i.id
        // })) || []}
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
          <Results setEditDiscount={setEditDiscount} discount={discount || []} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

ManagementClasses.getLayout = (page) => (
  <Authenticated name="discount">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ManagementClasses;
