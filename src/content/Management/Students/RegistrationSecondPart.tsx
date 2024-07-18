import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  DialogActions,
  DialogContent,
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
  Checkbox
} from '@mui/material';
import useNotistick from '@/hooks/useNotistick';
import {
  generateUsername,
  getFile,
  registration_no_generate,
  unique_password_generate
} from '@/utils/utilitY-functions';
import { FileUploadFieldWrapper } from '@/components/TextFields';
import Image from 'next/image';
import axios from 'axios';
import { NewDebounceInput } from '@/components/DebounceInput';

function RegistrationSecondPart({
  totalFormData,
  setTotalFormData,
  setActiveStep,
  handleCreateClassClose,
  student = null,
  classes,
  academicYears
}) {
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [selectedClass, setselectedClass] = useState(null);
  const [selecetedSection, setSelecetedSection] = useState(null);
  const [sectionsForSelectedClass, setSectionsForSelectedClass] = useState([]);
  const [student_photo, setStudent_photo] = useState(null);

  const [classesOptions, setClassesOptions] = useState(null);
  const [group, setGroup] = useState([]);

  const [isExtraClass, setIsExtraClass] = useState(false);
  const [extraClassesOptions, setExtraClassesOptions] = useState([]);
  const [selectedXtraCls, setSelectedXtraCls] = useState(null);
  const [sectionsForSelectedXtraCls, setSectionsForSelectedXtraCls] = useState([]);
  const [selectedXtraClsSection, setSelectedXtraClsSection] = useState(null);

  useEffect(() => {
    const classes_ = [];
    const extraClasses = [];

    classes?.forEach((class_) => {
      const customCls = {
        label: class_.name,
        id: class_.id,
        has_section: class_.has_section
      };

      if (class_.is_extra) return extraClasses.push(customCls);
      classes_.push(customCls);
    });
    setClassesOptions(() => classes_);
    setExtraClassesOptions(() => extraClasses);
  }, [classes]);

  useEffect(() => {
    if (classesOptions && student) {
      setselectedClass(
        classesOptions?.find(
          (i) =>
            i.id == (Number(student?.class_id) || student?.section?.class_id)
        )
      );
      axios
        .get(`/api/group?class_id=${student?.section?.class_id}`)
        .then((res) => {
          console.log('res?.data__', res?.data);

          setGroup(
            res?.data?.map((i) => ({
              label: i.title,
              id: i.id
            }))
          );
        })
        .catch((err) => console.log(err));
    }
  }, [classesOptions, student]);

  useEffect(() => {
    if (student) {
      const targetClassSections = classes?.find(
        (i) => i.id == (Number(student?.class_id) || student?.section?.class_id)
      );

      setSectionsForSelectedClass(
        targetClassSections?.sections?.map((i) => {
          return {
            label: i.name,
            id: i.id
          };
        })
      );

      const targetExtraClassSections = classes?.find(
        (i) => i.id == Number(student?.extra_section?.class_id)
      );
      if (targetExtraClassSections) {
        setIsExtraClass(true);
        setSelectedXtraCls({
          label: targetExtraClassSections.name,
          id: targetExtraClassSections.id,
          ...targetExtraClassSections
        });
      }
      setSectionsForSelectedXtraCls(
        targetExtraClassSections?.sections?.map((i) => {
          return {
            label: i.name,
            id: i.id
          };
        })
      );
      if (student?.extra_section)
        setSelectedXtraClsSection({
          label: student.extra_section.name,
          id: student.extra_section?.id
        });
    }
  }, [student]);

  useEffect(() => {
    if (student && sectionsForSelectedClass?.length > 0) {
      setSelecetedSection(
        sectionsForSelectedClass.find(
          (i) => i.id == (Number(student?.section_id) || student?.section?.id)
        )
      );
    }
  }, [sectionsForSelectedClass, student]);

  const handleClassSelect = (event, value, setFieldValue) => {
    setFieldValue('class_id', value?.id);
    setselectedClass(value);
    if (value) {
      axios
        .get(`/api/group?class_id=${value.id}`)
        .then((res) => {
          console.log('res?.data__', res?.data);
          setGroup(
            res?.data?.map((i) => ({
              label: i.title,
              id: i.id
            }))
          );
        })
        .catch((err) => console.log(err));

      const targetClassSections = classes?.find((i) => i.id == value.id);
      console.log(targetClassSections);

      setSectionsForSelectedClass(
        targetClassSections?.sections?.map((i) => {
          return {
            label: i.name,
            id: i.id
          };
        })
      );
      if (!value.has_section) {
        setSelecetedSection({
          label: targetClassSections?.sections[0]?.name,
          id: targetClassSections?.sections[0]?.id
        });
        setFieldValue('section_id', targetClassSections?.sections[0]?.id);
      } else {
        setSelecetedSection(null);
      }
    }
  };

  const handleExtraClassSelect = (event, value, setFieldValue) => {
    setFieldValue('extra_class_id', value?.id);
    setSelectedXtraCls(value);

    const targetClassSections = classes?.find((i) => i.id == value?.id);
    console.log(targetClassSections);

    setSectionsForSelectedXtraCls(
      targetClassSections?.sections?.map((i) => {
        return {
          label: i.name,
          id: i.id
        };
      })
    );
    if (!value?.has_section) {
      setSelectedXtraClsSection({
        label: targetClassSections?.sections[0]?.name,
        id: targetClassSections?.sections[0]?.id
      });
      setFieldValue('extra_section_id', targetClassSections?.sections[0]?.id);
    } else {
      setSelectedXtraClsSection(null);
    }
  };

  // const password = unique_password_generate();
  // console.log({ classes })

  const [isAvailableUsername, setIsAvailableUsername] = useState();


  const handleDebounce = (value) => {
    // console.log({ isEdit, name: student?.student_info?.user?.username })
    // if (totalFormData?.username?.toLowerCase() === value?.toLowerCase()) return setIsAvailableUsername(null);
    if (student?.student_info?.user?.username?.toLowerCase() === value?.toLowerCase()) return setIsAvailableUsername(null);
    if (value) {
      axios
        .get(`/api/user/is_available?username=${value}`)
        .then((res) => {
          setIsAvailableUsername(null);
        })
        .catch((err) => {
          setIsAvailableUsername(err?.response?.data?.message);
        });
    }
  };


  return (
    <>
      <Formik
        initialValues={{
          username: student
            ? student?.student_info?.user?.username || student?.username
            : totalFormData.username,
          password: student ? student?.password || '' : totalFormData.phone,
          confirm_password: student ? student?.password || '' : totalFormData.phone,
          class_id: student
            ? student?.class_id
              ? Number(student?.class_id)
              : student?.section?.class_id
            : undefined,
          section_id: student
            ? student?.section_id
              ? Number(student?.section_id)
              : student?.section?.id
            : undefined,
          group_id: student
            ? student?.group_id
              ? Number(student?.group_id)
              : student?.group?.id
            : undefined,

          extra_class_id: student?.extra_section_id
            ? student?.extra_section?.class_id
            : undefined,
          extra_section_id: student?.extra_section_id
            ? student?.extra_section?.id
            : undefined,

          academic_year_id: student
            ? Number(student?.academic_year_id)
            : undefined,
          roll_no: student ? student?.class_roll_no : undefined,
          registration_no:
            student?.class_registration_no || registration_no_generate(),
          student_photo: null,
          student_present_address: student
            ? student?.student_present_address
            : '',
          student_permanent_address: student
            ? student?.student_permanent_address ||
            student?.student_info?.student_permanent_address ||
            ''
            : '',
          previous_school: student
            ? student?.previous_school ||
            student?.student_info?.previous_school ||
            ''
            : ''
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string()
            .max(255)
            .required(t('First name field is required')),

          class_id: Yup.number()
            .integer()
            .positive()
            .required(t('Class field is required')),
          section_id: Yup.number()
            .integer()
            .positive()
            .required(t('batch field is required')),

          academic_year_id: Yup.number().positive().integer().required(),

          password: Yup.string()
            .max(255)
            .when('username', {
              is: undefined,
              then: Yup.string()
                .required('Must enter password')
                .min(8, 'Password is too short - should be 8 chars minimum.')
            }),
          // .required(t('The password field is required'))
          // .min(8, 'Password is too short - should be 8 chars minimum.'),

          // .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.'),

          confirm_password: Yup.string()
            .max(255)
            .when('username', {
              is: undefined,
              then: Yup.string()
                .required(t('confirm_password field is required'))
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
            }),
          roll_no: Yup.string().required(t('roll no is required!')),
          registration_no: Yup.string().required(
            t('registration no is required!')
          )
        })}
        onSubmit={async (
          _values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          try {
            setActiveStep(2);
            setTotalFormData((value) => ({ ...value, ..._values }));
          } catch (err) {
            console.error(err);
            showNotification('There was an error, try again later', 'error');
            setStatus({ success: false });
            // @ts-ignore
            setErrors({ submit: err.message });
            setSubmitting(false);
          }
        }}
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
          return (
            <form onSubmit={handleSubmit}>
              <DialogContent
                dividers
                sx={{
                  p: 3
                }}
              >
                <Grid container>
                  <Grid container item spacing={2}>
                    {/* username */}
                    <Grid item xs={12}>
                      {/* <TextField
                        required
                        fullWidth
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(touched.username && errors.username)}
                        helperText={touched.username && errors.username}
                        label={t('Username')}
                        name="username"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.username}
                        variant="outlined"
                      /> */}
                      <NewDebounceInput
                        touched={touched.username}
                        errors={errors.username || isAvailableUsername}
                        label={'User Name'}
                        name="username"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="username"
                        value={values.username || ''}
                        debounceTimeout={500}
                        handleDebounce={handleDebounce}
                        autocomplete="false"
                        required={true}
                      />
                    </Grid>

                    {/* password */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        required={student ? false : true}
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        fullWidth
                        error={Boolean(touched.password && errors.password)}
                        helperText={touched.password && errors.password}
                        onBlur={handleBlur}
                        label={t('Password')}
                        name="password"
                        onChange={handleChange}
                        type="text"
                        value={values.password}
                        variant="outlined"
                      />
                    </Grid>

                    {/* confirm_password */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        // required={student ? false : true}
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(
                          touched.confirm_password && errors.confirm_password
                        )}
                        fullWidth
                        helperText={
                          touched.confirm_password && errors.confirm_password
                        }
                        label={t('Confirm password')}
                        name="confirm_password"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.confirm_password}
                        variant="outlined"
                      />
                    </Grid>

                    {/* classes */}
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        disablePortal
                        options={classesOptions}
                        value={selectedClass}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            size="small"
                            sx={{
                              '& fieldset': {
                                borderRadius: '3px'
                              }
                            }}
                            fullWidth
                            error={Boolean(touched.class_id && errors.class_id)}
                            helperText={touched.class_id && errors.class_id}
                            onBlur={handleBlur}
                            label={t('Select class')}
                          />
                        )}
                        onChange={(event, value) =>
                          handleClassSelect(event, value, setFieldValue)
                        }
                      />
                    </Grid>

                    {/* section */}
                    <Grid item xs={12} md={6}>
                      {selectedClass && selectedClass.has_section && (
                        <Autocomplete
                          size="small"
                          disablePortal
                          options={sectionsForSelectedClass}
                          value={selecetedSection}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              required
                              size="small"
                              sx={{
                                '& fieldset': {
                                  borderRadius: '3px'
                                }
                              }}
                              fullWidth
                              error={Boolean(
                                touched.password && errors.password
                              )}
                              helperText={touched.password && errors.password}
                              onBlur={handleBlur}
                              label={t('Select Batch')}
                            />
                          )}
                          onChange={(event, value) => {
                            setSelecetedSection(value);
                            // @ts-ignore
                            setFieldValue('section_id', value?.id);
                          }}
                        />
                      )}
                    </Grid>

                    {/* Group  */}
                    <Grid item xs={12} md={6}>
                      {selectedClass && selectedClass.has_section && (
                        <Autocomplete
                          size="small"
                          disablePortal
                          options={group}
                          value={
                            group?.find((i) => i.id == values?.group_id) || null
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              sx={{
                                '& fieldset': {
                                  borderRadius: '3px'
                                }
                              }}
                              fullWidth
                              error={Boolean(
                                touched.group_id && errors.group_id
                              )}
                              helperText={touched.group_id && errors.group_id}
                              onBlur={handleBlur}
                              label={t('Select group')}
                            />
                          )}
                          onChange={(event, value) => {
                            setFieldValue('group_id', value?.id);
                          }}
                        />
                      )}
                    </Grid>

                    {/* academicYears */}
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        size="small"
                        disablePortal
                        options={academicYears}
                        value={academicYears?.find(
                          (i) => i.id == values?.academic_year_id || null
                        )}
                        renderInput={(params) => (
                          <TextField
                            required
                            size="small"
                            sx={{
                              '& fieldset': {
                                borderRadius: '3px'
                              }
                            }}
                            fullWidth
                            name="academic_year_id"
                            {...params}
                            label={t('Select Academic Year')}
                          //  error={Boolean(touched.academic_year_id && errors.academic_year_id)}
                          //  helperText={'The session is required'}
                          />
                        )}
                        onChange={(event, value) => {
                          setFieldValue('academic_year_id', value?.id);
                        }}
                      />
                    </Grid>

                    {/* roll_no */}
                    <Grid item xs={12} sm={6} md={6}>
                      <TextField
                        required
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(touched.roll_no && errors.roll_no)}
                        fullWidth
                        helperText={touched.roll_no && errors.roll_no}
                        label={t('Roll number')}
                        name="roll_no"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.roll_no}
                        variant="outlined"
                      />
                    </Grid>

                    {/* registration_no */}
                    <Grid item xs={12} sm={6} md={6}>
                      <TextField
                        required
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(
                          touched.registration_no && errors.registration_no
                        )}
                        fullWidth
                        helperText={
                          touched.registration_no && errors.registration_no
                        }
                        label={t('Provide an unique Registration number')}
                        name="registration_no"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.registration_no}
                        variant="outlined"
                      />
                    </Grid>

                    {/* previous_school */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(
                          touched.previous_school && errors.previous_school
                        )}
                        fullWidth
                        helperText={
                          touched.previous_school && errors.previous_school
                        }
                        label={t('Previous school')}
                        name="previous_school"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.previous_school}
                        variant="outlined"
                      />
                    </Grid>

                    {/* dummy  */}
                    <Grid item xs={0} md={6}></Grid>

                    {/* student_present_address */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        multiline
                        rows={3}
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(
                          touched.student_present_address &&
                          errors.student_present_address
                        )}
                        fullWidth
                        helperText={
                          touched.student_present_address &&
                          errors.student_present_address
                        }
                        label={t('Student present address')}
                        name="student_present_address"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.student_present_address}
                        variant="outlined"
                      />
                    </Grid>

                    {/* student_permanent_address */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        multiline
                        rows={3}
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(
                          touched.student_permanent_address &&
                          errors.student_permanent_address
                        )}
                        fullWidth
                        helperText={
                          touched.student_permanent_address &&
                          errors.student_permanent_address
                        }
                        label={t('Student permanent address')}
                        name="student_permanent_address"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.student_permanent_address}
                        variant="outlined"
                      />
                    </Grid>

                    {/* extra info */}
                    <Grid
                      item
                      xs={12}
                      display="flex"
                      justifyItems="center"
                    // bgcolor={"red"}
                    >
                      <Grid item>
                        {' '}
                        <Checkbox
                          name="is_extra"
                          checked={isExtraClass}
                          onChange={() => setIsExtraClass((value) => !value)}
                        />{' '}
                        Add Extra Class ?{' '}
                      </Grid>
                    </Grid>

                    {isExtraClass && (
                      <>
                        {/* extra classes */}
                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            disablePortal
                            options={extraClassesOptions}
                            value={selectedXtraCls}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                required
                                size="small"
                                sx={{
                                  '& fieldset': {
                                    borderRadius: '3px'
                                  }
                                }}
                                fullWidth
                                error={Boolean(
                                  touched.extra_class_id &&
                                  errors.extra_class_id
                                )}
                                helperText={
                                  touched.extra_class_id &&
                                  errors.extra_class_id
                                }
                                onBlur={handleBlur}
                                label={t('Select Extra class')}
                              />
                            )}
                            onChange={(event, value) =>
                              handleExtraClassSelect(
                                event,
                                value,
                                setFieldValue
                              )
                            }
                          />
                        </Grid>

                        {/* extra section */}
                        <Grid item xs={12} md={6}>
                          {selectedXtraCls && selectedXtraCls.has_section && (
                            <Autocomplete
                              size="small"
                              disablePortal
                              options={sectionsForSelectedXtraCls}
                              value={selectedXtraClsSection}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  required
                                  size="small"
                                  sx={{
                                    '& fieldset': {
                                      borderRadius: '3px'
                                    }
                                  }}
                                  fullWidth
                                  error={Boolean(
                                    touched.password && errors.password
                                  )}
                                  helperText={
                                    touched.password && errors.password
                                  }
                                  onBlur={handleBlur}
                                  label={t('Select Extra section')}
                                />
                              )}
                              onChange={(event, value) => {
                                console.log('selected sections__', {
                                  event,
                                  value
                                });
                                setSelectedXtraClsSection(value);
                                // @ts-ignore

                                setFieldValue('extra_section_id', value?.id);
                              }}
                            />
                          )}
                        </Grid>
                      </>
                    )}

                    {/* student photo */}
                    {/* <Grid container p={1} gap={1} xs={12} sm={6} md={6}></Grid> */}
                    <Grid container p={1} gap={1} xs={12}>
                      <Grid item>
                        <Image
                          src={
                            student_photo
                              ? student_photo
                              : getFile(
                                student?.student_photo ||
                                student?.filePathQuery?.student_photo_path
                              )
                          }
                          height={150}
                          width={150}
                          alt="Student photo"
                          loading="lazy"
                        />
                      </Grid>
                      <br />
                      <FileUploadFieldWrapper
                        htmlFor="student_photo"
                        label="Select Student photo:"
                        name="student_photo"
                        value={
                          values?.student_photo?.name ||
                          student?.student_photo ||
                          ''
                        }
                        handleChangeFile={(e) => {
                          if (e.target?.files?.length) {
                            const photoUrl = URL.createObjectURL(
                              e.target.files[0]
                            );
                            setStudent_photo(photoUrl);
                            setFieldValue('student_photo', e.target.files[0]);
                          }
                        }}
                        handleRemoveFile={(e) => {
                          setStudent_photo(null);
                          setFieldValue('student_photo', undefined);
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions
                sx={{
                  p: 3
                }}
              >
                <Button color="secondary" onClick={handleCreateClassClose}>
                  {t('Cancel')}
                </Button>
                {/* <Button
                  color="warning"
                  variant="contained"
                  onClick={() => setActiveStep(0)}
                >
                  {t('<< Previous')}
                </Button> */}
                <Button
                  type="submit"
                  startIcon={
                    isSubmitting ? <CircularProgress size="1rem" /> : null
                  }
                  // @ts-ignore
                  disabled={Boolean(errors.submit) || isSubmitting || isAvailableUsername}
                  variant="contained"
                >
                  {t('Next')}
                </Button>
              </DialogActions>
            </form>
          );
        }}
      </Formik>
    </>
  );
}

export default RegistrationSecondPart;
