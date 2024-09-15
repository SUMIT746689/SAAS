import React, { useContext, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
} from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { TextFieldWrapper } from '@/components/TextFields';
import { AutoCompleteWrapper, AutoCompleteWrapperWithoutRenderInput } from '@/components/AutoCompleteWrapper';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';

function PageHeader({ editDiscount, setEditDiscount, reFetchData, classes }) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [fees, setFees] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const typeOption = [
    {
      label: 'Percent',
      value: 'percent'
    },
    {
      label: 'Flat',
      value: 'flat'
    }
  ];

  const fees_type_arr = [
    {
      id: 'class_based',
      label: 'Class-Based'
    },
    {
      id: 'subject_based',
      label: 'Subject-Based'
    }
  ];

  const handleCreateClassOpen = () => {
    setOpen(true);
  };

  const handleCreateClassClose = () => {
    setOpen(false);
    setEditDiscount(null);
  };

  const handleCreateUserSuccess = (message) => {
    showNotification(message, 'success');
    setOpen(false);
    setEditDiscount(null);
  };

  useEffect(() => {
    if (editDiscount) handleCreateClassOpen();
  }, [editDiscount]);

  const handleFormSubmit = async (
    _values,
    { resetForm, setErrors, setStatus, setSubmitting }
  ) => {
    try {
      console.log("_values___", _values);

      if (editDiscount && academicYear) {
        await axios.patch(`/api/discount/${editDiscount.id}?academic_year_id=${academicYear?.id}`, _values)
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateUserSuccess(
          t('The discount updated successfully')
        );
        reFetchData();

      }
      else {
        await axios.post(`/api/discount?academic_year_id=${academicYear?.id}`, _values)
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateUserSuccess(t('The discount created successfully'));
        reFetchData();
      }

    } catch (err) {
      console.error(err);
      showNotification(t('There was an error, try again later'), 'error');
      setStatus({ success: false });
      // @ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  const handleClassChange = async (event, value, setFieldValue, values) => {

    setSections([]);
    setFieldValue('section_id', undefined);
    setFieldValue('class_id', value?.value || undefined);

    // const selectCls = classes.find(cls => cls.value === value?.value);
    // if (selectCls?.sections?.length === 0) showNotification("no batches founds", "error")
    // setSections(selectCls.sections);


    // axios.get(`/api/subject?class_id=${value.value}`)
    //   .then(res => setSubjects(res.data?.map(sub => ({ id: sub.id, label: sub.name }))))
    //   .catch(err => handleShowErrMsg(err, showNotification))

    // if (values.fees_type_id !== "class_based") return;
    // axios.get(`/api/fee?class_id=${value.value}`)
    //   .then(feesLists => {
    //     const customFeesLists = feesLists.data.data.map(fee => ({ label: `${fee.fees_head.title}(${fee.title})`, value: fee.id }))
    //     setFees(customFeesLists);
    //     console.log({ feesLists })
    //     // setFees()
    //   })
    //   .catch(feesError => handleShowErrMsg(feesError, showNotification))
    // // const selectCls = classes.find(cls => cls.value === value?.value);
    // // setSections(selectCls.sections);
  }

  const handleBatchChange = (event, value, setFieldValue, values) => {
    setFieldValue('section_id', value?.value || undefined);
  }

  // const handleSubjectChange = (event, value, setFieldValue, values) => {
  //   setFieldValue('subject_id', value?.value || undefined);
  // }

  console.log({ fees, classes, sections })

  return (
    <>
      <PageHeaderTitleWrapper
        name="Discount"
        handleCreateClassOpen={handleCreateClassOpen}
      />

      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={handleCreateClassClose}
      >
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t(editDiscount ? 'Edit a Discount' : 'Add new Discount')}
          </Typography>
          <Typography variant="subtitle2">
            {t('Fill in the fields below to create and add a new Discount')}
          </Typography>
        </DialogTitle>

        <Formik
          initialValues={{
            title: editDiscount?.title || undefined,
            // fee_id: editDiscount?.fee_id || undefined,
            class_id: undefined,
            type: editDiscount?.type || undefined,
            amt: editDiscount?.amt || undefined,
            // subject_id: undefined,
          }}
          validationSchema={Yup.object().shape({
            title: Yup.string()
              .max(255)
              .required(t('Discount title is required')),
            class_id: Yup.number().positive().integer().required('class id is required'),
            type: Yup.string()
              .max(255)
              .required(t('Discount type is required')),
            // fee_id: Yup.number().positive().integer().required('Fee is required'),
            amt: Yup.number().positive().required('Discount amount is required'),
          })}
          onSubmit={handleFormSubmit}
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            touched,
            values,
            setFieldValue
          }) => {
            console.log({ errors });

            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container >

                    <TextFieldWrapper
                      errors={errors.title}
                      touched={touched.title}
                      label={t('Discount title')}
                      name="title"
                      value={values.title}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                    />

                    {/* <AutoCompleteWrapperWithoutRenderInput
                      multiple={false}
                      // disabled={editData}
                      minWidth="100%"
                      label="Select Fees Type"
                      placeholder="Select Fees Type"
                      // value={values.fees_type || null}

                      value={
                        // editData ? fees_type_arr.find((item) => item.id === values.fees_type_id) : 
                        values.fees_type}
                      options={fees_type_arr}
                      name="fees_type_id"
                      error={errors?.fees_type_id}
                      touched={touched?.fees_type_id}
                      // @ts-ignore
                      handleChange={(e, value: any) => {
                        if (value) {
                          setFieldValue('fees_type', value);
                          setFieldValue('fees_type_id', value.id);
                        } else {
                          setFieldValue('fees_type', undefined);
                          setFieldValue('fees_type_id', undefined);
                        }
                      }}
                    /> */}

                    <AutoCompleteWrapper
                      minWidth="100%"
                      label="Select Class"
                      placeholder="select a class..."
                      value={classes.find((cls) => cls.value === values.class_id) || null}
                      options={classes}
                      required={true}
                      // @ts-ignore
                      handleChange={(e, v) => handleClassChange(e, v, setFieldValue, values)}
                    />

                    {/* <AutoCompleteWrapper
                      minWidth="100%"
                      label="Select Batch"
                      placeholder="select a batch..."
                      value={sections?.find((cls) => cls.value === values.section_id) || null}
                      options={sections}
                      // required={true}
                      // @ts-ignore
                      handleChange={(e, v) => handleBatchChange(e, v, setFieldValue, values)}
                    /> */}

                    {/* {
                      values.fees_type_id === "subject_based" &&
                      <AutoCompleteWrapper
                        minWidth="100%"
                        label="Select Subject"
                        placeholder="select a subject..."
                        value={subjects?.find((cls) => cls.value === values.subject_id) || null}
                        options={subjects}
                        required={true}
                        // @ts-ignore
                        handleChange={(e, v) => handleSubjectChange(e, v, setFieldValue, values)}
                      />
                    } */}

                    {/* <AutoCompleteWrapper
                      minWidth="100%"
                      label="Fee"
                      placeholder="select a Fee..."
                      value={fees.find((cls) => cls.value === values.fee_id) || null}
                      options={fees}
                      required={true}
                      // @ts-ignore
                      handleChange={(event, value) => {
                        setFieldValue('fee_id', value?.value || undefined);
                      }}
                    /> */}

                    <AutoCompleteWrapper
                      minWidth="100%"
                      label="Discount type"
                      placeholder="Select Discount type..."
                      value={
                        // typeOption.find((i) => i.value === values.type) || 
                        values.type
                      }
                      options={typeOption}
                      required={true}
                      // @ts-ignore
                      handleChange={(event, value) => {
                        setFieldValue('type', value?.value || undefined)
                      }}
                    />

                    <TextFieldWrapper
                      errors={errors.amt}
                      touched={touched.amt}
                      label={t(`Discount ${values?.type === 'percent' ? 'percent (%)' : 'amount'}`)}
                      name="amt"
                      value={values.amt}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type='number'
                    />

                  </Grid>
                </DialogContent>
                <DialogActionWrapper
                  title="Discount"
                  handleCreateClassClose={handleCreateClassClose}
                  errors={errors}
                  editData={editDiscount}
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
