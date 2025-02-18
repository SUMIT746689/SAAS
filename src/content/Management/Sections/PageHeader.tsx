import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import {
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
  Select,
  MenuItem,
  Chip,
  Box,
  SelectChangeEvent,
  InputLabel,
  FormControl
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { TextFieldWrapper } from '@/components/TextFields';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import TimePicker from '@mui/lab/TimePicker';
import { TimePickerWrapper } from '@/components/DatePickerWrapper';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

function PageHeader({ editSection, setEditSection, reFetchData, classList }) {
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState([])

  const [selectedClassGroup, setSelectedClassGroup] = useState(null);
  const { showNotification } = useNotistick();

  const [personName, setPersonName] = React.useState<string[]>([]);

  useEffect(() => {
    if (!editSection) return;
    handleCreateClassOpen();
    setPersonName(
      editSection.groups?.map((group) => ({
        label: group.title,
        value: group.id
      }))
    );
    getSelectedClassGroup(editSection.class_id);
  }, [editSection]);

  const getSelectedClassGroup = (class_id) => {
    axios
      .get(`/api/group?class_id=${class_id}`)
      .then((res) =>
        setSelectedClassGroup(
          res.data?.map((i) => {
            return {
              label: i.title,
              value: i.id
            };
          })
        )
      )
      .catch((err) => console.log(err));
  };

  const handleCreateClassOpen = () => {
    setOpen(true);
  };

  const handleCreateClassClose = () => {
    setOpen(false);
    setEditSection(null);
    setPersonName([]);
    setSelectedClassGroup(null);
    setSelectedClass([])
  };

  const handleCreateUserSuccess = (message) => {
    showNotification(message, 'success');
    setOpen(false);
    setEditSection(null);
    setPersonName([]);
    setSelectedClassGroup(null);
    setSelectedClass([])
  };

  useEffect(() => {
    // axios
    //   .get('/api/class')
    //   .then((res) =>
    //     setClasses(
    //       res.data?.map((i) => {
    //         return {
    //           label: i.name,
    //           value: i.id
    //         };
    //       })
    //     )
    //   )
    //   .catch((err) => console.log(err));

    axios
      .get('/api/teacher')
      .then((res) => {
        setTeachers(
          res.data?.map((teacher) => {
            return {
              label: teacher.user.username,
              value: teacher.id
            };
          })
        );
      })
      .catch((err) => console.log(err));
  }, []);

  const handleFormSubmit = async (
    _values,
    { resetForm, setErrors, setStatus, setSubmitting }
  ) => {
    try {
      if (editSection)
        axios
          .patch(`/api/section/${editSection.id}`, {
            ..._values,
            group_ids: Array.from(personName, (v: any) => v.value)
          })
          .then((res) => {
            if (res.data.success) {
              resetForm();
              setStatus({ success: true });
              setSubmitting(false);
              handleCreateUserSuccess(
                t('The section was updated successfully')
              );
              reFetchData();
            } else throw new Error(' Updated Unsuccessfull');
          });
      else {
        if (!_values?.class_id?.length) throw new Error('please select class');
        _values.class_ids = _values?.class_id?.map(i => ({
          id: i.value,
          // name: i?.label,
        }))
        axios
          .post(`/api/section`, {
            ..._values,
            group_ids: Array.from(personName, (v: any) => v.value)
          })
          .then(() => {
            resetForm();
            setStatus({ success: true });
            setSubmitting(false);
            handleCreateUserSuccess(t('The section was created successfully'));
            reFetchData();
          });
      }
    } catch (err) {
      console.error(err);
      handleShowErrMsg(err, showNotification)
      // showNotification(err.message || t('There was an error, try again later'), 'error');
      setStatus({ success: false });
      // @ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  const handleChangePerson = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value }
    } = event;
    // @ts-ignore
    setPersonName((groups: any) => {
      // const find = groups.find(group => group.value === value.value);
      // if(!find) return ([...groups,...value])
      // return groups
      return value
    })
    // On autofill we get a stringified value.
    // typeof value === 'string' ? value.split(',') : value))
  };

  return (
    <>
      <PageHeaderTitleWrapper
        name="batch"
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
            {t(editSection ? 'Edit a Batch' : 'Add new Batch')}
          </Typography>
          <Typography variant="subtitle2">
            {t('Fill in the fields below to create and add a new batch')}
          </Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            name: editSection?.name || undefined,
            class_id: editSection?.class_id || undefined,
            // group_id: editSection?.group_id || null,
            class_teacher_id: editSection?.class_teacher_id || null,
            std_entry_time: editSection?.std_entry_time || '',
            std_late_time: editSection?.std_late_time || '',
            std_absence_time: editSection?.std_absence_time || '',
            std_exit_time: editSection?.std_exit_time || '',
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .max(255)
              .required(t('The Batch name field is required')),
            class_id: editSection ? Yup.number()
              .positive()
              .integer()
              .required(t('The class field is required')) : Yup.array().required(t('The class field is required'))

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
                      errors={errors.name}
                      touched={touched.name}
                      label={t('Batch Name')}
                      name="name"
                      value={values.name}
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                    />

                    <AutoCompleteWrapper
                      multiple={editSection ? false : true}
                      minWidth="100%"
                      label="Class"
                      placeholder="select a class..."
                      value={editSection ? classList.find((cls) => cls.value === values.class_id) : selectedClass}
                      options={classList}
                      // @ts-ignore
                      handleChange={(event, value) => {
                        if (editSection) setFieldValue('class_id', value?.value || null)
                        else {
                          setSelectedClass(value)
                          setFieldValue('class_id', value)
                        }
                      }}
                    />

                    {/* <AutoCompleteWrapper
                      minWidth="100%"
                      label="Class"
                      placeholder="select a class..."
                      value={classes.find((cls) => cls.value === values.class_id) || null}
                      options={classes}
                      // @ts-ignore
                      handleChange={(event, value) => {
                        setFieldValue('class_id', value?.value || null);
                        setFieldValue('group_id', null);
                        if (value) getSelectedClassGroup(value.value);
                        else setSelectedClassGroup(null);
                      }}
                    /> */}


                    {selectedClassGroup && (
                      <Grid item xs={12} pb={1}>
                        <FormControl
                          variant="outlined"
                          style={{ width: '100%' }}
                        // size="small"
                        >
                          <InputLabel size='small' id="test-select-label" >
                            Select Groups
                          </InputLabel>
                          <Select
                            sx={{
                              [`& fieldset`]: {
                                borderRadius: 0.6,
                              }
                            }}
                            labelId="test-select-label"
                            id="test-select"
                            fullWidth
                            size='small'
                            // size="small"
                            label="Select Groups"
                            multiple
                            value={personName}
                            onChange={handleChangePerson}
                            variant="outlined"
                            renderValue={(selected) => (
                              <Box

                                sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 0.5
                                }}
                              >
                                {selected?.map((value: any) => (
                                  <Chip key={value.value} label={value.label} />
                                ))}
                              </Box>
                            )}
                            MenuProps={MenuProps}
                          >
                            {selectedClassGroup?.map((group) => (
                              <MenuItem

                                key={group.value}
                                value={group}
                              // style={getStyles(selectedClassGroup, personName, theme)}
                              >
                                {group?.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    <TimePickerWrapper
                      label="Student Entry Time"
                      value={values.std_entry_time}
                      handleChange={(value) => setFieldValue("std_entry_time", value)}
                    />

                    <TimePickerWrapper
                      label="Student Late Time"
                      value={values.std_late_time}
                      handleChange={(value) => setFieldValue("std_late_time", value)}
                    />

                    <TimePickerWrapper
                      label="Student Absence Time"
                      value={values.std_absence_time}
                      handleChange={(value) => setFieldValue("std_absence_time", value)}
                    />

                    <TimePickerWrapper
                      label="Student Exit Time"
                      value={values.std_exit_time}
                      handleChange={(value) => setFieldValue("std_exit_time", value)}
                    />


                    <AutoCompleteWrapper
                      minWidth={"100%"}
                      label="Class Teacher"
                      placeholder="select a class teacher..."
                      value={teachers.find((teacher) => teacher.value === values.class_teacher_id) || null}
                      options={teachers}
                      handleChange={(event, value) => setFieldValue('class_teacher_id', value?.value || null)}
                    />
                  </Grid>
                </DialogContent>
                <DialogActionWrapper
                  title="Batch"
                  handleCreateClassClose={handleCreateClassClose}
                  errors={errors}
                  editData={editSection}
                  isSubmitting={isSubmitting}
                />
              </form>
            );
          }}
        </Formik>
      </Dialog >
    </>
  );
}

export default PageHeader;
