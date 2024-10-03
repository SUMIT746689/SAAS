import Head from 'next/head';
import { useState, useEffect, useContext, useRef } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Paper,
  selectClasses,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import PageHeader from 'src/content/Management/Attendence/PageHeader';
import { ClassAndSectionSelect } from '@/components/Attendence';
import { useTranslation } from 'next-i18next';
import useNotistick from '@/hooks/useNotistick';
import ReactToPrint from 'react-to-print';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { ButtonWrapper } from '@/components/ButtonWrapper';

const applyPagination = (array, page, limit) => {
  return array.slice(page * limit, page * limit + limit);
};
const tableStyle: object = {
  border: '1px solid black',
  borderCollapse: 'collapse',
  minWidth: '60px',
  textAlign: 'center',
  padding: '8px'
  // backgroundColor: '#cccccc'
};
const gradeTableStyle: object = {
  border: '1px solid black',
  borderCollapse: 'collapse',
  minWidth: '40px',
  textAlign: 'center',
  padding: '6px'
  // backgroundColor: '#cccccc'
};

function Managementschools() {
  const theme = useTheme();
  const { t }: { t: any } = useTranslation();
  const [result, setResult] = useState([]);

  const { showNotification } = useNotistick();
  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [total_exam_mark, setTotal_exam_mark] = useState(null);
  const [subjectlistLength, setSubjectlistLength] = useState(null);
  const [exams, setExams] = useState(null);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  const paginatedResults = applyPagination(result, page, limit);
  const tabulation_sheet_Print = useRef();

  const selectedBulkActions = result.length > 0;

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
  };

  useEffect(() => {
    axios
      .get(`/api/class?school_id=${user?.school_id}`)
      .then((res) => setClasses(res?.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (selectedSection && academicYear && user) {
      axios
        .get(`/api/exam/exam-list?school_id=${user?.school_id}&academic_year=${academicYear?.id}&section_id=${selectedSection.id}`)
        .then((res) =>
          setExams(
            res.data?.map((i) => {
              return {
                label: i.title,
                id: i.id
              };
            })
          )
        )
        .catch((err) => console.log(err));
      setSelectedExam(null);
    }
  }, [selectedSection, academicYear, user]);

  const handleSearchResult = () => {
    axios
      .get(`/api/result/?section_id=${selectedSection.id}&exam_id=${selectedExam.id}`)
      .then((res) => {
        setResult(res.data.sections_result);
        setTotal_exam_mark(res.data.subject_list.exam_details.reduce((a, c) => a + c.subject_total, 0));
        setSubjectlistLength(res.data.subject_list.exam_details.length);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    setResult([]);
  }, [selectedSection, selectedExam]);

  return (
    <>
      <Head>
        <title>Merit list section</title>
      </Head>

      <PageTitleWrapper>
        <PageHeader title={'Merit list section'} />
      </PageTitleWrapper>

      <Grid justifyContent="center" alignItems="stretch" spacing={3} sx={{ px: { xs: 2, sm: 4 } }}>
        <Grid item xs={12}>
          <Card sx={{ p: 1, pb: 0, mb: 3, display: 'grid', gridTemplateColumns: { sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' }, columnGap: 1 }}>
            <ClassAndSectionSelect
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              classes={classes}
              selectedDate={null}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              flag={true}
            />

            {selectedSection && exams && (
              <AutoCompleteWrapper
                label="Select exam"
                placeholder="Exam..."
                options={exams}
                value={selectedExam}
                filterSelectedOptions
                handleChange={(e, v) => {
                  setSelectedExam(v);
                }}
              />
            )}
            {selectedSection && selectedExam && <ButtonWrapper handleClick={handleSearchResult}>Find</ButtonWrapper>}
            {selectedBulkActions && (
              <ReactToPrint
                content={() => tabulation_sheet_Print.current}
                // pageStyle={`{ size: 2.5in 4in }`}

                trigger={() => (
                  <ButtonWrapper handleClick={undefined} startIcon={<LocalPrintshopIcon />}>
                    {t('print')}
                  </ButtonWrapper>
                )}
                // pageStyle={"@page { size: landscape; }"}
              />
            )}
          </Card>
        </Grid>
        <Divider />
        <Card sx={{ minHeight: 'calc(100vh - 413px)' }}>
          {!selectedBulkActions && (
            <Box p={2} display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography component="span" variant="subtitle1">
                  {t('Showing')}:
                </Typography>{' '}
                <b>{paginatedResults.length}</b> <b>{t('Result')}</b>
              </Box>
              <TablePagination
                component="div"
                count={paginatedResults.length}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleLimitChange}
                page={page}
                rowsPerPage={limit}
                rowsPerPageOptions={[5, 10, 15]}
              />
            </Box>
          )}
          {paginatedResults.length === 0 ? (
            <>
              <Typography
                sx={{
                  py: 10
                }}
                variant="h3"
                fontWeight="normal"
                color="text.secondary"
                align="center"
              >
                {t("We couldn't find any result matching your search criteria")}
              </Typography>
            </>
          ) : (
            <>
              <TableContainer>
                <Table aria-label="collapsible table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Sl')}</TableCell>
                      <TableCell>{t('Students')}</TableCell>
                      <TableCell>{t('Roll')}</TableCell>
                      <TableCell>{t('Total marks')}</TableCell>
                      <TableCell>{t('GPA')}</TableCell>
                      <TableCell>{t('Result')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedResults.map((i, index) => {
                      const result_detailsLength = i.result_details.length;
                      let name = i.student.student_info.first_name;
                      if (i.student.student_info.middle_name) {
                        name += ' ' + i.student.student_info.middle_name;
                      }
                      if (i.student.student_info.last_name) {
                        name += ' ' + i.student.student_info.last_name;
                      }
                      return (
                        <TableRow>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{name}</TableCell>
                          <TableCell>{i.student.class_roll_no}</TableCell>
                          <TableCell>
                            {subjectlistLength == result_detailsLength ? `${i?.total_marks_obtained}/${total_exam_mark}` : 'not inserted'}
                          </TableCell>
                          <TableCell>{subjectlistLength == result_detailsLength ? i?.calculated_point?.toFixed(2) : 'not inserted'}</TableCell>
                          <TableCell>{subjectlistLength == result_detailsLength ? i?.calculated_grade : 'not inserted'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Card>
      </Grid>

      <Grid
        sx={{
          display: 'none'
        }}
      >
        <Grid
          sx={{
            p: 1
          }}
          ref={tabulation_sheet_Print}
        >
          <Grid
            py={2}
            spacing={2}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 2.75fr 1fr'
            }}
            px={7}
          >
            <Grid item>
              <Avatar variant="rounded">{/* {user?.school?.image && <img src={`/${user.school.image}`} />} */}</Avatar>
            </Grid>

            <Grid item>
              <Typography variant="h3" align="center">
                {user?.school?.name}
              </Typography>
              <Typography variant="h6" align="center" sx={{ borderBottom: 1 }}>
                {user?.school?.address}, {user?.school?.phone}
              </Typography>
              <Typography variant="h6" align="center">
                Class : {selectedClass?.label}, Section : {selectedSection?.label}
              </Typography>
            </Grid>

            <Grid item>
              <Typography variant="h4">Merit list</Typography>
            </Grid>
          </Grid>
          <Grid
            sx={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <TableContainer sx={{ marginX: 1, p: 0.5 }}>
              <Table aria-label="collapsible table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Sl')}</TableCell>
                    <TableCell>{t('Students')}</TableCell>
                    <TableCell>{t('Roll')}</TableCell>
                    <TableCell>{t('Total marks')}</TableCell>
                    <TableCell>{t('GPA')}</TableCell>
                    <TableCell>{t('Result')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result?.map((i, index) => {
                    const result_detailsLength = i.result_details.length;
                    let name = i.student.student_info.first_name;
                    if (i.student.student_info.middle_name) {
                      name += ' ' + i.student.student_info.middle_name;
                    }
                    if (i.student.student_info.last_name) {
                      name += ' ' + i.student.student_info.last_name;
                    }
                    return (
                      <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell>{i.student.class_roll_no}</TableCell>
                        <TableCell>
                          {subjectlistLength == result_detailsLength ? `${i?.total_marks_obtained}/${total_exam_mark}` : 'not inserted'}
                        </TableCell>
                        <TableCell>{subjectlistLength == result_detailsLength ? i?.calculated_point?.toFixed(2) : 'not inserted'}</TableCell>
                        <TableCell>{subjectlistLength == result_detailsLength ? i?.calculated_grade : 'not inserted'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Grid>

      <Footer />
    </>
  );
}

Managementschools.getLayout = (page) => (
  <Authenticated name="teacher">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Managementschools;
