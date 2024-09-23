import { useContext, useEffect, useState, ChangeEvent } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { Grid, Dialog, DialogTitle, DialogActions, DialogContent, Typography, TextField, CircularProgress, Button } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DialogActionWrapper, DialogWrapper } from '@/components/DialogWrapper';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { HomeworkContext } from '@/contexts/HomeWorkContext';
import { MobileDatePickerWrapper } from '@/components/DatePickerWrapper';
import { FileUploadFieldWrapper } from '@/components/TextFields';
import { imagePdfDocType } from '@/utils/utilitY-functions';
import { ButtonWrapper } from '@/components/ButtonWrapper';
// updated code start
import { useClientFetch } from 'src/hooks/useClientFetch';
import { AutoCompleteWrapperWithoutRenderInput } from '@/components/AutoCompleteWrapper';
import { convertUTCDateToIsoLocalDate } from '@/utils/getDay';
// updated code end

function PageHeader({ reFetchData, data, classes, classList, setLeave, userInfo, selectedClass,
  setSelectedClass, selectedSection, setSelectedSection, selectedSubject, setSelectedSubject
}) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const [academicYear] = useContext(AcademicYearContext);
  // @ts-ignore
  const { handleHomeworkInfo } = useContext(HomeworkContext);
  const [homeworkFilePreview, setHomeworkFilePreview] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [studentList, setStudentList] = useState([]);
  const [sections, setSections] = useState(null);

  // const [selectedClass, setSelectedClass] = useState(null);
  // const [selectedSection, setSelectedSection] = useState(null);
  // const [selectedSubject, setSelectedSubject] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  // updated code start
  const { data: classData, error: classError } = useClientFetch('/api/class');
  const [subjectsList, setSubjectList] = useState<Array<any>>([]);
  const [showRoutinBtn, setShowRoutinBtn] = useState(false);
  // updated code end

  useEffect(() => {
    if (data) {
      setSubjects(
        data?.section?.class?.subjects?.map((i) => ({
          label: i.name,
          id: i.id
        }))
      );
    }
  }, [data, academicYear]);

  const handleCreateClassOpen = () => {
    setOpen(true);
  };

  const handleCreateClassClose = () => {
    setOpen(false);
    setHomeworkFilePreview(null);
  };

  const handleFormSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {

      if (!_values.homeworkFile) {
        return showNotification("please upload a homework file","error");
      }

      if (userInfo?.school_id) {
        _values['school_id'] = userInfo?.school_id;
      }
      if (data?.id) {
        _values['student_id'] = data?.id;
      }
      _values['academic_year_id'] = academicYear?.id;
      if (!_values?.class_id) {
        _values['class_id'] = data?.section.class.id;
      }
      if (!_values?.section_id) {
        _values['section_id'] = data?.section.id;
      }
      if (data?.academic_year?.school_id) {
        _values['school_id'] = data?.academic_year?.school_id;
      }

      const formData = new FormData();
      for (const index in _values) {
        if (index === "date") formData.append(index, convertUTCDateToIsoLocalDate(_values[index]));
        else formData.append(index, _values[index]);
      }
      const res = await axios.post(`/api/homework`, formData);
      setSelectedClass(null);
      // update context code start
      // handleHomeworkInfo(
      //   res?.data?.document?.id | 0,
      //   _values.school_id,
      //   _values.class_id,
      //   _values.section_id,
      //   _values.academic_year_id,
      //   _values.student_id
      // );

      // update context code end
      showNotification(res.data.message);
      resetForm();
      setStatus({ success: true });
      setSubmitting(false);
      reFetchData();
      handleCreateClassClose();
    } catch (err) {
      console.error(err);
      showNotification(err?.response?.data?.message, 'error');
      setStatus({ success: false });
      //@ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  const handleClassSelect = (event, newValue) => {
    setSelectedClass(newValue);
    setSelectedSection(null);

    if (newValue) {
      axios
        .get(`/api/subject?class_id=${newValue.id}`)
        .then((res) => {
          setSubjects(
            res?.data?.map((i) => ({
              label: i.name,
              id: i.id
            }))
          );
        })
        .catch((err) => console.log(err));

      const targetClassSections = classes.find((i) => i.id == newValue.id);
      const sections = targetClassSections?.sections?.map((i) => {
        return {
          label: i.name,
          id: i.id
        };
      });
      setSections(sections);
      if (!newValue.has_section) {
        setSelectedSection({
          label: targetClassSections?.sections[0]?.name,
          id: targetClassSections?.sections[0]?.id
        });
        gettingStudent(targetClassSections?.sections[0]?.id);
      } else {
        setSelectedSection(null);
      }
    }
  };

  const handleSearch = () => {
    if (academicYear?.id && selectedClass?.id) {
      let url = `/api/homework?academic_year_id=${academicYear?.id}&class_id=${selectedClass?.id}`;
      if (selectedSection) url += `&section_id=${selectedSection?.id}`;
      if (selectedSubject) url += `&subject_id=${selectedSubject?.id}`;
      if (selectedStudent) url += `&student_id=${selectedStudent?.id}`;

      axios
        .get(url)
        .then((res) => {
          setLeave(res.data);
        })
        .catch((err) => console.log(err));
    }
  };

  const gettingStudent = (section_id) => {
    if (section_id) {
      axios
        .get(`/api/student/student-list?academic_year_id=${academicYear?.id}&section_id=${section_id}`)
        .then((res) =>
          setStudentList(
            res.data?.map((i) => {
              return {
                label: `${i.class_registration_no} (${i?.student_info?.first_name})`,
                id: i.id
              };
            })
          )
        )
        .catch((err) => console.log(err));
    }
  };

  // updated code start
  const handleClassSelectTeacher = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    if (newValue) {
      const targetClassSections = classData.find((i) => i.id == newValue.id);
      setSelectedClass(newValue);

      // sections data
      setSections(
        targetClassSections?.sections?.map((i) => {
          return {
            label: i.name,
            id: i.id
          };
        })
      );

      // subjects data
      setSubjectList(
        targetClassSections?.subjects?.map((i) => {
          return {
            label: i.name,
            id: i.id
          };
        })
      );

      if (!newValue.has_section) {
        setSelectedSection(null);
        // setSelectedSection({
        //   label: targetClassSections?.sections[0]?.name,
        //   id: targetClassSections?.sections[0]?.id
        // });
      } else {
        setSelectedSection(null);
      }
      setShowRoutinBtn(false);
    } else {
      setSections([]);
      setSubjectList([]);
      setSelectedSection(null);
      setSelectedSubject(null);
      setShowRoutinBtn(false);
    }
  };

  let shape = {
    date: Yup.date().required(t('The date field is required')),
    subject_id: Yup.number().min(1).required(t('Subject is required'))
    // homeworkFile: Yup.mixed().required(t('Home work file is required'))
  };

  if (userInfo) {
    (shape['class_id'] = Yup.number().min(1).required(t('Class is required'))),
      (shape['section_name'] = Yup.string().required(t('Section is required')));
  }
  // updated code end

  return (
    <>
      <PageHeaderTitleWrapper name="Homework" handleCreateClassOpen={handleCreateClassOpen} actionButton={userInfo ? false : true} />
      {/* {!data ||
        (userInfo && (
          <Grid
            container
            spacing={0}
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr 1fr'
              },
              p: 2,
              columnGap: 2
            }}
          >
            <AutoCompleteWrapper
              label="Select class"
              placeholder="Class..."
              options={classList}
              value={selectedClass}
              handleChange={handleClassSelect}
            />

            {selectedClass && selectedClass.has_section && sections && (
              <AutoCompleteWrapper
                label="Select section"
                placeholder="Section..."
                options={sections}
                value={selectedSection}
                handleChange={(e, v) => {
                  setSelectedSection(v);
                  gettingStudent(v?.id);
                }}
              />
            )}

            <AutoCompleteWrapper
              minWidth="100%"
              label={t('Select Subject')}
              placeholder={t('Subject...')}
              limitTags={2}
              // getOptionLabel={(option) => option.id}
              required={true}
              options={subjects}
              value={selectedSubject}
              handleChange={(e, v) => setSelectedSubject(v)}
            />
            <AutoCompleteWrapper
              minWidth="100%"
              label={t('Select student')}
              placeholder={t('Student...')}
              limitTags={2}
              required={true}
              options={studentList}
              value={selectedStudent}
              handleChange={(e, v) => setSelectedStudent(v)}
            />
            <ButtonWrapper startIcon={<SearchIcon />} handleClick={handleSearch}>
              Find
            </ButtonWrapper>
          </Grid>
        ))} */}
      <Grid
        container
        spacing={0}
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr 1fr 1fr'
          },
          p: 2,
          columnGap: 2
        }}
      >
        <AutoCompleteWrapper
          label="Select class"
          placeholder="Class..."
          options={
            classData?.map((i) => {
              return {
                label: i.name,
                id: i.id,
                has_section: i.has_section
              };
            }) || []
          }
          value={selectedClass}
          handleChange={handleClassSelectTeacher}
        />

        {selectedClass && selectedClass.has_section && sections && (
          <AutoCompleteWrapper
            label="Select section"
            placeholder="Section..."
            options={sections}
            value={selectedSection}
            handleChange={(e, v) => {
              setSelectedSection(v);
              gettingStudent(v?.id);
            }}
          />
        )}

        <AutoCompleteWrapper
          minWidth="100%"
          label={t('Select Subject')}
          placeholder={t('Subject...')}
          limitTags={2}
          // getOptionLabel={(option) => option.id}
          required={true}
          options={subjectsList}
          value={selectedSubject}
          handleChange={(e, v) => setSelectedSubject(v)}
        />
        {/* <AutoCompleteWrapper
          minWidth="100%"
          label={t('Select student')}
          placeholder={t('Student...')}
          limitTags={2}
          required={true}
          options={studentList}
          value={selectedStudent}
          handleChange={(e, v) => setSelectedStudent(v)}
        /> */}
        <ButtonWrapper startIcon={<SearchIcon />} handleClick={handleSearch}>
          Find
        </ButtonWrapper>
      </Grid>

      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleCreateClassClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('Homework')}
          </Typography>
          <Typography variant="subtitle2">{t('Fill in the fields below to add a Homework')}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            date: null,
            subject_id: undefined,
            class_id: undefined,
            section_id: undefined,
            section_name: '',
            homeworkFile: undefined,
            description: '',
            youtuble_class_link: '',
            live_class_link: ''
          }}
          validationSchema={Yup.object().shape(shape)}
          onSubmit={handleFormSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      display: 'grid'
                    }}
                  >
                    <MobileDatePickerWrapper
                      label={'Select Date'}
                      date={values?.date}
                      required={true}
                      handleChange={(v) => {
                        setFieldValue('date', v);
                      }}
                    />
                    {/*updated select class */}

                    {userInfo && (
                      <AutoCompleteWrapperWithoutRenderInput
                        minWidth="100%"
                        label="Select Class *"
                        placeholder="Class..."
                        options={
                          classData?.map((i) => {
                            return {
                              label: i.name,
                              id: i.id,
                              has_section: i.has_section
                            };
                          }) || []
                        }
                        value={values.class_id}
                        name="class_id"
                        error={errors?.class_id}
                        touched={touched?.class_id}
                        // @ts-ignore
                        handleChange={(e, v) => {
                          setFieldValue('class_id', v?.id);
                          // setFieldValue('section_id', undefined);
                          setFieldValue('section_name', '');
                          return handleClassSelectTeacher(e, v);
                        }}
                      />
                    )}

                    {/* updated select section */}

                    {userInfo && (
                      <AutoCompleteWrapperWithoutRenderInput
                        minWidth="100%"
                        label="Select Section *"
                        placeholder="Section..."
                        options={sections}
                        value={undefined}
                        name="section_name"
                        error={errors?.section_name}
                        touched={touched?.section_name}
                        // @ts-ignore
                        handleChange={(e, v) => {
                          setFieldValue('section_id', v?.id);
                          setFieldValue('section_name', v?.label);
                          //return handleSectionSelectTeacher(e, v)
                        }}
                      />
                    )}

                    {/* updated subject code */}
                    {userInfo && (
                      <AutoCompleteWrapperWithoutRenderInput
                        minWidth="100%"
                        label="Select Subject *"
                        placeholder="Subject..."
                        options={subjectsList}
                        value={values.subject_id}
                        name="subject_id"
                        error={errors?.subject_id}
                        touched={touched?.subject_id}
                        // @ts-ignore
                        handleChange={(e, v) => {
                          setFieldValue('subject_id', v?.id);
                          //return handleSectionSelectTeacher(e, v)
                        }}
                      />
                    )}

                    {data && (
                      <AutoCompleteWrapper
                        minWidth="100%"
                        label={t('Select Subject')}
                        placeholder={t('Subject...')}
                        limitTags={2}
                        // getOptionLabel={(option) => option.id}
                        required={true}
                        options={subjects}
                        value={selectedSubject}
                        handleChange={(e, v) => {
                          if (v) {
                            setSelectedSubject(v);
                            setFieldValue('subject_id', v?.id);
                          }
                        }}
                      />
                    )}

                    {/* description */}
                    <Grid container pl={1}>
                      <TextField
                        multiline
                        rows={3}
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(touched.description && errors.description)}
                        fullWidth
                        helperText={touched.description && errors.description}
                        label={t('Description')}
                        name="description"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.description}
                        variant="outlined"
                      />
                    </Grid>
                    {/* youtuble class link */}
                    <Grid container pl={1} py={1}>
                      <TextField
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(touched.youtuble_class_link && errors.youtuble_class_link)}
                        fullWidth
                        helperText={touched.youtuble_class_link && errors.youtuble_class_link}
                        label={t('Youtuble Class Link')}
                        name="youtuble_class_link"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.youtuble_class_link}
                        variant="outlined"
                      />
                    </Grid>

                    {/* live class link */}

                    <Grid container pl={1} py={1}>
                      <TextField
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(touched.live_class_link && errors.live_class_link)}
                        fullWidth
                        helperText={touched.live_class_link && errors.live_class_link}
                        label={t('Live Class Link')}
                        name="live_class_link"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.live_class_link}
                        variant="outlined"
                      />
                    </Grid>

                    {/* file  */}

                    <Grid item>
                      {homeworkFilePreview && (
                        <>
                          <Grid
                            sx={{
                              p: 1,
                              border: 1,
                              borderRadius: 1,
                              borderColor: 'primary.main',
                              color: 'primary.main'
                            }}
                          >
                            <a style={{ width: '50px' }} target="_blank" href={homeworkFilePreview}>
                              {homeworkFilePreview}
                            </a>
                          </Grid>
                          <br />
                        </>
                      )}
                      <FileUploadFieldWrapper
                        htmlFor="homeworkFile"
                        label="Select Homework File:*"
                        name="homeworkFile"
                        accept={'application/pdf'}
                        value={values?.homeworkFile?.name || ''}
                        handleChangeFile={(e) => {
                          if (e.target?.files?.length) {
                            if (imagePdfDocType.includes(e.target.files[0]?.type)) {
                              const photoUrl = URL.createObjectURL(e.target.files[0]);
                              setHomeworkFilePreview(photoUrl);
                              setFieldValue('homeworkFile', e.target.files[0]);
                            }
                          }
                        }}
                        handleRemoveFile={(e) => {
                          setHomeworkFilePreview(null);
                          setFieldValue('homeworkFile', undefined);
                        }}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActionWrapper
                  titleFront="+"
                  title="Submit"
                  editData={undefined}
                  errors={errors}
                  handleCreateClassClose={handleCreateClassClose}
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
