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
          first_name: editData?.first_name ? editData.first_name : undefined,
          middle_name: editData?.middle_name ? editData.middle_name : undefined,
          last_name: editData?.last_name ? editData.last_name : undefined,
          date_of_birth:editData?.date_of_birth ? editData.date_of_birth : undefined,
          class: editData?.class ? editData.class : undefined,
          phone: editData?.phone ? editData.phone : undefined,
          father_name: editData?.father_name ? editData.father_name : undefined,
          father_phn_no: editData?.father_phn_no ? editData.father_phn_no : undefined,
          mother_name: editData?.mother_name ? editData.mother_name : undefined,
          mother_phn_no: editData?.mother_phn_no ? editData.mother_phn_no : undefined,
          
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
                   <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: ' 1fr 1fr 1fr'  }, gap: 1 }} >
                    <TextFieldWrapper
                      label="Class"
                      name="class"
                      value={values.class}
                      touched={touched.class}
                      errors={errors.class}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
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
