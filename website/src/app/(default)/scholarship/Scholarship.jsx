"use client"
import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Grid, DialogContent } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DialogActionWrapper, DialogTitleWrapper } from '@/components/DialogWrapper';
import { TextFieldWrapper } from '@/components/TextFields';
import { useTranslation } from 'react-i18next';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';

function Scholarship({classes, editData, setEditData, reFetchData , serverHost}) {
  const {t} = useTranslation()
  const [open, setOpen] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const { showNotification } = useNotistick();
  // useEffect(() => {
  //   if (!classes || !Array.isArray(classes)) return;
  //   setClassOptions(
  //     classes.map((cls) => ({
  //       id: cls.id,
  //       label: cls.name
  //     }))
  //   );
  // }, [classes]);
  useEffect(() => {
    if (editData) setOpen(true);
  }, [editData]);
  const handleCreateClassOpen = () => {
    setOpen(true);
  };
  const handleCreateClassClose = () => {
    // setPhoto(null);
    setOpen(false);
    setEditData(null);
  };
  const handleFormSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {
      const formData = new FormData();
      for (let i in _values) {
        console.log({_values})
        if(i === "classes") {
        //  const customCls = JSON.stringify(Array.isArray(_values.classes) ? _values.classes.map(cls=>({id:cls.id, name:cls.label})) : [])
        //  console.log({customCls});
        //  formData.append(`${i}`,customCls);
         // formData.append('classes', JSON.stringify(Array.isArray( _values.classes) ? _values.classes.map(cls=>({id:cls.id,name:cls.label})): [])); 
        
         formData.append(`${i}`, JSON.stringify({id:_values.classes.id,name:_values.classes.label}));
        
        }
          else formData.append(`${i}`, _values[i]);
      }

      formData.append(`admission_date`, new Date(Date.now()).toISOString())

      await axios.post(`${serverHost}/api/onlineAdmission`, formData)
        .then(res => { console.log({ res }) })
        .catch(err => { console.log({ err }) })
      resetForm();
      setStatus({ success: true });
      showNotification('Online Admission form submitted !!');
    }
    catch (err) {
      console.log(err);
      showNotification(err?.response?.data?.message, 'error');
      setStatus({ success: false });
      //@ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };
  return (
    <> 
    <Grid paddingLeft={32} paddingRight={32} > <DialogTitleWrapper  name={'Scholarship'} editData={editData} /></Grid>
    <Formik
          initialValues={{
          // first_name: editData?.first_name ? editData.first_name : " ",
          first_name: editData?.first_name || '',
          middle_name: editData?.middle_name || '',
          last_name: editData?.last_name || '',
          classes: "",
          date_of_birth: editData?.date_of_birth || '',
          phone: editData?.phone || '',
          father_name: editData?.father_name || '',
          father_phn_no: editData?.father_phn_no || '',
          mother_name: editData?.mother_name || '',
          mother_phn_no: editData?.mother_phn_no || '',
          
        }}
        validationSchema={Yup.object().shape({
          first_name: Yup.string()
            .max(255)
            .required(t('The first name field is required')),

            classes: Yup.mixed()
            // .max(255)
            .required(t('The classes field is required')),
            
          date_of_birth: Yup.string()
            .max(255)
            .required(t('The date_of_birth field is required')),

          phone: Yup.string()
            .max(255)
            .required(t('The phone field is required')),
        })}
          onSubmit={handleFormSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            console.log({isSubmitting, values, errors });
            return (
              <form  onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container gap={1} paddingLeft={32} paddingRight={32}>
                    <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }} >
                   <TextFieldWrapper
                      label="First Name"
                      name="first_name"
                      value={values.first_name }
                      touched={touched.first_name }
                      errors={errors.first_name }
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Middle Name"
                      name="middle_name"
                      value={values.middle_name}
                      touched={touched.middle_name}
                      errors={errors.middle_name}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Last Name"
                      name="last_name"
                      value={values.last_name}
                      touched={touched.last_name}
                      errors={errors.last_name}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                   </Grid>
                   <Grid  style={{ color: 'red', fontSize: '14px', marginTop: '2px' }}container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: ' 1fr 1fr 1fr'  }, gap: 1 }} >
                    <Grid >
                    <AutoCompleteWrapper
                    minWidth="100%"
                    label="Select Classes"
                    placeholder="classes..."
                    // multiple
                    value={values.classes}
                    options={classes}
                    name="classes"
                    error={errors?.classes}
                    touched={touched?.classes}
                    handleChange={(e, value) =>{
                      setFieldValue("classes",value);
                      // setFieldValue("class_ids", value.id);
                      }}
                  />
                  {
                     touched.classes && errors?.classes
                  }
                    </Grid>
                    <TextFieldWrapper
                      label="Date Of Birth"
                      name="date_of_birth"
                      value={values.date_of_birth}
                      touched={touched.date_of_birth}
                      errors={errors.date_of_birth}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Phone"
                      name="phone"
                      value={values.phone}
                      touched={touched.phone}
                      errors={errors.phone}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    </Grid>
                    <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: ' 1fr 1fr' }, gap: 1 }} >
                   <TextFieldWrapper
                      label="Father Name"
                      name="father_name"
                      value={values.father_name}
                      touched={touched.father_name}
                      errors={errors.father_name}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Father Phn No"
                      name="father_phn_no"
                      value={values.father_phn_no}
                      touched={touched.father_phn_no}
                      errors={errors.father_phn_no}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                   </Grid>
                   <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: ' 1fr 1fr' }, gap: 1 }} >
                    <TextFieldWrapper
                      label="Mother Name"
                      name="mother_name"
                      value={values.mother_name}
                      touched={touched.mother_name}
                      errors={errors.mother_name}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Mother Phn No"
                      name="mother_phn_no"
                      value={values.mother_phn_no}
                      touched={touched.mother_phn_no}
                      errors={errors.mother_phn_no}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    </Grid>
                  </Grid>
                </DialogContent>

                {/* handle cancel dilog / close / submit dialog click cancel or add button */}
               <Grid paddingLeft={32} paddingRight={32}>
                <DialogActionWrapper 
                  title="Scholarship"
                  handleCreateClassClose={handleCreateClassClose}
                  errors={errors}
                  editData={editData}
                  isSubmitting={isSubmitting} 
                />
                </Grid>
               
              </form>
            );
          }}
        </Formik>
      {/* </Dialog> */}
    </>
  );
}

export default Scholarship;
