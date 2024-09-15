import Head from 'next/head';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid } from '@mui/material';
import Results from 'src/content/Management/Attendence/EmployeeAttendenceResult';
import { ButtonWrapper, DisableButtonWrapper } from '@/components/ButtonWrapper';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { useContext, useState } from 'react';
import { fetchData } from '@/utils/post';
import { useAuth } from '@/hooks/useAuth';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import useNotistick from '@/hooks/useNotistick';
import { DropDownSelectWrapper } from '@/components/DropDown';
function EmployeeAttendence() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectStudentAttendType, setSelectStudentAttendType] = useState('all_type');
  const [academicYear] = useContext(AcademicYearContext);
  const { showNotification } = useNotistick();

  const handleSendSms = async () => {
    // let url = new URL("http://localhost:3000/api/attendance/machine/send_sms_student");
    // if(selectedClass?.id) url.searchParams.set("class_id", selectedClass.id);
    // if(selectedSection?.id) url.searchParams.set("section_id", selectedSection.id);
    if (!selectedClass?.id || !academicYear?.id) return showNotification('class or academic year not selected', 'error');

    let url = `/api/attendance/machine/send_sms_student?academic_year_id=${academicYear.id}&class_id=${selectedClass.id}&sent_sms_std_status=${selectStudentAttendType}&`;
    if (selectedSection?.id) url += `section_id=${selectedSection.id}`;

    fetchData(url, 'post', {})
      .then(([err, data]) => {
        console.log({ data });
        err ? showNotification(err, 'error') : showNotification(data?.message || 'successfully sending...', 'success');
      })
      .catch((err) => showNotification(err?.response?.data?.message || ' failed to sending sms', 'error'));
  };

  return (
    <>
      <Head>
        <title>Employee Attendence</title>
      </Head>
      <PageTitleWrapper>
        <PageHeaderTitleWrapper
          name="Employee Attendence"
          handleCreateClassOpen={true}
          actionButton={
            <Grid item pt={1} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={0.5}>
              {/* <DropDownSelectWrapper
                name="Sms Send For"
                label="Sms Send For"
                value={selectStudentAttendType}
                handleChange={(e) => {
                  setSelectStudentAttendType(e.target.value);
                  console.log({ e: e.target.value });
                }}
                menuItems={['all_type', 'present', 'late', 'absence']}
              />
              <Grid sx={{ minWidth: { sm: 235 } }}>
                {selectedClass ? (
                  <ButtonWrapper handleClick={handleSendSms}> + Send Sms (Selected Student) </ButtonWrapper>
                ) : (
                  <DisableButtonWrapper> + Send Sms (Selected Student) </DisableButtonWrapper>
                )}
              </Grid> */}
            </Grid>
          }
        />
        {/* <PageHeader title={'Students Attendence'} /> */}
      </PageTitleWrapper>

      <Grid sx={{ px: { xs: 1, xl: 2 } }} container direction="row" justifyContent="center" alignItems="stretch" spacing={2}>
        <Grid item xs={12}>
          <Results
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
          />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

EmployeeAttendence.getLayout = (page) => (
  <Authenticated name="attendence">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default EmployeeAttendence;
