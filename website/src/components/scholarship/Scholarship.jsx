"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Grid, DialogContent, TextField, Button, CircularProgress, DialogActions } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DialogActionWrapper, DialogTitleWrapper } from '@/components/DialogWrapper';
import { NewFileUploadFieldWrapper, PreviewImageCard, TextFieldWrapper } from '@/components/TextFields';
import { useTranslation } from 'react-i18next';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { LocalizationProvider, MobileDatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import dayjs from 'dayjs';
import PdfDatas from '../scholarship/PdfDatas';
import { handleFileChange, handleFileRemove } from '@/utils/handleFileUpload';
import { useClientDataFetch, useClientFetch } from '@/hooks/useClientFetch';
import { useReactToPrint } from 'react-to-print';
function Scholarship({ classes, editData, setEditData, serverHost, school }) {
  console.log("school.......",{school})
  const [scholarshipData, setScholarshipData] = useState("")
  const { t } = useTranslation()
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const [pdfDatas, setPdfDatas] = useState({});
  const componentRef = useRef(null);
  const [batches, setBatches] = useState([]);
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
        console.log({ _values })
        if (i === "classes") formData.append(`${i}`, JSON.stringify({ id: _values.classes.id, name: _values.classes.label }));
        else if (i === "student_photo") formData.append(`${i}`, _values[i][0])
        else if (i === "preview_student_photo");
        else formData.append(`${i}`, _values[i]);
      }

      formData.append(`admission_date`, new Date(Date.now()).toISOString())

      const resOnlineAdd = await axios.post(`${serverHost}/api/onlineAdmission`, formData)

      setPdfDatas(resOnlineAdd.data.datas);
      resetForm();
      setStatus({ success: true });
      showNotification('submitted successfully !!');
    }
    catch (err) {
      console.log(err);
      showNotification(err.response?.data?.message || err.message, 'error');
      setStatus({ success: false });
      //@ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });

  return (
    <>
      <Grid sx={{ pt: 4 }}>  </Grid>
      {/* <Grid paddingLeft={32} paddingRight={32} > <DialogTitleWrapper name={'Scholarship'} editData={editData} /></Grid> */}
      <Formik
        initialValues={{
          // first_name: editData?.first_name ? editData.first_name : " ",
          first_name: '',
          middle_name: '',
          last_name: '',
          classes: " ",
          batch: "",
          // date_of_birth: editData?.date_of_birth || new Date(Date.now()),
          date_of_birth: null,
          phone: '',
          father_name: '',
          father_phn_no: '',
          mother_name: '',
          mother_phn_no: '',
          // form_fill_up_rules_and_regulation: school?.form_fill_up_rules_and_regulation || " "

        }}
        validationSchema={Yup.object().shape({
          first_name: Yup.string()
            .max(255)
            .required(t('The first name field is required')),

          // classes: Yup.mixed()
          //   // .max(255)
          //   .required(t('The classes field is required')),

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
          console.log({ isSubmitting, values, errors });
          return (
            <form onSubmit={handleSubmit}>
              <DialogContent
                dividers
                sx={{
                  p: 3
                }}
              >
                <Grid container gap={1} paddingLeft={32} paddingRight={32}>
                  <Grid>
                    <div className='text-red-800 font-bold text-xl'>
                    Roles and Regulations : 
                    </div>
                    {/* <div  className='px-4 pb-4 text-sm' dangerouslySetInnerHTML={{ __html: program.body }} /> </div>   */}
                    <div className='text-orange-700 font-semibold text-sm mb-4 p-2' dangerouslySetInnerHTML={{ __html: school.websiteui[0].form_fill_up_rules_and_regulation }} />
                  </Grid>
                  <Grid container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }} >
                   
                    <TextFieldWrapper
                      label="First Name"
                      name="first_name"
                      value={values.first_name}
                      touched={touched.first_name}
                      errors={errors.first_name}
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
                  <Grid style={{ color: 'red', fontSize: '14px', marginTop: '2px' }} container display="grid" sx={{ gridTemplateColumns: { sm: '1fr 1fr', md: ' 1fr 1fr 1fr' }, gap: 1 }} >
                    <Grid >
                      <AutoCompleteWrapper
                        minWidth="100%"
                        label="Select Class"
                        placeholder="class..."
                        // multiple
                        value={values.classes}
                        options={classes}
                        name="classes"
                        error={errors?.classes}
                        touched={touched?.classes}
                        handleChange={(e, value) => {
                          console.log({ section: value?.sections });
                          setFieldValue("classes", value);
                          setBatches(value?.sections || [])
                          // setFieldValue("class_ids", value.id);
                        }}
                      />
                      {
                        touched.classes && errors?.classes
                      }
                    </Grid>

                    {/* batches */}
                    <Grid>
                      <AutoCompleteWrapper
                        minWidth="100%"
                        label="Select Batch"
                        placeholder="batch..."
                        value={values.batch}
                        options={batches}
                        name="batch"
                        error={errors?.batch}
                        touched={touched?.batch}
                        getOptionLabel={(option) => option?.name || ""}  
                        isOptionEqualToValue={(option, value) => option.id === value.id}  
                        handleChange={(e, value) => {
                          setFieldValue("batch", value);
                        }}
                      />
                      {touched?.batch && errors?.batch}
                    </Grid>

                    {/* date_of_birth */}
                    {/* <Grid container xs={12} md={6}> */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>

                      <Grid display="grid">
                        <MobileDatePicker
                          label="Date of birth"
                          inputFormat="dd/MM/yyyy"
                          value={values.date_of_birth}
                          onChange={(n) => {
                            if (n) {
                              if (!n) return;
                              const newValue = dayjs(n);
                              //@ts-ignore
                              setFieldValue('date_of_birth', newValue);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              required
                              fullWidth
                              name="date_of_birth"
                              size="small"
                              sx={{
                                // width: "100%",
                                '& fieldset': {
                                  borderRadius: '3px'
                                }
                              }}
                              {...params}
                            />
                          )}
                        />
                        {touched.date_of_birth && errors.date_of_birth && <span style={{ color: 'red', fontSize: 12 }}> Date of birth are required</span>}
                      </Grid>
                    </LocalizationProvider>

                    {/* </Grid> */}

                    {/* 
                    <TextFieldWrapper
                      label="Date Of Birth"
                      name="date_of_birth"
                      value={values.date_of_birth}
                      touched={touched.date_of_birth}
                      errors={errors.date_of_birth}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    /> */}
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
                      label="Father Phone No"
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
                      label="Mother Phone No"
                      name="mother_phn_no"
                      value={values.mother_phn_no}
                      touched={touched.mother_phn_no}
                      errors={errors.mother_phn_no}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />

                  </Grid>
                  {/*student photo*/}
                  <Grid item xs={12}>
                    <Grid item>
                      <NewFileUploadFieldWrapper
                        htmlFor="student_photo"
                        accept="image/*"
                        label="Student Photo"
                        handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'student_photo', 'preview_student_photo')}
                      />
                    </Grid>
                    <Grid item>
                      {values?.preview_student_photo?.map((image, index) => (
                        <>
                          <PreviewImageCard
                            data={image}
                            index={index}
                            key={index}
                            handleRemove={() => handleFileRemove(setFieldValue, 'student_photo', 'preview_student_photo')}
                          />
                        </>
                      ))}
                    </Grid>
                  </Grid>

                </Grid>
              </DialogContent>

              {/* handle cancel dilog / close / submit dialog click cancel or add button */}
              <Grid paddingLeft={32} paddingRight={32}>
                {/* <DialogActionWrapper
                  title="Scholarship"
                  handleCreateClassClose={handleCreateClassClose}
                  errors={errors}
                  editData={editData}
                  isSubmitting={isSubmitting}
                /> */}
                <DialogActions sx={{ p: 3 }}>
                  <Button color="secondary" onClick={handleCreateClassClose}>
                    {'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                    //@ts-ignore
                    disabled={Boolean(errors.submit) || isSubmitting}
                    variant="contained"
                  >
                    Submit
                  </Button>
                </DialogActions>
              </Grid>

            </form>
          );
        }}
      </Formik>


      {/* pdf show */}
      {Object?.keys(pdfDatas).length > 0 && (
        <Grid display="grid" sx={{ width: '100%', pb: 8 }}>
          <Button variant="outlined" onClick={handlePrint} sx={{ mx: 'auto' }}>
            Download Form
          </Button>
        </Grid>
      )}

      <Grid sx={{ height: 0, overflow: 'hidden' }}>
        <Grid ref={componentRef}>
          <PdfDatas school={school} values={pdfDatas} serverHost={serverHost} />
        </Grid>
      </Grid>
    </>
  );
}

export default Scholarship;
