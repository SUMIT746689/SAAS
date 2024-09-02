'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  styled,
  Grid,
  Typography,
  useTheme,
  Box,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MobileDatePicker } from '@mui/lab';
import { LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import dayjs from 'dayjs';
import Image from 'next/image';
import useNotistick from '@/hooks/useNotistick';
import { FileUploadFieldWrapper } from '../components/reuseable/fileUpload';
import axios from 'axios';

import { SnackbarProvider } from 'notistack';

const TeachersApplication = ({ departments, serverHost }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { showNotification } = useNotistick();
  const [photo, setPhoto] = useState(null);

  const handleCreateClassClose = () => {
    router.push('/teachers-application');
  };

  const handleFormSubmit = async (
    _values,
    { resetForm, setErrors, setStatus, setSubmitting }
  ) => {
    try {
      console.log('_values__', _values);
      const resume = [];
      Array.prototype.forEach.call(_values.resume, function (file) {
        resume.push(file);
      });
      const formData = new FormData();

      for (const key in _values) {
        if (_values[key]) {
          formData.append(key, _values[key]);
        }
      }

      const successProcess = () => {
        resetForm();
        setPhoto(null);
        setStatus({ success: true });
        setSubmitting(false);
      };
      const res = await axios.post(
        `${serverHost}/api/teacher_recruitment`,
        formData
      );
      console.log('res?.data__', res?.data);
      showNotification(res?.data?.message);
      successProcess();
      handleCreateClassClose();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message, 'error');
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Typography variant="h4" gutterBottom p={4} align="center">
        {t('Teachers Application Form')}
      </Typography>

      <Formik
        initialValues={{
          first_name: '',
          middle_name: undefined,
          last_name: undefined,
          gender: undefined,
          phone: undefined,
          blood_group: undefined,
          religion: undefined,
          date_of_birth: null,
          present_address: undefined,
          permanent_address: undefined,
          department_id: undefined,
          national_id: undefined,
          email: undefined,
          resume: null,
          photo: null,
          submit: null
        }}
        // validationSchema={Yup.object().shape({
        //     first_name: Yup.string().required(
        //         t('The first name field is required')
        //     ),
        //     gender: Yup.string().required(t('The gender field is required')),
        //     date_of_birth: Yup.string().required(
        //         t('The date of birth field is required')
        //     ),
        //     phone: Yup.string().required(t('Phone number is required!'))
        //         .min(11, t('Phone number must be greater then or equals 11 character')),
        //     email: Yup.string().email(),
        //     present_address: Yup.string().required(
        //         t('The present address field is required')
        //     ),
        //     permanent_address: Yup.string().required(
        //         t('The parmanent_address field is required')
        //     ),
        //     department_id: Yup.number().required(
        //         t('The depardment field is required')
        //     ),
        //     national_id: Yup.number().required(
        //         t('The national id field is required')
        //     ),
        //     resume: Yup.mixed().required(t('The resume field is required'))
        // })}
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
          setFieldValue,
          resetForm
        }) => {
          // console.log("errors__", errors);
          return (
            <form onSubmit={handleSubmit}>
              <Grid container columnSpacing={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <Grid>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('First Name')}:*</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                    xs={12}
                  >
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      error={Boolean(touched.first_name && errors.first_name)}
                      fullWidth
                      helperText={touched.first_name && errors.first_name}
                      name="first_name"
                      placeholder={t('first name here...')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.first_name || ''}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Middle Name')}:</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      fullWidth
                      name="middle_name"
                      placeholder={t('middle name here...')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.middle_name || ''}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Last Name')}:</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      fullWidth
                      name="last_name"
                      placeholder={t('last name here...')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.last_name || ''}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('National Id')}:*</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      error={Boolean(touched.national_id && errors.national_id)}
                      fullWidth
                      helperText={touched.national_id && errors.national_id}
                      name="national_id"
                      placeholder={t('national id here...')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.national_id || ''}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Department')}</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <Autocomplete
                      size="small"
                      disablePortal
                      value={
                        departments?.find(
                          (i) => i.value === values.department_id
                        ) || null
                      }
                      options={departments}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      renderInput={(params) => (
                        <TextField
                          sx={{
                            '& fieldset': {
                              borderRadius: '3px'
                            }
                          }}
                          size="small"
                          error={Boolean(
                            touched?.department_id && errors?.department_id
                          )}
                          fullWidth
                          helperText={
                            touched?.department_id && errors?.department_id
                          }
                          name="department_id"
                          {...params}
                          label={t('Select Department')}
                        />
                      )}
                      // @ts-ignore
                      onChange={(e, value) =>
                        setFieldValue('department_id', value?.value || 0)
                      }
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Phone Number')}:</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      fullWidth
                      name="phone"
                      placeholder={t('phone number here...')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.phone || ''}
                      error={Boolean(touched.phone && errors.phone)}
                      helperText={touched.phone && errors.phone}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Gender')}:*</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel id="demo-simple-select-helper-label">
                        Select Gender
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        value={values.gender || ''}
                        name="gender"
                        label="Select Gender"
                        onChange={handleChange}
                        error={Boolean(touched.gender && errors.gender)}
                        onBlur={handleBlur}
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                      >
                        <MenuItem value={'male'}>Male</MenuItem>
                        <MenuItem value={'female'}>Female</MenuItem>
                      </Select>
                      <FormHelperText sx={{ color: 'red' }}>
                        {touched.gender && errors.gender}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Blood Group')}:</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel id="demo-simple-select-helper-label">
                        Select Blood Group
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        value={values.blood_group || ''}
                        name="blood_group"
                        label="Select Blood Group"
                        onChange={handleChange}
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                      >
                        <MenuItem value={'a+'}>A+</MenuItem>
                        <MenuItem value={'a-'}>A-</MenuItem>
                        <MenuItem value={'b+'}>B+</MenuItem>
                        <MenuItem value={'b-'}>B-</MenuItem>
                        <MenuItem value={'o+'}>O+</MenuItem>
                        <MenuItem value={'o-'}>O-</MenuItem>
                        <MenuItem value={'ab+'}>AB+</MenuItem>
                        <MenuItem value={'ab-'}>AB-</MenuItem>
                      </Select>
                      <FormHelperText>
                        {touched.gender && errors.gender}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Religion')}:</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      value={values.religion}
                      size="small"
                      fullWidth
                      name="religion"
                      placeholder={t('provide religion here...')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      // value={values.resume.name}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Date Of Birth')}:*</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <MobileDatePicker
                      label="Provide birth date"
                      inputFormat="dd/MM/yyyy"
                      value={values.date_of_birth || null}
                      onChange={(n) => {
                        const value = dayjs(n);
                        if (n) {
                          setFieldValue('date_of_birth', value);
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
                          fullWidth
                          {...params}
                          error={Boolean(
                            touched?.date_of_birth && errors?.date_of_birth
                          )}
                          helperText={
                            touched?.date_of_birth && errors?.date_of_birth
                          }
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid item sm={6}></Grid>
                <Grid item xs={12} md={6}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Present Address')}:*</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      multiline
                      rows={3}
                      error={Boolean(
                        touched.present_address && errors.present_address
                      )}
                      fullWidth
                      helperText={
                        touched.present_address && errors.present_address
                      }
                      name="present_address"
                      placeholder={t('present address here...')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.present_address || ''}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Permanent Address')}:*</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      multiline
                      rows={3}
                      error={Boolean(
                        touched.permanent_address && errors.permanent_address
                      )}
                      fullWidth
                      helperText={
                        touched.permanent_address && errors.permanent_address
                      }
                      name="permanent_address"
                      placeholder={t('permanent address here...')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.permanent_address || ''}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(1)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Email')}:</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      fullWidth
                      type="email"
                      name="email"
                      placeholder={t('provide email here...')}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.email || ''}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Resume')}:*</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(3)}`
                    }}
                    item
                  >
                    <FileUploadFieldWrapper
                      htmlFor="resume"
                      accept="application/pdf"
                      label="Select resume:"
                      name="resume"
                      error={Boolean(touched.resume && errors.resume)}
                      fullWidth
                      helperText={touched.resume && errors.resume}
                      value={values?.resume?.name || ''}
                      handleChangeFile={(e) => {
                        if (e.target?.files?.length) {
                          setFieldValue('resume', e.target.files[0]);
                        }
                      }}
                      handleRemoveFile={(e) => {
                        setFieldValue('resume', undefined);
                      }}
                    />

                    {errors?.resume && (
                      <Typography sx={{ color: 'red' }}>
                        {errors?.resume}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid item>
                    <Box
                      pr={3}
                      sx={{
                        pt: `${theme.spacing(2)}`,
                        pb: { xs: 1, md: 0 }
                      }}
                      alignSelf="center"
                    >
                      <b>{t('Photo')}:</b>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{
                      mb: `${theme.spacing(1)}`
                    }}
                    item
                  >
                    {photo && (
                      <Grid item>
                        <Image
                          src={photo}
                          height={150}
                          width={150}
                          alt="photo"
                          loading="lazy"
                        />
                      </Grid>
                    )}
                    <br />
                    <FileUploadFieldWrapper
                      htmlFor="photo"
                      label="Select photo:"
                      name="photo"
                      value={values?.photo?.name || ''}
                      handleChangeFile={(e) => {
                        if (e.target?.files?.length) {
                          const photoUrl = URL.createObjectURL(
                            e.target.files[0]
                          );
                          setPhoto(photoUrl);
                          setFieldValue('photo', e.target.files[0]);
                        }
                      }}
                      handleRemoveFile={(e) => {
                        setPhoto(null);
                        setFieldValue('photo', undefined);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <DialogActions
                sx={{
                  p: 3
                }}
              >
                <Button
                  color="secondary"
                  onClick={() => {
                    handleCreateClassClose();
                    resetForm();
                  }}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  type="submit"
                  startIcon={
                    isSubmitting ? <CircularProgress size="1rem" /> : null
                  }
                  //@ts-ignore
                  disabled={Boolean(errors.submit) || isSubmitting}
                  variant="contained"
                >
                  {t(`Submit`)}
                </Button>
              </DialogActions>
            </form>
          );
        }}
      </Formik>
    </LocalizationProvider>
  );
};

export default TeachersApplication;
