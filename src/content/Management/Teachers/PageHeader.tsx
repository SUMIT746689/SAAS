import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import 'react-quill/dist/quill.snow.css';

import {
  styled,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
  useTheme,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import axios from 'axios';

import useNotistick from '@/hooks/useNotistick';
import { DatePicker, MobileDatePicker } from '@mui/lab';
import dayjs from 'dayjs';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import { generateUsername, generateUsernameNew, getFile } from '@/utils/utilitY-functions';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { NewDebounceInput } from '@/components/DebounceInput';

const BoxUploadWrapper = styled(Box)(
  ({ theme }) => `
    border-radius: ${theme.general.borderRadius};
    padding: ${theme.spacing(3)};
    background: ${theme.colors.alpha.black[5]};
    border: 1px dashed ${theme.colors.alpha.black[30]};
    outline: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: ${theme.transitions.create(['border', 'background'])};

    &:hover {
      background: ${theme.colors.alpha.white[100]};
      border-color: ${theme.colors.primary.main};
    }
`
);

function PageHeader({ editSchool, setEditSchool, departments, reFetchData }): any {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const theme = useTheme();

  useEffect(() => {
    if (editSchool) {
      handleCreateProjectOpen();
    }
  }, [editSchool]);

  const handleCreateProjectOpen = () => {
    setOpen(true);
  };

  const handleCreateProjectClose = () => {
    setOpen(false);
    setEditSchool(null);
  };

  const handleCreateProjectSuccess = (message) => {
    showNotification(message);

    setOpen(false);
  };

  const handleFormSubmit = async (_values, resetForm, setErrors, setStatus, setSubmitting) => {
    try {
      const resume: any = [];
      if (_values.resume)
        Array.prototype.forEach.call(_values.resume, function (file) {
          resume.push(file);
        });
      const formData = new FormData();
      formData.append('first_name', _values.first_name);
      formData.append('middle_name', _values.middle_name);
      formData.append('last_name', _values.last_name);
      formData.append('national_id', _values.national_id);
      if (_values.department_id) formData.append('department_id', _values.department_id);
      formData.append('phone', _values.phone);
      formData.append('gender', _values.gender);
      formData.append('blood_group', _values.blood_group);
      formData.append('religion', _values.religion);
      formData.append('date_of_birth', _values.date_of_birth);
      formData.append('present_address', _values.present_address);
      formData.append('permanent_address', _values.permanent_address);
      formData.append('salary_type', _values.salary_type);
      formData.append('teacher_id', _values.teacher_id);
      formData.append('username', _values.username);

      if (_values.password !== '') {
        formData.append('password', _values.password);
      }

      formData.append('email', _values.email);
      formData.append('resume', _values.resume);

      formData.append('photo', _values.photo);

      const successProcess = (message) => {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateProjectSuccess(message);
        setEditSchool(null);
        reFetchData();
      };
      if (editSchool) {
        const result = await axios({
          method: 'PATCH',
          url: `/api/teacher?teacher_id=${editSchool.id}`,
          data: formData,
          headers: {
            'Content-Type': `multipart/form-data; boundary=<calculated when request is sent>`
          }
        });
        if (result.data?.success) successProcess(t('A teacher has been updated successfully'));
        else throw new Error('edit teacher failed');
      } else {
        const res = await axios({
          method: 'POST',
          url: '/api/teacher',
          data: formData,
          headers: {
            'Content-Type': `multipart/form-data; boundary=<calculated when request is sent>`
          }
        });
        if (res.data?.success) successProcess(t('A new teacher has been created successfully'));
        else throw new Error('created teacher failed');
      }
    } catch (err) {
      handleShowErrMsg(err, showNotification);
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };


  const [isAvailableUsername, setIsAvailableUsername] = useState();

  const handleDebounce = (value) => {
    // console.log({ value, name: editSchool },?.user?.username?.toLowerCase() === value?.toLowerCase())
    // if (totalFormData?.username?.toLowerCase() === value?.toLowerCase()) return setIsAvailableUsername(null);
    if (editSchool?.user?.username?.toLowerCase() === value?.toLowerCase()) return setIsAvailableUsername(null);
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
      <PageHeaderTitleWrapper name="Teacher" handleCreateClassOpen={handleCreateProjectOpen} />

      <Dialog fullWidth maxWidth="md" open={open} onClose={handleCreateProjectClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('Create new teacher')}
          </Typography>
          <Typography variant="subtitle2">{t('Use this dialog window to add a new teacher')}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            username: editSchool?.user?.username || undefined,
            password: undefined,
            first_name: editSchool?.first_name || '',
            middle_name: editSchool?.middle_name || '',
            last_name: editSchool?.last_name || '',
            gender: editSchool?.gender || '',
            phone: editSchool?.phone || '',
            blood_group: editSchool?.blood_group || '',
            religion: editSchool?.religion || '',
            date_of_birth: editSchool?.date_of_birth || '',
            present_address: editSchool?.present_address || '',
            permanent_address: editSchool?.permanent_address || '',
            department_id: editSchool?.department_id,
            national_id: editSchool?.national_id || '',
            email: editSchool?.email || '',
            resume: editSchool?.resume || '',
            photo: '',
            submit: null,
            salary_type: editSchool?.salary_type || '',
            teacher_id: editSchool?.teacher_id || ''
          }}
          validationSchema={Yup.object().shape({
            username: Yup.string().max(255).required(t('The name field is required')),
            password: editSchool ? Yup.string() : Yup.string().required(t('The password field is required')),
            first_name: Yup.string().required(t('The first name field is required')),
            gender: Yup.string().required(t('The gender field is required')),
            date_of_birth: Yup.string().required(t('The date of birth field is required')),
            present_address: Yup.string().required(t('The present address field is required')),
            permanent_address: Yup.string().required(t('The parmanent_address field is required')),
            salary_type: Yup.string().required(t('The salary_type field is required')),
            teacher_id: Yup.string().required(t('The teacher_id field is required')),
            // department_id: Yup.number().required(
            //   t('The depardment field is required')
            // ),
            national_id: Yup.number().required(t('The national id field is required'))
            // resume: !editSchool ? Yup.mixed().required(t('The resume field is required')) : Yup.mixed()
          })}
          onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) =>
            handleFormSubmit(_values, resetForm, setErrors, setStatus, setSubmitting)
          }
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent
                dividers
                sx={{
                  p: 3
                }}
              >
                <Grid container columnSpacing={1}>
                  <Grid
                    container
                    sx={{
                      background: `linear-gradient(to right bottom,${theme.colors.primary.main}, ${theme.colors.alpha.white[50]} )`,
                      p: 1,
                      color: 'white',
                      mb: 1
                    }}
                  >
                    Basic Information:
                  </Grid>

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
                        <b>{t('First Name')}: <span style={{ color: "red" }}>*</span></b>
                      </Box>
                    </Grid>
                    <Grid
                      sx={{
                        mb: `${theme.spacing(3)}`
                      }}
                      item
                      xs={12}
                    >
                      {/* <TextField
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
                        onBlurCapture={(v) => {
                          if (v) {
                            const temp = generateUsername(values.first_name);
                            if (!editSchool?.user?.username) {
                              setFieldValue('password', temp);
                            }
                            setFieldValue('username', temp);
                          }
                        }}
                        onChange={handleChange}
                        value={values.first_name}
                        variant="outlined"
                      /> */}
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
                        onBlurCapture={async (v) => {
                          if (v) {
                            if (editSchool || values.username) return;
                            const uniqueUsername = await generateUsernameNew(values.first_name);
                            console.log({ uniqueUsername })
                            setFieldValue('username', uniqueUsername)
                          }
                        }}
                        onChange={handleChange}
                        value={values.first_name}
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
                        value={values.middle_name}
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
                        value={values.last_name}
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
                        <b>{t('National Id')}: <span style={{ color: "red" }}>*</span></b>
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
                        value={values.national_id}
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
                        <b>{t('Department:')} <span style={{ color: "red" }}>*</span></b>
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
                        value={departments?.find((department) => department.value === values.department_id) || null}
                        options={departments}
                        isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                        renderInput={(params) => (
                          <TextField
                            sx={{
                              '& fieldset': {
                                borderRadius: '3px'
                              }
                            }}
                            size="small"
                            error={Boolean(touched?.department_id && errors?.department_id)}
                            fullWidth
                            helperText={touched?.department_id && errors?.department_id}
                            name="department_id"
                            {...params}
                            label={t('')}
                            required={true}
                          />
                        )}
                        // @ts-ignore
                        onChange={(e, value: any) => setFieldValue('department_id', value?.value || 0)}
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
                        value={values.phone}
                        onBlurCapture={(v) => {
                          if (!v || editSchool || values.password) return;
                          setFieldValue('password', values.phone)
                        }}
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
                        <b>{t('Gender')}: <span style={{color:"red"}}>*</span></b>
                      </Box>
                    </Grid>
                    <Grid
                      sx={{
                        mb: `${theme.spacing(3)}`
                      }}
                      item
                    >
                      <FormControl fullWidth size="small">
                        {/* <InputLabel id="demo-simple-select-helper-label">Select Gender</InputLabel> */}
                        <Select
                          labelId="demo-simple-select-helper-label"
                          id="demo-simple-select-helper"
                          value={values.gender}
                          name="gender"
                          label=""
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
                        <FormHelperText sx={{ color: 'red' }}>{touched.gender && errors.gender}</FormHelperText>
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
                        {/* <InputLabel id="demo-simple-select-helper-label">Select Blood Group</InputLabel> */}
                        <Select
                          labelId="demo-simple-select-helper-label"
                          id="demo-simple-select-helper"
                          value={values.blood_group}
                          name="blood_group"
                          label=""
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
                        <FormHelperText>{touched.gender && errors.gender}</FormHelperText>
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
                        <b>{t('Date Of Birth')}: <span style={{color:"red"}}>*</span></b>
                      </Box>
                    </Grid>
                    <Grid
                      sx={{
                        mb: `${theme.spacing(3)}`
                      }}
                      item
                    >
                      <MobileDatePicker
                        label=""
                        inputFormat="dd/MM/yyyy"
                        value={values.date_of_birth}
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
                            error={Boolean(touched?.date_of_birth && errors?.date_of_birth)}
                            helperText={touched?.date_of_birth && errors?.date_of_birth}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  {/* Teacher salary code  start*/}
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
                        <b>{t('Salary Type')}: <span style={{color:"red"}}>*</span></b>
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
                        value={values.salary_type || null}
                        options={[
                          {
                            label: 'percentage wise',
                            value: 'percentage_wise',
                            id: 1
                          },
                          {
                            label: 'class wise',
                            value: 'class_wise',
                            id: 2
                          },
                          {
                            label: 'monthly',
                            value: 'monthly',
                            id: 3
                          }
                        ]}
                        isOptionEqualToValue={(option: any, value: any) => {
                          return option.label === value;
                        }}
                        renderInput={(params) => (
                          <TextField
                            sx={{
                              '& fieldset': {
                                borderRadius: '3px'
                              }
                            }}
                            size="small"
                            error={Boolean(touched?.salary_type && errors?.salary_type)}
                            fullWidth
                            helperText={touched?.salary_type && errors?.salary_type}
                            name="salary_type"
                            {...params}
                            label={t('')}
                            placeholder="Select salary type"
                          />
                        )}
                        // @ts-ignore
                        onChange={(e, value: any) => {
                          setFieldValue('salary_type', value?.value || null);
                        }}
                      />
                    </Grid>
                  </Grid>
                  {/* Teacher salary code  end*/}

                  {/* Teacher id code start */}
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
                        <b>{t('Teacher Id')}: <span style={{color:"red"}}>*</span></b>
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
                        error={Boolean(touched.teacher_id && errors.teacher_id)}
                        fullWidth
                        helperText={touched.teacher_id && errors.teacher_id}
                        name="teacher_id"
                        placeholder={t('teacher id here...')}
                        onBlur={handleBlur}
                        onBlurCapture={(v) => {
                          // if (v) {
                          //   const temp = generateUsername(values.first_name);
                          //   if (!editSchool?.user?.username) {
                          //     setFieldValue('password', temp);
                          //   }
                          //   setFieldValue('username', temp);
                          // }
                        }}
                        onChange={handleChange}
                        value={values.teacher_id}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                  {/* Teacher id code end */}

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
                        <b>{t('Present Address')}: <span style={{color:"red"}}>*</span></b>
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
                        error={Boolean(touched.present_address && errors.present_address)}
                        fullWidth
                        helperText={touched.present_address && errors.present_address}
                        name="present_address"
                        placeholder={t('present address here...')}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.present_address}
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
                        <b>{t('Permanent Address')}: <span style={{color:"red"}}>*</span></b>
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
                        error={Boolean(touched.permanent_address && errors.permanent_address)}
                        fullWidth
                        helperText={touched.permanent_address && errors.permanent_address}
                        name="permanent_address"
                        placeholder={t('permanent address here...')}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.permanent_address}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    sx={{
                      background: `linear-gradient(to right bottom,${theme.colors.primary.main}, ${theme.colors.alpha.white[50]} )`,
                      p: 1,
                      color: 'white',
                      mb: 1
                    }}
                  >
                    Academic Information:
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
                        <b>{t('Username')}: <span style={{color:"red"}}>*</span></b>
                      </Box>
                    </Grid>
                    <Grid
                      sx={{
                        mb: `${theme.spacing(3)}`
                      }}
                      item
                    >
                      {/* <TextField
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        size="small"
                        error={Boolean(touched.username && errors.username)}
                        fullWidth
                        helperText={touched.username && errors.username}
                        name="username"
                        placeholder={t('Teacher username here...')}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        // disabled
                        value={values.username}
                        variant="outlined"
                      /> */}
                      <NewDebounceInput
                        touched={touched.username || isAvailableUsername}
                        errors={errors.username || isAvailableUsername}
                        label={''}
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
                        <b>{t('Passsword')}: <span style={{color:"red"}}>*</span></b>
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
                        error={Boolean(touched.password && errors.password)}
                        fullWidth
                        helperText={touched.password && errors.password}
                        name="password"
                        placeholder={t('Password here...')}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.password}
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
                        value={values.email}
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
                        <b>{t('Resume')}:</b>
                      </Box>
                    </Grid>
                    <Grid
                      sx={{
                        mb: `${theme.spacing(3)}`
                      }}
                      item
                    >
                      <BoxUploadWrapper>
                        <TextField
                          type="file"
                          accessKey="application/pdf"
                          error={Boolean(touched.resume && errors.resume)}
                          fullWidth
                          helperText={touched.resume && errors.resume}
                          name="resume"
                          placeholder={t('Resume here...')}
                          onBlur={handleBlur}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFieldValue('resume', event.target?.files[0])}
                          variant="outlined"
                        />
                      </BoxUploadWrapper>
                      {editSchool?.resume && (
                        <>
                          <Grid sx={{ mt: 1 }}>{t('Current Resume:')}</Grid>
                          <Grid
                            sx={{
                              mt: 1,
                              p: 1,
                              border: 1,
                              borderRadius: 1,
                              borderColor: 'primary.main',
                              color: 'primary.main'
                            }}
                          >
                            <a style={{ width: '50px' }} href={getFile(editSchool?.resume)} target="_blank">
                              {editSchool.resume}
                            </a>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    sx={{
                      background: `linear-gradient(to right bottom,${theme.colors.primary.main}, ${theme.colors.alpha.white[50]} )`,
                      p: 1,
                      color: 'white',
                      mb: 1
                    }}
                  >
                    Other Information:
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
                      <BoxUploadWrapper
                        sx={{
                          position: 'relative'
                        }}
                      >
                        <TextField
                          type="file"
                          error={Boolean(touched.photo && errors.photo)}
                          fullWidth
                          helperText={touched.photo && errors.photo}
                          name="photo"
                          placeholder={t('Photo here...')}
                          onBlur={handleBlur}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFieldValue('photo', event.target?.files[0])}
                          variant="outlined"
                        />
                      </BoxUploadWrapper>
                      {editSchool?.photo && (
                        <>
                          <Grid sx={{ mt: 1 }}>{t('Current Photo:')}</Grid>
                          <Grid
                            sx={{
                              mt: 1,
                              p: 1,
                              border: 1,
                              borderRadius: 1,
                              borderColor: 'primary.main',
                              color: 'primary.main'
                            }}
                            style={{ width: 'fit-content' }}
                          >
                            <img style={{ width: '50px' }} src={getFile(editSchool?.photo)} />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActionWrapper
                title="Teacher"
                errors={errors}
                editData={editSchool}
                disabled={isAvailableUsername}
                handleCreateClassClose={handleCreateProjectClose}
                isSubmitting={isSubmitting}
              />
            </form>
          )}
        </Formik>
      </Dialog>
    </>
  );
}

export default PageHeader;
