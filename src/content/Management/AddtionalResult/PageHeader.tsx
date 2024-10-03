import { useContext, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import 'react-quill/dist/quill.snow.css';
import { Grid, Dialog, DialogTitle, DialogContent, Typography, useTheme, Button } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { FileUploadFieldWrapper, TextFieldWrapper, UncontrolledTextFieldWrapper } from '@/components/TextFields';
import { AutoCompleteWrapper, EmptyAutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import { ButtonWrapper } from '@/components/ButtonWrapper';

function PageHeader({
  editExam,
  setEditExam,
  classes,
  selectClasses,
  setSelectClasses,
  setSelectedSection,
  setStudentList,
  setExams,
  setSections,
  sections,
  studentList,
  exams,
  examAddtionalMarkingList,
  setExamAddtionalMarkingList,
  selectedExam,
  selectedSection,
  setSelectedExam,
  setSelectedStudent,
  selectedStudent,
  selectedExamSubject,
  setSelectedExamSubject
}): any {
  const { t }: { t: any } = useTranslation();
  const [openSingle, setOpenSingle] = useState(false);
  const [openSubjectBulk, setOpenSubjectBulk] = useState(false);
  const { showNotification } = useNotistick();
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);

  const theme = useTheme();

  const handleSingleOpen = () => {
    setOpenSingle(true);
  };

  const handleCreateProjectClose = () => {
    setOpenSingle(false);
    setEditExam(null);
  };

  const handleSubjectBulkClose = () => {
    setOpenSubjectBulk(false);
  };

  const handleCreateProjectSuccess = (msg) => {
    showNotification(msg);
    setOpenSingle(false);
  };

  const handleErrorSnackbar = (err) => {
    showNotification(err.message, 'error');
  };
  const handleClassSelect = (event, newValue) => {
    setSelectClasses(newValue);
    if (newValue) {
      axios
        .get(`/api/class/${newValue.id}`)
        .then((res) => {
          setSections(
            res.data?.sections?.map((i) => {
              return {
                label: i.name,
                id: i.id
              };
            })
          );
        })
        .catch((err) => console.log(err));
    }
  };

  const handleExamSelect = (e, newvalue, setFieldValue, setSelectedExam) => {
    setSelectedExam(newvalue);
    if (newvalue) {
      setFieldValue('exam_id', newvalue.id);
      axios
        .get(`/api/exam/addtional_marks?exam_id=${newvalue.id}`)
        .then(({ data }) => {
          console.log({ data });

          setExamAddtionalMarkingList(
            data?.map((i) => {
              return {
                label: i.addtionalMarkingCategorie?.title,
                id: i.id,
                subject_total: i.total_mark
              };
            })
          );
        })
        .catch((err) => console.log(err));
    } else {
      setFieldValue('exam_id', null);
    }
  };

  const handleSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {
      const successProcess = () => {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateProjectSuccess('A new result has been created successfully');
        setSelectedSection(null);
        setStudentList(null);
        setExams(null);
        handleCreateProjectClose();
      };

      const query = {
        student_id: _values.student_id,
        exam_id: _values.exam_id,
        exam_details_id: _values.exam_details_id,
        mark_obtained: _values.mark_obtained,
        academic_year_id: academicYear.id,
        subject_total: _values.subject_total
      };

      if (editExam) {
        axios
          .put(`/api/result`, query)
          .then((res) => successProcess())
          .catch((err) => {
            handleErrorSnackbar(err);
          });
      } else {
        const res = await axios.post('/api/result/addtional_results', query);

        if (res.data?.success) successProcess();
        // @ts-ignore
        else throw new Error(`${res?.response?.data?.message}`);
      }
    } catch (err) {
      showNotification(err?.response?.data?.message, 'error');
      console.error('err', err?.response?.data?.message);
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };
  const handleSubjectBulkSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {
      const successProcess = () => {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        setSelectedSection(null);
        setStudentList(null);
        setExams(null);
        handleCreateProjectClose();
      };

      if (!_values.bulkExamMark) {
        throw new Error('Bulk Exam Mark excel file is required');
      }

      const formDate = new FormData();
      formDate.append('exam_id', _values.exam_id);
      formDate.append('exam_details_id', _values.exam_details_id);
      formDate.append('academic_year_id', academicYear.id);
      formDate.append('bulkExamMark', _values.bulkExamMark);

      const res = await axios.post('/api/result/subjectwise-bulk', formDate);

      if (res.data?.success) {
        successProcess();
        handleCreateProjectSuccess(res.data?.message);
      } else {
        // @ts-ignore
        throw new Error(`${res?.response?.data?.message}`);
      }
    } catch (err) {
      showNotification(err?.response?.data?.message, 'error');
      console.error('err', err?.response?.data?.message);
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeaderTitleWrapper
        name="Addtional Mark Entry"
        handleCreateClassOpen={undefined}
        actionButton={
          <Grid>
            <ButtonWrapper handleClick={handleSingleOpen} startIcon={<AddTwoToneIcon fontSize="small" />}>
              {t('Single Addtional Result Entry')}
            </ButtonWrapper>
          </Grid>
          // <Grid item width="100%" display={'grid'} columnGap={1} gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} py={2}>

          //   <Grid item>
          //     <ButtonWrapper
          //       handleClick={undefined}
          //       href={`/bulkExamMark.xlsx`}
          //     >
          //       Download Subject wise Bulk Excel format
          //     </ButtonWrapper>
          //   </Grid>

          //   <Grid>
          //     <ButtonWrapper
          //       handleClick={handleSingleOpen}
          //       startIcon={<AddTwoToneIcon fontSize="small" />}
          //     >
          //       {t('Single Addtional Result Entry')}
          //     </ButtonWrapper>
          //   </Grid>
          //   <Grid>
          //     <ButtonWrapper
          //       handleClick={() => setOpenSubjectBulk(true)}
          //       startIcon={<AddTwoToneIcon fontSize="small" />}
          //     >
          //       {t('Subject wise Bulk Result Entry')}
          //     </ButtonWrapper>
          //   </Grid>

          //   <Grid>

          //     <ButtonWrapper
          //       handleClick={handleSingleOpen}
          //       startIcon={<AddTwoToneIcon fontSize="small" />}
          //     >
          //       {t('Full term bulk Entry')}
          //     </ButtonWrapper>
          //   </Grid>

          // </Grid>
        }
      />
      {/* Single Result Entry */}
      <Dialog fullWidth maxWidth="sm" open={openSingle} onClose={handleCreateProjectClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t(`${editExam ? 'Edit Result mark entry' : 'Single Result entry'}`)}
          </Typography>
          <Typography variant="subtitle2">{t('Use this dialog window to Result mark entry')}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            student_id: selectedStudent?.id || undefined,
            exam_id: selectedExam?.id || undefined,
            exam_details_id: selectedExamSubject?.id || undefined,
            mark_obtained: undefined,
            subject_total: selectedExamSubject?.subject_total || undefined,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            student_id: Yup.number().required(t('The student field is required')).nullable(false),
            exam_id: Yup.number().required(t('The exam field is required')).nullable(false),
            exam_details_id: Yup.number().required(t('The exam addtional mark field is required')).nullable(false),
            mark_obtained: Yup.number().required(t('The mark obtained field is required')).nullable(false),
            subject_total: Yup.number().required(t('The subject total field is required')).nullable(false)
          })}
          onSubmit={handleSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent
                dividers
                sx={{
                  p: 3
                }}
              >
                <Grid container spacing={0}>
                  {/* select class */}
                  <AutoCompleteWrapper
                    minWidth="100%"
                    label={t('Select class')}
                    placeholder="select a class ..."
                    options={classes?.map((i) => ({
                      label: i.name,
                      id: i.id,
                      has_section: i.has_section
                    }))}
                    value={selectClasses}
                    filterSelectedOptions
                    handleChange={handleClassSelect}
                  />

                  {
                    // select section
                    sections ? (
                      <AutoCompleteWrapper
                        minWidth="100%"
                        label="Section"
                        placeholder="select a section..."
                        value={selectedSection}
                        options={sections}
                        filterSelectedOptions
                        handleChange={(e, v) => setSelectedSection(v)}
                      />
                    ) : (
                      <EmptyAutoCompleteWrapper minWidth="100%" label="Section" placeholder="select a section..." options={[]} value={undefined} />
                    )
                  }

                  {studentList ? (
                    <>
                      <AutoCompleteWrapper
                        minWidth="100%"
                        label="Select Student By Roll"
                        placeholder="select a student by roll number ..."
                        options={studentList}
                        value={selectedStudent}
                        filterSelectedOptions
                        handleChange={(e, v) => {
                          setSelectedStudent(v);
                          if (v) setFieldValue('student_id', v.id);
                        }}
                      />
                    </>
                  ) : (
                    <EmptyAutoCompleteWrapper
                      minWidth="100%"
                      label="Select Student By Roll"
                      placeholder="select a student by roll number ..."
                      options={[]}
                      value={undefined}
                    />
                  )}

                  {/* exam select */}
                  {exams ? (
                    <>
                      <AutoCompleteWrapper
                        label="Select Exam"
                        placeholder="select a exam..."
                        minWidth="100%"
                        value={selectedExam}
                        options={exams}
                        filterSelectedOptions
                        handleChange={(e, v) => handleExamSelect(e, v, setFieldValue, setSelectedExam)}
                      />
                    </>
                  ) : (
                    <EmptyAutoCompleteWrapper label="Select Exam" placeholder="select a exam..." minWidth="100%" value={undefined} options={[]} />
                  )}
                  {examAddtionalMarkingList ? (
                    <>
                      <AutoCompleteWrapper
                        minWidth="100%"
                        label="Select Exam subject"
                        placeholder="select exam subject..."
                        options={examAddtionalMarkingList}
                        value={selectedExamSubject}
                        filterSelectedOptions
                        handleChange={(e, v) => {
                          setSelectedExamSubject(v);
                          if (v) {
                            setFieldValue('subject_total', v.subject_total);
                            setFieldValue('exam_details_id', v.id);
                          } else {
                            setFieldValue('exam_details_id', null);
                          }
                        }}
                      />

                      {/* obtain mark */}

                      <TextFieldWrapper
                        name="mark_obtained"
                        label={t('Mark Obtained ')}
                        // placeholder={t('Mark obtained here...')}
                        errors={errors.mark_obtained}
                        touched={touched.mark_obtained}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.mark_obtained}
                        type="number"
                      />
                    </>
                  ) : (
                    <>
                      <EmptyAutoCompleteWrapper
                        minWidth="100%"
                        label="Select Exam subject"
                        placeholder="select exam subject..."
                        options={[]}
                        value={undefined}
                      />
                      <UncontrolledTextFieldWrapper disabled={true} label={t('Mark Obtained ')} value={undefined} />
                    </>
                  )}
                </Grid>
              </DialogContent>

              <DialogActionWrapper
                title="Result Mark Entry"
                titleFront="Submit"
                errors={errors}
                editData={editExam}
                handleCreateClassClose={handleCreateProjectClose}
                isSubmitting={isSubmitting}
              />
            </form>
          )}
        </Formik>
      </Dialog>

      {/* Subject wise Bulk Result Entry */}
      <Dialog fullWidth maxWidth="sm" open={openSubjectBulk} onClose={handleSubjectBulkClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t(`${editExam ? 'Edit Result mark entry' : 'Single Result entry'}`)}
          </Typography>
          <Typography variant="subtitle2">{t('Use this dialog window to Result mark entry')}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            exam_id: undefined,
            exam_details_id: undefined,
            bulkExamMark: null,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            exam_id: Yup.number().required(t('The exam field is required')).nullable(false),
            exam_details_id: Yup.number().required(t('The exam subject field is required')).nullable(false)
            // bulkExamMark: Yup.object().required(t('Bulk Exam Mark excel file is required')).nullable(false),
          })}
          onSubmit={handleSubjectBulkSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            console.log({ errors });
            console.log({ values });

            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container spacing={0}>
                    {/* select class */}
                    <AutoCompleteWrapper
                      minWidth="100%"
                      label={t('Select class')}
                      placeholder="select a class ..."
                      options={classes?.map((i) => ({
                        label: i.name,
                        id: i.id,
                        has_section: i.has_section
                      }))}
                      value={selectClasses}
                      filterSelectedOptions
                      handleChange={handleClassSelect}
                    />

                    {
                      // select section
                      sections ? (
                        <AutoCompleteWrapper
                          minWidth="100%"
                          label="Section"
                          placeholder="select a section..."
                          value={selectedSection}
                          options={sections}
                          filterSelectedOptions
                          handleChange={(e, v) => setSelectedSection(v)}
                        />
                      ) : (
                        <EmptyAutoCompleteWrapper minWidth="100%" label="Section" placeholder="select a section..." options={[]} value={undefined} />
                      )
                    }

                    {/* exam select */}
                    {exams ? (
                      <>
                        <AutoCompleteWrapper
                          label="Select Exam"
                          placeholder="select a exam..."
                          minWidth="100%"
                          value={selectedExam}
                          options={exams}
                          filterSelectedOptions
                          handleChange={(e, v) => handleExamSelect(e, v, setFieldValue, setSelectedExam)}
                        />
                      </>
                    ) : (
                      <EmptyAutoCompleteWrapper label="Select Exam" placeholder="select a exam..." minWidth="100%" value={undefined} options={[]} />
                    )}
                    {examAddtionalMarkingList ? (
                      <>
                        <AutoCompleteWrapper
                          minWidth="100%"
                          label="Select Addtional Marking Categories"
                          placeholder="select addtional subject..."
                          options={examAddtionalMarkingList}
                          value={selectedExamSubject}
                          filterSelectedOptions
                          handleChange={(e, v) => {
                            setSelectedExamSubject(v);
                            if (v) {
                              setFieldValue('exam_details_id', v.id);
                            } else {
                              setFieldValue('exam_details_id', undefined);
                            }
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <EmptyAutoCompleteWrapper
                          minWidth="100%"
                          label="Select Exam subject"
                          placeholder="select exam subject..."
                          options={[]}
                          value={undefined}
                        />
                      </>
                    )}
                    {selectedExamSubject && (
                      <>
                        <FileUploadFieldWrapper
                          htmlFor="bulkExamMark"
                          label="select Excel file"
                          name="bulkExamMark"
                          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          value={values?.bulkExamMark?.name || ''}
                          handleChangeFile={(e) => {
                            console.log(e.target.files[0]);

                            if (
                              e.target?.files?.length &&
                              e.target.files[0].type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            ) {
                              setFieldValue('bulkExamMark', e.target.files[0]);
                            }
                          }}
                          handleRemoveFile={(e) => {
                            setFieldValue('bulkExamMark', null);
                          }}
                        />
                      </>
                    )}
                  </Grid>
                </DialogContent>

                <DialogActionWrapper
                  title="Result Mark Entry"
                  titleFront="Submit"
                  errors={errors}
                  editData={editExam}
                  handleCreateClassClose={handleSubjectBulkClose}
                  isSubmitting={isSubmitting}
                />
              </form>
            );
          }}
        </Formik>
      </Dialog>
    </>
  );
}

export default PageHeader;
