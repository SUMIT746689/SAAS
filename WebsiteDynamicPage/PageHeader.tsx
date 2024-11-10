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
  const featureImageRef = useRef();

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
      console.log('_values__', _values);

      // if (editData) {
      // const res = await axios.patch(`/api//${editData.id}`, _values);
      // successResponse('updated');
      // } else {

      const formData = new FormData();
      for (const [key, value] of Object.entries(_values)) {
        console.log(`${key}: ${value}`);
        if (key === 'feature_photo') {
          formData.append(key, value[0]);
          continue;
        }
        // @ts-ignore
        formData.append(key, value);
      }

      if (editData) {
        const res = await axios.patch(`/api/front_end/website_dynamic_pages/${editData.id}`, formData);
        // fetchData('')
        console.log({ res });
        successResponse(' updated ');
        return;
      }

      const res = await axios.post(`/api/front_end/website_dynamic_pages`, formData);
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

  const handleDynamicContent = async (userType) => {
    const [err, res] = await fetchData('/api/certificate_templates/dynamic_content', 'get', {});
    setDynamicContent(() => (!err && res.success ? res.data : []));
  };

  // const handleFileChange = (e, setFieldValue, field, preview_field, student_id, id) => {
  //   if (e?.target?.files?.length === 0) {
  //     setFieldValue(field, '');
  //     setFieldValue(preview_field, []);
  //     setFieldValue(student_id, []);
  //     return;
  //   }

  // setFieldValue(field, e.target.files[0]);

  // const imgPrev = [];

  // if (selectedPerson === 'Student Photo') {
  //   Array.prototype.forEach.call(e.target.files, (file) => {
  //     const objectUrl = URL.createObjectURL(file);
  //     imgPrev.push({ name: file.name, src: objectUrl, studentId: id, student_photo: true });
  //   });
  // } else if (selectedPerson === 'Guardian Photo') {
  //   Array.prototype.forEach.call(e.target.files, (file) => {
  //     const objectUrl = URL.createObjectURL(file);
  //     imgPrev.push({ name: file.name, src: objectUrl, studentId: id, guardian_photo: true });
  //   });
  // } else if (selectedPerson === 'Father Photo') {
  //   Array.prototype.forEach.call(e.target.files, (file) => {
  //     const objectUrl = URL.createObjectURL(file);
  //     imgPrev.push({ name: file.name, src: objectUrl, studentId: id, father_photo: true });
  //   });
  // } else if (selectedPerson === 'Mother Photo') {
  //   Array.prototype.forEach.call(e.target.files, (file) => {
  //     const objectUrl = URL.createObjectURL(file);
  //     imgPrev.push({ name: file.name, src: objectUrl, studentId: id, mother_photo: true });
  //   });
  // }

  // setFieldValue(preview_field, imgPrev);
  // setFieldValue(student_id, [id]);

  // // filtering state
  // const filterStateArr = previousValues.filter((item) => {
  //   return item.studentId !== imgPrev[0].studentId;
  // });

  // // state value

  // setPreviousValues((prev) => [
  //   ...filterStateArr,
  //   {
  //     ...imgPrev[0]
  //   }
  // ]);
  // };

  return (
    <>
      {/* page head title and create button ui */}
      <PageHeaderTitleWrapper name="Website Dynamic Page" handleCreateClassOpen={handleCreateClassOpen} />

      <Dialog fullWidth maxWidth="md" open={open} onClose={handleCreateClassClose}>
        {/* dialog title */}
        <DialogTitleWrapper name={'Website Dynamic Page'} editData={editData} />

        <Formik
          initialValues={{
            english_title: editData?.english_title || undefined,
            bangla_title: editData?.bangla_title || undefined,
            english_description: editData?.english_description || '',
            bangla_description: editData?.bangla_description || '',
            feature_photo: '',
            status: editData?.status || undefined,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            english_title: Yup.string().max(255).required(t('The english title field is required')),
            bangla_title: Yup.string().max(255).required(t('The bangla title field is required')),
            english_description: Yup.string().required(t('The english description field is required')),
            bangla_description: Yup.string().required(t('The bangla description field is required')),
            status: Yup.string().required(t('select a status'))
          })}
          onSubmit={handleFormSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            console.log({ values, errors });
            return (
              <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ p: 3 }}>
                  <Grid container gap={1}>
                    {/* english title */}
                    <TextFieldWrapper
                      label="Title (English)"
                      name="english_title"
                      value={values.english_title}
                      touched={touched.english_title}
                      errors={errors.english_title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      required={true}
                    />

                    {/* bangla title */}
                    <TextFieldWrapper
                      label="Title (বাংলা)"
                      name="bangla_title"
                      value={values.bangla_title}
                      touched={touched.bangla_title}
                      errors={errors.bangla_title}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      required={true}
                    />

                    {/* english description */}
                    <Grid container pb={1} >
                      <Grid>Description (English): *</Grid>
                      <RichTextEditorWrapper
                        // height='200px'
                        value={values.english_description}
                        handleChange={(newValue: any) => {
                          console.log({ newValue });
                          setFieldValue('english_description', newValue);
                          // setText(editor.getContent({ format: 'text' }));
                          // editor.getContent({ format: 'text' });
                        }}
                      />
                      {/* <Grid display="flex" flexWrap="wrap" gap={1} mt={1} >
                        {dynamicContent?.map((content, index) => <Button key={index} variant="contained" sx={{ borderRadius: 0.4, fontSize: 12, fontWeight: 400, py: 0.4, px: 1 }} onClick={() => { setFieldValue('content', values.content + content) }} >{content}</Button>)}
                      </Grid> */}
                    </Grid>

                    {/* bangla description */}
                    <Grid container pb={1}>
                      <Grid>Description (বাংলা): *</Grid>
                      <RichTextEditorWrapper
                        // height='200px'
                        value={values.bangla_description}
                        handleChange={(newValue: any) => {
                          console.log({ newValue });
                          setFieldValue('bangla_description', newValue);
                          // setText(editor.getContent({ format: 'text' }));
                          // editor.getContent({ format: 'text' });
                        }}
                      />
                      {/* <Grid display="flex" flexWrap="wrap" gap={1} mt={1} >
                        {dynamicContent?.map((content, index) => <Button key={index} variant="contained" sx={{ borderRadius: 0.4, fontSize: 12, fontWeight: 400, py: 0.4, px: 1 }} onClick={() => { setFieldValue('content', values.content + content) }} >{content}</Button>)}
                      </Grid> */}
                    </Grid>

                    {/* feature image */}
                    <Grid item xs={12}>
                      <Grid item xs={12}>
                        <NewFileUploadFieldWrapper
                          htmlFor="feature_photo"
                          accept="image/*"
                          handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'feature_photo', 'preview_feature_photo')}
                          label="Feature Photo"
                          ref={featureImageRef}
                        />
                      </Grid>
                      <Grid item>
                        {values?.preview_feature_photo?.map((image, index) => (
                          <>
                            <PreviewImageCard
                              data={image}
                              index={index}
                              key={index}
                              // @ts-ignore
                              handleRemove={() => handleFileRemove(setFieldValue, 'feature_photo', 'preview_feature_photo', featureImageRef.current.resetInput)}
                            />
                          </>
                        ))}
                      </Grid>
                      <Grid item>
                        {editData?.feature_photo && (
                          <Image
                            src={getFile(editData?.feature_photo)}
                            height={200}
                            width={200}
                            alt="feature photo"
                            loading="lazy"
                            style={{ width: 150, height: 150, objectFit: 'contain' }}
                          />
                        )}
                      </Grid>
                    </Grid>

                    {/* status */}
                    <DropDownSelectWrapper
                      label="Status"
                      name="status"
                      value={values.status}
                      menuItems={['publish', 'unpublish']}
                      // touched={touched.name}
                      // errors={errors.name}
                      handleChange={handleChange}
                      // handleBlur={handleBlur}
                      required={true}
                    />
                  </Grid>
                </DialogContent>

                {/* handle cancel dilog / close / submit dialog click cancel or add button */}
                <DialogActionWrapper
                  title="Website Page"
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
