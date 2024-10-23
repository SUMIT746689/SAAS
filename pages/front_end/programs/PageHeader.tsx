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

  const [programsInfo, setProgramsInfo] = useState([]);

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
        showNotification('sms template' + message + ' successfully');
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        reFetchData();
        handleCreateClassClose();
      };
      // console.log('_values__', _values);

      const formData = new FormData();
      for (const [key, value] of Object.entries(_values)) {
        // console.log(`${key}: ${value}`);
        if (key === 'banner_photo') {
          formData.append(key, value[0]);
          continue;
        }
        // @ts-ignore
        formData.append(key, value);
      }

      if (editData) {
        const res = await axios.patch(`/api/front_end/programs/${editData.id}`, formData);
        console.log({ res });
        successResponse(' updated ');
        return;
      }

      const res = await axios.post(`/api/front_end/programs`, formData);
      // console.log({ res });
      successResponse('created');
    } catch (err) {
      console.error(err);
      showNotification(err?.response?.data?.message, 'error');
      setStatus({ success: false });
      //@ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };
  const programsList = () => {
    axios
      .get('/api/front_end/programs')
      .then((res) => {
        setProgramsInfo(res.data);
        console.log('ttttttttttttttttttttttt', res.data);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    programsList();
  }, []);

  const handleDynamicContent = async (userType) => {
    const [err, res] = await fetchData('/api/certificate_templates/dynamic_content', 'get', {});
    setDynamicContent(() => (!err && res.success ? res.data : []));
  };

  return (
    <>
      {/* page head title and create button ui */}
      <PageHeaderTitleWrapper name="programs Page" handleCreateClassOpen={handleCreateClassOpen} />

      <Dialog fullWidth maxWidth="md" open={open} onClose={handleCreateClassClose}>
        {/* dialog title */}
        <DialogTitleWrapper name={'website Page'} editData={editData} />

        <Formik
          initialValues={{
            title: editData?.title || undefined,
            body: editData?.body || '',
            banner_photo: editData?.banner_photo || '',
            submit: null
          }}
          validationSchema={Yup.object().shape({
            title: Yup.string().max(255).required(t('The  title field is required')),
            body: Yup.string().required(t('The body field is required'))
          })}
          onSubmit={handleFormSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            console.log({ values, errors });
            return (
              <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ p: 3 }}>
                  <Grid container gap={1}>
                    {/*  title */}
                    <TextFieldWrapper
                      label="Title"
                      name="title"
                      value={values.title}
                      touched={touched.title}
                      errors={errors.title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      required={true}
                    />

                    {/*  body */}
                    <Grid container pb={5}>
                      <Grid>Body: *</Grid>
                      <RichTextEditorWrapper
                        value={values.body}
                        handleChange={(newValue: any) => {
                          // console.log({ newValue });
                          setFieldValue('body', newValue);
                        }}
                      />
                    </Grid>

                    {/* banner image */}
                    <Grid item xs={12}>
                      <Grid item xs={12}>
                        <NewFileUploadFieldWrapper
                          htmlFor="banner_photo"
                          accept="image/*"
                          handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'banner_photo', 'preview_feature_photo')}
                          label="Banner Photo"
                        />
                      </Grid>
                      <Grid item>
                        {values?.preview_feature_photo?.map((image, index) => (
                          <>
                            <PreviewImageCard
                              data={image}
                              index={index}
                              key={index}
                              handleRemove={() => handleFileRemove(setFieldValue, 'banner_photo', 'preview_feature_photo')}
                            />
                          </>
                        ))}
                      </Grid>
                      <Grid item>
                        {editData?.banner_photo && (
                          <Image
                            src={getFile(editData?.banner_photo)}
                            height={200}
                            width={200}
                            alt="banner photo"
                            loading="lazy"
                            style={{ width: 150, height: 150, objectFit: 'contain' }}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </DialogContent>

                {/* handle cancel dilog / close / submit dialog click cancel or add button */}
                <DialogActionWrapper
                  title="Program Page"
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
