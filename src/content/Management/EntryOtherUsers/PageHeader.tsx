import React, { useState, useEffect, useRef } from 'react';
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
import { NewFileUploadFieldWrapper, PreviewImageCard, TextFieldWrapper } from '@/components/TextFields';
import { useAuth } from '@/hooks/useAuth';
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

const permissons = [
  // { label: 'Admin', role: 'ADMIN', value: 'create_admin' },
  // { label: 'Guardian', role: 'GURDIAN', value: 'create_gurdian' },
  { label: 'Staff', role: 'STAFF', value: 'create_staff' },
  { label: 'Accountant', role: 'ACCOUNTANT', value: 'create_accountant' },
  { label: 'Librarian', role: 'LIBRARIAN', value: 'create_librarian' },
  { label: 'Receptionist', role: 'RECEPTIONIST', value: 'create_receptionist' },
];

function PageHeader({
  editSchool,
  setEditSchool,
  reFetchData
}): any {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const [resume, setResume] = useState([]);
  const [previewResume, setPreviewResume] = useState([]);
  const [photo, setPhoto] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState([]);
  const resumeFileRef = useRef();
  const photoRef = useRef();

  const { user }: any = useAuth();
  const { showNotification } = useNotistick();
  const theme = useTheme();


  const available_permissions = user?.permissions?.map(
    (permission) => permission.value
  );

  const userPrermissionRoles = permissons.filter((role) =>
    available_permissions?.includes(role.value)
  );

  useEffect(() => {
    if (editSchool) {
      console.log("editSchool__", editSchool);

      handleCreateProjectOpen();
    }
  }, [editSchool]);

  const handleCreateProjectOpen = () => {
    setOpen(true);
  };

  const handleCreateProjectClose = () => {
    setOpen(false);
    setEditSchool(null);
    setResume([])
    setPreviewResume([])
    setPhoto([])
    setPreviewPhoto([])
  };

  const handleCreateProjectSuccess = (message) => {
    showNotification(message);
    setOpen(false);
  };

  const handleFormSubmit = async (
    _values,
    resetForm,
    setErrors,
    setStatus,
    setSubmitting
  ) => {
    try {
      // const resume: any = [];
      // Array.prototype.forEach.call(_values.resume, function (file) {
      //   resume.push(file);
      // });
      const formData = new FormData();
      formData.append('first_name', _values.first_name);
      formData.append('middle_name', _values.middle_name);
      formData.append('last_name', _values.last_name);
      formData.append('national_id', _values.national_id);
      formData.append('employee_id', _values.employee_id);
      formData.append('phone', _values.phone);
      formData.append('gender', _values.gender);
      formData.append('blood_group', _values.blood_group);
      formData.append('religion', _values.religion);
      formData.append('date_of_birth', _values.date_of_birth);
      formData.append('present_address', _values.present_address);
      formData.append('permanent_address', _values.permanent_address);
      formData.append('role', _values.role.role_title);
      formData.append('username', _values.username)

      if (_values.password !== '') {
        formData.append('password', _values.password);
      }

      formData.append('email', _values.email);
      if (resume.length > 0) formData.append('resume', resume[0]);

      if (photo.length > 0) formData.append('photo', photo[0]);

      const successProcess = (message) => {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateProjectSuccess(message);
        setEditSchool(null);
        reFetchData();
        handleCreateProjectClose()
      };
      if (editSchool) {
        const result = await axios({
          method: 'PATCH',
          url: `/api/other_users/${editSchool.id}`,
          data: formData,
          headers: {
            'Content-Type': `multipart/form-data; boundary=<calculated when request is sent>`
          }
        });
        if (result.data?.success)
          successProcess(t(' Updated successfully'));
        else throw new Error('update failed');
      } else {
        const res = await axios({
          method: 'POST',
          url: '/api/other_users',
          data: formData,
          headers: {
            'Content-Type': `multipart/form-data; boundary=<calculated when request is sent>`
          }
        });
        // console.log({ res });
        if (res.data?.success)
          successProcess(t('A new teacher has been created successfully'));
        else throw new Error('created  failed');
      }
    } catch (err) {
      console.error(err);
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
      showNotification("failed ", "error")
    }
  };

  const handleFileChange = (e, setFile, setPreviewFile) => {
    if (e?.target?.files?.length === 0) {
      setFile(() => []);
      setPreviewFile(() => []);
      return;
    }
    // setFile(() => e.target.files[0]);
    const imgPrev = [];
    const img = [];
    Array.prototype.forEach.call(e.target.files, (file) => {
      img.push(file);
      const objectUrl = URL.createObjectURL(file);
      imgPrev.push({ name: file.name, src: objectUrl })
      // console.log({ objectUrl });
      // console.log({ file: file.name })
    });
    setFile(img);
    setPreviewFile(() => imgPrev)
  }

  const handleRemove = (setPreviewFile, setFile) => {
    return (index) => {
      setPreviewFile((images) => {
        const imagesFilter = images.filter((image, imgIndex) => imgIndex !== index);
        return imagesFilter;
      })
      setFile((images) => {
        const imagesFilter = images.filter((image, imgIndex) => imgIndex !== index);
        return imagesFilter;
      })
    }
  }
  const temp = userPrermissionRoles.find(role_ => role_.role === editSchool?.user?.user_role?.title);
  // console.log({userPrermissionRoles,editSchool:editSchool?.user?.user_role?.title,temp})

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

      <PageHeaderTitleWrapper
        name="Staffs"
        handleCreateClassOpen={handleCreateProjectOpen}
      />

      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        onClose={handleCreateProjectClose}
      >
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('Create new other users')}
          </Typography>
          <Typography variant="subtitle2">
            {t('Use this dialog window to add a new other users')}
          </Typography>
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
            employee_id: editSchool?.employee_id || '',
            national_id: editSchool?.national_id || '',
            email: editSchool?.email || '',
            role: temp ? {
              role_title: temp?.role,
              permission: temp?.value
            } : undefined,
            // role: temp ? {
            //   role_title: temp?.role,
            //   permission: temp?.value
            // } : undefined,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            username: Yup.string()
              .max(255)
              .required(t('The name field is required')),
            password: editSchool ? Yup.string() : Yup.string().required(
              t('The password field is required')
            ),
            first_name: Yup.string().required(
              t('The first name field is required')
            ),
            gender: Yup.string().required(t('The gender field is required')),
            date_of_birth: Yup.string().required(
              t('The date of birth field is required')
            ),
            present_address: Yup.string().required(
              t('The present address field is required')
            ),
            permanent_address: Yup.string().required(
              t('The parmanent_address field is required')
            ),
            national_id: Yup.number().required(
              t('The national id field is required')
            ),
            // resume: !editSchool ? Yup.mixed().required(t('The resume field is required')) : Yup.mixed()
          })}
          onSubmit={async (
            _values,
            { resetForm, setErrors, setStatus, setSubmitting }
          ) =>
            handleFormSubmit(
              _values,
              resetForm,
              setErrors,
              setStatus,
              setSubmitting
            )
          }
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
            // console.log({ values, errors })
            return (
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
                              const temp = generateUsername(values.first_name)
                              if (!editSchool?.user?.username) {

                                setFieldValue('password', temp)
                              }
                              setFieldValue('username', temp)
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
                              setFieldValue('username', uniqueUsername);
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
                          <b>{t('Select Role')}:*</b>
                        </Box>
                      </Grid>

                      <Autocomplete
                        disablePortal
                        size='small'
                        // @ts-ignore
                        value={userPrermissionRoles.find((permRole) => permRole.value === values?.role?.permission) || null}
                        options={userPrermissionRoles}
                        isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                        getOptionLabel={(option) => option?.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            sx={{
                              [`& fieldset`]: {
                                borderRadius: 0.6,
                              }
                            }}
                            name="role"
                            label={t('')}
                            placeholder='select a role...'
                            error={Boolean(touched.role && errors.role)}
                            helperText={touched.role && errors.role}
                            onBlur={handleBlur}
                          />
                        )}
                        // @ts-ignore
                        onChange={(event, value: any) => { setFieldValue('role', { role_title: value?.role, permission: value?.value } || ''); }}
                      />
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
                          error={Boolean(
                            touched.national_id && errors.national_id
                          )}
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
                          <b>{t('Employee Id')}:</b>
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
                          error={Boolean(
                            touched.employee_id && errors.employee_id
                          )}
                          fullWidth
                          helperText={touched.employee_id && errors.employee_id}
                          name="employee_id"
                          placeholder={t('employee id here...')}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.employee_id}
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
                          {/* <InputLabel id="demo-simple-select-helper-label">
                            Select Gender
                          </InputLabel> */}
                          <Select
                            labelId="demo-simple-select-helper-label"
                            id="demo-simple-select-helper"
                            value={values.gender}
                            name="gender"
                            // label="Select Gender"
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
                          // label="Provide birth date"
                          inputFormat='dd/MM/yyyy'
                          value={values.date_of_birth}
                          onChange={(n) => {
                            const value = dayjs(n);
                            if (n) {
                              setFieldValue('date_of_birth', value)
                            }
                          }}
                          renderInput={(params) => <TextField
                            size='small'
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
                          />}
                        />
                      </Grid>
                    </Grid>
                    <Grid item sm={4}></Grid>
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
                          <b>{t('Username')}:*</b>
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
                          disabled
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
                          <b>{t('Passsword')}:*</b>
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

                      <NewFileUploadFieldWrapper
                        htmlFor="resume"
                        // name="left_images"
                        // multiple={true}
                        accept="application/pdf, application/vnd.ms-excel"
                        handleChangeFile={(e) => handleFileChange(e, setResume, setPreviewResume)}
                        ref={resumeFileRef}
                      />
                      <Grid
                        sx={{
                          mb: `${theme.spacing(3)}`
                        }}
                        item
                      >

                        {previewResume?.map((image, index) => (
                          <React.Fragment key={index} >
                            <iframe src={image.src} width="100%" />
                            <Button onClick={() => handleRemove(setPreviewResume, setResume)(index)} size='small' color="error" sx={{ borderRadius: 0.5, height: 30 }}>Remove</Button>
                          </React.Fragment>
                        ))}

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
                              <a
                                style={{ width: '50px' }}
                                href={getFile(editSchool?.resume)}
                                target='_blank'
                              >
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
                      <NewFileUploadFieldWrapper
                        htmlFor="photo"
                        // name="left_images"
                        // multiple={true}
                        accept="image"
                        handleChangeFile={(e) => handleFileChange(e, setPhoto, setPreviewPhoto)}
                        ref={photoRef}
                      />
                      <Grid
                        sx={{
                          mb: `${theme.spacing(1)}`
                        }}
                        item
                      >

                        {previewPhoto?.map((image, index) => (
                          <PreviewImageCard data={image} index={index} key={index} handleRemove={handleRemove(setPreviewPhoto, setPhoto)} />
                        ))}
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
                              <img
                                style={{ width: '50px' }}
                                src={getFile(editSchool?.photo)}
                              />
                            </Grid>
                          </>
                        )}


                      </Grid>
                    </Grid>

                  </Grid>
                </DialogContent>
                <DialogActionWrapper
                  title="Other Users"
                  errors={errors}
                  disabled={isAvailableUsername}
                  editData={editSchool}
                  handleCreateClassClose={handleCreateProjectClose}
                  isSubmitting={isSubmitting}
                />
              </form>
            )
          }}
        </Formik>

      </Dialog>
    </>
  );
}

export default PageHeader;
