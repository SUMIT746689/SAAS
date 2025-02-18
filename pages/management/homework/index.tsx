import Head from 'next/head';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from 'src/content/Management/HomeWork/PageHeader';
import Footer from 'src/components/Footer';
import { Grid } from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Results from 'src/content/Management/HomeWork/Results';
import { useContext, useEffect, useState } from 'react';
import { serverSideAuthentication } from '@/utils/serverSideAuthentication';
import prisma from '@/lib/prisma_client';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import axios from 'axios';
import { HomeworkContext } from '@/contexts/HomeWorkContext';

export async function getServerSideProps(context: any) {
  let data: any = null;
  let userInfo: any = null;
  let user_role: any = null;
  try {
    const refresh_token_varify: any = serverSideAuthentication(context);
    user_role = refresh_token_varify?.role?.title;

    if (!refresh_token_varify) return { props: { data } };

    if (refresh_token_varify.role.title === 'TEACHER') {
      userInfo = {
        user_role: refresh_token_varify.role.title,
        school_id: refresh_token_varify.school_id
      };

      const parse = JSON.parse(JSON.stringify({ userInfo, data }));
      return { props: parse };
    }

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
  // if (data) {
  //   data['user_role'] = user_role;
  // }

  const parse = JSON.parse(JSON.stringify({ data, userInfo }));
  return { props: parse };
}

function ManagementLeave({ data, userInfo }) {
  const [leave, setLeave] = useState([]);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [classes, setClasses] = useState([]);
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const reFetchData = () => {
    if (data) {
      // if (academicYear?.id) {
      axios
        // .get(`/api/homework?class_id=${data?.class_id}&student_id=${data?.id}`)
        .get(`/api/homework?class_id=${data?.class_id}&section_id=${data?.section_id}`)
        .then((res) => setLeave(res.data))
        .catch((err) => console.log(err));
      // }
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
        <PageHeader
          data={data}
          classes={classes}
          classList={classList}
          setLeave={setLeave}
          reFetchData={reFetchData}
          userInfo={userInfo}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}  
          selectedSection={selectedSection} 
          setSelectedSection={setSelectedSection}
          selectedSubject={selectedSubject} 
          setSelectedSubject={setSelectedSubject}
      
        />
      </PageTitleWrapper>

      <Grid sx={{ px: 4 }} container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
        <Grid item xs={12}>
          <Results userInfo={userInfo} users={leave} setUsers={setLeave} reFetchData={reFetchData} />
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
