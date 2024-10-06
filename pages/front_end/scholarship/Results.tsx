import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, Card, CircularProgress, Grid } from '@mui/material';
import { FormControlLabel, FormGroup, Switch, Typography } from '@mui/material';
import {TextFieldWrapper } from '@/components/TextFields';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { useEffect, useState } from 'react';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { useClientFetch } from '@/hooks/useClientFetch';
import { useAuth } from '@/hooks/useAuth';
const Results = ({ data, reFetchData }) => {

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
        english_scholarship_name: data?.english_scholarship_name || '',
        bangla_scholarship_name: data?.bangla_scholarship_name || '',
        classes: data?.scholarshipClasses?.map(cls=>({id: cls.id, label: cls.name})) || [],
        // classess: [],
        submit: null
      }}
      // validationSchema={Yup.object().shape({
      //   classess: Yup.array().min(1, 'select a classess')
      // })}
      onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          const successResponse = (message) => {
            setStatus({ success: true });
            setSubmitting(false);
            showNotification(message);
          };
          const copyValues = JSON.parse(JSON.stringify(_values));
          copyValues.classes = copyValues?.classes?.map(cls=>cls.id);
          axios
            .put('/api/front_end/scholarship', copyValues)
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
        console.log({values})
        return (
          <>
            <form onSubmit={handleSubmit}>
              <Card sx={{ minWidth:'calc(100vh-40px)' }}>
                <Grid container columnSpacing={1} paddingTop={2} borderTop="1px solid lightGray" borderBottom="1px solid lightGray" p={2}>
                  <TextFieldWrapper
                    touched={touched.english_scholarship_name}
                    errors={errors.english_scholarship_name}
                    label="Select English Name"
                    name="english_scholarship_name"
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    value={values.english_scholarship_name}
                    autocomplete="false"
                  />
                  <TextFieldWrapper
                    touched={touched.bangla_scholarship_name}
                    errors={errors.bangla_scholarship_name}
                    label="Select Bangla Name"
                    name="bangla_scholarship_name"
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    value={values.bangla_scholarship_name}
                    autocomplete="false"
                  />
                  <AutoCompleteWrapper
                    minWidth="100%"
                    label="Select Classes"
                    placeholder="classes..."
                    multiple
                    value={values.classes}
                    options={classOptions}
                    name="classes"
                    error={errors?.classes}
                    touched={touched?.classes}
                    // @ts-ignore
                    handleChange={(e, value: any) => setFieldValue('classes', value)}
                  />

                  <FormControlLabel
                    control={<Switch checked={isOn} onChange={() => setIsOn((value) => !value)} inputProps={{ 'aria-label': 'controlled' }} />}
                    label={`Scholarship ${isOn ? 'Active' : 'Disable'}`}
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
