import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import { Grid, Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { TextFieldWrapper } from '@/components/TextFields';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { DropDownSelectWrapper } from '@/components/DropDown';

function PageHeader({ editSubject, setEditSubject, reFetchSubjects, classList }) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const [selectedClass, setSelectedClass] = useState([]);

  useEffect(() => {
    if (editSubject) handleCreateClassOpen();
  }, [editSubject]);

  const handleCreateClassOpen = () => {
    setOpen(true);
  };

  const handleCreateClassClose = () => {
    setOpen(false);
    setSelectedClass([]);
    setEditSubject(null);
  };

  const handleCreateUserSuccess = (message) => {
    showNotification(message);
    handleCreateClassClose();
    reFetchSubjects();
  };
  const handleFormSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {
      if (editSubject) {
        await axios.patch(`/api/fees_heads/${editSubject.id}`, _values);
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateUserSuccess(t('The subject was updated successfully'));
      } else {
        await axios.post(`/api/fees_heads`, _values);
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        handleCreateUserSuccess(t('The subject was created successfully'));
      }

      // await wait(1000);
    } catch (err) {
      console.error(err);
      showNotification(t('There was an error, try again'), 'error');
      setStatus({ success: false });
      // @ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeaderTitleWrapper handleCreateClassOpen={handleCreateClassOpen} name="fees heads" />

      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleCreateClassClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t(editSubject ? 'Edit Fees Heads' : 'Add new Fees Head')}
          </Typography>
          <Typography variant="subtitle2">{t('Fill in the fields below to create and edit a fees head')}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            title: editSubject?.title || '',
            frequency: editSubject ? editSubject?.frequency : ''
          }}
          validationSchema={Yup.object().shape({
            title: Yup.string().max(255).required(t('The class name field is required')),
            frequency: Yup.string().max(255).required(t('The class name field is required'))
          })}
          onSubmit={handleFormSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container spacing={1}>
                    <TextFieldWrapper
                      errors={errors.name}
                      touched={touched.name}
                      label={t('Title')}
                      name="title"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.title}
                    />

                    <Grid item minWidth="100%">
                      <DropDownSelectWrapper
                        value={values.frequency}
                        name="frequency"
                        label="Frequency"
                        handleChange={handleChange}
                        menuItems={['on_demand', 'half_yearly', 'monthly', 'annual']}
                      />
                    </Grid>

                    {/* <AutoCompleteWrapper
                      multiple={editSubject ? false : true}
                      minWidth="100%"
                      value={editSubject ? (classList.find((cls) => cls.value === values.class_id) || null) : selectedClass}
                      options={classList}
                      label="Class"
                      placeholder={"select class..."}
                      // @ts-ignore
                      handleChange={(event, value) => {
                        console.log("value__", value);
                        if (editSubject) {
                          setFieldValue('class_id', value?.value || null)
                        }
                        else {
                          setSelectedClass(value)
                          setFieldValue('class_id', value)
                        }

                      }}
                    /> */}
                  </Grid>
                </DialogContent>
                <DialogActionWrapper
                  title={'Fees Head'}
                  editData={editSubject}
                  errors={errors}
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
