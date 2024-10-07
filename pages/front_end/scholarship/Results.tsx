import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, Card, CircularProgress, Grid } from '@mui/material';
import { FormControlLabel, FormGroup, Switch, Typography } from '@mui/material';
import { NewFileUploadFieldWrapper, PreviewImageCard, TextAreaWrapper, TextFieldWrapper } from '@/components/TextFields';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { useEffect, useState } from 'react';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { useClientFetch } from '@/hooks/useClientFetch';
import { useAuth } from '@/hooks/useAuth';
const Results = ({ data, reFetchData, sections }) => {
  const { user } = useAuth();
  const [classOptions, setClassOptions] = useState([]);
  const { data: classes } = useClientFetch(`/api/class?school_id=${user?.school_id}`);
  useEffect(() => {
    if (!classes || !Array.isArray(classes)) return;
    setClassOptions(
      classes.map((cls) => ({
        id: cls.id,
        label: cls.name
      }))
    );
  }, [classes]);

  console.log('classess...', { classes });
  console.log({ classOptions });
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();
  // isOn
  const [isOn, setIsOn] = useState(false);
  useEffect(() => {
    const storedValue = localStorage.getItem('isOn');
    console.log({ storedValue });
    if (storedValue !== null) {
      setIsOn(JSON.parse(storedValue));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('isOn', JSON.stringify(isOn));
  }, [isOn]);
  return (
    <Formik
      enableReinitialize
      initialValues={{
        english_chairman_name: data?.english_chairman_name || '',
        bangla_chairman_name: data?.bangla_chairman_name || '',
        classess: data?.classess || '',
        submit: null
      }}
      onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          const successResponse = (message) => {
            setStatus({ success: true });
            setSubmitting(false);
            showNotification(message);
          };
          const formData = new FormData();
          for (let i in _values) {
            if (i.includes('preview_')) continue;
            if (i == 'carousel_image') {
              const temp = _values[i];
              for (const j in temp) {
                if (typeof temp[j] == 'object') {
                  formData.append('carousel_image', temp[j]);
                }
              }
            } else if (
              ['header_image', 'about_school_photo', 'chairman_photo', 'principal_photo', 'assist_principal_photo'].includes(i) &&
              _values[i]
            ) {
              formData.append(`${i}`, _values[i][0]);
            } else if (['e_books_section', 'downloads_section'].includes(i) && _values[i]) {
              formData.append(`${i}`, JSON.stringify(_values[i]));
            } else {
              console.log({ i: _values[i] });
              formData.append(`${i}`, _values[i]);
            }
          }
          axios
            .put('/api/front_end', formData)
            .then((res) => {
              reFetchData();
              successResponse('Scholarship information updated !');
            })
            .catch((err) => {
              console.log(err);
              showNotification('Scholarship information updated  failed !', 'error');
            });
        } catch (err) {
          console.error(err);

          setStatus({ success: false });
          //@ts-ignore
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
        return (
          <>
            <form onSubmit={handleSubmit}>
              <Card sx={{ maxWidth: 1400 }}>
                <Grid container columnSpacing={1} paddingTop={2} borderTop="1px solid lightGray" borderBottom="1px solid lightGray" p={2}>
                  <TextFieldWrapper
                    touched={touched.english_chairman_name}
                    errors={errors.english_chairman_name}
                    label="Select_English_Name"
                    name="english_chairman_name"
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    value={values.english_chairman_name}
                    autocomplete="false"
                  />
                  <TextFieldWrapper
                    touched={touched.bangla_chairman_name}
                    errors={errors.bangla_chairman_name}
                    label="Select_Bangla_Name"
                    name="bangla_chairman_name"
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    value={values.bangla_chairman_name}
                    autocomplete="false"
                  />
                  <AutoCompleteWrapper
                    minWidth="100%"
                    label="Select classess"
                    placeholder="classess..."
                    multiple
                    options={classOptions}
                    name="classes"
                    error={errors?.classess}
                    touched={touched?.classess}
                    handleChange={(e, value: any) => setFieldValue('classess', value)}
                  />
                  <Grid item>Scholership</Grid>
                  <FormControlLabel
                    control={<Switch checked={isOn} onChange={() => setIsOn((value) => !value)} inputProps={{ 'aria-label': 'controlled' }} />}
                    label={`${isOn ? 'On' : 'Off'}`}
                    labelPlacement="start"
                    sx={{ mr: 'auto' }}
                  />
                </Grid>

                <Grid display={'flex'} alignContent="center" justifyContent={'center'} alignItems="center" padding={2}>
                  <Button
                    sx={{
                      borderRadius: 0.5,
                      height: 36,
                      width: '50%'
                    }}
                    type="submit"
                    startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                    disabled={Boolean(errors.submit) || isSubmitting}
                    variant="contained"
                  >
                    {t('Save')}
                  </Button>
                </Grid>
              </Card>
            </form>
          </>
        );
      }}
    </Formik>
  );
};
export default Results;
