import Head from 'next/head';
import { useState, useEffect, useContext, useRef } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
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
  TextField,
  Typography,
  selectClasses,
  useTheme
} from '@mui/material';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import PageHeader from 'src/content/Management/Attendence/PageHeader';
import { ClassAndSectionSelect } from '@/components/Attendence';
import { useTranslation } from 'next-i18next';
import useNotistick from '@/hooks/useNotistick';
import Image from 'next/image';
import ReactToPrint from 'react-to-print';
import dayjs from 'dayjs';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { ReportCardDesign } from '@/components/Result/ReportCardDesign';
import { getFile } from '@/utils/utilitY-functions';

const applyPagination = (array, page, limit) => {
  return array.slice(page * limit, page * limit + limit);
};
const tableStyle: object = {
  border: '1px solid black',
  borderCollapse: 'collapse',
  minWidth: '30px',
  textAlign: 'center',
  padding: '5px'
  // backgroundColor: '#cccccc'
};
const gradeTableStyle: object = {
  border: '1px solid black',
  borderCollapse: 'collapse',
  fontSize: '11px',
  fontWeight: 'bold',
  //  width: '5px',
  textAlign: 'center',
  padding: '3px'
  // backgroundColor: '#cccccc'
};

const sixElementArray = Array.from(Array(5).keys()).map((i) => <td style={tableStyle}></td>);
function Managementschools() {
  const { t }: { t: any } = useTranslation();
  const [result, setResult] = useState([]);
  const { showNotification } = useNotistick();
  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);

  const [exams, setExams] = useState(null);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedTempleate, setSelectedTempleate] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [highestMarks, setHighestMarks] = useState(null);
  const [grade, setGrade] = useState([]);

  const paginatedResults = applyPagination(result, page, limit);
  const reportCardPrint = useRef();

  const selectedSomeUsers = selectedItems.length > 0 && selectedItems.length < result.length;
  const selectedAllUsers = selectedItems.length === result.length;
  const selectedBulkActions = selectedItems.length > 0;
  const subjectListLength = subjectList?.length;

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
  };
  const handleSelectOneUser = (_event, row) => {
    if (selectedItems.findIndex((i) => i.id == row.id) == -1) {
      setSelectedItems((prevSelected) => [...prevSelected, row]);
    } else {
      setSelectedItems((prevSelected) => prevSelected.filter((i) => i.id !== row.id));
    }
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
      axios
        .get(`/api/grade?academic_year_id=${academicYear?.id}`)
        .then((res) => setGrade(res.data))
        .catch((err) => console.log(err));

      setSelectedExam(null);
    }
  }, [selectedSection, academicYear, user]);

  const handleSearchResult = () => {
    axios
      .get(`/api/result/?section_id=${selectedSection.id}&exam_id=${selectedExam.id}`)
      .then((res) => {
        // console.log(res.data);
        setHighestMarks(res.data.highestMark);
        setSubjectList(
          res.data.subject_list.exam_details.map((i) => {
            return {
              exam_details_id: i.id,
              name: i.subject.name,
              id: i.subject.id,
              subject_total: i.subject_total
            };
          })
        );
        setResult(res.data.sections_result);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    setResult([]);
    setSubjectList(null);
    setSelectedItems([]);
    setSelectedTempleate(null);
  }, [selectClasses, selectedSection, selectedExam]);

  const handleSelectAllUsers = (event): void => {
    setSelectedItems(event.target.checked ? result : []);
  };

  const subjectListLenghth: number = subjectList?.length;
  return (
    <>
      <Head>
        <title>Report card section</title>
      </Head>

      <PageTitleWrapper>
        <PageHeader title={'Report card section'} />
      </PageTitleWrapper>

      <Grid justifyContent="center" alignItems="stretch" spacing={3} sx={{ px: { xs: 2, sm: 4 } }}>
        <Grid item xs={12}>
          <Card sx={{ p: 1, pb: 0, mb: 3, display: 'grid', gridTemplateColumns: { md: '1fr 1fr 1fr 1fr 1fr' }, columnGap: 1 }}>
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
              <AutoCompleteWrapper
                label="Select Templeate"
                placeholder="Templeate..."
                options={['Default', 'New given']}
                value={selectedTempleate}
                filterSelectedOptions
                handleChange={(e, v) => {
                  setSelectedTempleate(v);
                }}
              />
            )}
            {selectedTempleate && selectedBulkActions && (
              <ReactToPrint
                content={() => reportCardPrint.current}
                // pageStyle={`{ size: 2.5in 4in }`}
                trigger={() => (
                  <ButtonWrapper
                    startIcon={<LocalPrintshopIcon />}
                    handleClick={() => {
                      console.log('selectedItems__', selectedItems);

                      showNotification('Not possible for now !', 'error');
                    }}
                  >
                    {t('print')}
                  </ButtonWrapper>
                )}
                // pageStyle="@page { size: A4; }"
                pageStyle={
                  selectedTempleate == 'default' ? `@page { size: landscape; } .printable-item { page-break-after: always; }` : '@page { size: A4; }'
                }
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
            <TableContainer>
              <Table aria-label="collapsible table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedAllUsers} indeterminate={selectedSomeUsers} onChange={handleSelectAllUsers} />
                    </TableCell>
                    <TableCell>{t('Class roll')}</TableCell>
                    <TableCell>{t('Total marks obtained')}</TableCell>
                    <TableCell>{t('GPA')}</TableCell>
                    <TableCell>{t('Grade')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedResults?.map((row) => {
                    const isUserSelected = selectedItems.findIndex((i) => i.id == row.id) > -1;
                    return (
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox checked={isUserSelected} onChange={(event) => handleSelectOneUser(event, row)} value={isUserSelected} />
                        </TableCell>

                        <TableCell component="th" scope="row">
                          {row?.student?.class_roll_no}
                        </TableCell>
                        <TableCell>{row?.total_marks_obtained?.toFixed(2)}</TableCell>
                        <TableCell>{(row?.calculated_point).toFixed(2)}</TableCell>
                        <TableCell>{row?.calculated_grade}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Grid>

      {/* print report Card */}
      <Grid
        sx={{
          display: 'none'
        }}
      >
        <Grid ref={reportCardPrint}>
          {selectedTempleate &&
            (selectedTempleate == 'Default' ? (
              <>
                {/* Your content here */}
                {selectedItems?.map((i) => {
                  const resultDetailsLength = i?.result_details?.length;
                  return (
                    <Grid
                      key={i.id}
                      sx={{
                        position: 'relative'
                      }}
                    >
                      <Image
                        src="/mram.png"
                        alt="Watermark"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          zIndex: 1,
                          opacity: 0.2,
                          objectFit: 'contain'
                        }}
                        height={100}
                        width={100}
                      />

                      <Grid
                        sx={{
                          zIndex: 2
                        }}
                      >
                        <Grid
                          sx={{
                            p: '15px',
                            pageBreakAfter: 'always'
                          }}
                        >
                          <Grid
                            container
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '80% 20%',
                              pb: 2
                            }}
                          >
                            <Grid
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: '10% 90%',
                                alignItems: 'center',
                                px: '5%',
                                gap: 1
                              }}
                            >
                              <Grid
                                sx={{
                                  maxWidth: '80px'
                                }}
                              >
                                <Image
                                  width={200}
                                  height={300}
                                  alt="student_photo"
                                  loading="eager"
                                  src={i?.student?.student_photo ? getFile(i?.student?.student_photo) : '/dumy_student.png'}
                                />
                              </Grid>

                              <Grid
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 2
                                }}
                              >
                                <Grid
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '5%'
                                  }}
                                >
                                  <Grid
                                    sx={{
                                      maxWidth: '10em'
                                    }}
                                  >
                                    <img src="/mram.png" alt="logo" />
                                  </Grid>
                                  <Grid
                                    sx={{
                                      textAlign: 'center'
                                    }}
                                  >
                                    <Typography variant="h1" gutterBottom>
                                      {user?.school?.name}
                                    </Typography>
                                    <Typography variant="h5" gutterBottom>
                                      {user?.school?.address},{user?.school?.phone}
                                    </Typography>
                                    <Typography variant="h4" gutterBottom>
                                      {selectedExam?.label} (Academic) {academicYear?.label}
                                    </Typography>
                                    <Chip label="Report - Card" color="info" />
                                  </Grid>
                                </Grid>

                                <Grid
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    gap: 4
                                  }}
                                >
                                  <Grid>
                                    <Typography variant="h5" gutterBottom>
                                      Name: {i?.student?.student_info?.first_name} {i?.student?.student_info?.middle_name}{' '}
                                      {i?.student?.student_info?.last_name}
                                    </Typography>
                                    {i?.student?.group?.title && (
                                      <Typography variant="h5" gutterBottom>
                                        Group: {i?.student?.group?.title}
                                      </Typography>
                                    )}
                                  </Grid>
                                  <Grid>
                                    <Typography variant="h5" gutterBottom>
                                      Class: {i?.student?.section?.class?.name}
                                    </Typography>
                                    <Typography variant="h5" gutterBottom>
                                      Section: {i?.student?.section?.name}
                                    </Typography>
                                  </Grid>
                                  <Grid>
                                    <Typography variant="h5" gutterBottom>
                                      Class registration no: {i?.student?.class_registration_no}
                                    </Typography>
                                    <Typography variant="h5" gutterBottom>
                                      Class Roll no: {i?.student?.class_roll_no}
                                    </Typography>
                                    <Typography variant="h5" gutterBottom>
                                      Gender: {i?.student?.student_info?.gender}
                                    </Typography>
                                    <Typography variant="h5" gutterBottom>
                                      Date of birth: {dayjs(i?.student?.student_info?.date_of_birth).format('YYYY-MM-DD')}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid
                              sx={{
                                height: 'auto'
                              }}
                            >
                              <Table size="small">
                                <thead>
                                  <tr>
                                    <td colSpan={3} style={gradeTableStyle}>
                                      Grading Scale
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={gradeTableStyle}>Marks</td>
                                    <td style={gradeTableStyle}>Grade</td>
                                    <td style={gradeTableStyle}>Point</td>
                                  </tr>
                                </thead>
                                <tbody>
                                  {grade?.map((i) => (
                                    <tr>
                                      <td style={gradeTableStyle}>
                                        {i?.lower_mark} - {i?.upper_mark}
                                      </td>
                                      <td style={gradeTableStyle}>{i?.grade}</td>
                                      <td style={gradeTableStyle}>{i?.point}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </Grid>
                          </Grid>

                          <Grid
                            item
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              height: 'auto'
                            }}
                          >
                            <Table
                              sx={{
                                width: '97.5%',
                                p: 2
                              }}
                              size="small"
                            >
                              <thead>
                                <tr>
                                  <th style={tableStyle}>Subject</th>
                                  <th style={tableStyle}>Subject Obtain Marks</th>
                                  <th style={tableStyle}>Subject Total Marks</th>
                                  <th style={tableStyle}>Grade </th>
                                  <th style={tableStyle}>point</th>
                                  <th style={tableStyle}>Remark </th>
                                </tr>
                              </thead>
                              <tbody
                                style={{
                                  overflowX: 'auto',
                                  overflowY: 'auto'
                                }}
                              >
                                {subjectList?.map((j) => {
                                  const found = i?.result_details?.find((a) => a?.exam_details?.subject?.id == j.id);

                                  if (found) {
                                    return (
                                      <tr>
                                        <td style={tableStyle}>{found?.exam_details?.subject?.name}</td>
                                        <td style={tableStyle}>{found?.mark_obtained}</td>
                                        <td style={tableStyle}>{found?.exam_details?.subject_total}</td>
                                        <td style={tableStyle}>{found?.grade?.grade}</td>
                                        <td style={tableStyle}>{found?.grade?.point}</td>
                                        <td style={tableStyle}>{found?.remark}</td>
                                      </tr>
                                    );
                                  } else {
                                    return (
                                      <tr>
                                        <td style={tableStyle}>{j?.name}</td>
                                        <td style={tableStyle}>{j?.subject_total}</td>
                                        <td style={tableStyle}>not inserted</td>
                                        <td style={tableStyle}>not inserted</td>
                                        <td style={tableStyle}>not inserted</td>
                                        <td style={tableStyle}></td>
                                      </tr>
                                    );
                                  }
                                })}
                              </tbody>
                            </Table>
                          </Grid>

                          <Grid
                            sx={{
                              p: 1
                            }}
                          >
                            <Table
                              sx={{
                                width: '40vh',
                                paddingLeft: 5
                              }}
                              size="small"
                            >
                              <thead>
                                <tr>
                                  <th style={tableStyle}>GPA</th>
                                  <th style={tableStyle}>
                                    {subjectListLength === resultDetailsLength ? i?.calculated_point?.toFixed(2) : 'not inserted'}
                                  </th>
                                </tr>
                                <tr>
                                  <th style={tableStyle}>Grand Total marks</th>
                                  <th style={tableStyle}>
                                    {subjectListLength === resultDetailsLength ? i?.total_marks_obtained?.toFixed(2) : 'not inserted'}
                                  </th>
                                </tr>
                                <tr>
                                  <th style={tableStyle}>Result</th>
                                  <th style={tableStyle}>{subjectListLength === resultDetailsLength ? i?.calculated_grade : 'not inserted'}</th>
                                </tr>
                              </thead>
                            </Table>
                          </Grid>

                          <Grid
                            container
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
                            }}
                          >
                            <Grid
                              sx={{
                                px: 2
                              }}
                            >
                              <Table size="small">
                                <thead>
                                  <tr>
                                    <td colSpan={2} style={{ ...tableStyle, fontWeight: 'bold' }}>
                                      Attendence
                                    </td>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td style={{ ...tableStyle, fontWeight: 'bold' }}>No. of working days</td>
                                    <td style={tableStyle}>0</td>
                                  </tr>
                                  <tr>
                                    <td style={{ ...tableStyle, fontWeight: 'bold' }}>No. of days attended</td>
                                    <td style={tableStyle}>0</td>
                                  </tr>
                                  <tr>
                                    <td style={{ ...tableStyle, fontWeight: 'bold' }}>Attended percentage</td>
                                    <td style={tableStyle}>0.00%</td>
                                  </tr>
                                </tbody>
                              </Table>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                })}
              </>
            ) : (
              <>
                {/* <ReportCardDesign /> */}

                {selectedItems?.map((i) => {
                  return (
                    <Grid
                      sx={{
                        height: 'auto',
                        p: 2,
                        pageBreakAfter: 'always'
                      }}
                    >
                      {/* header */}
                      <Grid
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '5%',
                          pb: 1
                        }}
                      >
                        <Grid
                          sx={{
                            maxWidth: '10em'
                          }}
                        >
                          <img src="/mram.png" alt="logo" />
                        </Grid>
                        <Grid
                          sx={{
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="h1" gutterBottom>
                            {user?.school?.name}
                          </Typography>
                          <Typography variant="h5" gutterBottom>
                            {user?.school?.address},{user?.school?.phone}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid display={'grid'} gridTemplateColumns={'auto 30%'} gap={2}>
                        {/* student info  */}
                        <Table size="small">
                          <thead>
                            <tr>
                              <td style={{ ...gradeTableStyle, width: '50%' }}>ছাত্র-ছাত্রীর নাম</td>
                              <td colSpan={3} style={{ ...gradeTableStyle, width: '50%' }}>
                                {[
                                  i?.student?.student_info?.first_name,
                                  i?.student?.student_info?.middle_name,
                                  i?.student?.student_info?.last_name
                                ].join(' ')}
                              </td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={gradeTableStyle}>পিতার নাম</td>
                              <td style={gradeTableStyle}>{i?.student?.student_info?.father_name}</td>
                            </tr>
                            <tr>
                              <td style={gradeTableStyle}>মাতার নাম</td>
                              <td style={gradeTableStyle}>{i?.student?.student_info?.mother_name || ''}</td>
                            </tr>
                            <tr>
                              <td style={gradeTableStyle}>শ্রেনী</td>
                              <td style={gradeTableStyle}>{i?.student?.section?.class?.name}</td>
                            </tr>
                            <tr>
                              <td style={gradeTableStyle}>রোল</td>
                              <td style={gradeTableStyle}>{i?.student?.class_roll_no}</td>
                            </tr>
                            <tr>
                              <td style={gradeTableStyle}>শাখা</td>
                              <td style={gradeTableStyle}>{i?.student?.section?.name}</td>
                            </tr>
                          </tbody>
                        </Table>
                        {/* Grading */}
                        <Table size="small">
                          <thead>
                            <tr>
                              <td colSpan={3} style={gradeTableStyle}>
                                Grading Scale
                              </td>
                            </tr>
                            <tr>
                              <td style={gradeTableStyle}>Marks</td>
                              <td style={gradeTableStyle}>Grade</td>
                              <td style={gradeTableStyle}>Point</td>
                            </tr>
                          </thead>
                          <tbody>
                            {grade?.map((i) => (
                              <tr>
                                <td style={gradeTableStyle}>
                                  {i?.lower_mark} - {i?.upper_mark}
                                </td>
                                <td style={gradeTableStyle}>{i?.grade}</td>
                                <td style={gradeTableStyle}>{i?.point}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Grid>

                      <Typography variant="h4" align="center" gutterBottom py={1}>
                        {selectedExam?.label} (Academic) {academicYear?.label}
                      </Typography>

                      <Grid
                        item
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          height: 'auto'
                        }}
                      >
                        <Table size="small">
                          <tbody
                            style={{
                              overflowX: 'auto',
                              overflowY: 'auto'
                            }}
                          >
                            <tr>
                              <th style={tableStyle}>বিষয়ের নাম</th>
                              <th style={tableStyle}>মোট নম্বর</th>
                              <th style={tableStyle}>প্রাপ্ত নম্বর</th>
                              <th style={tableStyle}>গ্রেড </th>
                              <th style={tableStyle}>জিপিএ</th>
                              <th style={tableStyle}>সর্বোচ্চ নম্বর</th>
                              <th style={tableStyle}>মোট প্রাপ্ত নম্বর</th>
                              <th style={tableStyle}>গ্রেড</th>
                              <th style={tableStyle}>গড় জিপিএ</th>
                            </tr>
                            {subjectList?.map((j, index) => {
                              const found = i?.result_details?.find((a) => a?.exam_details?.subject?.id == j.id);
                              const highest = highestMarks?.find((hi) => hi.exam_details_id == j.exam_details_id)?._max?.mark_obtained;
                              const subjectTableStyle = { ...tableStyle, maxWidth: '30px', padding: '3px' };
                              if (found) {
                                return (
                                  <tr>
                                    <td style={subjectTableStyle}>{found?.exam_details?.subject?.name}</td>
                                    <td style={subjectTableStyle}>{found?.exam_details?.subject_total}</td>
                                    <td style={subjectTableStyle}>{found?.mark_obtained}</td>
                                    <td style={subjectTableStyle}>{found?.grade?.grade}</td>
                                    <td style={subjectTableStyle}>{found?.grade?.point}</td>
                                    <td style={subjectTableStyle}>{highest}</td>
                                    {index == 0 && (
                                      <>
                                        <td rowSpan={subjectListLenghth + 5} style={subjectTableStyle}>
                                          {i?.total_marks_obtained?.toFixed(2)}
                                        </td>
                                        <td rowSpan={subjectListLenghth + 5} style={subjectTableStyle}>
                                          {i?.calculated_grade}
                                        </td>
                                        <td rowSpan={subjectListLenghth + 5} style={subjectTableStyle}>
                                          {i?.calculated_point?.toFixed(2)}
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                );
                              } else {
                                return (
                                  <tr>
                                    <td style={subjectTableStyle}>{j?.name}</td>
                                    <td style={subjectTableStyle}>{j?.subject_total}</td>
                                    <td style={subjectTableStyle}>not given</td>
                                    <td style={subjectTableStyle}>not given</td>
                                    <td style={subjectTableStyle}>not given</td>
                                    <td style={subjectTableStyle}>{highest}</td>
                                    {index == 0 && (
                                      <>
                                        <td rowSpan={subjectListLenghth + 5} style={subjectTableStyle}></td>
                                        <td rowSpan={subjectListLenghth + 5} style={subjectTableStyle}></td>
                                        <td rowSpan={subjectListLenghth + 5} style={subjectTableStyle}></td>
                                      </>
                                    )}
                                  </tr>
                                );
                              }
                            })}

                            <tr>
                              <td style={tableStyle}>মৌখিক পরীক্ষা</td>
                              {sixElementArray}
                            </tr>
                            <tr>
                              <td style={tableStyle}>প্রথম মাসিক পরীক্ষায় প্রাপ্ত নম্বর</td>
                              {sixElementArray}
                            </tr>
                            <tr>
                              <td style={tableStyle}>দ্বিতীয় মাসিক পরীক্ষায় প্রাপ্ত নম্বর</td>
                              {sixElementArray}
                            </tr>
                            <tr>
                              <td style={tableStyle}>উপস্থিতি (১০নম্বর/মাস) </td>
                              {sixElementArray}
                            </tr>
                            <tr>
                              <td style={tableStyle}>বেতন মাসিক পরীক্ষার পূর্বে দিলে(১০নম্বর/মাস) </td>
                              {sixElementArray}
                            </tr>
                          </tbody>
                        </Table>
                        <br />
                        <Table size="small">
                          <tbody
                            style={{
                              overflowX: 'auto',
                              overflowY: 'auto'
                            }}
                          >
                            <tr>
                              <th rowSpan={5} style={{ ...tableStyle, transform: 'rotate(-90deg)' }}>
                                মন্তব্য
                              </th>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>
                                *&nbsp;&nbsp;&nbsp;&nbsp;পড়ালেখা উন্নয়নের জন্য চেষ্টা করছে।{' '}
                              </td>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>
                                *&nbsp;&nbsp;&nbsp;&nbsp;সম্পূর্ণ ক্লাস ব্যাপী মনোযোগ ধরে রাখতে পারে না।{' '}
                              </td>
                              <th style={{ ...tableStyle, textAlign: 'left' }}>অবস্থান </th>
                              <th style={{ ...tableStyle, textAlign: 'left' }}>পূর্ববর্তী পরীক্ষায় অবস্থান </th>
                            </tr>
                            <tr>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>
                                *&nbsp;&nbsp;&nbsp;&nbsp;পড়ালেখার উন্নতি দৃশ্যমান।
                              </td>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>
                                *&nbsp;&nbsp;&nbsp;&nbsp;হাতের লেখা আরও ভাল করতে হবে।
                              </td>
                              <td rowSpan={4} style={tableStyle}></td>
                              <td rowSpan={4} style={tableStyle}></td>
                            </tr>
                            <tr>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>
                                *&nbsp;&nbsp;&nbsp;&nbsp;নিয়মিত স্কুলের পোষাক পরিধান করে না।
                              </td>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>*&nbsp;&nbsp;&nbsp;&nbsp;নিয়মিত পড়া শিখে আসে না।</td>
                            </tr>
                            <tr>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>
                                *&nbsp;&nbsp;&nbsp;&nbsp;নিয়মিত বাড়ির কাজ করে না।
                              </td>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>
                                *&nbsp;&nbsp;&nbsp;&nbsp;সময়মত ক্লাসে উপস্থিত হয় না।
                              </td>
                            </tr>
                            <tr>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>
                                *&nbsp;&nbsp;&nbsp;&nbsp;নিয়মিত হাতের লেখা লেখে আনে না।
                              </td>
                              <td style={{ ...tableStyle, textAlign: 'left', fontSize: '11px' }}>*&nbsp;&nbsp;&nbsp;&nbsp;নিয়মিত কোচিং এ আসে না।</td>
                            </tr>

                            <tr>
                              <th style={tableStyle}>স্বাক্ষর এবং তারিখ</th>
                              <th style={tableStyle}>ফলাফল প্রস্তুতকারক</th>
                              <th style={tableStyle}>পরীক্ষা নিয়ন্ত্রক</th>
                              <th colSpan={2} style={tableStyle}>
                                ফলাফল প্রকাশের তারিখ
                              </th>
                            </tr>
                            <tr>
                              <td rowSpan={2} style={{ ...tableStyle, height: '55px' }}></td>
                              <td rowSpan={2} style={{ ...tableStyle, height: '55px' }}></td>
                              <td rowSpan={2} style={{ ...tableStyle, height: '55px' }}></td>
                              <td rowSpan={2} colSpan={2} style={{ ...tableStyle, height: '55px' }}></td>
                            </tr>

                            <tr></tr>
                          </tbody>
                        </Table>
                      </Grid>
                    </Grid>
                  );
                })}
              </>
            ))}
        </Grid>
      </Grid>

      <br />

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
