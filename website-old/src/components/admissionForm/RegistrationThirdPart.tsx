import { useRef, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  DialogActions,
  DialogContent,
  TextField,
  CircularProgress,
  Button,
} from '@mui/material';
import axios from 'axios';

import Image from 'next/image';

import useNotistick from '../../hooks/useNotistick';
import { FileUploadFieldWrapper } from '../reuseable/fileUpload';
import { useRouter } from 'next/navigation';

function RegistrationThirdPart({
  school_id,
  totalFormData,
  setTotalFormData,
  setActiveStep,
  handleCreateClassClose,
  setUsersFlag,
  serverHost,
  setPdfDatas,
  handlePrint
}) {
  const router = useRouter()
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [father_photo, setFather_photo] = useState(null);
  const [mother_photo, setMother_photo] = useState(null);
  const [guardian_photo, setGuardian_photo] = useState(null);

  const registration3rdPart = useRef(null)

  return (
    <>
      <Formik
        initialValues={{
          father_name: '',
          father_phone: '',
          father_profession: '',
          father_photo: null,
          mother_name: '',
          mother_phone: '',
          mother_profession: '',
          mother_photo: null,
          guardian_name: '',
          guardian_phone: '',
          guardian_profession: '',
          guardian_photo: null,
          relation_with_guardian: ''
        }}
        validationSchema={Yup.object().shape({
          father_name: Yup.string().max(255).nullable(true)
        })}
        onSubmit={async (
          _values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          try {
            _values = {
              ..._values,
              // @ts-ignore
              ...totalFormData,
              school_id: school_id
            };
            console.log({ _values })

            const formData = new FormData();

            for (let i in _values) {
              formData.append(`${i}`, _values[i]);
            }

            await axios.post(`${serverHost}/api/onlineAdmission`, formData)
              // .then(res => { console.log({ res }) })
              // .catch(err => { console.log({ err }) })
            setPdfDatas(() => _values)

            resetForm();
            setTotalFormData({})
            setStatus({ success: true });
            setSubmitting(false);
            setUsersFlag(true);
            setActiveStep(0);
            showNotification('Online Admission form submitted !!');
            // router.push('/online-admission');

            setTimeout(() => {
              handlePrint()
            }, 2000);

          } catch (err) {
            setPdfDatas({});
            console.log(err.message);
            showNotification(err.response?.data?.message || err.message, 'error');
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
                <Grid container ref={registration3rdPart}>
                  <Grid container item spacing={1}>
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
                        helperText={touched.father_phone && errors.father_phone}
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
                          touched.father_profession && errors.father_profession
                        )}
                        fullWidth
                        margin="normal"
                        helperText={
                          touched.father_profession && errors.father_profession
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
                    <Grid container p={1} gap={1} xs={12} sm={6} md={6}>
                      {
                        father_photo && <Grid item>
                          <Image src={father_photo}
                            height={100}
                            width={100}
                            alt="Father's photo:"
                            loading='lazy'
                          />

                        </Grid>
                      }

                      <br />
                      <FileUploadFieldWrapper
                        htmlFor="father_photo"
                        label="Select Father's photo::"
                        name="father_photo"
                        // @ts-ignore
                        value={values?.father_photo?.name || ''}
                        handleChangeFile={(e) => {
                          if (e.target?.files?.length) {
                            const photoUrl = URL.createObjectURL(e.target.files[0]);
                            // @ts-ignore
                            setFather_photo(photoUrl)
                            setFieldValue('father_photo', e.target.files[0])
                          }
                        }}
                        handleRemoveFile={(e) => {
                          setFather_photo(null);
                          setFieldValue('father_photo', undefined)
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
                          touched.mother_name && errors.mother_name
                        )}
                        fullWidth
                        margin="normal"
                        helperText={touched.father_name && errors.mother_name}
                        label={t('Mother name')}
                        name="mother_name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.mother_name}
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
                          touched.mother_phone && errors.mother_phone
                        )}
                        fullWidth
                        margin="normal"
                        helperText={touched.mother_phone && errors.mother_phone}
                        label={t('Mother phone number')}
                        name="mother_phone"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.mother_phone}
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
                          touched.mother_profession && errors.mother_profession
                        )}
                        fullWidth
                        margin="normal"
                        helperText={
                          touched.mother_profession && errors.mother_profession
                        }
                        label={t('Mother profession')}
                        name="mother_profession"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.mother_profession}
                        variant="outlined"
                      />
                    </Grid>
                    {/* mather_photo */}
                    <Grid container p={1} gap={1} xs={12} sm={6} md={6}>

                      {
                        mother_photo && <Grid item>
                          <Image src={mother_photo}
                            height={100}
                            width={100}
                            alt="Mother's photo:"
                            loading='lazy'
                          />

                        </Grid>
                      }
                      <br />
                      <FileUploadFieldWrapper
                        htmlFor="mother_photo"
                        label="Select Mother's photo::"
                        name="mother_photo"
                        // @ts-ignore
                        value={values?.mother_photo?.name || ''}
                        handleChangeFile={(e) => {
                          if (e.target?.files?.length) {
                            const photoUrl = URL.createObjectURL(e.target.files[0]);
                            // @ts-ignore
                            setMother_photo(photoUrl)
                            setFieldValue('mother_photo', e.target.files[0])
                          }
                        }}
                        handleRemoveFile={(e) => {
                          setMother_photo(null);
                          setFieldValue('mother_photo', undefined)
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
                    <Grid container p={1} gap={1} item xs={12} sm={6} md={6}>

                      {
                        guardian_photo && <Grid item>
                          <Image src={guardian_photo}
                            height={100}
                            width={100}
                            alt="Guardian's photo:"
                            loading='lazy'
                          />

                        </Grid>
                      }
                      <br />
                      <FileUploadFieldWrapper
                        htmlFor="guardian_photo"
                        label="Select Guardian's photo:"
                        name="guardian_photo"
                        // @ts-ignore
                        value={values?.guardian_photo?.name || ''}
                        handleChangeFile={(e) => {
                          if (e.target?.files?.length) {
                            const photoUrl = URL.createObjectURL(e.target.files[0]);
                            // @ts-ignore
                            setGuardian_photo(photoUrl)
                            setFieldValue('guardian_photo', e.target.files[0])
                          }
                        }}
                        handleRemoveFile={(e) => {
                          setGuardian_photo(null);
                          setFieldValue('guardian_photo', undefined)
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
                  color="warning"
                  variant="contained"
                  onClick={() => setActiveStep(1)}
                >
                  {t('Previous')}
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
                  {t('Submit')}
                </Button>
              </DialogActions>
            </form>
          );
        }}
      </Formik>


    </>
  );
}

export default RegistrationThirdPart;
