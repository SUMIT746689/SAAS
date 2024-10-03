import PropTypes from 'prop-types';
import {
  Autocomplete,
  Box,
  Card,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  Button,
  Avatar
} from '@mui/material';

import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { AutoCompleteWrapper, EmptyAutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { ButtonWrapper, DisableButtonWrapper } from '@/components/ButtonWrapper';
import { BasicPdfExport } from '@/components/Export/Pdf';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import dayjs from 'dayjs';
import { TableEmptyWrapper } from '@/components/TableWrapper';

const ExamResults = () => {
  const { t }: { t: any } = useTranslation();
  const [routine, setRoutine] = useState(null);
  const [slotHeader, setSlotHeader] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedExam, setselectedExam] = useState(null);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const { user } = useAuth();
  const routineRef = useRef();
  useEffect(() => {
    axios
      .get(`/api/class?school_id=${user?.school_id}`)
      .then((res) => setClasses(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (selectedSection) {
      axios
        .get(`/api/exam/exam-list?academic_year=${academicYear?.id}&section_id=${selectedSection.id}`)
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
    }
  }, [selectedSection]);

  const handleClassSelect = (e, value) => {
    setSelectedClass(value);
    setSelectedSection(null);
    setselectedExam(null);
    setExams(() => []);
    if (value) {
      const selectedClass = classes.find((i) => i.id == value?.id);
      if (selectedClass) {
        if (selectedClass.has_section) {
          setSections(
            selectedClass?.sections?.map((j) => {
              return { label: j.name, id: j.id };
            })
          );
        } else {
          setSelectedSection({ label: selectedClass?.sections[0]?.name, id: selectedClass?.sections[0]?.id });
        }
      }
    }
  };

  const handleSectionSelect = (e, value) => {
    setselectedExam(null);

    setSelectedSection(value);
  };

  const handleRoutineGenerate = () => {
    if (selectedSection && selectedExam) {
      axios
        .get(`/api/routine/exam?section_id=${selectedSection?.id}&exam_id=${selectedExam.id}&academic_year_id=${academicYear?.id}`)
        .then((res) => {
          setRoutine(res.data);
        })
        .catch((err) => console.log(err));
    }
  };
  return (
    <>
      <Card
        sx={{
          maxWidth: 900,
          mx: 'auto',
          pt: 1,
          px: 1,
          my: 1,
          display: 'grid',
          gridTemplateColumns: { sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr min-content' },
          gap: { sm: 1 }
        }}
      >
        <Grid>
          <AutoCompleteWrapper
            value={selectedClass}
            label="Select Class"
            placeholder="Select class..."
            handleChange={handleClassSelect}
            options={classes?.map((i) => ({ label: i.name, value: i.id, id: i.id, has_section: i.has_section }))}
          />
        </Grid>
        <Grid>
          {selectedClass && selectedClass.has_section ? (
            <AutoCompleteWrapper
              label="Select Batch"
              placeholder="select a batch..."
              value={selectedSection}
              options={sections}
              handleChange={handleSectionSelect}
            />
          ) : (
            <EmptyAutoCompleteWrapper label="Select Batch" placeholder="select a batch..." value={undefined} options={[]} />
          )}
        </Grid>
        <Grid>
          <AutoCompleteWrapper
            label="Select Exam"
            placeholder="Select section..."
            value={selectedExam}
            options={exams}
            handleChange={(e, value) => setselectedExam(value)}
          />
        </Grid>
        <Grid>
          {selectedExam ? <ButtonWrapper handleClick={handleRoutineGenerate}>Find</ButtonWrapper> : <DisableButtonWrapper>Find</DisableButtonWrapper>}
        </Grid>
        <Grid item className="w-full">
          {routine && <BasicPdfExport ref={routineRef} />}
        </Grid>
      </Card>

      <Card sx={{ minHeight: '85%' }}>
        <Divider />

        <>
          {routine ? (
            <Grid ref={routineRef} sx={{ p: 1 }}>
              <Grid container pt={4} spacing={2} justifyContent={'space-between'} px={7}>
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
                    Exam Title : {selectedExam?.label}, Class : {selectedClass?.label}, Section :{' '}
                    {selectedClass?.has_section ? selectedSection?.label : 'no section'}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h4">Exam Routine</Typography>
                </Grid>
              </Grid>

              <TableContainer sx={{ p: 1 }}>
                <Table size="small">
                  <TableHead
                    sx={{
                      border: '1px solid darkgrey',
                      borderCollapse: 'collapse'
                    }}
                  >
                    <TableRow>
                      <TableCell
                        sx={{
                          border: '1px solid darkgrey',
                          borderCollapse: 'collapse',
                          fontSize: '11px',
                          px: 1,
                          py: 0.5
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{
                          border: '1px solid darkgrey',
                          borderCollapse: 'collapse',
                          fontSize: '11px',
                          px: 1,
                          py: 0.5
                        }}
                      >
                        Time Slot
                      </TableCell>
                      <TableCell
                        sx={{
                          border: '1px solid darkgrey',
                          borderCollapse: 'collapse',
                          fontSize: '11px',
                          px: 1,
                          py: 0.5
                        }}
                      >
                        Room
                      </TableCell>

                      <TableCell
                        sx={{
                          border: '1px solid darkgrey',
                          borderCollapse: 'collapse',
                          fontSize: '11px',
                          px: 1,
                          py: 0.5
                        }}
                      >
                        Subject Name
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routine?.exam_details?.map((i) => {
                      return (
                        <TableRow hover key={i.id}>
                          <TableCell
                            sx={{
                              border: '1px solid darkgrey',
                              borderCollapse: 'collapse',
                              px: 1,
                              py: 0.5
                            }}
                          >
                            <Typography sx={{ fontSize: '11px' }}>{dayjs(i?.exam_date).format('DD-MM-YYYY')}</Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              border: '1px solid darkgrey',
                              borderCollapse: 'collapse',
                              px: 1,
                              py: 0.5
                            }}
                          >
                            <Typography sx={{ fontSize: '11px' }}>{dayjs(i?.exam_date).format('h:m A')}</Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              border: '1px solid darkgrey',
                              borderCollapse: 'collapse',
                              px: 1,
                              py: 0.5
                            }}
                          >
                            <Typography sx={{ fontSize: '11px' }}>{i?.exam_room?.map((j) => j?.name)?.join(', ')}</Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              border: '1px solid darkgrey',
                              borderCollapse: 'collapse',
                              px: 1,
                              py: 0.5
                            }}
                          >
                            <Typography sx={{ fontSize: '11px' }}>{i?.subject?.name}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          ) : (
            <TableEmptyWrapper title="exam routine" />
          )}
        </>
      </Card>
    </>
  );
};

ExamResults.propTypes = {
  schools: PropTypes.array.isRequired
};

ExamResults.defaultProps = {
  schools: []
};

export default ExamResults;
