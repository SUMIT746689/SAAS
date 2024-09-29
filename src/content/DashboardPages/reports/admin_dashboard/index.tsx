import Footer from 'src/components/Footer';
import { Avatar, Button, Card, Grid, Typography } from '@mui/material';
import Calander from '../../calender/calander';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import {
  AccountingIcon,
  AttendanceIcon,
  ExamIcon,
  FeesCollectionIcon,
  NoticeIcon,
  OnlineAddmissionIcon,
  ReportIcon,
  RoutineIcon,
  SmsIcon,
  StaffsIcon,
  StudentRegIcon,
  StudentsIcon,
  StudyMaterialsIcon,
  TeacherIcon,
  TeacherRoutineIcon,
  WebsiteSettingsIcon
} from '@/components/Icon';
import Notices from '../../admin_notices';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import dayjs from 'dayjs';
import { formatNumber } from '@/utils/numberFormat';
import Image from 'next/image';
import { adminModulesList } from '@/utils/moduleLists';
import { useContext } from 'react';
import { ModuleContext } from '@/contexts/ModuleContext';
import { DashboardQuickLinkButtonWrapper } from '@/components/DashboardQuickLinkButtonWrapper';
import { Attendance } from '../../attendance';

const colorBlue = '#0052B4';
const colorLightRed = '#FFE6E2';
const colorDarkRed = '#CA3214';
const colorLightTeal = '#D2F7ED';
const colorDarkTeal = '#147D6F';
const colorDarkViolet = '#9C2BAD';
const colorLightViolet = '#F9E5F9';

const quickLinksColors = [
  { dark: '#006ADC', light: '#E1F0FF' },
  { dark: '#9C2BAD', light: '#F9E5F9' },
  { dark: '#CA3214', light: '#FFE6E2' }
];

// const quickLinks = [
//     { color: quickLinksColors[2], linkUrl: "management/users", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "All Users", },
//     { color: quickLinksColors[0], linkUrl: "management/students/online-admission", icon: <OnlineAddmissionIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Online Admission" },
//     { color: quickLinksColors[1], linkUrl: "management/students", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Students" },
//     { color: quickLinksColors[2], linkUrl: "management/teachers", icon: <TeacherIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Teachers" },
//     { color: quickLinksColors[0], linkUrl: "management/users/entry_other_users", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Other Users" },
//     { color: quickLinksColors[1], linkUrl: "management/attendence/normalAttendence", icon: < AttendanceIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Attendance" },
//     { color: quickLinksColors[2], linkUrl: "management/accounting/account", icon: < AccountingIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Accounting" },
//     { color: quickLinksColors[0], linkUrl: "front_end/notice", icon: < NoticeIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Notice" },
//     { color: quickLinksColors[1], linkUrl: "management/routine/class_routine", icon: <RoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Routine" },
//     { color: quickLinksColors[2], linkUrl: "#", icon: <StudyMaterialsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Study Materials" },
//     { color: quickLinksColors[0], linkUrl: "bulk_sms_and_email/send_sms", icon: <SmsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Sms" },

//     { color: quickLinksColors[1], linkUrl: "front_end", icon: <WebsiteSettingsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Website Settings" },
//     { color: quickLinksColors[2], linkUrl: "reports/attendence/student/normal", icon: <ReportIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Reports" },
//     { color: quickLinksColors[0], linkUrl: "reports/exam/report_card", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Examinations" },

//     // { color: quickLinksColors[2], linkUrl: "#", icon: <TeacherRoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Teacher Routine" },
//     // { color: quickLinksColors[0], linkUrl: "/management/exam", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Exam" },
//     // { color: quickLinksColors[2], linkUrl: "/management/student_fees_collection", icon: < FeesCollectionIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: 'Fees Colelction' }
// ]

const quickLinks = [
  {
    color: quickLinksColors[2],
    linkUrl: 'dashboards/modules/admin',
    icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />,
    name: 'All Users'
  },
  {
    color: quickLinksColors[0],
    linkUrl: 'dashboards/modules/admin',
    icon: <OnlineAddmissionIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />,
    name: 'Online Admission'
  },
  {
    color: quickLinksColors[1],
    linkUrl: 'dashboards/modules/admin',
    icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />,
    name: 'Students'
  },
  {
    color: quickLinksColors[2],
    linkUrl: 'dashboards/modules/admin',
    icon: <TeacherIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />,
    name: 'Teachers'
  },
  {
    color: quickLinksColors[0],
    linkUrl: 'dashboards/modules/admin',
    icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />,
    name: 'Other Users'
  },
  {
    color: quickLinksColors[1],
    linkUrl: 'dashboards/modules/admin',
    icon: <AttendanceIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />,
    name: 'Attendance'
  },
  {
    color: quickLinksColors[2],
    linkUrl: 'dashboards/modules/admin',
    icon: <AccountingIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />,
    name: 'Accounting'
  },
  {
    color: quickLinksColors[0],
    linkUrl: 'dashboards/modules/admin',
    icon: <NoticeIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />,
    name: 'Notice'
  },
  {
    color: quickLinksColors[1],
    linkUrl: 'dashboards/modules/admin',
    icon: <RoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />,
    name: 'Routine'
  },
  {
    color: quickLinksColors[2],
    linkUrl: 'dashboards/modules/admin',
    icon: <StudyMaterialsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />,
    name: 'Study Materials'
  },
  {
    color: quickLinksColors[0],
    linkUrl: 'dashboards/modules/admin',
    icon: <SmsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />,
    name: 'Sms'
  },

  {
    color: quickLinksColors[1],
    linkUrl: 'dashboards/modules/admin',
    icon: <WebsiteSettingsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />,
    name: 'Website Settings'
  },
  {
    color: quickLinksColors[2],
    linkUrl: 'dashboards/modules/admin',
    icon: <ReportIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />,
    name: 'Reports'
  },
  {
    color: quickLinksColors[0],
    linkUrl: 'dashboards/modules/admin',
    icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />,
    name: 'Examinations'
  },

  {
    color: quickLinksColors[1],
    linkUrl: 'dashboards/modules/admin',
    icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />,
    name: 'Inventory Management'
  },
  {
    color: quickLinksColors[2],
    linkUrl: 'dashboards/modules/admin',
    icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />,
    name: 'Hostel Managment'
  },
  {
    color: quickLinksColors[0],
    linkUrl: 'dashboards/modules/admin',
    icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />,
    name: 'Library Managment'
  },
  {
    color: quickLinksColors[2],
    linkUrl: 'dashboards/modules/admin',
    icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />,
    name: 'E-Learning Management'
  }

  // { color: quickLinksColors[2], linkUrl: "#", icon: <TeacherRoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Teacher Routine" },
  // { color: quickLinksColors[0], linkUrl: "/management/exam", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Exam" },
  // { color: quickLinksColors[2], linkUrl: "/management/student_fees_collection", icon: < FeesCollectionIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: 'Fees Colelction' }
];

function AdminDashboardContent({ blockCount = null }) {
  const { banners: banners_ } = blockCount || {};
  const { banners } = banners_ || {};
  const { left_banners, right_banners } = banners || {};
  const { t }: { t: any } = useTranslation();
  const right_banner_check = Array.isArray(right_banners) && right_banners.length > 0;
  console.log({ blockCount });
  return (
    <>
      <Grid p={{ xs: 1, xl: 2 }} display={{ sm: 'grid' }} gridTemplateColumns={{ md: '1fr ' }} gap={2}>
        <Card
          sx={{
            display: 'flex',
            minHeight: { xl: 170 },
            justifyContent: 'space-between',
            width: '100%',
            pl: 2,
            py: { xs: 2, md: 0 },
            pr: { xs: 2, md: 0 },
            columnGap: 2,
            backgroundColor: (theme) => theme.colors.primary.main,
            color: 'whitesmoke',
            borderRadius: 1
          }}
        >
          <Avatar sx={{ my: 'auto', width: { xs: 40, sm: 80 }, height: { xs: 40, sm: 80 } }} />
          <Grid item sx={{ display: 'flex', height: 'fit-content', flexDirection: 'column', gap: 1, my: 'auto', py: 1 }}>
            <Grid sx={{ fontSize: { xs: 15, sm: 17, md: 17, lg: 18, xl: 22 }, fontWeight: 500 }}>{blockCount?.school?.name} </Grid>
            <Grid sx={{ fontSize: { xs: 12, xl: 16 }, fontWeight: 300 }}> Address: {blockCount?.school?.address}</Grid>
            <Grid sx={{ fontSize: { xs: 12, xl: 16 }, fontWeight: 300 }}>
              {' '}
              {blockCount?.school?.subscription[0]?.package?.name && `Package: ${blockCount?.school?.subscription[0]?.package?.name}`}
              {blockCount?.school?.subscription[0]?.package?.is_std_cnt_wise === true ? ',Package type: Student count wise,' : ''} Package Expire
              Date: {dayjs(blockCount?.school?.subscription[0]?.end_date).format('MMMM D, YYYY')}{' '}
            </Grid>
          </Grid>
          <Grid item height="fit-content" width="fit-content" display={{ xs: 'none', md: 'Grid' }}>
            <Image
              src="/dashboard/student_teacher.svg"
              width={200}
              height={100}
              alt="Picture of the author"
              style={{ position: 'relative', objectFit: 'contain', bottom: -1, right: 0, marginTop: 'auto' }}
            />
          </Grid>
        </Card>
      </Grid>

      <Grid px={{ xs: 1, xl: 2 }} display={{ sm: 'grid' }} gridTemplateColumns={{ md: '1fr 300px', xl: '1fr 420px' }} gap={2}>
        <Grid sx={{ display: 'grid', width: '100%' }} height="fit-content" rowGap={2}>
          {/* quick links and attendance */}
          <Grid display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            {/* quick links */}
            <Grid width="100%" display="flex" justifyContent="center">
              <Grid
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: { xs: 1, xl: 2 },
                  justifyContent: { xs: 'space-between', md: 'center' },
                  height: 'fit-content',
                  transition: 'all 5s'
                }}
              >
                {quickLinks.map(({ color, linkUrl, icon, name }, index) => (
                  <DashboardQuickLinkButtonWrapper
                    key={index}
                    color={color}
                    linkUrl={linkUrl}
                    icon={icon}
                    name={name}
                    value={adminModulesList[index]}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>

          {/* banners */}
          {banners && (
            <Grid sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Card
                sx={{
                  width: '100',
                  borderRadius: 0,
                  // borderTopLeftRadius: 0.5, borderTopRightRadius: 0.5,
                  overflow: 'hidden'
                }}
              >
                <ImageSlider
                  target="_blank"
                  images={left_banners ? left_banners?.map((banner) => ({ url: banner.url, redirectUrl: banner.redirectUrl })) : []}
                />
              </Card>
              <Card sx={{ width: '100', borderRadius: 0 }}>
                {right_banner_check && right_banners[0]?.redirectUrl ? (
                  <Link target="_blank" href={right_banners[0].redirectUrl}>
                    <img
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                      src={`/api/get_file/${
                        Array.isArray(right_banners) && right_banners.length > 0 && right_banners[0].url && right_banners[0].url
                      }`}
                      alt="right_banner"
                    />
                  </Link>
                ) : (
                  right_banner_check &&
                  right_banners[0].url &&
                  right_banners[0].url && (
                    <img
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                      src={`/api/get_file/${right_banner_check && right_banners[0].url && right_banners[0].url}`}
                      alt="right_banner"
                    />
                  )
                )}
                {/* <Link
            target='_blank'
            href={(Array.isArray(right_banners) && right_banners.length > 0 && right_banners[0].redirectUrl) ? right_banners[0].redirectUrl : ''}
          >
            <img style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} src={`/api/get_file/${(Array.isArray(right_banners) && right_banners.length > 0 && right_banners[0].url) && right_banners[0].url}`} alt="right_banner" />
          </Link> */}
              </Card>
            </Grid>
          )}
        </Grid>

        <Grid sx={{ height: 'fit-content', minWidth: { sm: 220, xl: 240 }, width: '100%', display: 'grid', gap: 1 }}>
          <Button
            variant="contained"
            sx={{
              minWidth: '100%',
              background: '#494949',
              ':hover': { background: '#494949', opacity: 0.9 },
              py: { xs: 1.5, xl: 2 },
              width: '100%',
              fontSize: { xs: 16, xl: 18 }
            }}
          >
            <Link href={`http://${blockCount?.domain}`} target="_blank" color="primary" rel="noopener noreferrer">
              {t('Website Link')}
            </Link>
          </Button>

          {/* total students and staffs */}
          <Grid
            sx={{
              width: '100%',
              minHeight: { xs: '80px', xl: '100px' },
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              justifyContent: 'center',
              columnGap: { xs: 1, sm: 2 }
            }}
          >
            <Card
              sx={{
                // minWidth: { md: '320px', xl: '380px' },
                py: 0.5,
                px: 3,
                background: 'linear-gradient(180deg, #017D8F 0%, #004A54 100%)',
                color: 'white',
                display: 'flex',
                gap: { xs: 1, sm: 2 },
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <StudentsIcon fillColor="white" />
              <Grid fontWeight={700} fontSize={{ xs: 12, xl: 16 }}>
                <Grid>Total Students</Grid>
                <Grid>{blockCount?.students?.count}</Grid>
              </Grid>
            </Card>

            <Card
              sx={{
                // minWidth: { md: '320px', xl: '380px' },
                py: 1,
                px: 3,
                background: 'linear-gradient(180deg, #F5952D 0%, #F36717 100%)',
                color: 'white',
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <StaffsIcon fillColor="white" />
              <Grid fontWeight={700} fontSize={{ xs: 12, xl: 16 }}>
                <Grid sx={{}}>Total Staffs</Grid>
                <Grid>{blockCount?.total_staffs}</Grid>
              </Grid>
            </Card>
          </Grid>

          <Card sx={{ color: colorBlue, px: 2, py: 2 }}>
            <Grid sx={{ fontSize: { xs: 12, sm: 14 }, fontWeight: 700, textAlign: 'center' }}>SMS QUANTITY</Grid>
            <Grid sx={{ fontSize: { xs: 10, xl: 12 }, display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <span>Masking Sms:</span>
              <span>{blockCount?.school?.masking_sms_count ? formatNumber(blockCount?.school?.masking_sms_count) : 0}</span>
            </Grid>
            <Grid sx={{ fontSize: { xs: 10, xl: 12 }, display: 'flex', justifyContent: 'space-between' }}>
              <span>Non Masking Sms:</span>
              <span>{blockCount?.school?.non_masking_sms_count ? formatNumber(blockCount?.school?.non_masking_sms_count) : 0}</span>
            </Grid>
          </Card>

          {/* attendence */}
          <Attendance todayAttendance={blockCount.attendance} />

          {/* calander */}
          <Grid item sx={{ maxWidth: { sm: 400 }, minWidth: 'fit-content' }}>
            <Typography fontWeight={700} fontSize={{ xs: 16, sm: 18 }} pb={1}>
              Calander
            </Typography>
            <Calander holidays={blockCount.holidays} />
          </Grid>
        </Grid>
      </Grid>

      {/* banners */}
      {/* <Grid sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, p: 2 }}> */}

      {/* notice board and calander */}
      {/* < Grid sx={{ display: 'grid', width: "100%", height: "100%", gridTemplateColumns: { md: '1fr 1fr' }, px: 2, gap: 2 }
      }>
        <Grid xs={12} md={11} sx={{ height: 'full' }}>
          <Grid sx={{ fontSize: { xs: 20, sm: 26 }, fontWeight: 700 }}>Notice Board</Grid>
          <Notices notices={blockCount?.school?.Notice || []} />
        </Grid>

        <Grid
          xs={12}
          md={11}
          sx={{
            // pt: 2,
          }}
        >
          <Grid sx={{ fontSize: { xs: 20, sm: 26 }, fontWeight: 700 }}>Calander</Grid>
          <Calander holidays={blockCount.holidays} />
        </Grid>
      </Grid > */}

      <Footer />
    </>
  );
}

const StudentPathButton = ({ color, linkUrl, name, icon, value }) => {
  const { handleChangeModule } = useContext(ModuleContext);
  return (
    <>
      <Link href={linkUrl} onClick={() => handleChangeModule(value)}>
        <Card
          sx={{
            p: 1.5,
            // boxShadow: 'inset 0px 0px 25px 3px rgba(0,0,0,0.1)',
            border: '1px solid',
            transition: 'all 0.2s',
            ':hover': { background: color, transform: 'scale(.95)' },
            borderRadius: '18px',
            borderColor: color.dark,
            background: 'transparent',
            boxShadow:
              '5px 5px 13px 0px #D1D9E6E5 inset,-5px -5px 10px 0px #FFFFFFE5 inset;,5px -5px 10px 0px #D1D9E633 inset;,-5px 5px 10px 0px #D1D9E633 inset;,-1px -1px 2px 0px #D1D9E680;,1px 1px 2px 0px #FFFFFF4D'
            // borderRadius: 1, px: 3, py: 1
          }}
        >
          <Card
            sx={{
              // boxShadow: '5px 5px 13px 0px #D1D9E6E5,-5px -5px 10px 0px #FFFFFFE5,5px -5px 10px 0px #D1D9E633,-5px 5px 10px 0px #D1D9E633,-1px -1px 2px 0px #D1D9E680 inset,1px 1px 2px 0px #FFFFFF4D inset',
              boxShadow:
                'box-shadow: 5px 5px 13px 0px #D1D9E6E5,-5px -5px 10px 0px #FFFFFFE5,5px -5px 10px 0px #D1D9E633,-5px 5px 10px 0px #D1D9E633,-1px -1px 2px 0px #D1D9E680 inset,1px 1px 2px 0px #FFFFFF4D inset',
              borderRadius: '18px',
              background: color.light
            }}
          >
            <Grid
              sx={{
                width: 175,
                height: 101,
                my: 'auto',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly'
              }}
            >
              <Grid>{icon}</Grid>
              <Grid fontSize={15} fontWeight={700} color={color.dark}>
                {name}
              </Grid>
            </Grid>
          </Card>
        </Card>

        {/* <Card sx={{ border: '1px solid', transition: 'all 0.2s', ':hover': { background: colorLightViolet, transform: 'scale(.95)' }, borderColor: colorDarkViolet, borderRadius: 1, px: 3, py: 1 }}>
          <Grid sx={{ width: 85, height: 85, my: "auto", textAlign: "center", display: "flex", flexDirection: 'column', justifyContent: 'space-evenly' }}>
            <Grid>
              {icon}
            </Grid>
            <Grid fontSize={14} color={colorDarkViolet}>
              {name}
            </Grid>
          </Grid>
        </Card> */}
      </Link>
    </>
  );
};

export default AdminDashboardContent;
