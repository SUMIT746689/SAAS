import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import dayjs, { Dayjs } from 'dayjs';

import {
  Grid,
  DialogActions,
  DialogContent,
  TextField,
  CircularProgress,
  Button,
} from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import useNotistick from '@/hooks/useNotistick';
import { MobileDatePicker, MobileDateTimePicker } from '@mui/lab';
import { registration_no_generate } from '@/utils/utilitY-functions';

function RegistrationFirstPart({
  setTotalFormData,
  setActiveStep,
  handleCreateClassClose,
  student = null,
}) {
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();
  
  return (
    <>
      <Formik
        initialValues={{
          first_name: student ? (student?.first_name || student?.student_info?.first_name || '') : undefined,
          middle_name: student ? (student?.middle_name || student?.student_info?.middle_name || '') : '',
          last_name: student ? (student?.middle_name || student?.student_info?.last_name || '') : '',
          admission_no: student ? ( student?.admission_no|| student?.student_info?.admission_no) : '',
          admission_date: student ? ( student?.admission_date || student?.student_info?.admission_date) : null,
          date_of_birth: student ? ( student?.date_of_birth || student?.student_info?.date_of_birth) : null,
          gender: student ? ( student?.gender || student?.student_info?.gender) : 'male',
          blood_group: student ? ( student?.blood_group|| student?.student_info?.blood_group || '') : '',
          religion: student ? (student?.religion || student?.student_info?.religion) : '',
          phone: student ? (student?.phone || student?.student_info?.phone) : undefined,
          email: student ? ( student?.email || student?.student_info?.email) : '',
          national_id: student ? (student?.national_id || student?.student_info?.national_id) : '',
          student_photo: null
        }}
        validationSchema={Yup.object().shape({
          first_name: Yup.string()
            .max(255)
            .required(t('First name field is required')),
          middle_name: Yup.string().max(255).nullable(true),
          last_name: Yup.string().max(255).nullable(true),
          admission_date: Yup.date().required(t('Admission date is required!')),
          date_of_birth: Yup.date().required(t('Date of birth is required!')),
          gender: Yup.string().required(t('select a gender')),
          blood_group: Yup.string().nullable(true),
          religion: Yup.string().nullable(true),
          phone: Yup.string().required(t('Phone number is required!'))
            .min(11, 'Phone number must be greater then or equals 11 character'),
    
        })}
        onSubmit={async (
          _values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          try {
            console.log('clicked');
            setTotalFormData((values: any) => ({ ...values, ..._values }));
            setActiveStep(1);
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
          // console.log("T__values__",values);
          console.log({ errors });
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
                    {/* first_name */}
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        // required
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(touched.first_name && errors.first_name)}
                        fullWidth
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
                        helperText={touched.last_name && errors.last_name}
                        label={t('Last name')}
                        name="last_name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.last_name}
                        variant="outlined"
                      />
                    </Grid>

                    {/* admission_no   */}
                    <Grid item xs={12}>
                      <TextField
                        // required
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
                        helperText={touched.admission_no && errors.admission_no}
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

                      <MobileDateTimePicker
                        label="admission Date"
                        inputFormat='dd/MM/yyyy hh:mm a'
                        value={values.admission_date}
                        renderInput={(params) => (
                          <TextField
                            required
                            fullWidth
                            size="small"
                            name='admission_date'
                            onBlur={handleBlur}
                            sx={{
                              '& fieldset': {
                                borderRadius: '3px'
                              },
                              // color:"red"
                            }}
                            {...params}
                          />
                        )}
                        onChange={(n: any) => {
                          const newValue = dayjs(n)

                          // dayjs(newValue).format('H:m:ss')
                          if (n) {
                            console.log("admission_date__", newValue);
                            //@ts-ignore
                            setFieldValue('admission_date', newValue);

                          }
                        }}


                      />
                      {
                        errors.admission_date && <span style={{ color: 'red' }}> Admission date are required</span>
                      }
                    </Grid>

                    {/* date_of_birth */}
                    <Grid item xs={12} md={6}>
                      <MobileDatePicker
                        label="Date of birth"
                        inputFormat='dd/MM/yyyy'
                        value={values.date_of_birth}
                        onChange={(n) => {
                          if (n) {
                            // @ts-ignore
                            const newValue = dayjs(n)
                            setFieldValue('date_of_birth', newValue);

                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            required
                            fullWidth
                            name='date_of_birth'
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
                      {
                        errors.date_of_birth && <span style={{ color: 'red' }}> Date of birth are required</span>
                      }

                    </Grid>

                    {/* Gender */}
                    <Grid item xs={12}>
                      <FormControl required>
                        <FormLabel id="demo-row-radio-buttons-group-label">
                          Select Gender 
                        </FormLabel>
                        <RadioGroup
                          aria-labelledby="demo-controlled-radio-buttons-group"
                          name="gender"
                          row
                          value={values.gender}
                          onChange={(event) => {
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
                    <Grid item xs={12} md={6}>
                      <TextField
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(touched.phone && errors.phone)}
                        fullWidth
                        helperText={touched.phone && errors.phone}
                        label={t('Phone')}
                        name="phone"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        // required
                        value={values.phone}
                        variant="outlined"
                      />
                    </Grid>

                    {/* email */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        size="small"
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        error={Boolean(touched.email && errors.email)}
                        fullWidth
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
                    <Grid item xs={12} >
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
                        helperText={touched.national_id && errors.national_id}
                        label={t('Birth certificate Id')}
                        name="national_id"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.national_id}
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

export default RegistrationFirstPart;
