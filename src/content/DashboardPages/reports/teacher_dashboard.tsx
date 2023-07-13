import Footer from 'src/components/Footer';
import { Card, Grid } from '@mui/material';
import Block1 from 'src/content/Blocks/Statistics/Block3';
import Image from 'next/image';
import Calander from '../calender/calander';
import Notice from '../notice/notice';
import Head from '../head/head';
import QuickLinkCards from '../quick_link_card/quickLinkCard';

function StudentDashboardReportsContent({ blockCount }) {

  const { teacher } = blockCount;
  const name = [teacher.first_name, teacher.middle_name, teacher.last_name].join(' ');
  const extraInfo = [['department', teacher.department.title]];
  const quickLinks = [
    { name: 'Exam', src: "exam.svg", href: "/management/exam" },
    { name: 'Class Attendance', src: "attendance.svg", href: "/management/attendence/normalAttendence" },
    { name: 'Routine', src: "routine.svg", href: "/management/routine/class" },
    { name: 'Exam Attendance', src: "exam_attendance.svg", href: "/management/attendence/examAttendence" }
  ]

  return (
    <>
      <Card sx={{ m: 4, borderRadius: 0.5 }}>
        <Grid container justifyContent='space-between' >
          <Grid item xs={8} p={2}>
            <Head name={name} extraInfo={extraInfo} />
          </Grid>
          <Grid item xs={4} position="relative" >
            {/* <Grid position="absolute"> */}
            <Image width={50} height={50} className=' absolute object-cover h-full w-full content-center ' src={'school_classroom.svg'} alt="classroom" />
            {/* </Grid> */}
            {/* <Image width={60} height={60} className=' absolute object-contain h-full w-full  ' src={'curve_circle.svg'} alt="classroom" /> */}
          </Grid>
        </Grid>
      </Card>

      <Grid
        sx={{
          px: 4
        }}
        container
        direction="row"
        justifyContent="center"
        alignItems='center'
        spacing={4}
      >
        <Grid item xs={12}>
          <Block1 blockCount={blockCount} />
        </Grid>

        <Grid
          xs={12}
          md={11}
          sx={{
            pl: 4,
            pt: 2,
          }}
        >
          <Grid display="flex" gap={4} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* quick links */}
            <QuickLinkCards quickLinks={quickLinks} />

            {/* calander */}
            <Calander holidays={blockCount.holidays} />
          </Grid>
        </Grid>
      </Grid>

      {/* notice */}
      <Notice blockCount={blockCount} />
      <Footer />
    </>
  );
}


export default StudentDashboardReportsContent;
