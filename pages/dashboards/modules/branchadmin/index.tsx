import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import ModulesAdminDashboard from '@/content/DashboardPages/reports/admin_dashboard/modules';

function ModulesDashboardReports() {
  return <ModulesAdminDashboard />;

  // switch (blockCount?.role) {
  //     case 'teacher':
  //         return (
  //             <>
  //                 <Head> <title>Teacher Dashboard</title> </Head>
  //                 <TeacherDashboardReportsContent blockCount={blockCount} />
  //             </>
  //         )
  //     case 'student':
  //         return (
  //             <>
  //                 <Head><title>Student Dashboard</title></Head>
  //                 <StudentDashboardReportsContent blockCount={blockCount} />
  //             </>
  //         )
  //     case 'admin':
  //         return (
  //             <>
  //                 <Head><title>Dashboard</title></Head>
  //                 <AdminDashboardReportsContent blockCount={blockCount} />
  //             </>
  //         )
  //     default:
  //         return (
  //             <>
  //                 <Head><title>Dashboard</title></Head>
  //                 <DashboardReportsContent blockCount={blockCount} />
  //             </>
  //         )
  // }
}

ModulesDashboardReports.getLayout = (page) => (
  <Authenticated>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ModulesDashboardReports;
