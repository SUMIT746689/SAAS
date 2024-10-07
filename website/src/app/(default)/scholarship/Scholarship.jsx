"use client"
import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Grid, Dialog, DialogContent, Button } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DialogActionWrapper, DialogTitleWrapper } from '@/components/DialogWrapper';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { FileUploadFieldWrapper, TextFieldWrapper } from '@/components/TextFields';
import { useTranslation } from 'react-i18next';



function Scholarship({ editData, setEditData, reFetchData , serverHost}) {
  // const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();

  useEffect(() => {
    if (editData) setOpen(true);
  }, [editData]);

  const handleCreateClassOpen = () => {
    setOpen(true);9
  };

  const handleCreateClassClose = () => {
    // setPhoto(null);
    setOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    // try {
    //   const successResponse = (message) => {
    //     showNotification(message);
    //     resetForm();
    //     setStatus({ success: true });
    //     setSubmitting(false);
    //     reFetchData();
    //     handleCreateClassClose();
    //   };

    //   const formData = new FormData();
    //   for (const [key, value] of Object.entries(_values)) {
    //     // @ts-ignore
    //     formData.append(key, value);
    //   }
    //   if (editData) {
    //     const res = await axios.patch(`/api/notices/${editData.id}`, formData);
    //     // fetchData('')
    //     console.log({ res });
    //     successResponse('Notice updated !!');
    //   } else {
    //     const res = await axios.post(`/api/notices`, formData);
    //     successResponse('Notice created !!');
    //   }
    //   setPhoto(null);
    // } 
    try {
      
      const formData = new FormData();

      for (let i in _values) {
        formData.append(`${i}`, _values[i]);
      }

      await axios.post(`${serverHost}/api/onlineAdmission`, formData)
        .then(res => { console.log({ res }) })
        .catch(err => { console.log({ err }) })
      
        // setPdfDatas(() => _values)

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
          first_name: undefined,
          middle_name: '',
          last_name: '',
          date_of_birth: null,
          phone: undefined,
          father_name: undefined,
          father_phn_no: undefined,
          mother_name: '',
          mother_phn_no: undefined,
          
        }}
        // validationSchema={Yup.object().shape({
        //   first_name: Yup.string().max(255).required(t('First name field is required')),
        //   middle_name: Yup.string().max(255).nullable(true),
        //   last_name: Yup.string().max(255).nullable(true),
        //   date_of_birth: Yup.date().required(t('Date of birth is required!')),
        //   phone: Yup.string().required(t('Phone number is required!')).min(11, 'Phone number must be greater then or equals 11 character'),
        //   father_name: Yup.string().max(255).required(t('First name field is required')),
        //   mother_name: Yup.string().max(255).nullable(true),
        //   father_phn_no:  Yup.string().required(t('Phone number is required!')).min(11, 'Phone number must be greater then or equals 11 character'),
        //   mother_phn_no:  Yup.string().required(t('Phone number is required!')).min(11, 'Phone number must be greater then or equals 11 character'),
          
        // })}
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
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Middle Name"
                      name="middle_name"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Last Name"
                      name="last_name"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                   </Grid>
                   <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: ' 1fr 1fr' }, gap: 1 }} >
                    <TextFieldWrapper
                      label="Date Of Birth"
                      name="date_of_birth"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Phone"
                      name="phone"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    </Grid>
                    <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: ' 1fr 1fr' }, gap: 1 }} >
                   <TextFieldWrapper
                      label="Father Name"
                      name="father_name"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Father Phn No"
                      name="father_phn_no"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                   </Grid>
                   <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: ' 1fr 1fr' }, gap: 1 }} >
                    <TextFieldWrapper
                      label="Mother Name"
                      name="mother_name"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Mother Phn No"
                      name="mother_phn_no"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
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
