import { useContext, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import 'react-quill/dist/quill.snow.css';
import { Grid, Dialog, DialogTitle, DialogContent, Box, Zoom, Typography, TextField, CircularProgress, Button, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { TextFieldWrapper } from '@/components/TextFields';
import { DialogActionWrapper } from '@/components/DialogWrapper';

function PageHeader({ contentPermission, editGrade, setEditGrade, reFetchData }): any {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const theme = useTheme();
  console.log({ editGrade });

  useEffect(() => {
    if (editGrade) {
      handleCreateProjectOpen();
    }
  }, [editGrade]);

  const handleCreateProjectOpen = () => {
    setOpen(true);
  };

  const handleCreateProjectClose = () => {
    setOpen(false);
    setEditGrade(null);
  };

  const handleCreateProjectSuccess = (message) => {
    showNotification(message);
    setOpen(false);
  };

  const handleSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {
      const successProcess = (message) => {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        setEditGrade(null);
        handleCreateProjectSuccess(message);
        reFetchData();
      };
      if (editGrade) {
        const res = await axios.patch(`/api/grade?grade_id=${editGrade.id}`, _values);
        if (res.status == 200) successProcess(t('A grad has been updated successfully'));
        else throw new Error('edit grade failed');
      } else {
        const res = await axios.post('/api/grade', _values);
        if (res.status == 200) successProcess(t('A grad has been created successfully'));
        else throw new Error('created grade failed');
      }
    } catch (err) {
      console.error(err);
      showNotification(err.message, 'error');
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeaderTitleWrapper
        name="Grade"
        handleCreateClassOpen={handleCreateProjectOpen}
        actionButton={
          contentPermission?.create_grade && (
            <Grid item>
              <ButtonWrapper
                sx={{
                  mt: { xs: 2, sm: 0 }
                }}
                handleClick={handleCreateProjectOpen}
                startIcon={<AddTwoToneIcon fontSize="small" />}
              >
                {t('Create new Grade')}
              </ButtonWrapper>
            </Grid>
          )
        }
      />

      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleCreateProjectClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {editGrade ? t('Edit grade') : t('Create new grade')}
          </Typography>
          <Typography variant="subtitle2">{t(`Use this dialog window to ${editGrade ? 'Edit ' : 'add a new'} Grade`)}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            lower_mark: editGrade ? editGrade?.lower_mark : undefined,
            upper_mark: editGrade ? editGrade?.upper_mark : undefined,
            point: editGrade ? editGrade?.point : undefined,
            grade: editGrade ? editGrade?.grade : undefined,
            academic_year_id: academicYear.id,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            lower_mark: Yup.number().max(255).required(t('The lower_mark field is required')),
            upper_mark: Yup.number().max(255).required(t('The upper_mark field is required')),
            point: Yup.number().max(255).required(t('The point field is required')),
            grade: Yup.string().max(255).required(t('The grade field is required'))
          })}
          onSubmit={handleSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent
                dividers
                sx={{
                  p: 3
                }}
              >
                <Grid container>
                  {/* Lower mark */}
                  <TextFieldWrapper
                    name="lower_mark"
                    label={t('Lower Mark')}
                    errors={errors.lower_mark}
                    touched={touched.lower_mark}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    value={values.lower_mark}
                    type="number"
                  />

                  {/* Upper mark */}

                  <TextFieldWrapper
                    errors={errors.upper_mark}
                    touched={touched.upper_mark}
                    name="upper_mark"
                    label={t('Upper Mark')}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    value={values.upper_mark}
                    type="number"
                  />

                  {/* point */}

                  <TextFieldWrapper
                    errors={errors.point}
                    touched={touched.point}
                    name="point"
                    label={t('Point ')}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    value={values.point}
                    type="number"
                  />

                  <TextFieldWrapper
                    errors={errors.grade}
                    touched={touched.grade}
                    name="grade"
                    label={t('Grade')}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    value={values.grade}
                    type="text"
                  />
                </Grid>
              </DialogContent>
              <DialogActionWrapper
                title={'Grade'}
                handleCreateClassClose={handleCreateProjectClose}
                errors={errors}
                editData={editGrade}
                isSubmitting={isSubmitting}
              />
            </form>
          )}
        </Formik>
      </Dialog>
    </>
  );
}

export default PageHeader;
