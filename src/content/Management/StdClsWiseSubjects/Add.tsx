import { ChangeEvent, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/useAuth';
import { Grid, Dialog, DialogContent, } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DialogActionWrapper, DialogTitleWrapper } from '@/components/DialogWrapper';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { DisableTextWrapper } from '@/components/TextFields';
import { AutoCompleteWrapper, AutoCompleteWrapperWithDebounce } from '@/components/AutoCompleteWrapper';
import { DropDownSelectWrapper } from '@/components/DropDown';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { label } from 'aws-amplify';


function Add({ refetch, student_id, isOpen, selectCls, setAddSubject }) {
    const { t }: { t: any } = useTranslation();
    const [open, setOpen] = useState(isOpen);
    const { user } = useAuth();
    const { showNotification } = useNotistick();
    const [checked, setChecked] = useState(false);
    const [subjectLists, setSubjectLists] = useState([]);


    const handleCreateClassClose = () => {
        setChecked(false)
        setOpen(false);
        setAddSubject(null)
        // seteditData(null);
    };

    const handleCreateUserSuccess = () => {
        // seteditData(null);
        setOpen(false);
        setAddSubject(null)
    };

    const handleSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
            const successResponse = () => {
                showNotification('subject add successfully');
                resetForm();
                setStatus({ success: true });
                setSubmitting(false);
                handleCreateUserSuccess();
                // reFetchData();
                refetch();
            };

            const sendDatas = {
                student_id: _values.student_id
            }
            sendDatas['subjects'] = _values.subjects?.map(subject => {
                const { value: subject_id, teacher } = subject;
                // const { id: teacher_id } = teacher || {};

                if (!subject_id) throw new Error('subject not founds ');
                // if (!subject_id || !teacher_id) throw new Error('subject or teacher not founds ');

                // return { subject_id, teacher_id }
                return { subject_id }
            })

            // _values['late_fee'] = _values?.late_fee ? _values?.late_fee : 0;
            const res = await axios.post(`/api/student_class_subjects`, sendDatas);

            successResponse();
        } catch (err) {
            handleShowErrMsg(err, showNotification);
            setStatus({ success: false });
            //@ts-ignore
            setErrors({ submit: err.message });
            setSubmitting(false);
        }
    }

    const handleSelectAllSubjects = (setValue) => {
        setValue('subjects', subjectLists)
    }

    const handleRemoveAllSubjects = (setValue) => {
        setValue('subjects', [])
    }

    const getSubjects = () => {
        axios.get(`/api/subject?class_id=${selectCls.id}`)
            .then(({ data }) => {
                if (!Array.isArray(data)) return setSubjectLists([]);
                const cusSubjectLists = data.map((subject_) => {
                    const val = { label: subject_.name, value: subject_.id }
                    return val
                });
                setSubjectLists(cusSubjectLists)
            })
            .catch(err => { })
    }

    useEffect(() => {
        getSubjects();
    }, [])

    return (
        <>
            <Dialog
                fullWidth
                maxWidth="sm"
                open={open}
                onClose={handleCreateClassClose}
                sx={{ borderRadius: 0.5 }}
            >

                <DialogTitleWrapper editData={false} name="Student Subject" />

                <Formik
                    initialValues={{
                        student_id,
                        class_name: selectCls?.label,
                        submit: null,
                        subjects: [],

                    }}
                    validationSchema={Yup.object().shape({
                        // title: Yup.string()
                        //   .max(255)
                        //   .required(t('The title field is required')),
                        // fees_head_id: Yup.number()
                        //     .min(1, 'The fees head is required')
                        //     .required(t('The fees head is required')),
                        // amount: Yup.number()
                        //     .min(1)
                        //     .required(t('The amount code field is required')),
                        // school_id: Yup.number()
                        //     .min(1)
                        //     .required(t('The school id is required')),
                        months: Yup.array().min(1, "select a month"),
                        // class_ids: !editData && Yup.array().min(1, "select a class"),
                        // class_id: Yup.number()
                        //   .min(1)
                        //   .required(t('class filed field is required'))
                    })}
                    onSubmit={handleSubmit}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
                        return (
                            <form onSubmit={handleSubmit}>
                                <DialogContent
                                    dividers
                                    sx={{
                                        p: 3,
                                        borderRadius: 0.5
                                    }}
                                >
                                    <Grid container columnSpacing={1} columns={12}>
                                        {/* Class */}
                                        <Grid item xs={12}>
                                            <DisableTextWrapper label="Select Class" value={values.class_name} touched={touched?.class_name} errors={errors?.class_name} />
                                        </Grid>
                                    </Grid>

                                    {
                                        <Grid item columnGap={1}>
                                            <AutoCompleteWrapper
                                                minWidth="100%"
                                                label="Select Subject"
                                                placeholder="subjects..."
                                                multiple
                                                value={values.subjects}
                                                options={subjectLists}
                                                name="month"
                                                error={errors?.subjects}
                                                touched={touched?.subjects}
                                                // @ts-ignore
                                                handleChange={(e, value: any) => setFieldValue('subjects', value)}
                                            />

                                            {
                                                // !editData && 
                                                (
                                                    <Grid display="flex" justifyContent="start" columnGap={1}>
                                                        <ButtonWrapper variant="outlined" handleClick={() => handleSelectAllSubjects(setFieldValue)}>Select All</ButtonWrapper>
                                                        <ButtonWrapper variant="outlined" handleClick={() => handleRemoveAllSubjects(setFieldValue)}>Remove All</ButtonWrapper>
                                                    </Grid>
                                                )
                                            }

                                            {/* {
                                                values.subjects?.map((subject, index) => (
                                                    <Grid key={index} display="grid" gridTemplateColumns="1fr 2fr" columnGap={1}>
                                                        <DisableTextWrapper label="Select Subject" value={subject?.label} touched={undefined} errors={undefined} />


                                                        <Grid display="grid" gridTemplateColumns="1fr 6fr">
                                                            <Grid minWidth={100}>
                                                                <DropDownSelectWrapper
                                                                    name='teacher_search_type'
                                                                    label="Search By"
                                                                    menuItems={['name', 'id']}
                                                                    value={subject.teacher_search_type}
                                                                    handleChange={(e, value: any) => {
                                                                        const subjects_ = values.subjects;
                                                                        subjects_[index]['teacher_search_type'] = e.target.value;
                                                                        setFieldValue('subjects', subjects_)
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <SearchTeacher setFieldValue={setFieldValue} index={index} values={values} searchType={subject.teacher_search_type} disabled={!!!subject.teacher_search_type} />
                                                        </Grid>
                                                    </Grid>
                                                ))
                                            } */}

                                        </Grid>
                                    }

                                </DialogContent>
                                <DialogActionWrapper
                                    titleFront="Add"
                                    title="Subject"
                                    errors={errors}
                                    editData={false}
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

// const SearchTeacher = ({ setFieldValue, index, values, searchType, disabled }) => {

//     const [searchValue, setSearchValue] = useState();
//     const [searchOptionData, setSearchOptionData] = useState([]);

//     const handleDebounce = async (value) => {
//         try {
//             if (value?.length >= 2) {
//                 const res = await axios.get(`/api/teacher/search-teachers?search_type=${searchType}&search_value=${value?.toLowerCase()}`);
//                 const userInfoArr = res?.data?.map((item) => {
//                     return {
//                         label: `${item.name} | ${item.teacher_id || ''}`,
//                         id: item.id,
//                         teacher_id: item.student_id,
//                         // student_table_id: item.student_table_id
//                     };
//                 });
//                 setSearchOptionData(userInfoArr);
//             } else if (value?.length < 2) {
//                 setSearchOptionData([]);
//             } else if (!value) {
//                 setSearchOptionData([]);
//             }
//         } catch (error) { }
//     };

//     const searchHandleChange = async (event: ChangeEvent<HTMLInputElement>, v) => {
//         setSearchValue(v);
//     };

//     const searchHandleUpdate = (event: ChangeEvent<HTMLInputElement>, v) => {
//         const subjects_ = values.subjects;
//         subjects_[index]['teacher'] = v;
//         setFieldValue('subjects', subjects_)
//         setSearchValue(v || null);
//     }

//     return (
//         <AutoCompleteWrapperWithDebounce
//             disabled={disabled}
//             debounceTimeout={500}
//             handleDebounce={handleDebounce}
//             // @ts-ignore
//             searchHandleUpdate={searchHandleUpdate}
//             options={searchOptionData}
//             value={searchValue}
//             handleChange={searchHandleChange}
//             label="Search Teacher"
//             placeholder="Search Teacher"
//         />
//     )
// }

export default Add;
