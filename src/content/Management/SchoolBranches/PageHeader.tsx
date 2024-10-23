import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import 'react-quill/dist/quill.snow.css';

import { Grid, Dialog, DialogTitle, DialogContent, Typography, TextField, CircularProgress, Autocomplete, useTheme, Checkbox } from '@mui/material';
import axios from 'axios';
import { useSearchUsers } from '@/hooks/useSearchUsers';
import useNotistick from '@/hooks/useNotistick';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { TextFieldWrapper } from '@/components/TextFields';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { useClientFetch } from '@/hooks/useClientFetch';

function PageHeader({ editSchool, setEditSchool, reFetchData }): any {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const [logo, setLogo] = useState(null);
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

  const handleFormSubmit = async (_values, resetForm, setErrors, setStatus, setSubmitting) => {
    try {
      console.log('....dhdhdhhdhdhdhd');
      const handleSubmitSuccess = async (message) => {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        showNotification(message);
        setEditSchool(null);
        reFetchData();
        handleCreateProjectClose();
      };

      console.log('editSchool');
      if (editSchool) {
        console.log({ editSchool });
        _values['subscription_id'] = editSchool?.subscription[0]?.id;
        const res = await axios.patch(`/api/school/school_branches/${editSchool.id}`, _values);
        if (res?.data?.success) {
          handleSubmitSuccess(t('A school batch has been updated successfully'));
        } else {
          new Error('Edit school failed');
        }
      } else {
        console.log('.........shshhs');
        const res = await axios.post('/api/school/school_branches', _values);
        console.log({ res });
        if (res.data?.success) {
          handleSubmitSuccess(t('A new school batch has been created successfully'));
        } else throw new Error('Failed to create new school');
      }
    } catch (err) {
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
      handleShowErrMsg(err, showNotification);
    }
  };
  return (
    <>
      <PageHeaderTitleWrapper name="School Branch" handleCreateClassOpen={handleCreateProjectOpen} />
      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleCreateProjectClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t(editSchool ? 'Edit a School Branch' : 'Create new School Branch')}
          </Typography>
          <Typography variant="subtitle2">{t(`Use this dialog window to ${editSchool ? 'update a' : 'add a new'} school branch`)}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            name: editSchool?.name ? editSchool.name : undefined,
            phone: editSchool?.phone ? editSchool.phone : undefined,
            optional_phone: editSchool?.optional_phone ? editSchool.optional_phone : undefined,
            map_location: editSchool?.map_location ? editSchool.map_location : undefined,
            email: editSchool?.email ? editSchool.email : undefined,
            address: editSchool?.address ? editSchool.address : undefined,
            admin_ids: editSchool?.admins ? Array.from(editSchool.admins, (x: any) => x.id) : undefined,
            currency: editSchool?.currency ? editSchool.currency : null,
            domain: editSchool?.domain ? editSchool?.domain : null,
            // main_balance: editSchool?.main_balance ? editSchool?.main_balance : null,
            // masking_sms_count: editSchool?.masking_sms_count ? editSchool?.masking_sms_count : null,
            // non_masking_sms_count: editSchool?.non_masking_sms_count ? editSchool?.non_masking_sms_count : null,
            // masking_sms_price: editSchool?.masking_sms_price ? editSchool?.masking_sms_price : null,
            // non_masking_sms_price: editSchool?.non_masking_sms_price ? editSchool?.non_masking_sms_price : null,

            // is_std_cnt_wise: editSchool?.subscription[0]?.package?.is_std_cnt_wise,
            // package_price: editSchool?.subscription[0]?.package?.price,
            // package_duration: editSchool?.subscription[0]?.package?.duration,
            // package_student_count: editSchool?.subscription[0]?.package?.student_count,

            // voice_sms_balance: editSchool?.voice_sms_balance || undefined,
            // voice_sms_price: editSchool?.voice_sms_price || undefined,
            // voice_pulse_size: editSchool?.voice_pulse_size || undefined,

            submit: null
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().max(255).required(t('The name field is required')),
            phone: Yup.string().length(11).required(t('The phone field is required')),
            optional_phone: Yup.string().length(11).required(t('The optional phone field is required')),
            // map_location: Yup.string().length(11).required(t('The location field is required')),
            email: Yup.string().email().required(t('The email field is required')),
            address: Yup.string().max(255).required(t('The address field is required')),
            admin_ids: Yup.array(Yup.number().required(t('The admin_ids field must be number'))).required('Please select a branch admin'),
            domain: Yup.string().nullable()

            // is_std_cnt_wise: Yup.boolean(),
            // package_price: Yup.number().min(1).required(t('The price field is required')),
            // package_duration: Yup.number().min(1).required(t('The duration field is required')),

            // voice_pulse_size: Yup.number().integer().min(0).required(t('The voice pusle size field is required'))
          })}
          onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
            handleFormSubmit(_values, resetForm, setErrors, setStatus, setSubmitting);
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            console.log({ values, errors, touched });
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
                      errors={errors.optional_phone}
                      touched={touched.optional_phone}
                      name="optional_phone"
                      label={t('Optional Phone Number')}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.optional_phone}
                    />
                    <TextFieldWrapper
                      errors={errors.map_location}
                      touched={touched.map_location}
                      name="map_location"
                      label={t('Map Location')}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.map_location}
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

                    <TextFieldWrapper
                      errors={errors.domain}
                      touched={touched.domain}
                      name="domain"
                      label={t('School Domain')}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.domain}
                    />

                    <Grid item width={'100%'} justifyContent="flex-end" textAlign={{ sm: 'right' }} mb={1}>
                      <SelectAdmin
                        touched={touched.admin_ids}
                        error={errors.admin_ids}
                        setFieldValue={setFieldValue}
                        oldSelectedAdminID={values.admin_ids}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActionWrapper
                  handleCreateClassClose={handleCreateProjectClose}
                  errors={errors}
                  editData={editSchool}
                  title={'School Branch'}
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

const SelectAdmin = ({ error, touched, setFieldValue, oldSelectedAdminID }) => {
  const [options, setOptions] = useState([]);
  const [searchToken, setSearchToken] = useState('');
  const { searchUsers } = useSearchUsers();
  const [selectedOption, setSelectedOption] = useState<any>([]);
  const { data: branchUsers, reFetchData } = useClientFetch('/api/user/branch_admins');
  const { showNotification } = useNotistick();

  useEffect(() => {
    if (!branchUsers) return;
    setOptions(
      branchUsers.map((user) => ({
        id: user.id,
        label: user.username
      }))
    );

    if (!oldSelectedAdminID) return;

    const prevSelected = [...selectedOption];

    for (const i of oldSelectedAdminID) {
      const user: any = branchUsers.find((user) => user.id === i);
      if (user) {
        prevSelected.push({ id: user?.id, label: user?.username });
      }
    }
    setSelectedOption(prevSelected);
  }, [branchUsers]);

  const handleSelect = (value) => {
    if (Array.isArray(value) && value.length > 1) return showNotification('only add one branch admin...', 'warning');
    setSelectedOption(value);
    const filterIds = Array.from(value, (x: any) => x.id);
    if (value) setFieldValue('admin_ids', filterIds);
  };

  // const getNsetOptions = async () => {
  //   // if (err) return;
  //   const users = []
  //   setOptions(
  //     users.map((user) => ({
  //       id: user.id,
  //       label: user.username
  //     }))
  //   );
  //   // if (oldSelectedAdminID && oldSelectedAdminID?.length > 0) {
  //   if (oldSelectedAdminID) {
  //     const prevSelected = [...selectedOption];

  //     for (const i of oldSelectedAdminID) {
  //       const user: any = users.find((user) => user.id === i);
  //       if (user) {
  //         prevSelected.push({ id: user?.id, label: user?.username })
  //       }
  //     }
  //     setSelectedOption(prevSelected)
  //     // oldSelectedAdminID.forEach((adminID) => {
  //     //   const user: any = users.find((user) => user.id === adminID);
  //     //   setSelectedOption((values) => [
  //     //     ...values,
  //     //     { id: user?.id, label: user?.username }
  //     //   ]);
  //     // });
  //   }
  // };

  // useEffect(() => {
  //   getNsetOptions();
  // }, []);

  useEffect(() => {
    if (searchToken.length > 3) {
      // getNsetOptions();
    }
  }, [searchToken]);

  return (
    <>
      <Autocomplete
        size="small"
        multiple
        id="multiple-limit-tags"
        options={options}
        value={selectedOption}
        onChange={(e, v) => handleSelect(v)}
        onInputChange={(e, v) => setSearchToken(v)}
        renderInput={(params) => (
          <TextField
            sx={{
              [`& fieldset`]: {
                borderRadius: 0.6
              }
            }}
            {...params}
            label="Select Branch Admin"
          />
        )}
      />
      {((Array.isArray(touched) && touched.length > 0) || touched) && (
        <Grid textAlign="left" px={1} py={0.5} color="red" fontWeight={600}>
          {error}
        </Grid>
      )}
    </>
  );
};
