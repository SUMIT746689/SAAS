import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/useAuth';
import dayjs, { Dayjs } from 'dayjs';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Zoom,
  Typography,
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useSnackbar } from 'notistack';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import useNotistick from '@/hooks/useNotistick';
import axios from 'axios';
import { DateTimePicker, DesktopDatePicker } from '@mui/lab';

function RegistrationFirstPart({ setUsersFlag }) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const { user } = useAuth();
  const [academicYears, setacademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setselectedClass] = useState(null);
  const [admission_date, setAdmission_date] = useState<Dayjs | null>(null);
  const [date_of_birth, setDate_of_birth] = useState<Dayjs | null>(null);
  const [sectionsForSelectedClass, setSectionsForSelectedClass] = useState([]);
  const [gender, setGender] = useState('male');

  const handleCreateClassOpen = () => {
    setOpen(true);
  };

  const handleCreateClassClose = () => {
    setOpen(false);
  };

  const handleCreateUserSuccess = () => {
    showNotification('The user student created successfully');

    setOpen(false);
  };

  useEffect(() => {
    if (selectedClass) {
      axios
        .get(`/api/class/${selectedClass}`)
        .then((res) => {
          console.log(res.data);
          setSectionsForSelectedClass(res.data?.sections);
        })
        .catch((err) => console.log(err));
    }
  }, [selectedClass]);

  useEffect(() => {
    axios
      .get('/api/academic_years')
      .then((res) =>
        setacademicYears(
          res?.data?.data?.map((i) => {
            return {
              label: i.title,
              id: i.id
            };
          }) || []
        )
      )
      .catch((err) => console.log(err));

    axios
      .get('/api/class')
      .then((res) => {
        setClasses(
          res.data?.map((i) => {
            return {
              label: i.name,
              id: i.id
            };
          })
        );
      })
      .catch((err) => console.log(err));
  }, []);
  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            {t('Student Management')}
          </Typography>
          <Typography variant="subtitle2">
            {t(
              'All aspects related to the app users can be managed from this page'
            )}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            sx={{
              mt: { xs: 2, sm: 0 }
            }}
            onClick={handleCreateClassOpen}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
          >
            {t('Create student')}
          </Button>
        </Grid>
      </Grid>
      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        onClose={handleCreateClassClose}
      >
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('Student Registration Form')}
          </Typography>
          <Typography variant="subtitle2">
            {t('Fill in the fields below to registration a new student')}
          </Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            first_name: '',
            middle_name: '',
            last_name: '',
            section_id: null,
            password: '',
            confirm_password: '',
            academic_year_id: 0,
            admission_no: '',
            admission_date: null,
            admission_status: '',
            date_of_birth: null,
            gender: 'male',
            blood_group: '',
            religion: '',
            phone: '',
            email: '',
            national_id: '',
            roll_no: '',
            registration_no: '',
            discount: 0,
            student_photo: null,
            student_admission_status: '',
            father_name: '',
            father_phone: '',
            father_profession: '',
            father_photo: null,
            mather_name: '',
            mather_phone: '',
            mather_profession: '',
            mather_photo: null,
            guardian_name: '',
            guardian_phone: '',
            guardian_profession: '',
            guardian_photo: null,
            relation_with_guardian: '',
            student_present_address: '',
            student_permanent_address: '',
            previous_school: ''
          }}
          validationSchema={Yup.object().shape({
            first_name: Yup.string()
              .max(255)
              .required(t('First name field is required')),
            middle_name: Yup.string().max(255),
            last_name: Yup.string().max(255),
            section_id: Yup.number().integer().positive().required(),
            academic_year_id: Yup.number().positive().integer().required(),
            password: Yup.string()
              .max(255)
              .required(t('The password field is required'))
              .min(8, 'Password is too short - should be 8 chars minimum.'),
            // .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.'),
            confirm_password: Yup.string()
              .max(255)
              .required(t('confirm_password field is required'))
              .oneOf([Yup.ref('password'), null], 'Passwords must match'),
            admission_no: Yup.string(),
            // admission_date: Yup.date().required(t('Admission date is required!')),
            admission_status: Yup.string().required(
              t('Admission status is required!')
            ),
            // date_of_birth: Yup.date().required(t('Date of birth is required!')),
            blood_group: Yup.string(),
            religion: Yup.string(),
            phone: Yup.string(),
            email: Yup.string(),
            national_id: Yup.string(),
            // roll_no: Yup.string().required(t('roll no is required!')),
            registration_no: Yup.string().required(
              t('registration no is required!')
            )
          })}
          onSubmit={async (
            _values,
            { resetForm, setErrors, setStatus, setSubmitting }
          ) => {
            try {
              console.log('clicked');
              _values = {
                ..._values,
                // @ts-ignore
                school_id: user?.school_id
              };
              console.log('__values ', _values);

              const formData = new FormData();

              for (let i in _values) {
                formData.append(`${i}`, _values[i]);
              }

              // for (const pair of formData.entries()) {
              //   console.log(`${pair[0]}, ${pair[1]}`);
              // }

              await axios
                .post(`/api/student`, formData, {
                  // headers: {
                  //   Authorization: `Bearer ${token}`
                  // }
                })
                .then(() => {
                  resetForm();
                  setStatus({ success: true });
                  setSubmitting(false);
                  handleCreateUserSuccess();
                  setUsersFlag(true);
                  setselectedClass(null);
                  setSectionsForSelectedClass([]);
                });
              // await wait(1000);
            } catch (err) {
              console.error(err);
              showNotification('There was an error, try again later','error');
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
            // console.log("T__values__",values);

            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container>
                    <Grid container item spacing={1}>
                      {/* first_name */}
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.first_name && errors.first_name
                          )}
                          fullWidth
                          margin="normal"
                          helperText={touched.first_name && errors.first_name}
                          label={t('First name')}
                          name="first_name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.first_name}
                          variant="outlined"
                        />
                      </Grid>
                      {/* middle_name */}
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.middle_name && errors.middle_name
                          )}
                          fullWidth
                          margin="normal"
                          helperText={touched.middle_name && errors.middle_name}
                          label={t('Middle name')}
                          name="middle_name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.middle_name}
                          variant="outlined"
                        />
                      </Grid>
                      {/* last_name */}
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(touched.last_name && errors.last_name)}
                          fullWidth
                          margin="normal"
                          helperText={touched.last_name && errors.last_name}
                          label={t('Last name')}
                          name="last_name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.last_name}
                          variant="outlined"
                        />
                      </Grid>
                      {/* classes */}
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          disablePortal
                          options={classes}
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
                              label={t('Select class')}
                            />
                          )}
                          onChange={(event, value) => {
                            console.log('selected class__', { event, value });

                            setselectedClass(value?.id);
                          }}
                        />
                      </Grid>
                      {/* section */}
                      {selectedClass && (
                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            size="small"
                            disablePortal
                            options={sectionsForSelectedClass?.map(
                              (section) => {
                                return {
                                  label: section.name,
                                  id: section.id
                                };
                              }
                            )}
                            renderInput={(params) => (
                              <TextField
                                size="small"
                                sx={{
                                  '& fieldset': {
                                    borderRadius: '3px'
                                  }
                                }}
                                fullWidth
                                {...params}
                                label={t('Select section')}
                                // error={Boolean(touched.section_id && errors.section_id)}
                                // helperText={'The section is required'}
                              />
                            )}
                            onChange={(event, value) => {
                              console.log('selected sections__', {
                                event,
                                value
                              });
                              // @ts-ignore
                              setFieldValue('section_id', value?.id);
                            }}
                          />
                        </Grid>
                      )}
                      {/* academicYears */}
                      <Grid item xs={12} md={7}>
                        <Autocomplete
                          size="small"
                          disablePortal
                          options={academicYears}
                          renderInput={(params) => (
                            <TextField
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
                            console.log('selected session__', {
                              event,
                              value
                            });

                            setFieldValue('academic_year_id', value?.id);
                          }}
                        />
                      </Grid>
                      {/* password */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(touched.password && errors.password)}
                          fullWidth
                          margin="normal"
                          helperText={touched.password && errors.password}
                          label={t('Password')}
                          name="password"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="password"
                          value={values.password}
                          variant="outlined"
                        />
                      </Grid>
                      {/* confirm_password */}
                      <Grid item xs={12} md={6}>
                        <TextField
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
                          margin="normal"
                          helperText={
                            touched.confirm_password && errors.confirm_password
                          }
                          label={t('Confirm password')}
                          name="confirm_password"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="password"
                          value={values.confirm_password}
                          variant="outlined"
                        />
                      </Grid>
                      {/* admission_no   */}
                      <Grid item xs={12}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.admission_no && errors.admission_no
                          )}
                          fullWidth
                          helperText={
                            touched.admission_no && errors.admission_no
                          }
                          label={t('Admission no')}
                          name="admission_no"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.admission_no}
                          variant="outlined"
                        />
                      </Grid>
                      {/* admission_date */}
                      <Grid item xs={12} md={6}>
                       
                          <DateTimePicker
                            label="admission Date"
                            value={admission_date}
                            onChange={(n) => {
                              const newValue = dayjs(n)
                              if (n) {
                                // setFieldValue("admission_date", `1970-05-02 ${newValue.$H}:${newValue.$m}:00+0000`)
                              //  @ts-ignore
                                setFieldValue('admission_date', newValue.$d);
                                setAdmission_date(newValue);
                                console.log(newValue);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                size="small"
                                sx={{
                                  '& fieldset': {
                                    borderRadius: '3px'
                                  }
                                }}
                                {...params}
                              />
                            )}
                          />
                       
                      </Grid>

                      {/* date_of_birth */}
                      <Grid item xs={12} md={6}>
                        
                          <DesktopDatePicker
                            label="Date of birth"
                           
                            value={date_of_birth}
                            onChange={(n) => {
                              const newValue = dayjs(n)
                              if (n) {
                                // setFieldValue("date_of_birth", `1970-05-02 ${newValue.$H}:${newValue.$m}:00+0000`)
                                //@ts-ignore
                                setFieldValue('date_of_birth', newValue.$d);
                                setDate_of_birth(newValue);
                                console.log(newValue);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                size="small"
                                sx={{
                                  '& fieldset': {
                                    borderRadius: '3px'
                                  }
                                }}
                                {...params}
                              />
                            )}
                          />
                       
                      </Grid>
                      {/* admission_status */}
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          size="small"
                          disablePortal
                          options={['waiting', 'approved', 'declined']}
                          renderInput={(params) => (
                            <TextField
                              size="small"
                              sx={{
                                '& fieldset': {
                                  borderRadius: '3px'
                                }
                              }}
                              fullWidth
                              {...params}
                              label={t('Select admission status')}
                            />
                          )}
                          onChange={(event, value) => {
                            console.log('selected admission_status', {
                              event,
                              value
                            });

                            setFieldValue('admission_status', value);
                          }}
                        />
                      </Grid>
                      {/* Gender */}
                      <Grid item xs={12} md={6}>
                        <FormControl>
                          <FormLabel id="demo-row-radio-buttons-group-label">
                            Select Gender
                          </FormLabel>
                          <RadioGroup
                            aria-labelledby="demo-controlled-radio-buttons-group"
                            name="gender"
                            row
                            value={gender}
                            onChange={(event) => {
                              setGender(event.target.value);
                              setFieldValue('gender', event.target.value);
                            }}
                          >
                            <FormControlLabel
                              value="male"
                              control={<Radio />}
                              label="Male"
                            />
                            <FormControlLabel
                              value="female"
                              control={<Radio />}
                              label="Female"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {/* blood_group */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.blood_group && errors.blood_group
                          )}
                          fullWidth
                          margin="normal"
                          helperText={touched.blood_group && errors.blood_group}
                          label={t('blood Group')}
                          name="blood_group"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.blood_group}
                          variant="outlined"
                        />
                      </Grid>
                      {/* religion */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(touched.religion && errors.religion)}
                          fullWidth
                          margin="normal"
                          helperText={touched.religion && errors.religion}
                          label={t('Religion')}
                          name="religion"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.religion}
                          variant="outlined"
                        />
                      </Grid>
                      {/* phone */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(touched.phone && errors.phone)}
                          fullWidth
                          margin="normal"
                          helperText={touched.phone && errors.phone}
                          label={t('phone')}
                          name="phone"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.phone}
                          variant="outlined"
                        />
                      </Grid>
                      {/* email */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(touched.email && errors.email)}
                          fullWidth
                          margin="normal"
                          helperText={touched.email && errors.email}
                          label={t('email')}
                          name="email"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="email"
                          value={values.email}
                          variant="outlined"
                        />
                      </Grid>
                      {/* national_id */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.national_id && errors.national_id
                          )}
                          fullWidth
                          margin="normal"
                          helperText={touched.national_id && errors.national_id}
                          label={t('national Id')}
                          name="national_id"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.national_id}
                          variant="outlined"
                        />
                      </Grid>
                      {/* roll_no */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(touched.roll_no && errors.roll_no)}
                          fullWidth
                          margin="normal"
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
                          margin="normal"
                          helperText={
                            touched.registration_no && errors.registration_no
                          }
                          label={t('Registration number')}
                          name="registration_no"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.registration_no}
                          variant="outlined"
                        />
                      </Grid>
                      {/* discount */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(touched.discount && errors.discount)}
                          fullWidth
                          margin="normal"
                          helperText={touched.discount && errors.discount}
                          label={t('Discount')}
                          name="discount"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="number"
                          value={values.discount}
                          variant="outlined"
                        />
                      </Grid>
                      {/* student photo */}
                      <Grid item xs={12} sm={6} md={6}>
                        <label htmlFor="student_photo">Student photo:</label> <br />
                        <input
                          accept="image/*"
                          type="file"
                          name="student_photo"
                          onChange={(e) => {
                            console.log(e.target.files[0]);
                            setFieldValue('student_photo', e.target.files[0]);
                          }}
                        />
                      </Grid>
                      {/* student_admission_status */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.student_admission_status &&
                              errors.student_admission_status
                          )}
                          fullWidth
                          margin="normal"
                          helperText={
                            touched.student_admission_status &&
                            errors.student_admission_status
                          }
                          label={t('Student admission status')}
                          name="student_admission_status"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.student_admission_status}
                          variant="outlined"
                        />
                      </Grid>
                      {/* father_name */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.father_name && errors.father_name
                          )}
                          fullWidth
                          margin="normal"
                          helperText={touched.father_name && errors.father_name}
                          label={t('Father name')}
                          name="father_name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.father_name}
                          variant="outlined"
                        />
                      </Grid>
                      {/* father_phone */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.father_phone && errors.father_phone
                          )}
                          fullWidth
                          margin="normal"
                          helperText={
                            touched.father_phone && errors.father_phone
                          }
                          label={t('father phone number')}
                          name="father_phone"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.father_phone}
                          variant="outlined"
                        />
                      </Grid>
                      {/* father_profession */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.father_profession &&
                              errors.father_profession
                          )}
                          fullWidth
                          margin="normal"
                          helperText={
                            touched.father_profession &&
                            errors.father_profession
                          }
                          label={t('father Profession')}
                          name="father_profession"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.father_profession}
                          variant="outlined"
                        />
                      </Grid>
                      {/* father_photo */}
                      <Grid item xs={12} sm={6} md={6}>
                        <label htmlFor="student_photo">Father photo:</label> <br />
                        <input
                          accept="image/*"
                          type="file"
                          name="father_photo"
                          onChange={(e) => {
                            console.log(e.target.files[0]);
                            setFieldValue('father_photo', e.target.files[0]);
                          }}
                        />
                      </Grid>
                      {/* mather_name */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.mather_name && errors.mather_name
                          )}
                          fullWidth
                          margin="normal"
                          helperText={touched.father_name && errors.mather_name}
                          label={t('Mother name')}
                          name="mather_name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.mather_name}
                          variant="outlined"
                        />
                      </Grid>
                      {/* mather_phone */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.mather_phone && errors.mather_phone
                          )}
                          fullWidth
                          margin="normal"
                          helperText={
                            touched.mather_phone && errors.mather_phone
                          }
                          label={t('Mather phone number')}
                          name="mather_phone"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.mather_phone}
                          variant="outlined"
                        />
                      </Grid>
                      {/* mather_profession */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.mather_profession &&
                              errors.mather_profession
                          )}
                          fullWidth
                          margin="normal"
                          helperText={
                            touched.mather_profession &&
                            errors.mather_profession
                          }
                          label={t('Mather profession')}
                          name="mather_profession"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.mather_profession}
                          variant="outlined"
                        />
                      </Grid>
                      {/* mather_photo */}
                      <Grid item xs={12} sm={6} md={6}>
                        <label htmlFor="mather_photo">Mather photo:</label> <br />
                        <input
                          accept="image/*"
                          type="file"
                          name="mather_photo"
                          onChange={(e) => {
                            console.log(e.target.files[0]);
                            setFieldValue('mather_photo', e.target.files[0]);
                          }}
                        />
                      </Grid>
                      {/* guardian_name */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.guardian_name && errors.guardian_name
                          )}
                          fullWidth
                          margin="normal"
                          helperText={
                            touched.guardian_name && errors.guardian_name
                          }
                          label={t('Guardian name')}
                          name="guardian_name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.guardian_name}
                          variant="outlined"
                        />
                      </Grid>
                      {/* guardian_phone */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.guardian_phone && errors.guardian_phone
                          )}
                          fullWidth
                          margin="normal"
                          helperText={
                            touched.guardian_phone && errors.guardian_phone
                          }
                          label={t('Guardian phone')}
                          name="guardian_phone"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.guardian_phone}
                          variant="outlined"
                        />
                      </Grid>
                      {/* guardian_profession */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.guardian_profession &&
                              errors.guardian_profession
                          )}
                          fullWidth
                          margin="normal"
                          helperText={
                            touched.guardian_profession &&
                            errors.guardian_profession
                          }
                          label={t('Guardian profession')}
                          name="guardian_profession"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.guardian_profession}
                          variant="outlined"
                        />
                      </Grid>
                      {/* guardian_photo */}
                      <Grid item xs={12} sm={6} md={6}>
                        <label htmlFor="guardian_photo">Guardian photo:</label>{' '}
                        <br />
                        <input
                          accept="image/*"
                          type="file"
                          name="guardian_photo"
                          onChange={(e) => {
                            console.log(e.target.files[0]);
                            setFieldValue('guardian_photo', e.target.files[0]);
                          }}
                        />
                      </Grid>
                      {/* relation_with_guardian */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          size="small"
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          error={Boolean(
                            touched.relation_with_guardian &&
                              errors.relation_with_guardian
                          )}
                          fullWidth
                          margin="normal"
                          helperText={
                            touched.relation_with_guardian &&
                            errors.relation_with_guardian
                          }
                          label={t('Relation with guardian')}
                          name="relation_with_guardian"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          type="text"
                          value={values.relation_with_guardian}
                          variant="outlined"
                        />
                      </Grid>
                      {/* student_present_address */}
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
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
                          margin="normal"
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
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
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
                          margin="normal"
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
                      {/* previous_school */}
                      <Grid item xs={12} sm={6} md={6}>
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
                          margin="normal"
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
                  <Button
                    type="submit"
                    startIcon={
                      isSubmitting ? <CircularProgress size="1rem" /> : null
                    }
                    // @ts-ignore
                    disabled={Boolean(errors.submit) || isSubmitting}
                    variant="contained"
                  >
                    {t('Add new student')}
                  </Button>
                </DialogActions>
              </form>
            );
          }}
        </Formik>
      </Dialog>
    </>
  );
}

export default RegistrationFirstPart;
