"use client"
import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import { Grid, Dialog, DialogContent } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DialogActionWrapper, DialogTitleWrapper } from '@/components/DialogWrapper';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { FileUploadFieldWrapper, TextFieldWrapper } from '@/components/TextFields';

function PageHeader({ editData, setEditData, reFetchData }) {
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();

  useEffect(() => {
    if (editData) setOpen(true);
  }, [editData]);

  const handleCreateClassOpen = () => {
    setOpen(true);
  };

  const handleCreateClassClose = () => {
    setPhoto(null);
    setOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {
      const successResponse = (message) => {
        showNotification(message);
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        reFetchData();
        handleCreateClassClose();
      };

      const formData = new FormData();
      for (const [key, value] of Object.entries(_values)) {
        // @ts-ignore
        formData.append(key, value);
      }
      if (editData) {
        const res = await axios.patch(`/api/notices/${editData.id}`, formData);
        // fetchData('')
        console.log({ res });
        successResponse('Notice updated !!');
      } else {
        const res = await axios.post(`/api/notices`, formData);
        successResponse('Notice created !!');
      }
      setPhoto(null);
    } catch (err) {
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
            title: editData?.title || undefined,
            first_name: editData?.first_name || undefined,
            middle_name: editData?.middle_name || undefined,
            last_name: editData?.last_name || undefined,
            date_of_birth: editData?.title || undefined,
            father_name: editData?.father_name || undefined,
            father_phn_no: editData?. father_phn_no || undefined,
            mother_name: editData?.mother_name || undefined,
            mother_phn_no: editData?.title || undefined,
            submit: null
          }}
        //   validationSchema={Yup.object().shape({
        //     title: Yup.string().max(255).required(t('The name field is required'))
        //     // content: Yup.string()
        //     //   .max(255)
        //     //   .required(t('The content field is required'))
        //   })}
          onSubmit={handleFormSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            console.log({ values, errors });
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
                      label="First_Name"
                      name="first_name"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Middle_Name"
                      name="middle_name"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Last_Name"
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
                      label="Date_Of_Birth"
                      name="date_of_birthday"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Phone_No"
                      name="phone_no"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    </Grid>
                    <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: ' 1fr 1fr' }, gap: 1 }} >
                   <TextFieldWrapper
                      label="Father_Name"
                      name="father_name"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Father_Phn_No"
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
                      label="Mother_Name"
                      name="mother_name"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="Mother_Phn_No"
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
               <Grid paddingLeft={32} paddingRight={32}><DialogActionWrapper 
                  title="Scholarship"
                  handleCreateClassClose={handleCreateClassClose}
                  errors={errors}
                  editData={editData}
                  isSubmitting={isSubmitting} 
                /></Grid>
               
              </form>
            );
          }}
        </Formik>
      {/* </Dialog> */}
    </>
  );
}

export default PageHeader;
