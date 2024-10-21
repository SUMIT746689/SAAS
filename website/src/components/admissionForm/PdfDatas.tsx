'use client';
import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import dayjs, { Dayjs } from 'dayjs';
import {
    Grid,
    DialogActions,
    DialogContent,
    TextField,
    CircularProgress,
    Button,
    Autocomplete,
    Typography,
    Card,
} from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import { MobileDatePicker, MobileDateTimePicker } from '@mui/lab';
import useNotistick from '@/hooks/useNotistick';
import { FileUploadFieldWrapper } from '../reuseable/fileUpload';
import Image from 'next/image';
import { ShowImage } from '../ImageShow'

function PdfDatas({ school, values, serverHost }) {
    const { t }: { t: any } = useTranslation();

    return (
        <>
            <Grid display="grid" sx={{ p: 8, pageBreakBefore: "always", pageBreakInside: "avoid" }} >
                <Grid display="grid" gridTemplateColumns="1fr 1fr 1fr" justifyContent="space-between"   >
                    <Grid sx={{ borderRadius: 1, overflow: "hidden", border: "5px solid white", height: 150, width: 150 }}>
                        <Image
                            src={`${serverHost}/api/get_file/${school?.websiteui[0].header_image?.replace(/\\/g, '/')}`}
                            width={150}
                            height={150}
                            alt={"school_image"}
                            loading='lazy'
                            objectFit="contain"
                            objectPosition="center"
                        />
                    </Grid>

                    <Grid fontFamily="cursive" textAlign="center" pt={4} >
                        <Typography variant="h5" color="goldenrod" fontFamily="cursive" >{school?.name}</Typography>
                        <Grid>{school?.address}</Grid>
                    </Grid>

                    <Grid display="flex" justifyContent="end" >
                        <Card sx={{ borderRadius: 1, overflow: "hidden", border: "5px solid white", height: 100, width: 100, boxShadow: 0.5 }}>
                            {values?.student_photo
                                &&
                                <ShowImage file={values?.student_photo} alt={"Student Photo"} />
                                // {/* <ImagePreviewShow file={values?.student_photo} alt={"Student Photo"} /> */}
                            }
                        </Card>
                    </Grid>
                </Grid>

                <DialogContent
                    dividers
                    sx={{
                        p: 6
                    }}
                >

                    <Grid container spacing={2}>
                        {/* first_name */}
                        <Grid item xs={4}>
                            <TextField
                                // required
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('First name')}
                                name="first_name"
                                value={values.first_name ?? ''}
                                variant="outlined"
                            // autoComplete={""}
                            />
                        </Grid>

                        {/* middle_name */}
                        <Grid item xs={4}>
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Middle name')}
                                name="middle_name"
                                value={values.middle_name ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* last_name */}
                        <Grid item xs={4}>
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Last name')}
                                name="last_name"
                                value={values.last_name ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* admission_date */}
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Admission Date')}
                                name="admission_date"
                                value={values.admission_date ?? '' ? dayjs(values.admission_date).format('DD/MM/YYYY h:mm A') : ''}
                                variant="outlined"
                            />

                        </Grid>

                        {/* date_of_birth */}
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Date Of Birth')}
                                name="date_of_birth"
                                value={values.date_of_birth ?? '' ? dayjs(values.date_of_birth).format('DD/MM/YYYY') : ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* Gender */}
                        <Grid item xs={12}>
                            <FormControl>
                                <FormLabel id="demo-row-radio-buttons-group-label">
                                    Select Gender *
                                </FormLabel>
                                <RadioGroup
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="gender"
                                    row
                                    value={values.gender}
                                // onChange={(event) => {
                                //     setGender(event.target.value);
                                //     setFieldValue('gender', event.target.value);
                                // }}
                                >
                                    <FormControlLabel
                                        value="male"
                                        control={<Radio />}
                                        label="Male"
                                    />
                                    <FormControlLabel
                                        value="female"
                                        control={<Radio />}
                                        label="Female"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {/* blood_group */}
                        <Grid item xs={6} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}

                                fullWidth
                                label={t('blood Group')}
                                name="blood_group"
                                type="text"
                                value={values.blood_group ?? ''}
                                variant="outlined"

                            />
                        </Grid>

                        {/* religion */}
                        <Grid item xs={6} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Religion')}
                                name="religion"
                                type="text"
                                value={values.religion ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* national_id */}
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Birth certificate Id')}
                                name="national_id"
                                type="text"
                                value={values.national_id ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* phone */}
                        <Grid item xs={6} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                // @ts-ignore
                                label={t('Phone')}
                                name="phone"
                                type="text"
                                required
                                value={values.phone ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* email */}
                        <Grid item xs={12} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('email')}
                                name="email"
                                type="email"
                                value={values.email ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* classes */}
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Class')}
                                name="class"
                                type="text"
                                value={values.class_name ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* academicYears */}
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Academic Year')}
                                name="academic_year"
                                type="text"
                                value={values.academic_year_title ?? ''}
                                variant="outlined"
                            />
                        </Grid>


                        {/* previous_school */}
                        <Grid item xs={12} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Previous school')}
                                name="previous_school"
                                type="text"
                                value={values.previous_school ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* student_present_address */}
                        <Grid item xs={12}>
                            <TextField
                                multiline
                                rows={2}
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Student present address')}
                                name="student_present_address"
                                type="text"
                                value={values.student_present_address ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* student_permanent_address */}
                        <Grid item xs={12}>
                            <TextField
                                multiline
                                rows={2}
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Student permanent address')}
                                name="student_permanent_address"
                                type="text"
                                value={values.student_permanent_address ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* father_name */}
                        <Grid item xs={12} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Father name')}
                                name="father_name"


                                type="text"
                                value={values.father_name ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* father_phone */}
                        <Grid item xs={6}>
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('father phone number')}
                                name="father_phone"


                                type="text"
                                value={values.father_phone ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* father_profession */}
                        <Grid item xs={6} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('father Profession')}
                                name="father_profession"
                                type="text"
                                value={values.father_profession ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* father_photo */}
                        <Grid item xs={12} mt={11} >
                            <Grid item>Father Photo:</Grid>
                            {
                                values?.father_photo
                                &&
                                // <Card sx={{boxShadow:1, width:"10",height:"10",mx:"auto"}}>
                                <ShowImage file={values?.father_photo} alt={"Father Photo"} />
                                // </Card>
                            }

                        </Grid>

                        {/* mather_name */}
                        <Grid item xs={12} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Mother name')}
                                name="mother_name"
                                type="text"
                                value={values.mother_name ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* mather_phone */}
                        <Grid item xs={6} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Mother phone number')}
                                name="mother_phone"
                                type="text"
                                value={values.mother_phone ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* mather_profession */}
                        <Grid item xs={6} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Mother profession')}
                                name="mother_profession"
                                type="text"
                                value={values.mother_profession ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* mather_photo */}
                        <Grid item xs={12} >

                            <Grid item>Mother Photo:</Grid>
                            {
                                values?.mother_photo
                                &&
                                <Grid item>
                                    <ShowImage file={values?.mother_photo} alt={"Mother Photo"} />
                                </Grid>
                            }

                        </Grid>

                        {/* guardian_name */}
                        <Grid item xs={12} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Guardian name')}
                                name="guardian_name"
                                type="text"
                                value={values.guardian_name ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* guardian_phone */}
                        <Grid item xs={6} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Guardian phone')}
                                name="guardian_phone"
                                type="text"
                                value={values.guardian_phone ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* guardian_profession */}
                        <Grid item xs={6} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Guardian profession')}
                                name="guardian_profession"
                                type="text"
                                value={values.guardian_profession ?? ''}
                                variant="outlined"
                            />
                        </Grid>

                        {/* guardian_photo */}
                        <Grid item xs={12} >
                            <Grid item>Guardian Photo:</Grid>
                            {
                                values?.guardian_photo
                                &&
                                <Grid item>
                                    <ShowImage file={values?.guardian_photo} alt={"Guardian Photo"} />
                                </Grid>
                            }

                        </Grid>

                        {/* relation_with_guardian */}
                        <Grid item xs={12} >
                            <TextField
                                size="small"
                                sx={{
                                    '& fieldset': {
                                        borderRadius: '3px'
                                    }
                                }}
                                fullWidth
                                label={t('Relation with guardian')}
                                name="relation_with_guardian"
                                type="text"
                                value={values.relation_with_guardian ?? ''}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <Grid sx={{ display: "flex", justifyContent: "space-between", px: 10, pt: 8 }}>
                    <Grid sx={{ borderTop: "1px solid lightgray" }}>Guardian Signature</Grid>

                    <Grid sx={{ borderTop: "1px solid lightgray" }}>Principal Signature</Grid>
                </Grid>
            </Grid >
        </>
    );
}

export default PdfDatas;
