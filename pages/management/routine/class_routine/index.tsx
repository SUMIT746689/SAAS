import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import Head from 'next/head';
import { useClientFetch } from 'src/hooks/useClientFetch';
import React, { ChangeEvent, useState, MouseEvent, useEffect } from 'react';
import { Grid, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { SearchingButtonWrapper } from '@/components/ButtonWrapper';
import useNotistick from '@/hooks/useNotistick';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { useTranslation } from 'react-i18next';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { TextFieldWrapper } from '@/components/TextFields';
import dayjs from 'dayjs';
import { AutoCompleteWrapperWithoutRenderInput } from '@/components/AutoCompleteWrapper';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import axios from 'axios';
import Result from './Result';
const dayOptions = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// timeslots functionality start
const generateTimeSlots = () => {
  const times = [];
  let start = new Date();
  start.setHours(0, 0, 0, 0); // Start at 12:00 AM

  while (start.getDate() === new Date().getDate()) {
    let hours = start.getHours();
    let minutes = start.getMinutes();
    let period = hours >= 12 ? 'pm' : 'am';

    let formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    let formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    times.push(`${formattedHours}:${formattedMinutes}${period}`);

    start.setMinutes(start.getMinutes() + 15);
  }

  return times;
};

// timeslots functionality end
const ClassRoutine = () => {
  const [startTimeSlots, setStartTimeSlots] = useState([]);
  const [endTimeSlots, setEndTimeSlots] = useState([]);
  const { showNotification } = useNotistick();
  const [selectedClass, setSelectedClass] = useState(null);
  const { data: classData, error: classError } = useClientFetch('/api/class');
  const { data: subjects, reFetchData: reFetchSubjects } = useClientFetch(`/api/subject`);
  const [sections, setSections] = useState<Array<any>>([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showRoutinBtn, setShowRoutinBtn] = useState(false);
  const [open, setOpen] = useState(false);
  const { t }: { t: any } = useTranslation();
  const [teacherList, setTeacherList] = useState([]);
  const [routineData, setRoutineData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [DeleteIconDisabled, setDeleteIconDisabled] = useState(false);

  useEffect(() => {
    const result = generateTimeSlots();
    setStartTimeSlots(result);
    setEndTimeSlots(result);
  }, []);

  // teacher information code start
  // const { data: teachers, setData: setTeachers, reFetchData, error } = useClientFetch('/api/teacher');
  // console.log('data information is here');
  // console.log(teachers);
  useEffect(() => {
    axios
      .get('/api/teacher')
      .then((res) => {
        setTeacherList(
          res.data.map((item, i) => {
            return {
              id: item.id,
              label: [item.first_name, item.middle_name, item.last_name].join(' ')
            };
          })
        );
      })
      .catch((error) => {});
  }, []);
  // teacher information code end

  const handleClassSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    if (newValue) {
      const targetClassSections = classData.find((i) => i.id == newValue.id);
      setSelectedClass(newValue);
      setSections(
        targetClassSections?.sections?.map((i) => {
          return {
            label: i.name,
            id: i.id
          };
        })
      );
      if (!newValue.has_section) {
        setSelectedSection({
          label: targetClassSections?.sections[0]?.name,
          id: targetClassSections?.sections[0]?.id
        });
      } else {
        setSelectedSection(null);
      }
      setShowRoutinBtn(false);
    } else {
      setSections([]);
      setSelectedSection(null);
      setShowRoutinBtn(false);
    }
  };

  const handleSectionSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    setSelectedSection(newValue);
    setShowRoutinBtn(false);
  };

  // Debounce function
  const debounce = (func, delay) => {
    let timerId;
    return function (...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const handleClickStudentInfo = debounce(() => {
    if (!selectedClass) {
      showNotification('Please select a class before proceeding', 'error');
      return;
    }
    if (!selectedSection) {
      showNotification('Please select a section before proceeding', 'error');
      return;
    }

    // find data from database code start
    axios
      .get(`/api/period?class_id=${selectedClass.id}&section_id=${selectedSection.id}`)
      .then((res) => {
        setRoutineData(res.data.result);
      })
      .catch((err) => {});
    // find data from database code end

    setShowRoutinBtn(true);
  }, 1000);

  const handleCreateAddClassRoutine = (event: MouseEvent<HTMLButtonElement>) => {
    setEditData(null);
    setOpen(true);
  };
  const handleCreateRoutineFormClose = (event: MouseEvent<HTMLButtonElement>) => {
    setOpen(false);
  };

  const handleCreateUserSuccess = () => {
    // seteditData(null);
    setOpen(false);
  };

  const handleSelectAllMonths = (setValue) => {
    setValue('days', dayOptions);
  };
  const handleRemoveAllMonths = (setValue) => {
    setValue('days', []);
  };

  const handleCreateClassClose = () => {
    setOpen(false);
  };

  const handleDeleteRoutine = debounce((item) => {
    axios
      .delete(`/api/period/${item.id}`)
      .then((response) => {
        if (response.status === 204) {
          showNotification('class routine deleted successfull!!');
          handleClickStudentInfo();
        }
      })
      .catch((err) => {
        showNotification(err?.response?.data?.message, 'error');
      });
  }, 1000);

  // const handleDeleteRoutine = async (item) => {
  //   setDeleteIconDisabled(true);
  //   try {
  //     const response = await axios.delete(`/api/period/${item.id}`);

  //     if (response.status === 204) {
  //       showNotification('class routine deleted successfull!!');
  //       handleClickStudentInfo();
  //     }
  //   } catch (err) {
  //     showNotification(err?.response?.data?.message, 'error');
  //   } finally {
  //     setDeleteIconDisabled(false);
  //   }
  // };

  return (
    <>
      <Head>
        <title>Routine</title>
      </Head>
      {/* selectedClass && selectedSection && showRoutinBtn */}
      {/* page header related code */}
      <PageTitleWrapper>
        <PageHeaderTitleWrapper
          name="Add/Edit Class Routine"
          // handleCreateClassOpen={handleCreateClassOpen}
          handleCreateClassOpen={handleCreateAddClassRoutine}
          disabled={selectedClass && selectedSection && showRoutinBtn ? false : true}
        />
      </PageTitleWrapper>

      {/* searching part code start */}
      <Grid mt={3} display="grid" gridTemplateColumns="1fr" rowGap={{ xs: 1, md: 0 }} mx={1} minHeight="fit-content">
        {/* split your code start */}
        <Grid
          sx={{
            overflow: 'hidden',
            backgroundColor: '#fff'
          }}
        >
          <Grid pt="9px" px={2}>
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                columnGap: '20px',
                rowGap: '0',
                flexWrap: 'wrap'
              }}
            >
              {/* Class field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapper
                  options={
                    classData?.map((i) => {
                      return {
                        label: i.name,
                        id: i.id,
                        has_section: i.has_section
                      };
                    }) || []
                  }
                  value={undefined}
                  label="Select Class"
                  placeholder="select a class"
                  handleChange={handleClassSelect}
                />
              </Grid>

              {/* Section field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapper
                  options={sections}
                  value={selectedSection}
                  label="Select Section"
                  placeholder="select a section"
                  handleChange={handleSectionSelect}
                />
              </Grid>

              {/* Search button */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '15%'
                  },
                  flexGrow: 1,
                  position: 'relative',
                  display: 'flex',
                  gap: 1
                }}
              >
                <Grid
                  sx={{
                    flexGrow: 1
                  }}
                >
                  <SearchingButtonWrapper isLoading={false} handleClick={handleClickStudentInfo} disabled={false} children={'Search'} />
                </Grid>
              </Grid>
              {/* Add routine */}
              {/* {selectedClass && selectedSection && showRoutinBtn && (
                <Grid>
                  <SearchingButtonWrapper isLoading={false} handleClick={handleCollect} disabled={false} children={'Add Routine'} />
                </Grid>
              )} */}
            </Grid>
          </Grid>
        </Grid>

        {/* split your code end */}
      </Grid>

      {/* class routine form start */}
      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleCreateRoutineFormClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('Add new class routine')}
          </Typography>
          <Typography variant="subtitle2">{t('Fill in the fields below to create and add a class routine')}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            // title: editData?.title && editData.title,
            teacher: editData?.teacher_id ? editData.teacher_id : undefined,
            subject: editData?.subject_id ? editData.subject_id : undefined,
            date: dayjs().format('YYYY-MM-DD'),
            days: editData?.day ? [editData.day] : [],
            start_time: editData?.start_time ? editData.start_time : '',
            end_time: editData?.end_time ? editData.end_time : '',
            submit: null
          }}
          validationSchema={Yup.object().shape({
            teacher: Yup.number().required(t('The teacher field is required')),
            subject: Yup.number().required(t('The subject field is required')),
            date: Yup.date().required('The date field is required'),
            days: Yup.array().of(Yup.string().required('Day is required')).min(1, 'Day is required'),
            start_time: Yup.string().max(255).required(t('The Start Time field is required')),
            end_time: Yup.string().max(255).required(t('The End Time field is required'))
          })}
          onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
            try {
              const values = {
                class_id: selectedClass.id,
                section_id: selectedSection.id,
                teacher_id: _values.teacher,
                subject_id: _values.subject,
                days: _values.days,
                start_time: _values.start_time,
                end_time: _values.end_time
              };

              if (editData) {
                const response = await axios.patch(`/api/period/${editData.id}`, values);
                if (response.status === 200) {
                  showNotification(response.data.message);
                  setSubmitting(false);
                  setStatus({ success: true });
                  handleCreateUserSuccess();
                  handleClickStudentInfo();
                }
              } else {
                const response = await axios.post(`/api/period`, values);

                if (response.status === 200) {
                  resetForm();
                  setSubmitting(false);
                  showNotification(response.data.message);
                  setStatus({ success: true });
                  handleCreateUserSuccess();
                  handleClickStudentInfo();
                }
              }
            } catch (err) {
              setStatus({ success: false });
              //@ts-ignore
              setErrors({ submit: err.message });
              setSubmitting(false);

              // showNotification(err.message,'error')
              showNotification(err?.response?.data?.message, 'error');
            }
          }}
        >
          {({ setFieldValue, errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => {
            const handleSelectChange = (event) => {
              setFieldValue('days', event.target.value);
            };

            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container spacing={3}>
                    <AutoCompleteWrapperWithoutRenderInput
                      minWidth="100%"
                      label="Select Teacher"
                      placeholder="Select Teacher..."
                      value={teacherList.find((item) => item.id === values.teacher) || null}
                      options={teacherList}
                      name="teacher"
                      error={errors?.teacher}
                      touched={touched?.teacher}
                      // @ts-ignore
                      handleChange={(e, value: any) => {
                        if (value) {
                          setFieldValue('teacher', value.id);
                        } else {
                          setFieldValue('teacher', null);
                        }
                      }}
                    />
                  </Grid>
                  <Grid container spacing={3}>
                    <AutoCompleteWrapperWithoutRenderInput
                      minWidth="100%"
                      label="Select Subject"
                      placeholder="Select Subject..."
                      value={
                        subjects
                          .map((item) => {
                            return {
                              id: item.id,
                              label: item.name
                            };
                          })
                          .find((item) => item.id === values.subject) || null
                      }
                      options={subjects.map((item) => {
                        return {
                          id: item.id,
                          label: item.name
                        };
                      })}
                      name="subject"
                      error={errors?.subject}
                      touched={touched?.subject}
                      // @ts-ignore
                      handleChange={(e, value: any) => {
                        if (value) {
                          setFieldValue('subject', value.id);
                        } else {
                          setFieldValue('subject', null);
                        }
                      }}
                    />
                    {/* <TextFieldWrapper
                      name="subject"
                      errors={errors?.subject}
                      touched={touched?.subject}
                      label={t(`Subject`)}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values?.subject}
                    /> */}
                  </Grid>
                  {/* <Grid container spacing={3}>
                    <TextFieldWrapper
                      name="date"
                      errors={errors?.date}
                      touched={touched?.date}
                      label={t(`Date`)}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values?.date}
                      type="date"
                    />
                  </Grid> */}
                  <Grid container spacing={3}>
                    {editData?.day ? (
                      <AutoCompleteWrapperWithoutRenderInput
                        minWidth="100%"
                        label="Days"
                        placeholder="Days..."
                        value={values.days}
                        options={dayOptions}
                        name="days"
                        error={errors?.days}
                        touched={touched?.days}
                        // @ts-ignore
                        handleChange={(e, value: any) => setFieldValue('days', value)}
                      />
                    ) : (
                      <AutoCompleteWrapperWithoutRenderInput
                        minWidth="100%"
                        label="Days"
                        placeholder="Days..."
                        multiple
                        value={values.days}
                        options={dayOptions}
                        name="days"
                        error={errors?.days}
                        touched={touched?.days}
                        // @ts-ignore
                        handleChange={(e, value: any) => setFieldValue('days', value)}
                      />
                    )}
                    {editData?.day ? (
                      ''
                    ) : (
                      <Grid display="flex" justifyContent="start" columnGap={1} sx={{ pl: '27px' }}>
                        <Grid>
                          <ButtonWrapper variant="outlined" handleClick={() => handleSelectAllMonths(setFieldValue)}>
                            Select All
                          </ButtonWrapper>
                        </Grid>
                        <Grid>
                          <ButtonWrapper variant="outlined" handleClick={() => handleRemoveAllMonths(setFieldValue)}>
                            Remove All
                          </ButtonWrapper>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                  <Grid container spacing={3}>
                    <AutoCompleteWrapperWithoutRenderInput
                      minWidth="100%"
                      label="Select Start Time"
                      placeholder="Start Time..."
                      value={values.start_time}
                      options={startTimeSlots}
                      name="start_time"
                      error={errors?.start_time}
                      touched={touched?.start_time}
                      // @ts-ignore
                      handleChange={(e, value: any) => setFieldValue('start_time', value)}
                    />

                    {/* <AutoCompleteWrapper
                      minWidth="100%"
                      options={startTimeSlots}
                      value={selectedStartTimeSlots}
                      label="Select Start Time"
                      placeholder="Select Start Time"
                      handleChange={(e: ChangeEvent<HTMLInputElement>, value) => {
                        setselectedStartTimeSlots(value);
                      }}
                    /> */}
                  </Grid>
                  <Grid container spacing={3}>
                    <AutoCompleteWrapperWithoutRenderInput
                      minWidth="100%"
                      label="Select End Time"
                      placeholder="End Time..."
                      value={values.end_time}
                      options={endTimeSlots}
                      name="end_time"
                      error={errors?.end_time}
                      touched={touched?.end_time}
                      // @ts-ignore
                      handleChange={(e, value: any) => setFieldValue('end_time', value)}
                    />
                    {/* <AutoCompleteWrapper
                      minWidth="100%"
                      options={endTimeSlots}
                      value={selectedEndTimeSlots}
                      label="Select End Time"
                      placeholder="Select End Time"
                      handleChange={(e: ChangeEvent<HTMLInputElement>, value) => {
                        setselectedEndTimeSlots(value);
                      }}
                    /> */}
                  </Grid>
                </DialogContent>

                <DialogActionWrapper
                  title="Routine"
                  errors={errors}
                  editData={editData || undefined}
                  handleCreateClassClose={handleCreateClassClose}
                  isSubmitting={isSubmitting}
                />
              </form>
            );
          }}
        </Formik>
      </Dialog>
      {/* class routine form end */}
      {/* result component code start */}
      <Result routineInfo={routineData} setEditData={setEditData} setOpen={setOpen} handleDeleteRoutine={handleDeleteRoutine} />
      {/* result component code end */}
    </>
  );
};

ClassRoutine.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_class_routine', 'show_class_routine']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ClassRoutine;
