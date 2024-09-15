import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import Head from 'next/head';
import { useClientFetch } from 'src/hooks/useClientFetch';
import React, { ChangeEvent, useState, MouseEvent, useEffect } from 'react';
import { Grid, Typography, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
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
const dayOptions = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
import { DatePickerWrapper } from '@/components/DatePickerWrapper';
import Result from './Result';

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
const CreateNote = () => {
  const [startDate, setStartDate] = useState<any>(dayjs(Date.now()));
  const [startTimeSlots, setStartTimeSlots] = useState([]);
  const [endTimeSlots, setEndTimeSlots] = useState([]);
  const { showNotification } = useNotistick();
  const [selectedClass, setSelectedClass] = useState(null);
  const { data: classData, error: classError } = useClientFetch('/api/class');
  const { data: subjects, reFetchData: reFetchSubjects } = useClientFetch(`/api/subject`);
  const [sections, setSections] = useState<Array<any>>([]);
  const [subjectsList, setSubjectList] = useState<Array<any>>([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
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
        }) || []
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

  const handleSectionSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    setSelectedSection(newValue);
    setShowRoutinBtn(false);
  };
  const handleSubjectSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    setSelectedSubject(newValue);
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
    if (!selectedSubject) {
      showNotification('Please select a subject before proceeding', 'error');
      return;
    }

    // find data from database code start
    axios
      .get(`/api/period?class_id=${selectedClass.id}&subject_id=${selectedSubject.id}&notes=${true}`)
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

  //   const startDatePickerHandleChange = (event: ChangeEvent<HTMLInputElement>): void => {
  //     setStartDate(event);
  //   };

  console.log({ subjects, subjectsList });

  return (
    <>
      <Head>
        <title>Routine</title>
      </Head>
      {/* selectedClass && selectedSection && showRoutinBtn */}
      {/* page header related code */}
      <PageTitleWrapper>
        <PageHeaderTitleWrapper
          name="Add/Edit Daily Notes"
          // handleCreateClassOpen={handleCreateClassOpen}
          handleCreateClassOpen={handleCreateAddClassRoutine}
          disabled={selectedClass && selectedSubject && showRoutinBtn && routineData.length > 0 ? false : true}
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
              {/* Subject field */}
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
                  options={subjectsList}
                  value={selectedSubject}
                  label="Select Subject"
                  placeholder="select a subject"
                  handleChange={handleSubjectSelect}
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
              {/* Period field */}
              {/* <Grid
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
                  options={subjectsList}
                  value={selectedSubject}
                  label="Select Subject"
                  placeholder="select a subject"
                  handleChange={handleSubjectSelect}
                />
              </Grid> */}
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
            {t('Add new daily notes')}
          </Typography>
          <Typography variant="subtitle2">{t('Fill in the fields below to create and update a daily notes')}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            // english_title: editData?.english_title ? editData?.english_title : '',
            note: '',
            period_id: undefined,
            note_date: undefined,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            // note_date: Yup.date().required('Note date is required'),
            note: Yup.string().max(255).required(t('The note field is required')),
            period_id: Yup.number().required(t('The day field is required'))
          })}
          onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
            try {
              let start_date_ = new Date(new Date(startDate).setHours(0, 0, 0, 0));

              const values = {
                note: _values.note,
                note_date: start_date_,
                subject_id: selectedSubject.id,
                period_id: _values.period_id
              };

              if (false) {
                // const response = await axios.patch(`/api/period/${editData.id}`, values);
                // if (response.status === 200) {
                //   showNotification(response.data.message);
                //   setSubmitting(false);
                //   setStatus({ success: true });
                //   handleCreateUserSuccess();
                //   handleClickStudentInfo();
                // }
              } else {
                const response = await axios.post(`/api/notes`, values);

                if (response.status === 200) {
                  resetForm();
                  setSubmitting(false);
                  showNotification('Daily notes created successfully!');
                  setStatus({ success: true });
                  handleCreateUserSuccess();
                  handleClickStudentInfo();
                  setStartDate(dayjs(Date.now()));
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
                  <Grid container spacing={3} sx={{ paddingTop: '27px', paddingLeft: '27px', paddingBottom: '9px' }}>
                    <Grid minWidth="100%">
                      <DatePickerWrapper
                        label={'Start Date *'}
                        date={startDate}
                        handleChange={(event) => {
                          setStartDate(event);
                          setFieldValue('note_date', event);
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <AutoCompleteWrapperWithoutRenderInput
                      minWidth="100%"
                      label="Select Day"
                      placeholder="Select Day..."
                      value={
                        routineData
                          .map((item) => {
                            return {
                              id: item.id,
                              label: item.day
                            };
                          })
                          .find((item) => item.id === values.period_id) || null
                      }
                      options={routineData.map((item) => {
                        return {
                          id: item.id,
                          label: item.day
                        };
                      })}
                      name="period_id"
                      error={errors?.period_id}
                      touched={touched?.period_id}
                      // @ts-ignore
                      handleChange={(e, value: any) => {
                        if (value) {
                          setFieldValue('period_id', value.id);
                        } else {
                          setFieldValue('period_id', undefined);
                        }
                      }}
                    />
                  </Grid>

                  <Grid container spacing={3} sx={{ paddingTop: '27px', paddingLeft: '27px', paddingBottom: '9px' }}>
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      error={Boolean(touched.note && errors.note)}
                      fullWidth
                      helperText={touched.note && errors.note}
                      name="note"
                      placeholder={t('note...')}
                      onBlur={handleBlur}
                      onBlurCapture={async (v) => {}}
                      onChange={handleChange}
                      value={values.note}
                      variant="outlined"
                    />
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
      <Result menuInfo={[]} setEditData={setEditData} setOpen={setOpen} handleDeleteMenu={() => {}} setMenuItemId={null} setMenuLabel={''} />
      {/* result component code end */}
    </>
  );
};

CreateNote.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_class_routine', 'show_class_routine']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default CreateNote;
