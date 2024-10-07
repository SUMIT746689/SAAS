import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Grid, Dialog, DialogContent } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DialogActionWrapper, DialogTitleWrapper } from '@/components/DialogWrapper';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { FileUploadFieldWrapper, TextFieldWrapper } from '@/components/TextFields';
import { fetchData } from '@/utils/post';
import { getFile } from '@/utils/utilitY-functions';

function PageHeader({ editData, setEditData, reFetchData }) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const [dynamicContent, setDynamicContent] = useState([]);
  const [photo, setPhoto] = useState(null);

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

  const handleDynamicContent = async (userType) => {
    const [err, res] = await fetchData('/api/certificate_templates/dynamic_content', 'get', {});
    setDynamicContent(() => (!err && res.success ? res.data : []));
  };

  return (
    <>
      {/* page head title and create button ui */}
      <PageHeaderTitleWrapper name="notice" handleCreateClassOpen={handleCreateClassOpen} />

      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleCreateClassClose}>
        {/* dialog title */}
        <DialogTitleWrapper name={'Notice'} editData={editData} />

        <Formik
          initialValues={{
            title: editData?.title || undefined,
            headLine: editData?.headLine || undefined,
            photo: undefined,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            title: Yup.string().max(255).required(t('The name field is required'))
            // content: Yup.string()
            //   .max(255)
            //   .required(t('The content field is required'))
          })}
          onSubmit={handleFormSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            console.log({ values, errors });
            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container gap={1}>
                    {/* <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }} > */}
                    <TextFieldWrapper
                      label="Title"
                      name="title"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                    <TextFieldWrapper
                      label="head Line"
                      name="headLine"
                      value={values.headLine}
                      touched={touched.headLine}
                      errors={errors.headLine}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />

                    <Grid sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Grid>
                        <FileUploadFieldWrapper
                          htmlFor="photo"
                          label="Photo Image"
                          name="photo"
                          value={values.photo?.name || ''}
                          accept="application/pdf"
                          handleChangeFile={(e) => {
                            if (e.target?.files?.length) {
                              setPhoto(URL.createObjectURL(e.target.files[0]));
                              setFieldValue('photo', e.target.files[0]);
                            }
                          }}
                          handleRemoveFile={() => {
                            setPhoto(null);
                            setFieldValue('photo', undefined);
                          }}
                        />
                      </Grid>
                      {(photo || editData?.file_url) && (
                        <Grid
                          sx={{
                            p: 1,
                            border: 1,
                            borderRadius: 1,
                            borderColor: 'primary.main',
                            color: 'primary.main'
                          }}
                        >
                          <a style={{ width: '50px' }} target="_blank" href={photo || getFile(editData?.file_url)}>
                            {photo || (editData?.file_url ? getFile(editData?.file_url) : 'Not selected')}
                          </a>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </DialogContent>

                {/* handle cancel dilog / close / submit dialog click cancel or add button */}
                <DialogActionWrapper
                  title="Notice"
                  handleCreateClassClose={handleCreateClassClose}
                  errors={errors}
                  editData={editData}
                  isSubmitting={isSubmitting}
                />
              </form>
            );
          }}
        </Formik>
      </Dialog>
    </>
  );
}

export default PageHeader;
