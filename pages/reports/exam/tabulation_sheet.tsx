import Head from 'next/head';
import { useState, useEffect, useContext, useRef } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
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
  textAlign: 'center',
  padding: '2px',
  fontSize: '0.8em'
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
  const [tableHeader, setTableHeader] = useState([]);
  const [exams, setExams] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  const paginatedResults = applyPagination(result, page, limit);
  const tabulation_sheet_Print = useRef();

  const selectedBulkActions = result.length > 0;

  const tableHeaderLength = tableHeader?.length;

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
        setTableHeader(
          res.data.subject_list.exam_details.map((i) => {
            return {
              name: i.subject.name,
              id: i.subject.id,
              subject_total: i.subject_total
            };
          })
        );
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    setResult([]);
  }, [selectedSection, selectedExam]);

  return (
    <>
      <Head>
        <title>Tabulation sheet section</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader title={'Tabulation sheet section'} />
      </PageTitleWrapper>

      {/* filter part */}
      <Grid justifyContent="center" alignItems="stretch" spacing={3} sx={{ px: { xs: 2, sm: 4 } }}>
        <Grid item xs={12}>
          <Card
            sx={{
              p: 1,
              pb: 0,
              mb: 3,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' },
              gap: 1,
              justifyContent: 'center'
            }}
          >
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
                options={exams}
                value={selectedExam}
                label="Select Exam"
                placeholder="input an exam..."
                handleChange={(e, newvalue) => {
                  setSelectedExam(newvalue);
                }}
              />
            )}
            {selectedSection && selectedExam && <ButtonWrapper handleClick={handleSearchResult}> Search</ButtonWrapper>}
            {selectedBulkActions && (
              <ReactToPrint
                content={() => tabulation_sheet_Print.current}
                // pageStyle={`{ size: 2.5in 4in }`}

                trigger={() => (
                  <ButtonWrapper handleClick={undefined} startIcon={<LocalPrintshopIcon />} size="medium">
                    {t('print')}
                  </ButtonWrapper>
                )}
                // pageStyle={"@page { size: landscape; }"}
              />
            )}
          </Card>
        </Grid>
        <Divider />
        {/* result */}
        <Card sx={{ minHeight: 'calc(100vh - 418px)' }}>
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
                      {tableHeader.map((j) => (
                        <TableCell>{t(`${j.name}(${j.subject_total})`)}</TableCell>
                      ))}
                      <TableCell>{t('Total marks')}</TableCell>
                      <TableCell>{t('GPA')}</TableCell>
                      <TableCell>{t('Result')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedResults.map((i, index) => {
                      const resultDetailsLength = i?.result_details?.length;
                      return (
                        <TableRow>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{i.student.student_info.first_name}</TableCell>
                          <TableCell>{i.student.class_roll_no}</TableCell>
                          {tableHeader?.map((j) => {
                            const found = i.result_details.find((sub) => sub.exam_details.subject.id == j.id);
                            console.log(found);

                            if (found) {
                              return <TableCell>{found.mark_obtained}</TableCell>;
                            } else {
                              return <TableCell>not taken</TableCell>;
                            }
                          })}
                          <TableCell>{tableHeaderLength == resultDetailsLength ? i?.total_marks_obtained?.toFixed(2) : 'not inserted'}</TableCell>
                          <TableCell>{tableHeaderLength == resultDetailsLength ? i?.calculated_point?.toFixed(2) : 'not inserted'}</TableCell>
                          <TableCell>{tableHeaderLength == resultDetailsLength ? i?.calculated_grade : 'not inserted'}</TableCell>
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

      {/* pdf  */}
      <Grid
        sx={{
          display: 'none'
        }}
      >
        <Grid sx={{ p: 2 }} ref={tabulation_sheet_Print}>
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
              <Typography variant="h4">Tabulation Sheet</Typography>
            </Grid>
          </Grid>

          <Grid
            item
            sx={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Table size="small">
              <thead>
                <tr>
                  <th style={tableStyle}>{t('Sl')}</th>
                  <th style={tableStyle}>{t('Students')}</th>
                  <th style={tableStyle}>{t('Roll')}</th>
                  {tableHeader.map((j) => (
                    <th style={tableStyle}>{t(`${j.name}\n(${j.subject_total})`)}</th>
                  ))}

                  <th style={tableStyle}>{t('Total marks')}</th>
                  <th style={tableStyle}>{t('GPA')}</th>
                  <th style={tableStyle}>{t('Result')}</th>
                </tr>
              </thead>
              <tbody
                style={{
                  overflowX: 'auto',
                  overflowY: 'auto'
                }}
              >
                {result.map((i, index) => {
                  const resultDetailsLength = i?.result_details?.length;
                  return (
                    <tr>
                      <td style={tableStyle}>{index + 1}</td>
                      <td style={tableStyle}>{i.student.student_info.first_name}</td>
                      <td style={tableStyle}>{i.student.class_roll_no}</td>
                      {tableHeader?.map((j) => {
                        const found = i.result_details.find((sub) => sub.exam_details.subject.id == j.id);
                        console.log(found);

                        if (found) {
                          return <td style={tableStyle}>{found.mark_obtained}</td>;
                        } else {
                          return <td style={tableStyle}>not taken</td>;
                        }
                      })}
                      <td style={tableStyle}>{tableHeaderLength == resultDetailsLength ? i?.total_marks_obtained?.toFixed(2) : 'not inserted'}</td>
                      <td style={tableStyle}>{tableHeaderLength == resultDetailsLength ? i?.calculated_point?.toFixed(2) : 'not inserted'}</td>
                      <td style={tableStyle}>{tableHeaderLength == resultDetailsLength ? i?.calculated_grade : 'not inserted'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
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
