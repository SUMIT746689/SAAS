import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/useAuth';

import {
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  TextField,
  CircularProgress,
  Autocomplete,
  Button
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { FileUploadFieldWrapper, TextFieldWrapper } from '@/components/TextFields';
import Image from 'next/image';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';

function PageHeader({ editUser, setEditUser, reFetchData }) {
  const { user }: any = useAuth();
  const [user_photo, setUser_photo] = useState(null)

  useEffect(() => {
    if (editUser) handleCreateUserOpen();
  }, [editUser]);

  const permissons = [
    { label: 'Admin', role: 'ADMIN', value: 'create_admin' },
    { label: 'Guardian', role: 'GURDIAN', value: 'create_gurdian' },
    { label: 'Stuff', role: 'STAFF', value: 'create_stuff' },
    { label: 'Accountant', role: 'ACCOUNTANT', value: 'create_accountant' },
    { label: 'Librarian', role: 'LIBRARIAN', value: 'create_librarian' },
    { label: 'Receptionist', role: 'RECEPTIONIST', value: 'create_receptionist' },
  ];
  const available_permissions = user?.permissions?.map(
    (permission) => permission.value
  );
  const userPrermissionRoles = permissons.filter((role) =>
    available_permissions?.includes(role.value)
  );

  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();


  const handleCreateUserOpen = () => {
    setOpen(true);
  };

  const handleCreateUserClose = () => {
    setUser_photo(null)
    setOpen(false);
    setEditUser(null);
  };

  const handleCreateUserSuccess = () => {
    showNotification('The user account was created successfully');

    setOpen(false);
  };

  const handleFormSubmit = async (_values, formValue) => {
    const { resetForm, setErrors, setStatus, setSubmitting } = formValue
    try {

      const formData = new FormData();
      for (const i in _values) {
        if (i == 'role') {
          formData.append(`${i}`, JSON.stringify(_values[i]))
        }
        else {
          formData.append(`${i}`, _values[i])
        }


      }

      if (editUser)
        axios.patch(`/api/user/${editUser.id}`, formData).then(() => {
          resetForm();
          setStatus({ success: true });
          setSubmitting(false);
          handleCreateUserSuccess();
          reFetchData(true);
        });
      else
        axios.post(`/api/user`, formData).then(() => {
          resetForm();
          setStatus({ success: true });
          setSubmitting(false);
          handleCreateUserSuccess();
          reFetchData(true);
        });
      // await wait(1000);
    } catch (err) {
      console.error(err);
      showNotification('There was an error, try again later', 'error');
      setStatus({ success: false });
      // @ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  }

  const temp = userPrermissionRoles.find(i => i.role == editUser?.user_role?.title);

  return (
    <>
      <PageHeaderTitleWrapper
        name={"User"}
        handleCreateClassOpen={handleCreateUserOpen}
      />

      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleCreateUserClose}
      >
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t(editUser ? 'Edit user' : 'Add new user')}
          </Typography>
          <Typography variant="subtitle2">
            {t(
              `Fill in the fields below to ${editUser ? 'edit' : 'create a'
              } user to the site`
            )}
          </Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            username: editUser?.username || '',
            password: '',
            confirm_password: '',
            user_photo: editUser?.user_photo || '',
            role: temp ? {
              role_title: temp?.role,
              permission: temp?.value
            } : undefined
          }}
          validationSchema={Yup.object().shape({
            username: Yup.string()
              .max(255)
              .when("role", (role, schema) => {
                if (!role)
                  return schema.required(t('The username field is required'))
                return schema
              }),

            password: Yup.string().max(255)
              .when("role", (role, schema) => {
                if (!role)
                  return schema.required(t('The password field is required')).min(8, 'Password is too short - should be 8 chars minimum.')
                return schema
              }),

            // .matches(/[0-9]/, 'Password requires a number'),
            // .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.'),
            confirm_password: Yup.string()
              .max(255)
              .when("role", (role, schema) => {
                if (!role)
                  return schema.required(t('confirm_password field is required')).oneOf([Yup.ref('password'), null], 'Passwords must match')
                return schema
              })
            ,
            role: Yup.object().required(t('Role field is required')),
          })}
          onSubmit={(_values, getValue: any) => handleFormSubmit(_values, getValue)}
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
          }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent
                dividers
                sx={{
                  p: 3
                }}
              >
                <Grid container spacing={1}>

                  <TextFieldWrapper
                    touched={touched.username}
                    errors={errors.username}
                    label={t('Username')}
                    name="username"
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    value={values.username}
                  />

                  <TextFieldWrapper
                    touched={touched.password}
                    errors={errors.password}
                    label={t('Password')}
                    name="password"
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    type="password"
                    value={values.password}
                  />

                  <TextFieldWrapper
                    errors={errors.confirm_password}
                    touched={touched.confirm_password}
                    label={t('Confirm password')}
                    name="confirm_password"
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    type="password"
                    value={values.confirm_password}
                  />

                  {
                    !editUser && <Grid item width={"100%"} mb={1}>
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
                            label={t('User role')}
                            error={Boolean(touched.role && errors.role)}
                            helperText={touched.role && errors.role}
                            onBlur={handleBlur}
                          />
                        )}
                        // @ts-ignore
                        onChange={(event, value: any) => { setFieldValue('role', { role_title: value?.role, permission: value?.value } || ''); }}
                      />
                    </Grid>
                  }

                  <Grid item xs={12} >

                    <FileUploadFieldWrapper
                      htmlFor="user photo"
                      label="Select user photo"
                      name="user_photo"
                      value={values?.user_photo?.name || values?.user_photo || ''}
                      handleChangeFile={(e) => {
                        if (e.target.files?.length) {
                          const photoUrl = URL.createObjectURL(e.target.files[0]);
                          setUser_photo(photoUrl)
                          setFieldValue('user_photo', e.target.files[0])
                        }
                      }}
                      handleRemoveFile={(e) => {
                        setUser_photo(null)
                        setFieldValue('user_photo', undefined)
                      }}
                    />


                    {
                      (user_photo || editUser?.user_photo) &&
                      <Image src={user_photo ? user_photo : `/api/get_file/${editUser?.user_photo?.replace(/\\/g, '/')}`}
                        height={150}
                        width={150}
                        alt='User photo'
                        loading='lazy'
                      />
                    }

                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions
                sx={{
                  p: 3
                }}
              >
                <Button color="secondary" onClick={handleCreateUserClose}>
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
                  {t(editUser ? 'Edit user' : 'Add new user')}
                </Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>
    </>
  );
}

export default PageHeader;
