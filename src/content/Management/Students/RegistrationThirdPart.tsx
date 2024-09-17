import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/useAuth';
import { Dayjs } from 'dayjs';
import { Grid, DialogActions, DialogContent, Zoom, TextField, CircularProgress, Button } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import useNotistick from '@/hooks/useNotistick';
import Image from 'next/image';
import { NewFileUploadFieldWrapper, PreviewImageCard, TextFieldWrapper } from '@/components/TextFields';
import { getFile } from '@/utils/utilitY-functions';
import { handleConvBanNum } from 'utilities_api/convertBanFormatNumber';
import { handleFileChange, handleFileRemove } from 'utilities_api/handleFileUpload';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';

function RegistrationFirstPart({
  totalFormData,
  setTotalFormData,
  setActiveStep,
  handleCreateClassClose,
  setUsersFlag,
  student,
  onlineAdmission_id,
  handleClose
}) {
  const router = useRouter();
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();
  const { user } = useAuth();
  const [father_photo, setFather_photo] = useState(null);
  const [mother_photo, setMother_photo] = useState(null);
  const [guardian_photo, setGuardian_photo] = useState(null);
  console.log({ totalFormData });
  return (
    <>
      <Formik
        initialValues={{
          father_name: student ? student?.student_info?.father_name || student?.father_name || '' : '',
          father_phone: student ? student?.student_info?.father_phone || student?.father_phone || '' : '',
          father_profession: student ? student?.student_info?.father_profession || student?.father_profession || '' : '',
          father_nid: student ? student?.student_info?.father_nid || student?.father_nid || '' : '',
          father_photo: null,
          preview_father_photo: [],

          mother_name: student ? student?.student_info?.mother_name || student?.mother_name || '' : '',
          mother_phone: student ? student?.student_info?.mother_phone || student?.mother_phone || '' : '',
          mother_profession: student ? student?.student_info?.mother_profession || student?.mother_profession || '' : '',
          mother_nid: student ? student?.student_info?.mother_nid || student?.mother_nid || '' : '',
          mother_photo: null,
          preview_mother_photo: [],

          guardian_name: student ? student?.guardian_name : '',
          guardian_phone: student ? student?.guardian_phone : '',
          guardian_profession: student ? student?.guardian_profession : '',
          guardian_nid: student ? student?.guardian_nid : '',
          guardian_photo: null,
          preview_guardian_photo: [],

          relation_with_guardian: student ? student?.relation_with_guardian : '',
          filePathQuery: student ? student?.filePathQuery : {}
        }}
        validationSchema={Yup.object().shape({
          father_name: Yup.string().max(255).nullable(true)
        })}
        onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
          try {
            // validate phone numbers
            if (_values.father_phone) {
              const { number, err } = handleConvBanNum(_values.father_phone);
              if (err) return showNotification('father_phone field: ' + err, 'error');
              _values.father_phone = number;
            }
            if (_values.mother_phone) {
              const { number, err } = handleConvBanNum(_values.mother_phone);
              if (err) return showNotification('mother_phone field: ' + err, 'error');
              _values.mother_phone = number;
            }
            if (_values.guardian_phone) {
              const { number, err } = handleConvBanNum(_values.guardian_phone);
              if (err) return showNotification('father_phone field: ' + err, 'error');
              _values.guardian_phone = number;
            }

            _values = {
              ..._values,
              // @ts-ignore
              ...totalFormData,
              school_id: user?.school_id
            };
            console.log({ _values });

            const formData = new FormData();

            for (let i in _values) {
              if (['preview_mother_photo', 'preview_father_photo', 'preview_guardian_photo'].includes(i)) {
              } else if (['mother_photo', 'father_photo', 'guardian_photo'].includes(i)) _values[i] && formData.append(`${i}`, _values[i][0]);
              else if (i == 'filePathQuery') formData.append(`${i}`, JSON.stringify(_values[i]));
              else if (_values[i]) formData.append(`${i}`, _values[i]);
            }
            const handleSubmitSuccess = () => {
              resetForm();
              setTotalFormData({});
              setStatus({ success: true });
              setSubmitting(false);
              setUsersFlag(true);
              setActiveStep(0);
            };

            if (student && !onlineAdmission_id) {
              const res = await axios.patch(`/api/student/${router.query.id}`, formData);
              if (res.data.success) {
                handleSubmitSuccess();
                showNotification('Student updated Successfully');
                router.back();
              }
            } else {
              const res = await axios.post(`/api/student`, formData);

              if (res.data.success) {
                handleSubmitSuccess();
                showNotification(res.data.success);
                if (onlineAdmission_id) {
                  await axios.delete(`/api/onlineAdmission/${onlineAdmission_id}`);
                  handleClose();
                } else router.push('/management/students/registration');
              }
            }
          } catch (err) {
            console.log(err);
            // showNotification(err.response?.data?.message, 'error');
            handleShowErrMsg(err, showNotification);
            setStatus({ success: false });
            // @ts-ignore
            setErrors({ submit: err.message });
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
          console.log('T__values__', errors);

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
                    {/* father_name */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'father_name'}
                        errors={errors?.father_name}
                        touched={touched?.father_name}
                        label={t(`Father Name:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.father_name}
                      />
                    </Grid>
                    {/* father_phone */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'father_phone'}
                        errors={errors?.father_phone}
                        touched={touched?.father_phone}
                        label={t(`Father Phone Number:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.father_phone}
                      />
                    </Grid>
                    {/* father_profession */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'father_profession'}
                        errors={errors?.father_profession}
                        touched={touched?.father_profession}
                        label={t(`Father Profession:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.father_profession}
                      />
                    </Grid>
                    {/* father_nid */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'father_nid'}
                        errors={errors?.father_nid}
                        touched={touched?.father_nid}
                        label={t(`Father NID:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.father_nid}
                      />
                    </Grid>

                    {/* mother_name */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'mother_name'}
                        errors={errors?.mother_name}
                        touched={touched?.mother_name}
                        label={t(`Mother Name:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.mother_name}
                      />
                    </Grid>

                    {/* mother_phone */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'mother_phone'}
                        errors={errors?.mother_phone}
                        touched={touched?.mother_phone}
                        label={t(`Mother Phone Number:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.mother_phone}
                      />
                    </Grid>

                    {/* mother_profession */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'mother_profession'}
                        errors={errors?.mother_profession}
                        touched={touched?.mother_profession}
                        label={t(`Mother Profession:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.mother_profession}
                      />
                    </Grid>

                    {/* mother_nid */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'mother_nid'}
                        errors={errors?.mother_nid}
                        touched={touched?.mother_nid}
                        label={t(`Mother NID:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.mother_nid}
                      />
                    </Grid>

                    {/* guardian_name */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'guardian_name'}
                        errors={errors?.guardian_name}
                        touched={touched?.guardian_name}
                        label={t(`Guardian Name:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.guardian_name}
                      />
                    </Grid>

                    {/* guardian_phone */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'guardian_phone'}
                        errors={errors?.guardian_phone}
                        touched={touched?.mother_phone}
                        label={t(`Guardian Phone Number:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.guardian_phone}
                      />
                    </Grid>

                    {/* guardian_profession */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'guardian_profession'}
                        errors={errors?.guardian_profession}
                        touched={touched?.guardian_profession}
                        label={t(`Guardian Profession:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.guardian_profession}
                      />
                    </Grid>

                    {/* guardian nid */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'guardian_nid'}
                        errors={errors?.guardian_nid}
                        touched={touched?.guardian_nid}
                        label={t(`Guardian NID:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.guardian_nid}
                      />
                    </Grid>

                    {/* relation_with_guardian */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name={'relation_with_guardian'}
                        errors={errors?.relation_with_guardian}
                        touched={touched?.relation_with_guardian}
                        label={t(`Relation With Guardian:`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.relation_with_guardian}
                      />
                    </Grid>

                    {/*father photo*/}
                    <Grid item xs={12} sm={6}>
                      <Grid item>
                        <NewFileUploadFieldWrapper
                          htmlFor="father_photo"
                          accept="image/*"
                          handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'father_photo', 'preview_father_photo')}
                          label="Father Photo"
                        />
                      </Grid>
                      <Grid item>
                        {values?.preview_father_photo?.map((image, index) => (
                          <>
                            <PreviewImageCard
                              data={image}
                              index={index}
                              key={index}
                              handleRemove={() => handleFileRemove(setFieldValue, 'father_photo', 'preview_father_photo')}
                            />
                          </>
                        ))}
                      </Grid>
                      <Grid item>
                        {student?.student_info?.father_photo && (
                          <Image src={getFile(student?.student_info?.father_photo)} height={150} width={150} alt="Logo" loading="lazy" />
                        )}
                      </Grid>
                    </Grid>

                    {/*mother photo*/}
                    <Grid item xs={12} sm={6}>
                      <Grid item xs={12}>
                        <NewFileUploadFieldWrapper
                          htmlFor="mother_photo"
                          accept="image/*"
                          handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'mother_photo', 'preview_mother_photo')}
                          label="Mother Photo"
                        />
                      </Grid>
                      <Grid item>
                        {values?.preview_mother_photo?.map((image, index) => (
                          <>
                            <PreviewImageCard
                              data={image}
                              index={index}
                              key={index}
                              handleRemove={() => handleFileRemove(setFieldValue, 'mother_photo', 'preview_mother_photo')}
                            />
                          </>
                        ))}
                      </Grid>
                      <Grid item>
                        {student?.student_info?.mother_photo && (
                          <Image src={getFile(student?.student_info?.mother_photo)} height={150} width={150} alt="Logo" loading="lazy" />
                        )}
                      </Grid>
                    </Grid>

                    {/* guardian_photo */}
                    <Grid item xs={12} sm={6}>
                      <Grid item xs={12}>
                        <NewFileUploadFieldWrapper
                          htmlFor="guardian_photo"
                          accept="image/*"
                          handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'guardian_photo', 'preview_guardian_photo')}
                          label="Guardian Photo"
                        />
                      </Grid>
                      <Grid item>
                        {values?.preview_guardian_photo?.map((image, index) => (
                          <>
                            <PreviewImageCard
                              data={image}
                              index={index}
                              key={index}
                              handleRemove={() => handleFileRemove(setFieldValue, 'guardian_photo', 'preview_guardian_photo')}
                            />
                          </>
                        ))}
                      </Grid>
                      <Grid item>
                        {student?.guardian_photo && (
                          <Image
                            src={getFile(student?.guardian_photo)}
                            height={150}
                            width={150}
                            alt="guardian photo"
                            loading="lazy"
                            style={{ width: 150, height: 150, objectFit: 'contain' }}
                          />
                        )}
                      </Grid>
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

                <Button color="warning" variant="contained" onClick={() => setActiveStep(1)}>
                  {t('Previous')}
                </Button>
                <Button
                  type="submit"
                  startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
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

export default RegistrationFirstPart;
