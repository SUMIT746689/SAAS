import React, { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Grid, Dialog, DialogContent, Avatar, Button, Typography } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DialogActionWrapper, DialogTitleWrapper } from '@/components/DialogWrapper';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { FileUploadFieldWrapper, NewFileUploadFieldWrapper, PreviewImageCard, TextAreaWrapper, TextFieldWrapper } from '@/components/TextFields';
import { DropDownSelectWrapper, DynamicDropDownSelectWrapper } from '@/components/DropDown';
import { RichTextEditorWrapper } from '@/components/RichTextEditorWrapper';
import Image from 'next/image';
import { fetchData } from '@/utils/post';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { getFile } from '@/utils/utilitY-functions';
import { handleFileChange, handleFileRemove } from 'utilities_api/handleFileUpload';

function PageHeader({ editData, setEditData, reFetchData }) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const [dynamicContent, setDynamicContent] = useState([]);
  const [videoGallariesInfo, setVideoGallariesInfo] = useState([]);

  useEffect(() => {
    if (editData) setOpen(true);
  }, [editData]);

  const handleCreateClassOpen = () => {
    setOpen(true);
  };

  const handleCreateClassClose = () => {
    setOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {
      const successResponse = (message) => {
        showNotification('Video Gallary ' + message + ' successfully');
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        reFetchData();
        handleCreateClassClose();
      };
      console.log('_values__', _values);
      if (editData) {
        const res = await axios.patch(`/api/front_end/video_gallaries/${editData.id}`, _values);
        // fetchData('')
        console.log({ res });
        successResponse(' updated ');
        return;
      }

      const res = await axios.post(`/api/website/video_gallaries`, _values);
      console.log({ res });
      successResponse('created');
      // }
    } catch (err) {
      console.error(err);
      showNotification(err?.response?.data?.message, 'error');
      setStatus({ success: false });
      //@ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };
  const videoGallaryList = () => {
    axios
      .get('/api/website/video_gallaries')
      .then((res) => {
        setVideoGallariesInfo(res?.data?.result);
        // setParentList(res?.data?.menus);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    videoGallaryList();
  }, []);
  useEffect(() => {}, [videoGallaryList]);
  return (
    <>
      {/* page head title and create button ui */}
      <PageHeaderTitleWrapper name="Video Gallary" handleCreateClassOpen={handleCreateClassOpen} />

      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleCreateClassClose}>
        {/* dialog title */}
        <DialogTitleWrapper name={'Video Gallary'} editData={editData} />

        <Formik
          initialValues={{
            youtube_link: editData?.youtube_link || undefined,
            english_title: editData?.english_title || undefined,
            bangla_title: editData?.bangla_title || undefined,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            youtube_link: Yup.string().required(t('Youtube Link field is required')),
            english_title: Yup.string().max(255).required(t('The english title field is required')),
            bangla_title: Yup.string().max(255).required(t('The bangla title field is required'))
          })}
          onSubmit={handleFormSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            console.log({ values, errors });
            return (
              <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ p: 3 }}>
                  <Grid container gap={1}>
                    {/* Youtube_Link */}
                    <TextFieldWrapper
                      label="Youtube_Link"
                      name="youtube_link"
                      value={values.youtube_link}
                      touched={touched.youtube_link}
                      errors={errors.youtube_link}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      required={true}
                    />
                  </Grid>
                  <TextFieldWrapper
                    label="English Title"
                    name="english_title"
                    value={values.english_title}
                    touched={touched.english_title}
                    errors={errors.english_title}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required={true}
                  />

                  {/* Content Name English*/}
                  <TextFieldWrapper
                    label="Bangla Title"
                    name="bangla_title"
                    value={values.bangla_title}
                    touched={touched.bangla_title}
                    errors={errors.bangla_title}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required={true}
                  />
                </DialogContent>

                {/* handle cancel dilog / close / submit dialog click cancel or add button */}
                <DialogActionWrapper
                  title="Video Gallary"
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
