import { useContext, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik, ErrorMessage } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/useAuth';
import { Grid, Dialog, DialogContent } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { TextFieldWrapper } from '@/components/TextFields';
import { AutoCompleteWrapperWithoutRenderInput } from '@/components/AutoCompleteWrapper';
import { DialogActionWrapper, DialogTitleWrapper } from '@/components/DialogWrapper';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';

const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((i) => ({
  label: i,
  value: i.toLocaleLowerCase()
}));
const fees_type_arr = [
  {
    id: 'class_based',
    label: 'Class Based'
  },
  {
    id: 'batch_based',
    label: 'Batch Based'
  },
  {
    id: 'subject_based',
    label: 'Subject Based'
  }
];

function PageHeader({ name, feesHeads, editData, seteditData, classData, reFetchData, subjectData }) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { showNotification } = useNotistick();
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [checked, setChecked] = useState(false);
  const [subjectList, setSubjectList] = useState<Array<any>>([]);
  const [batchList, setBatchList] = useState([]);

  useEffect(() => {
    if (editData) handleCreateClassOpen();
  }, [editData]);

  const handleCreateClassOpen = () => {
    setOpen(true);
  };

  const handleCreateClassClose = () => {
    setChecked(false);
    setOpen(false);
    seteditData(null);
  };

  const handleCreateUserSuccess = () => {
    seteditData(null);
    setOpen(false);
  };

  const handleSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {
      const successResponse = (message) => {
        showNotification('fees ' + message + ' successfully');
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateUserSuccess();
        reFetchData();
      };
      _values['last_date'] = new Date(_values.last_date).setHours(23, 59, 0, 0);
      _values['late_fee'] = parseFloat(_values.late_fee);
      const customMonths = _values.months.map((month) => month.value);
      // old code
      //const class_ids = _values.class_ids.map((cls) => cls.value);
      // dayjs(_values.last_date).format('YYYY-MM-DD')

      if (editData) {
        const res = await axios.patch(`/api/fee/${editData.id}`, {
          ..._values,
          months: customMonths,
          class_ids: [_values.class_id],
          subject_ids: _values.subject_id
        }); // For edit _values.class_id    _values.subject_id
        successResponse('updated');
      } else {
        _values['late_fee'] = _values?.late_fee ? _values?.late_fee : 0;
        const res = await axios.post(`/api/fee`, {
          ..._values,
          months: customMonths,
          class_ids: [_values.class_id],
          subject_ids: _values.subject_id
        });
        successResponse('created');
      }
    } catch (err) {
      handleShowErrMsg(err, showNotification);
      setStatus({ success: false });
      //@ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  const handleSelectAllMonths = (setValue) => {
    setValue('months', month);
  };
  const handleRemoveAllMonths = (setValue) => {
    setValue('months', []);
  };

  // // subject list function
  // const subjectListFn = (classInfo) => {
  //   axios
  //     .get(`/api/subject?class_id=${classInfo.value}`)
  //     .then((res) => {
  //       const filterArr = res?.data.map((item) => {
  //         return {
  //           label: item.name,
  //           value: item.id
  //         };
  //       });
  //       setSubjectList(filterArr);
  //     })
  //     .catch((error) => {
  //       setSubjectList([]);
  //     });
  // };
  console.log({ classData, batchList })
  return (
    <>
      <PageHeaderTitleWrapper name="Fees Management" handleCreateClassOpen={handleCreateClassOpen} />
      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleCreateClassClose}>
        <DialogTitleWrapper editData={editData} name="fees" />

        <Formik
          initialValues={{
            fees_head_id: editData?.fees_head_id || undefined,
            title: editData?.title || undefined,
            amount: editData?.amount || undefined,
            school_id: user?.school_id || undefined,
            last_date: editData?.last_date || null,
            frequency: editData?.frequency || undefined,
            _for: editData?.for || undefined,
            academic_year_id: editData?.academic_year_id || academicYear?.id || undefined,
            class_id: editData?.class_id || undefined,
            subject_id: editData?.subject_id || undefined,
            subject_ids: editData?.subject ? subjectData.find((subject) => subject.value === editData.subject_id) : undefined,
            class_ids: editData?.class ? classData.find((cls) => cls.value === editData.class_id) : undefined,
            fees_type: editData?.fees_type ? fees_type_arr.find((item) => item.id === editData?.fees_type) : undefined,
            fees_type_id: editData?.fees_type || undefined,
            months: [],
            late_fee: editData?.late_fee || 0,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            fees_head_id: Yup.number().min(1, 'The fees head is required').required(t('The fees head is required')),
            amount: Yup.number().min(1).required(t('The amount code field is required')),
            school_id: Yup.number().min(1).required(t('The school id is required')),
            months: !editData && Yup.array().min(1, 'select a month'),
            class_id: Yup.number().min(1, 'The class is required').required(t('The class is required')),
            subject_id: Yup.number()
              .min(1, 'The subject is required')
              .when('fees_type_id', {
                is: 'subject_based', // Check if fees_type_id is equal to "subject_based"
                then: Yup.number().required('The subject is required'),
                otherwise: Yup.number().notRequired()
              }),
            fees_type_id: Yup.string().min(1, 'The section is required').required(t('Fees type is required'))
          })}
          onSubmit={handleSubmit}
        >
          {({ validateOnBlur, errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            useEffect(() => {
              // If frequency is 'annual', ensure that the field is disabled and no default month is selected.
              if (values.frequency === 'annual') {
                setFieldValue('months', values.months); // Accept the month manually provided for annual frequency.
              } else {
                // For other frequencies, enable multiple month selection and reset months if needed.
                setFieldValue('months', values.months || []);
              }
            }, [values.frequency, values.months, setFieldValue]);
            console.log({ values, touched, errors, validateOnBlur });
            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  {/* <Grid display={'grid'} columnGap={2} rowGap={1} gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}> */}
                  <Grid container columnSpacing={1} columns={12}>
                    {/* fees heads */}
                    <Grid item xs={12} sm={6}>
                      <AutoCompleteWrapperWithoutRenderInput
                        sm={6}
                        minWidth="100%"
                        label="Select Fees Head"
                        placeholder="select a fees head..."
                        value={feesHeads.find((cls) => cls.value === values.fees_head_id) || null}
                        options={feesHeads}
                        isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                        name="fees_head_id"
                        error={errors?.fees_head_id}
                        touched={touched?.fees_head_id}
                        // @ts-ignore
                        handleChange={(e, value: any) => {
                          console.log({ value });
                          setFieldValue('fees_head_id', value?.value || 0);
                          setFieldValue('frequency', value?.frequency || 0);
                        }}
                      />
                    </Grid>

                    {/* which month */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        disabled={true}
                        name="frequency"
                        label="Frequency"
                        errors={errors?.frequency}
                        touched={touched?.frequency}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.frequency || ''}
                      />
                    </Grid>

                    {/* fee's for which month */}
                    {/* <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        name="_for"
                        label="Fee For"
                        errors={errors?._for}
                        touched={touched?._for}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?._for}
                      />
                    </Grid> */}

                    {/* select type */}
                    <Grid item xs={12} sm={6}>
                      <AutoCompleteWrapperWithoutRenderInput
                        multiple={false}
                        disabled={editData}
                        minWidth="100%"
                        label="Select Fees Type"
                        placeholder="Select Fees Type"
                        // value={values.fees_type || null}

                        value={editData ? fees_type_arr.find((item) => item.id === values.fees_type_id) : values.fees_type}
                        options={fees_type_arr}
                        name="fees_type_id"
                        error={errors?.fees_type_id}
                        touched={touched?.fees_type_id}
                        // @ts-ignore
                        handleChange={(e, value: any) => {
                          setFieldValue('batch_ids', undefined);
                          setFieldValue('batch_id', undefined);
                          setFieldValue('section_ids', undefined);
                          setFieldValue('section_id', undefined);

                          if (value) {
                            setFieldValue('fees_type', value);
                            setFieldValue('fees_type_id', value.id);
                          } else {
                            setFieldValue('fees_type', undefined);
                            setFieldValue('fees_type_id', undefined);
                          }
                        }}
                      />
                    </Grid>

                    {/* Class */}
                    {values.fees_type_id && (
                      <Grid item xs={12} sm={6}>
                        <AutoCompleteWrapperWithoutRenderInput
                          multiple={false}
                          disabled={editData}
                          minWidth="100%"
                          label="Select Class"
                          placeholder="select a class..."
                          value={editData ? classData.find((cls) => cls.value === values.class_id) : values?.class_ids?.value}
                          options={classData}
                          name="class_id"
                          error={errors?.class_id}
                          touched={touched?.class_id}
                          // @ts-ignore
                          handleChange={(event, value) => {
                            if (value) {
                              // subjectListFn(value);
                              setFieldValue('class_ids', value || undefined);
                              setFieldValue('class_id', value.value || 0);
                              setBatchList(value.sections || []);
                              setSubjectList(value.subjects || []);
                            } else {
                              setFieldValue('subject_ids', undefined);
                              setFieldValue('subject_id', 0);
                              setSubjectList([]);
                              setBatchList([]);
                            }
                          }}
                        />
                      </Grid>
                    )}

                    {/* Batch */}
                    {values.fees_type_id === 'batch_based' && (
                      <Grid item xs={12} sm={6}>
                        <AutoCompleteWrapperWithoutRenderInput
                          multiple={false}
                          disabled={editData}
                          minWidth="100%"
                          label="Select Batch"
                          placeholder="select a batch..."
                          // value={editData ? classData.find((cls) => cls.value === values.class_id) : values?.class_ids?.value}
                          value={
                            // editData ? subjectData.find((sub) => sub.value === values.subject_id) : 
                            values.section_ids || null}
                          options={batchList}
                          name="batch_id"
                          error={errors?.section_id}
                          touched={touched?.section_id}
                          // @ts-ignore
                          handleChange={(event, value) => {
                            if (value) {
                              // subjectListFn(value);
                              setFieldValue('section_ids', value || undefined);
                              setFieldValue('section_id', value.value || 0);
                            } else {
                              setFieldValue('section_ids', undefined);
                              setFieldValue('section_id', 0);
                            }
                          }}
                        />
                      </Grid>
                    )}

                    {/* subject related code start */}
                    {values.fees_type_id === 'subject_based' && (
                      <Grid item xs={12} sm={6}>
                        <AutoCompleteWrapperWithoutRenderInput
                          multiple={false}
                          disabled={editData}
                          minWidth="100%"
                          label="Select Subject"
                          placeholder="select a subject..."
                          value={editData ? subjectData.find((sub) => sub.value === values.subject_id) : values.subject_ids || null}
                          options={subjectList}
                          name="subject_id"
                          error={errors?.subject_id}
                          touched={touched?.subject_id}
                          // @ts-ignore
                          handleChange={(event, value) => {
                            if (value) {
                              setFieldValue('subject_ids', value || undefined);
                              setFieldValue('subject_id', value.value || 0);
                            } else {
                              setFieldValue('subject_ids', undefined);
                              setFieldValue('subject_id', 0);
                            }
                          }}
                        />
                      </Grid>
                    )}

                    {/* Amount */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        type="number"
                        errors={errors?.amount}
                        touched={touched?.amount}
                        name="amount"
                        label="Amount"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.amount}
                      />
                    </Grid>

                    {/* late_fee */}
                    <Grid item xs={12} sm={6}>
                      <TextFieldWrapper
                        type="number"
                        errors={errors?.late_fee}
                        touched={touched?.late_fee}
                        name="late_fee"
                        label={t(`Late Fee`)}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.late_fee}
                      />
                    </Grid>
                  </Grid>

                  {!editData && (
                    <Grid item columnGap={1}>
                      <AutoCompleteWrapperWithoutRenderInput
                        minWidth="100%"
                        label="Select Month"
                        placeholder="Month..."
                        multiple={true}
                        // multiple={values.frequency !== 'annual' && values.frequency !== 'half-yearly'} // Enable multiple selection only if frequency is not 'annual'
                        value={values.months}
                        options={month}
                        name="month"
                        error={errors?.months}
                        touched={touched?.months}
                        // disabled={values.frequency === 'annual'} // Disable field if frequency is 'annual'
                        // @ts-ignore
                        handleChange={(e, value: any) => {
                          console.log({ value });
                          if (values.frequency === 'annual' && value.length > 1) return;
                          if (values.frequency === 'half_yearly' && value.length > 2) return;
                          setFieldValue('months', value);
                        }}
                      />

                      {values.frequency !== 'annual' && (
                        <Grid display="flex" justifyContent="start" columnGap={1}>
                          <ButtonWrapper variant="outlined" handleClick={() => handleSelectAllMonths(setFieldValue)}>
                            Select All
                          </ButtonWrapper>
                          <ButtonWrapper variant="outlined" handleClick={() => handleRemoveAllMonths(setFieldValue)}>
                            Remove All
                          </ButtonWrapper>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </DialogContent>
                <DialogActionWrapper
                  title="Fees"
                  errors={errors}
                  editData={editData}
                  handleCreateClassClose={handleCreateClassClose}
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
