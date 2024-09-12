import { useContext, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  TextField,
  CircularProgress,
  Button
} from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DialogActionWrapper, DialogWrapper } from '@/components/DialogWrapper';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { MobileDatePickerWrapper } from '@/components/DatePickerWrapper';
import { FileUploadFieldWrapper } from '@/components/TextFields';
import { imagePdfDocType } from '@/utils/utilitY-functions';
import { ButtonWrapper } from '@/components/ButtonWrapper';


function PageHeader({ reFetchData, data, classes, classList, setLeave }) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const [academicYear,] = useContext(AcademicYearContext);
  const [homeworkFilePreview, setHomeworkFilePreview] = useState(null)
  const [subjects, setSubjects] = useState([])

  const [studentList, setStudentList] = useState([])
  const [sections, setSections] = useState(null);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (data) {
      setSubjects(data?.class?.subjects?.map(i => ({
        label: i.name,
        id: i.id
      })))
    }
  }, [data, academicYear])

  const handleCreateClassOpen = () => {
    setOpen(true);
  };

  const handleCreateClassClose = () => {
    setOpen(false);
    setHomeworkFilePreview(null);

  };


  const handleFormSubmit = async (
    _values,
    { resetForm, setErrors, setStatus, setSubmitting }
  ) => {
    try {

      _values['student_id'] = data?.id;
      _values['academic_year_id'] = academicYear?.id;
      const formData = new FormData()
      for (const index in _values) {
        formData.append(index, _values[index])
      }
      const res = await axios.post(`/api/homework`, formData)
      showNotification(res.data.message)
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
    console.log({newValue});
    setSelectedClass(newValue);
    setSelectedSection(null);

    if (newValue) {
      axios.get(`/api/subject?class_id=${newValue.id}`)
        .then(res => {
          setSubjects(res?.data?.map(i => ({
            label: i.name,
            id: i.id
          })))
        }).catch(err => console.log(err))

      const targetClassSections = classes.find((i) => i.id == newValue.id);
      const sections = targetClassSections?.sections?.map((i) => {
        return {
          label: i.name,
          id: i.id
        };
      })
      setSections(sections);
      if (!newValue.has_section) {
        setSelectedSection({
          label: targetClassSections?.sections[0]?.name,
          id: targetClassSections?.sections[0]?.id
        });
        gettingStudent(targetClassSections?.sections[0]?.id)
      } else {
        setSelectedSection(null);
      }
    }
  };
  const handleSearch = () => {
    if (academicYear?.id && selectedClass?.id) {
      let url = `/api/homework?academic_year_id=${academicYear?.id}&class_id=${selectedClass?.id}`
      if (selectedSection) url += `&section_id=${selectedSection?.id}`
      if (selectedSubject) url += `&subject_id=${selectedSubject?.id}`
      axios.get(url).then(res => setLeave(res.data)).catch(err => console.log(err))
    }
  }
  const gettingStudent = (section_id) => {
    if (section_id) {
      axios.get(`/api/student/student-list?academic_year_id=${academicYear?.id}&class_id=${selectedClass?.id}&section_id=${section_id}`)
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
  }

  return (
    <>

      <PageHeaderTitleWrapper
        name="Homework"
        handleCreateClassOpen={handleCreateClassOpen}
        actionButton={data ? false : true}
      />
      {
        !data && <Grid container spacing={0} sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: {
            xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr'
          },
          p: 2,
          columnGap: 2
        }}>

          <AutoCompleteWrapper
            label="Select class"
            placeholder="Class..."
            options={classList}
            value={selectedClass}
            handleChange={handleClassSelect}
          />


          {selectedClass && selectedClass.has_section && sections && (
            <AutoCompleteWrapper
              label="Select Batch"
              placeholder="Batch..."
              options={sections}
              value={selectedSection}
              handleChange={(e, v) => {
                setSelectedSection(v);
                gettingStudent(v?.id)
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
          <ButtonWrapper startIcon={<SearchIcon />} handleClick={handleSearch}>Find</ButtonWrapper>

        </Grid>
      }



      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleCreateClassClose}
      >
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('Homework')}
          </Typography>
          <Typography variant="subtitle2">
            {t('Fill in the fields below to add a Homework')}
          </Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            date: null,
            subject_id: undefined,
            homeworkFile: undefined
          }}
          validationSchema={Yup.object().shape({
            date: Yup.date().required(t('The date field is required')),
            subject_id: Yup.number()
              .min(1)
              .required(t('Subject is required')),
            homeworkFile: Yup.mixed().required(t('Home work file is required'))
          })}
          onSubmit={handleFormSubmit}
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            touched,
            values,
            setFieldValue
          }) => {
            console.log({ values, errors });

            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container spacing={1} sx={{
                    display: 'grid',
                  }}>

                    <MobileDatePickerWrapper
                      label={'Select Date'}
                      date={values?.date}
                      required={true}
                      handleChange={(v) => {
                        console.log(v)

                        setFieldValue('date', v)
                      }
                      }
                    />
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
                          setSelectedSubject(v)
                          setFieldValue('subject_id', v?.id)
                        }
                      }
                      }
                    />
                    <Grid item>
                      {

                        homeworkFilePreview && <>
                          <Grid
                            sx={{
                              p: 1,
                              border: 1,
                              borderRadius: 1,
                              borderColor: 'primary.main',
                              color: 'primary.main'
                            }}
                          >
                            <a
                              style={{ width: '50px' }}
                              target="_blank"
                              href={homeworkFilePreview}
                            >
                              {homeworkFilePreview}
                            </a>
                          </Grid>
                          <br />
                        </>

                      }
                      <FileUploadFieldWrapper
                        htmlFor="homeworkFile"
                        label="Select Homework File:"
                        name="homeworkFile"
                        accept={'application/pdf'}
                        value={values?.homeworkFile?.name || ''}
                        handleChangeFile={(e) => {
                          if (e.target?.files?.length) {
                            console.log(e.target.files[0]);
                            if (imagePdfDocType.includes(e.target.files[0]?.type)) {
                              const photoUrl = URL.createObjectURL(e.target.files[0]);
                              setHomeworkFilePreview(photoUrl)
                              setFieldValue('homeworkFile', e.target.files[0])
                            }
                          }
                        }
                        }
                        handleRemoveFile={(e) => {
                          setHomeworkFilePreview(null);
                          setFieldValue('homeworkFile', undefined)
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
