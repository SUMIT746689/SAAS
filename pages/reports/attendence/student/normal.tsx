import { Card, Grid, Divider, TextField, Button, Typography, Avatar, Table } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import dayjs from 'dayjs';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import useNotistick from '@/hooks/useNotistick';
const tableStyle: object = {
  border: '1px solid black',
  borderCollapse: 'collapse',
  minWidth: '36px',
  textAlign: 'center'
};
import Head from 'next/head';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import PageHeader from 'src/content/Management/Attendence/PageHeader';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import ReactToPrint from 'react-to-print';
import { MobileDatePicker } from '@mui/lab';
import { AutoCompleteWrapper, EmptyAutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { ButtonWrapper, DisableButtonWrapper } from '@/components/ButtonWrapper';
import { TableEmptyWrapper } from '@/components/TableWrapper';
function Attendence() {
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();
  const [targetsectionStudents, setTargetsectionStudents] = useState(null);
  const [students, setStudents] = useState(null);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const { user } = useAuth();
  console.log({ user });
  const attendenceRef = useRef();

  const today = dayjs();
  const formattedToday = parseInt(today.format('D'), 10);
  console.log({ formattedToday });

  useEffect(() => {
    axios
      .get(`/api/class?school_id=${user?.school_id}`)
      .then((res) => setClasses(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleClassSelect = (e, value) => {
    setSelectedClass(value);
    setSelectedSection(null);
    if (value?.id) {
      const selectedClassSections = classes.find((i) => i.id == value?.id);
      if (selectedClassSections) {
        if (selectedClassSections.has_section) {
          setSections(
            selectedClassSections?.sections?.map((j) => {
              return {
                label: j.name,
                id: j.id
              };
            })
          );
        } else {
          setSelectedSection({
            label: selectedClassSections?.sections[0].name,
            id: selectedClassSections?.sections[0].id
          });
        }
      }
    }
  };

  const handleReportGenerate = async () => {
    try {
      if (selectedSection && selectedDate && academicYear && user) {
        const response = await axios.get(
          `/api/attendance/student?school_id=${user?.school_id}&section_id=${selectedSection?.id}&from_date=${
            selectedDate.slice(0, -2) + '01'
          }&to_date=${selectedDate.slice(0, -2) + '31'}`
        );

        if (response.data.length < 1) {
          throw new Error('Attendence not taken!');
        }
        const res = await axios.get(
          `/api/student?school_id=${user?.school_id}&section_id=${selectedSection?.id}&academic_year_id=${academicYear?.id}`
        );
        console.log({ setTargetsectionStudents });
        setTargetsectionStudents(
          res.data.map((i) => {
            const middle_name = i?.student_info?.middle_name;
            const last_name = i?.student_info?.last_name;
            return {
              student_id: i.id,
              class_roll_no: i.class_roll_no,
              name: i.student_info.first_name + (middle_name ? ` ${middle_name}` : '') + (last_name ? ` ${last_name}` : '')
            };
          })
        );

        const montAttendence = Array.from({ length: 33 }, (_, j) => {
          if (j == 0) return 'name';
          else if (j == 1) return 'roll';
          else
            return {
              dayNumber: j - 1,
              student_id_list: []
            };
        });

        for (const i of response.data) {
          const temp_date = new Date(i.date).getUTCDate();
          // @ts-ignore
          montAttendence[(temp_date < 1 ? 1 : temp_date) + 1]?.student_id_list.push({
            student_id: i.student_id,
            status: i.status,
            remark: i.remark
          });
        }
        setStudents(montAttendence);
      }
    } catch (err) {
      setStudents(null);
      setTargetsectionStudents(null);
      console.log(err);
      // showNotification(err.message, 'error')
      showNotification(err?.response?.data?.message || err?.message, 'error');
    }
  };
  console.log({ selectedClass, selectedSection });
  return (
    <>
      <Head>
        <title>Students Attendence</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader title={'Students Attendence'} />
      </PageTitleWrapper>

      <Grid sx={{ px: { xs: 2, sm: 4 } }} container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 1, pb: 0, mb: 3, display: 'grid', gridTemplateColumns: { sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' }, columnGap: 1 }}>
            <Grid item width="100%" pb={1}>
              <MobileDatePicker
                label="Select Date"
                views={['year', 'month']}
                value={selectedDate}
                onChange={(newValue) => {
                  if (newValue) setSelectedDate(dayjs(newValue).format('YYYY-MM-DD'));
                  else setSelectedDate(null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    fullWidth
                    sx={{
                      [`& fieldset`]: {
                        borderRadius: 0.6
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {selectedDate ? (
              <>
                <AutoCompleteWrapper
                  minWidth="100%"
                  label={t('Select class')}
                  placeholder={t('Class...')}
                  options={classes.map((i) => ({
                    label: i.name,
                    id: i.id,
                    has_section: i.has_section
                  }))}
                  value={undefined}
                  handleChange={handleClassSelect}
                />
              </>
            ) : (
              <EmptyAutoCompleteWrapper minWidth="100%" label={t('Select Class')} placeholder={t('Class...')} options={[]} value={undefined} />
            )}

            {selectedClass?.has_section && sections && selectedDate ? (
              <>
                <AutoCompleteWrapper
                  minWidth="100%"
                  label={t('Batch')}
                  placeholder={t('Select batch...')}
                  options={sections}
                  value={selectedSection}
                  handleChange={(e, value) => setSelectedSection(value)}
                />
              </>
            ) : (
              <EmptyAutoCompleteWrapper minWidth="100%" label={t('Batch')} placeholder={t('Select batch...')} options={[]} value={undefined} />
            )}

            {user && selectedSection && academicYear ? (
              <ButtonWrapper handleClick={() => handleReportGenerate()}>Generate</ButtonWrapper>
            ) : (
              <DisableButtonWrapper>Generate</DisableButtonWrapper>
            )}

            {user && selectedSection && academicYear && students ? (
              <ReactToPrint
                content={() => attendenceRef.current}
                // pageStyle={`{ size: 2.5in 4in }`}
                trigger={() => (
                  <ButtonWrapper startIcon={<LocalPrintshopIcon />} size="small" handleClick={undefined}>
                    Print
                  </ButtonWrapper>
                )}
              />
            ) : (
              <DisableButtonWrapper>Print</DisableButtonWrapper>
            )}
          </Card>

          <br />

          {/* present table */}
          <Card
            sx={{
              height: 'calc(100vh - 412px) !important',
              overflowX: 'auto',
              overflowY: 'auto',
              p: 1,
              borderRadius: 0.5
            }}
            // justifyContent={'flex-end'}
          >
            {targetsectionStudents && students ? (
              <div ref={attendenceRef}>
                <Grid container py={2} spacing={2} justifyContent={'space-between'} px={7}>
                  <Grid item>
                    <Avatar variant="rounded">{/* {user?.school?.image && <img src={`/${user.school.image}`} />} */}</Avatar>
                  </Grid>

                  <Grid width={'60%'} item>
                    <Typography variant="h3" align="center">
                      {user?.school?.name}
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ borderBottom: 1 }}>
                      {user?.school?.address}, {user?.school?.phone}
                    </Typography>
                    <Typography variant="h6" align="center">
                      Class : {selectedClass?.label}, Section : {selectedSection?.label}, Month : {dayjs(selectedDate).format('MMMM, YYYY')}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h4">Class Attendence Report</Typography>
                  </Grid>
                </Grid>
                {/* attendance type */}
                <Card
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    color: '#4454cc',
                    ml: 'auto',
                    columnGap: { xs: 3 },
                    rowGap: 1,
                    p: 1,
                    my: 1,
                    width: { xs: 1, md: 1 / 2 },
                    borderRadius: 0.5
                  }}
                >
                  <Grid>Present = P</Grid>
                  <Grid>Holiday = H</Grid>
                  <Grid>Absent = A</Grid>
                  <Grid>Bunk = B</Grid>
                  <Grid>Late = L</Grid>
                </Card>
                <Table style={{ ...tableStyle, width: '100%' }}>
                  <thead>
                    <tr>
                      {[-1, ...Array(32).keys()].map((i) => (
                        <th style={tableStyle}>{i > 1 ? i : i == -1 ? 'Name' : i == 0 ? 'Roll' : i}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody
                    style={{
                      overflowX: 'auto',
                      overflowY: 'auto'
                    }}
                  >
                    {targetsectionStudents?.map((i) => {
                      return (
                        <tr>
                          {students?.map((j, index) => {
                            if (j.student_id_list) {
                              const found = j.student_id_list.find((st) => st.student_id == i.student_id);
                              const today = dayjs();
                              const formattedToday = parseInt(today.format('D'), 10);
                              console.log({ index, formattedToday });

                              if (found) {
                                return (
                                  <td
                                    style={
                                      found.status == 'absent'
                                        ? {
                                            ...tableStyle,
                                            backgroundColor: 'red',
                                            color: 'white'
                                          }
                                        : found.status == 'late'
                                        ? {
                                            ...tableStyle,
                                            backgroundColor: 'yellow',
                                            color: 'black'
                                          }
                                        : found.status == 'bunk'
                                        ? {
                                            ...tableStyle,
                                            backgroundColor: 'blue',
                                            color: 'white'
                                          }
                                        : {
                                            ...tableStyle,
                                            backgroundColor: 'green',
                                            color: 'white'
                                          }
                                    }
                                  >
                                    {found.status.slice(0, 1)}
                                  </td>
                                );
                              } else {
                                // console.log({ index, formattedToday });
                                if (index - 1 <= formattedToday) {
                                  return (
                                    <td
                                      style={{
                                        ...tableStyle,
                                        backgroundColor: 'red',
                                        color: 'white',
                                        textAlign: 'center'
                                      }}
                                    >
                                      &nbsp; &nbsp; A
                                    </td>
                                  );
                                } else {
                                  return <td style={tableStyle}>&nbsp; &nbsp;</td>;
                                }
                              }
                            } else {
                              if (j == 'name')
                                return (
                                  <td
                                    style={{
                                      ...tableStyle,
                                      backgroundColor: '#00997a',
                                      color: 'white'
                                    }}
                                  >
                                    {i.name}
                                  </td>
                                );
                              else
                                return (
                                  <td
                                    style={{
                                      ...tableStyle,
                                      backgroundColor: '#00997a',
                                      color: 'white'
                                    }}
                                  >
                                    {i.class_roll_no}
                                  </td>
                                );
                            }
                          })}
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* <tfoot>
            <tr>
              <td>Sum</td>
              <td>$180</td>
            </tr>
          </tfoot> */}
                </Table>
              </div>
            ) : (
              <TableEmptyWrapper title="attendance" />
            )}
          </Card>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

Attendence.getLayout = (page) => (
  <Authenticated name="attendence">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Attendence;
