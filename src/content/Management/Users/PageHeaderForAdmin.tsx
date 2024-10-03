import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/useAuth';

import { Grid, Dialog, DialogTitle, DialogActions, DialogContent, Typography, TextField, CircularProgress, Autocomplete, Button, Card } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { FileUploadFieldWrapper, NewFileUploadFieldWrapper, PreviewImageCard, TextFieldWrapper } from '@/components/TextFields';
import Image from 'next/image';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { getFile } from '@/utils/utilitY-functions';
import { DebounceInput, NewDebounceInput } from '@/components/DebounceInput';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';

function PageHeader({ editUser, setEditUser, reFetchData }) {
  const { user }: any = useAuth();
  const [user_photo, setUser_photo] = useState(null);
  const [isAvailableUsername, setIsAvailableUsername] = useState(null);
  console.log({ editUser })
  useEffect(() => {
    if (editUser) handleCreateUserOpen();
  }, [editUser]);

  const permissons = [
    { label: 'Branch Admin', role: 'BRANCH_ADMIN', value: 'create_branch_admin' },
  ];
  const available_permissions = user?.permissions?.map((permission) => permission.value);
  console.log({ available_permissions })
  const userPrermissionRoles = permissons.filter((role) => available_permissions?.includes(role.value));

  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();

  const handleCreateUserOpen = () => {
    setOpen(true);
  };

  const handleCreateUserClose = () => {
    setUser_photo(null);
    setOpen(false);
    setEditUser(null);
    setIsAvailableUsername(null);
  };

  const handleCreateUserSuccess = (mess) => {
    showNotification(mess);
    setOpen(false);
  };

  const handleFormSubmit = async (_values, formValue) => {
    const { resetForm, setErrors, setStatus, setSubmitting } = formValue;
    try {
      const handleResponseSuccess = (msg) => {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateUserSuccess(msg);
        reFetchData(true);
      };

      const formData = new FormData();
      for (const i in _values) {
        if (i === 'role') {
          formData.append(`${i}`, JSON.stringify(_values[i]));
        } else {
          formData.append(`${i}`, _values[i]);
        }
      }

      if (editUser) {
        await axios.patch(`/api/user/${editUser.id}`, formData);
        handleResponseSuccess('The user account was edited successfully');
      } else {
        await axios.post(`/api/user`, formData);
        handleResponseSuccess('The user account was created successfully');
      }

      // await wait(1000);
    } catch (err) {
      handleShowErrMsg(err, showNotification);
      setStatus({ success: false });
      // @ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };
  console.log({ userPrermissionRoles })
  const temp = userPrermissionRoles.find((i) => i.role == editUser?.user_role?.title);
  console.log({ temp });

  const handleDebounce = (value) => {
    if (editUser?.username?.toLowerCase() === value?.toLowerCase()) return setIsAvailableUsername(null);
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

  const handleFileChange = (e, setFieldValue, field, preview_field) => {
    if (e?.target?.files?.length === 0) {
      setFieldValue(field, '');
      setFieldValue(preview_field, []);
      return;
    }

    setFieldValue(field, e.target.files[0]);

    const imgPrev = [];
    Array.prototype.forEach.call(e.target.files, (file) => {
      const objectUrl = URL.createObjectURL(file);
      imgPrev.push({ name: file.name, src: objectUrl });
    });
    setFieldValue(preview_field, imgPrev);
  };

  const handleRemove = (setFieldValue, field, preview_field) => {
    setFieldValue(field, '');
    setFieldValue(preview_field, []);
  };

  return (
    <>
      <PageHeaderTitleWrapper
        name={'User'}
        handleCreateClassOpen={handleCreateUserOpen}
        // actionButton={user?.role?.title !== 'ASSIST_SUPER_ADMIN' && user?.role?.title !== 'SUPER_ADMIN' ? true : false}
      />

      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleCreateUserClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t(editUser ? 'Edit user' : 'Add new user')}
          </Typography>
          <Typography variant="subtitle2">{t(`Fill in the fields below to ${editUser ? 'edit' : 'create a'} user to the site`)}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            username: editUser?.username || '',
            password: undefined,
            confirm_password: '',
            user_photo: editUser?.user_photo || '',
            preview_user_photo: [],
            role: temp
              ? {
                role_title: temp?.role,
                permission: temp?.value
              }
              : undefined,
            domain: editUser?.adminPanel?.domain || '',
            copy_right_txt: editUser?.adminPanel?.copy_right_txt,
            logo: null,
            preview_logo: []
          }}
          validationSchema={Yup.object().shape({
            username: Yup.string()
              .max(255)
              .when('role', (role, schema) => {
                if (!role) return schema.required(t('The username field is required'));
                return schema;
              }),

            password: Yup.string()
              .max(255)
              .when('role', (role, schema) => {
                if (!role) return schema.required(t('The password field is required')).min(8, 'Password is too short - should be 8 chars minimum.');
                return schema;
              }),

            // .matches(/[0-9]/, 'Password requires a number'),
            // .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.'),
            confirm_password: Yup.string()
              .max(255)
              .when('role', (role, schema) => {
                if (!role) return schema.required(t('confirm_password field is required')).oneOf([Yup.ref('password'), null], 'Passwords must match');
                return schema;
              }),
            role: Yup.object().required(t('Role field is required'))
          })}
          onSubmit={(_values, getValue: any) => handleFormSubmit(_values, getValue)}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue, setErrors }) => {
            console.log({ errors })
            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container spacing={1}>
                    {/* <Grid>Touched value {touched.username}</Grid> */}
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
                      autocomplete="false"
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

                    {!editUser && (
                      <Grid item width={'100%'} mb={1}>
                        <Autocomplete
                          disablePortal
                          size="small"
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
                                  borderRadius: 0.6
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
                          onChange={(event, value: any) => {
                            setFieldValue(
                              'role',
                              {
                                role_title: value?.role,
                                permission: value?.value
                              } || ''
                            );
                          }}
                        />
                      </Grid>
                    )}

                    {values.role?.role_title === 'ASSIST_SUPER_ADMIN' && (
                      <>
                        <TextFieldWrapper
                          errors={errors.domain}
                          touched={touched.domain}
                          label={t('Domain')}
                          name="domain"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          value={values.domain}
                        />
                        <TextFieldWrapper
                          errors={errors.copy_right_txt}
                          touched={touched.copy_right_txt}
                          label={t('Copy Right Text')}
                          name="copy_right_txt"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          value={values.copy_right_txt}
                        />
                        <Grid item xs={12}>
                          <NewFileUploadFieldWrapper
                            htmlFor="logo"
                            accept="image/*"
                            handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'logo', 'preview_logo')}
                            label="Logo"
                          />
                        </Grid>
                        <Grid item>
                          {values?.preview_logo?.map((image, index) => (
                            <>
                              <PreviewImageCard
                                data={image}
                                index={index}
                                key={index}
                                handleRemove={() => handleRemove(setFieldValue, 'logo', 'preview_logo')}
                              />
                            </>
                          ))}
                        </Grid>
                        <Grid item>
                          {editUser?.adminPanel?.logo && (
                            <Image src={getFile(editUser?.adminPanel?.logo)} height={150} width={150} alt="Logo" loading="lazy" />
                          )}
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12}>
                      <NewFileUploadFieldWrapper
                        htmlFor="user_photo"
                        accept="image/*"
                        handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'user_photo', 'preview_user_photo')}
                        label="Upload User Photo"
                      />
                    </Grid>
                    <Grid item>
                      {values?.preview_user_photo?.map((image, index) => (
                        <>
                          <PreviewImageCard
                            data={image}
                            index={index}
                            key={index}
                            handleRemove={() => handleRemove(setFieldValue, 'user_photo', 'preview_user_photo')}
                          />
                        </>
                      ))}
                    </Grid>

                    <Grid item>
                      {(user_photo || editUser?.user_photo) && (
                        <Image
                          src={user_photo ? user_photo : getFile(editUser?.user_photo)}
                          height={150}
                          width={150}
                          alt="User photo"
                          loading="lazy"
                        />
                      )}
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
                    startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                    // @ts-ignore
                    disabled={Boolean(isAvailableUsername) || Boolean(errors.submit) || isSubmitting}
                    variant="contained"
                  >
                    {t(editUser ? 'Edit user' : 'Add new user')}
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

// const PreviewImageCard = ({ data, index, handleRemove }) => {
//   const { src, name } = data;
//   return (
//     <Grid height={180} width={150} display="flex" flexDirection="column" justifyContent="end" gridTemplateColumns={"auto"}
//       sx={{
//         border: "1px solid skyblue", borderRadius: 0.6, borderStyle: "dashed", p: 0.5, ":hover": {
//           scale: 1.5,
//           cursor: "pointer"
//         }
//       }}
//     >
//       <Grid maxHeight={140} m={"auto"}>
//         <img src={src} style={{ height: "100%", objectFit: "contain" }} />
//       </Grid>
//       <Grid sx={{ height: 20, fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
//         File name: <span style={{ color: "darkcyan" }}>{name}</span>
//       </Grid>
//       <Button onClick={() => handleRemove()} size='small' color="error" sx={{ borderRadius: 0.5, height: 30 }}>Remove</Button>
//     </Grid>
//   )
// }

export default PageHeader;
