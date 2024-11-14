import Head from 'next/head';
import { useState, useEffect, useContext } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from 'src/content/Management/Fees/PageHeader';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';

import { Grid } from '@mui/material';
import type { Project } from 'src/models/project';
import Results from 'src/content/Management/Fees/Results';
import { useClientFetch } from 'src/hooks/useClientFetch';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
function ManagementFees() {
  // const isMountedRef = useRefMounted();
  const [datas, setDatas] = useState<Project[]>([]);
  const [editData, setEditData] = useState<Project>(null);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const { data, error, reFetchData } = useClientFetch(`/api/fee?academic_year_id=${academicYear?.id}`);

  const { data: classDatas, error: classError } = useClientFetch('/api/class');

  const { data: feesHeads } = useClientFetch('/api/fees_heads');
  // const { data: subjectData, error: subjectError } = useClientFetch('/api/subject');


  useEffect(() => {
    if (data?.success) setDatas(data.data);
  }, [data, error]);
  console.log({ classDatas })
  return (
    <>
      <Head>
        <title>Fees - Management</title>
      </Head>
      <PageTitleWrapper>
        {/* @ts-ignore */}

        <PageHeader
          name="Fees"
          classData={
            classDatas?.map((i) => ({
              label: i.name,
              value: i.id,
              sections: i.sections?.map(section => ({ label: section.name, value: section.id })),
              subjects: i.subjects?.map(subject => ({ label: subject.name, value: subject.id }))
            })) || []
          }
          subjectData={
            // subjectDatas?.map((i) => ({
            //   label: i.name,
            //   value: i.id
            // })) || 
            []
          }
          feesHeads={feesHeads?.map((feesH) => ({ label: feesH.title, value: feesH.id, frequency: feesH.frequency })) || []}
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
      // spacing={3}
      >
        <Grid item xs={12}>
          <Results sessions={datas} setEditData={setEditData} reFetchData={reFetchData} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

ManagementFees.getLayout = (page) => (
  <Authenticated name="fee">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ManagementFees;
