import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import 'react-quill/dist/quill.snow.css';

import { Grid, Dialog, DialogTitle, DialogContent, Typography, TextField, CircularProgress, Autocomplete, useTheme, Checkbox } from '@mui/material';
import axios from 'axios';
import { useSearchUsers } from '@/hooks/useSearchUsers';
import { currency_list } from '@/static_data/currency_list';
import useNotistick from '@/hooks/useNotistick';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { TextFieldWrapper } from '@/components/TextFields';
import { DialogActionWrapper } from '@/components/DialogWrapper';

function PageHeader({ editSchool, setEditSchool, reFetchData }): any {

  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const [logo, setLogo] = useState(null)
  const theme = useTheme();
  const { showNotification } = useNotistick();
  const handleCreateProjectOpen = () => {
    setOpen(true);
  };

  const handleCreateProjectClose = () => {
    setLogo(null);
    setEditSchool(null);
    setOpen(false);
  };

  useEffect(() => {
    if (editSchool) {
      handleCreateProjectOpen();
    }
  }, [editSchool]);

  const handleFormSubmit = async (
    _values,
    resetForm,
    setErrors,
    setStatus,
    setSubmitting
  ) => {
    try {
      const handleSubmitSuccess = async (message) => {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        showNotification(message);
        setEditSchool(null);
        reFetchData();
        handleCreateProjectClose();
      };

      if (editSchool) {
        _values['subscription_id'] = editSchool?.subscription[0]?.id
        const res = await axios.patch(`/api/school/${editSchool.id}`, _values);
        if (res?.data?.success) {
          handleSubmitSuccess(t('A school has been updated successfully'));
        } else {
          new Error('Edit school failed');
        }
      } else {
        const res = await axios.post('/api/school', _values);

        if (res.data?.success) {
          handleSubmitSuccess(t('A new school has been created successfully'));
        } else throw new Error('Failed to create new school');
      }
    } catch (err) {
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
      showNotification(t(err.message), 'error');
    }
  };
  return (
    <>
      <PageHeaderTitleWrapper
        name="School"
        handleCreateClassOpen={handleCreateProjectOpen}
      />
      <Dialog
        fullWidth
        maxWidth='md'
        open={open}
        onClose={handleCreateProjectClose}
      >
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t(editSchool ? 'Edit a School' : 'Create new school')}
          </Typography>
          <Typography variant="subtitle2">
            {t(`Use this dialog window to ${editSchool ? 'update a' : 'add a new'} school`)}
          </Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            name: editSchool?.name ? editSchool.name : undefined,
            phone: editSchool?.phone ? editSchool.phone : undefined,
            email: editSchool?.email ? editSchool.email : undefined,
            address: editSchool?.address ? editSchool.address : undefined,
            admin_ids: editSchool?.admins ? Array.from(editSchool.admins, (x: any) => x.id) : undefined,
            currency: editSchool?.currency ? editSchool.currency : null,
            domain: editSchool?.domain ? editSchool?.domain : null,
            main_balance: editSchool?.main_balance ? editSchool?.main_balance : null,
            masking_sms_count: editSchool?.masking_sms_count ? editSchool?.masking_sms_count : null,
            non_masking_sms_count: editSchool?.non_masking_sms_count ? editSchool?.non_masking_sms_count : null,
            masking_sms_price: editSchool?.masking_sms_price ? editSchool?.masking_sms_price : null,
            non_masking_sms_price: editSchool?.non_masking_sms_price ? editSchool?.non_masking_sms_price : null,
            branch_limit: editSchool?.branch_limit ? editSchool.branch_limit : null,

            is_std_cnt_wise: editSchool?.subscription[0]?.package?.is_std_cnt_wise,
            package_price: editSchool?.subscription[0]?.package?.price,
            package_duration: editSchool?.subscription[0]?.package?.duration,
            package_student_count: editSchool?.subscription[0]?.package?.student_count,

            voice_sms_balance: editSchool?.voice_sms_balance || undefined,
            voice_sms_price: editSchool?.voice_sms_price || undefined,
            voice_pulse_size: editSchool?.voice_pulse_size || undefined,

            submit: null
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .max(255)
              .required(t('The name field is required')),
            phone: Yup.string()
              .length(11)
              .required(t('The phone field is required')),
            email: Yup.string()
              .email()
              .required(t('The email field is required')),
            address: Yup.string()
              .max(255)
              .required(t('The address field is required')),
            admin_ids: Yup.array(
              Yup.number().required(t('The admin_ids field must be number'))
            ).required('Please select admin.'),
            domain: Yup.string().nullable(),



            is_std_cnt_wise: Yup.boolean(),
            package_price: Yup.number().min(1).required(t('The price field is required')),
            package_duration: Yup.number().min(1).required(t('The duration field is required')),

            voice_pulse_size: Yup.number().integer().min(0).required(t('The voice pusle size field is required'))

          })}
          onSubmit={async (
            _values,
            { resetForm, setErrors, setStatus, setSubmitting }
          ) => {
            handleFormSubmit(
              _values,
              resetForm,
              setErrors,
              setStatus,
              setSubmitting
            );
          }}
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

            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container spacing={0}>

                    <TextFieldWrapper
                      errors={errors.name}
                      touched={touched.name}
                      label="School Name"
                      name="name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.name}
                    />

                    <TextFieldWrapper
                      errors={errors.phone}
                      touched={touched.phone}
                      name="phone"
                      label={t('Phone Number')}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.phone}
                    />

                    <TextFieldWrapper
                      errors={errors.email}
                      touched={touched.email}
                      name="email"
                      label={t('Email')}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.email}
                    />

                    <TextFieldWrapper
                      errors={errors.address}
                      touched={touched.address}
                      name="address"
                      label={t('School Eddress')}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.address}
                    />

                    <Grid
                      container
                      width={'100%'}
                      display={'grid'}
                      gridTemplateColumns={'2% 98%'}
                      gap={2}
                      py={1}
                      pb={1}
                    >
                      <Checkbox
                        sx={{ p: 0 }}
                        checked={values?.is_std_cnt_wise}
                        onChange={(event) => {
                          setFieldValue('is_std_cnt_wise', event.target.checked);
                        }}
                      />
                      <Typography variant="h6">
                        Student count package?
                      </Typography>

                    </Grid>

                    <Grid sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        md: `${values?.is_std_cnt_wise ? '1fr 1fr' : '1fr 1fr 1fr'}`
                      },
                      width: '100%',
                      gap: 1
                    }}>
                      <TextFieldWrapper
                        errors={errors?.package_price}
                        touched={touched?.package_price}
                        label={`${values?.is_std_cnt_wise ? 'Per student Price' : 'Package price'}`}
                        name="package_price"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.package_price}
                        type='number'
                      />

                      <TextFieldWrapper
                        errors={errors?.package_duration}
                        touched={touched?.package_duration}
                        name="package_duration"
                        label="Duration"
                        type="number"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values?.package_duration}
                      />
                      {
                        !values?.is_std_cnt_wise && <TextFieldWrapper
                          errors={errors?.package_student_count}
                          touched={touched?.package_student_count}
                          required={true}
                          name="package_student_count"
                          label="Student Count"
                          type="number"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          value={values?.package_student_count}
                        />
                      }
                    </Grid>


                    <Grid sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        md: '1fr 1fr'
                      },
                      width: '100%',
                      gap: 1
                    }}>
                      <Grid
                        item
                        width={'100%'}
                        justifyContent="flex-end"
                        textAlign={{ sm: 'right' }}
                        mb={1}
                      >

                        {/* <AdminSelect
                        setFieldValue={setFieldValue}
                        oldSelectedAdminID={values.admin_id}
                      /> */}
                        <SelectAdmin
                          setFieldValue={setFieldValue}
                          oldSelectedAdminID={values.admin_ids}
                        />
                      </Grid>


                      <TextFieldWrapper
                        type="number"
                        errors={errors.branch_limit}
                        touched={touched.branch_limit}
                        name="branch_limit"
                        label={t('Select Branch Limit ')}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.branch_limit}
                      />

                    </Grid>

                    <Grid
                      item
                      width="100%"
                      gap={1}
                      display="grid"
                      gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                    >
                      <Autocomplete
                        size='small'
                        id="tags-outlined"

                        disablePortal
                        value={
                          currency_list.find(
                            (academic) => academic.code === values.currency
                          ) || null
                        }
                        options={currency_list}
                        isOptionEqualToValue={(option: any, value: any) =>
                          option.code === value.code
                        }
                        getOptionLabel={(option) =>
                          option?.name + ' - ' + option?.code
                        }
                        renderInput={(params) => (
                          <TextField
                            sx={{
                              // maxHeight:100,
                              [`& fieldset`]: {
                                borderRadius: 0.6,
                              }
                            }}
                            {...params}
                            fullWidth
                            error={Boolean(touched?.currency && errors?.currency)}
                            helperText={touched?.currency && errors?.currency}
                            name="currency"
                            label={t('Select Currency ')}
                          />
                        )}
                        // @ts-ignore
                        onChange={(e, value: any) =>
                          setFieldValue('currency', value?.code || 0)
                        }
                      />

                      <TextFieldWrapper
                        type="number"
                        errors={errors.main_balance}
                        touched={touched.main_balance}
                        name="main_balance"
                        label={t('Balance Amount ')}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.main_balance}
                      />
                    </Grid>


                    <TextFieldWrapper
                      errors={errors.domain}
                      touched={touched.domain}
                      name="domain"
                      label={t('School domain ')}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.domain}
                    />

                    <Grid container display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} columnGap={1}>

                      <TextFieldWrapper
                        type="number"
                        errors={errors.masking_sms_price}
                        touched={touched.masking_sms_price}
                        name="masking_sms_price"
                        label={t('Masking Sms Price')}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.masking_sms_price}
                      />

                      <TextFieldWrapper
                        type="number"
                        errors={errors.non_masking_sms_price}
                        touched={touched.non_masking_sms_price}
                        name="non_masking_sms_price"
                        label={t('Non Masking Sms Price')}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.non_masking_sms_price}
                      />

                      <TextFieldWrapper
                        type="number"
                        errors={errors.masking_sms_count}
                        touched={touched.masking_sms_count}
                        name="masking_sms_count"
                        label={t('Masking Sms Count')}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.masking_sms_count}
                      />
                      <TextFieldWrapper
                        type="number"
                        errors={errors.non_masking_sms_count}
                        touched={touched.non_masking_sms_count}
                        name="non_masking_sms_count"
                        label={t('Non Masking Sms Count')}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.non_masking_sms_count}
                      />

                      {/* voice sms */}
                      <TextFieldWrapper
                        type="number"
                        errors={errors.voice_sms_balance}
                        touched={touched.voice_sms_balance}
                        name="voice_sms_balance"
                        label={t('Voice Sms Balance')}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.voice_sms_balance}
                      />
                      <TextFieldWrapper
                        type="number"
                        errors={errors.voice_sms_price}
                        touched={touched.voice_sms_price}
                        name="voice_sms_price"
                        label={t('Voice Sms Price')}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.voice_sms_price}
                      />
                      <TextFieldWrapper
                        type="number"
                        errors={errors.voice_pulse_size}
                        touched={touched.voice_pulse_size}
                        name="voice_pulse_size"
                        label={t('Voice Sms Pulse Size (Second)')}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.voice_pulse_size}
                        pattern="[0-9]{10}"
                      />
                    </Grid>


                  </Grid>
                </DialogContent>
                <DialogActionWrapper
                  handleCreateClassClose={handleCreateProjectClose}
                  errors={errors}
                  editData={editSchool}
                  title={"School"}
                  isSubmitting={isSubmitting}
                />
              </form>
            )
          }
          }
        </Formik>






      </Dialog>
    </>
  );
}

export default PageHeader;

const SelectAdmin = ({ setFieldValue, oldSelectedAdminID }) => {
  const [options, setOptions] = useState([]);
  const [searchToken, setSearchToken] = useState('');
  const { searchUsers } = useSearchUsers();
  const [selectedOption, setSelectedOption] = useState<any>([]);

  const handleSelect = (value) => {
    setSelectedOption(value);
    const filterIds = Array.from(value, (x: any) => x.id);
    if (value) setFieldValue('admin_ids', filterIds);
  };

  const getNsetOptions = async () => {
    const [users, err] = await searchUsers({ by: null, token: null });
    if (err) return;

    setOptions(
      users.map((user) => ({
        id: user.id,
        label: user.username
      }))
    );
    // if (oldSelectedAdminID && oldSelectedAdminID?.length > 0) {
    if (oldSelectedAdminID) {
      const prevSelected = [...selectedOption];

      for (const i of oldSelectedAdminID) {
        const user: any = users.find((user) => user.id === i);
        if (user) {
          prevSelected.push({ id: user?.id, label: user?.username })
        }
      }
      setSelectedOption(prevSelected)
      // oldSelectedAdminID.forEach((adminID) => {
      //   const user: any = users.find((user) => user.id === adminID);
      //   setSelectedOption((values) => [
      //     ...values,
      //     { id: user?.id, label: user?.username }
      //   ]);
      // });
    }
  };

  useEffect(() => {
    getNsetOptions();
  }, []);

  useEffect(() => {
    if (searchToken.length > 3) {
      getNsetOptions();
    }
  }, [searchToken]);

  return (
    <Autocomplete
      size="small"
      multiple
      id="multiple-limit-tags"
      options={options}
      value={selectedOption}
      onChange={(e, v) => handleSelect(v)}
      onInputChange={(e, v) => setSearchToken(v)}
      renderInput={(params) => <TextField
        sx={{
          [`& fieldset`]: {
            borderRadius: 0.6,
          }
        }}
        {...params}
        label="Select admin"
      />
      }
    />
  );
};