import Head from 'next/head';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from '@/content/Management/HomeWork old/PageHeader';
import Footer from 'src/components/Footer';
import { Grid } from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Results from '@/content/Management/HomeWork old/Results';
import { useContext, useEffect, useState } from 'react';
import { serverSideAuthentication } from '@/utils/serverSideAuthentication';
import prisma from '@/lib/prisma_client';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import axios from 'axios';

export async function getServerSideProps(context: any) {
  let data: any = null;
  try {
    const refresh_token_varify: any = serverSideAuthentication(context);
    if (!refresh_token_varify) return { props: { data } };

    if (refresh_token_varify.role.title === 'STUDENT') {
      data = await prisma.student.findFirst({
        where: {
          student_info: {
            user_id: Number(refresh_token_varify.id),
            school_id: refresh_token_varify.school_id
          }
        },
        select: {
          id: true,
          student_photo: true,
          // section_id: true,
          class_id: true,
          class: {
            select: {
              id: true,
              name: true,
              has_section: true,
              subjects: true
            }
          },
          academic_year: true,
          batches: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    }
  } catch (error) {
    console.log({ error });
  }
  const parse = JSON.parse(JSON.stringify({ data }));
  return { props: parse };
}
function ManagementLeave({ data }) {
  const [leave, setLeave] = useState([]);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [classes, setClasses] = useState([]);
  const [classList, setClassList] = useState([]);

  const reFetchData = () => {
    if (data) {
      if (academicYear?.id) {
        axios
          .get(`/api/homework?academic_year_id=${academicYear?.id}&class_id=${data?.class_id}&student_id=${data?.id}`)
          .then((res) => setLeave(res.data))
          .catch((err) => console.log(err));
      }
    } else {
      axios
        .get(`/api/class`)
        .then((res) => {
          setClasses(res.data);
          setClassList(
            res.data?.map((i) => ({
              label: i.name,
              id: i.id,
              has_section: i.has_section
            }))
          );
        })
        .catch((err) => console.log(err));
    }
  };
  useEffect(() => {
    reFetchData();
  }, [data, academicYear]);

  console.log({ data });
  return (
    <>
      <Head>
        <title>Homework - Management</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader data={data} classes={classes} classList={classList} setLeave={setLeave} reFetchData={reFetchData} />
      </PageTitleWrapper>

      <Grid sx={{ px: 4 }} container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
        <Grid item xs={12}>
          <Results users={leave} reFetchData={reFetchData} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

ManagementLeave.getLayout = (page) => (
  <Authenticated name="homework">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ManagementLeave;
