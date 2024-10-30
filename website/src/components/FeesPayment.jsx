'use client'
import React, { useState } from 'react';
import useNotistick from '@/hooks/useNotistick';
import { useTranslation } from 'react-i18next';
import { Autocomplete, Box, Button, Card, Checkbox, CircularProgress, Grid, Table, TextField, Typography, useTheme } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { formatNumber } from "@/utils/numberFormat"
import Image from 'next/image';
import { TableBodyCellWrapper, TableHeaderCellWrapper, TableRowWrapper } from '@/new_components/Table/Table';
import { useRouter } from 'next/navigation';
import { MdOutlineBatchPrediction } from "react-icons/md";
import { AiOutlineIdcard } from "react-icons/ai";
import { SiGoogleclassroom } from "react-icons/si";
import { GiRadarCrossSection } from "react-icons/gi";
import { FaQuidditch } from "react-icons/fa";


const FeesPayment = ({ allBranches, bkashActivationInfo, serverHost }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const { showNotification } = useNotistick();

    const [stdInfo, setStdInfo] = useState();
    const [lists, setLists] = useState([]);
    const [selectedItems, setSelectedUsers] = useState([]);
    const [selectedPayAmt, setSelectedPayAmt] = useState(0);
    const router = useRouter();

    const selectedAllUsers = selectedItems.length === lists.length;
    const selectedSomeUsers = selectedItems.length > 0 && selectedItems.length < lists.length;


    const handleFormSubmit = async (
        _values,
        { resetForm, setErrors, setStatus, setSubmitting }
    ) => {

        try {
            console.log('_values__', _values);

            const successProcess = () => {
                resetForm();
                setStatus({ success: true });
                setSubmitting(false);
            };
            const res = await axios.get(`${serverHost}/api/student_payment_collect/websites?branch_id=${_values.branch_id}&student_id=${_values.student_id}&phone_number=${_values.phone_number}`);
            setLists(res.data?.data?.fees);
            setStdInfo(res.data?.data?.stdInfo);

            showNotification(res?.data?.message);
            successProcess();
        } catch (err) {
            showNotification(err.response?.data?.message, 'error');
            // showNotification(err.message,"error")
            console.error(err);
            setStatus({ success: false });
            setErrors({ submit: err.message });
            setSubmitting(false);
        }
    };


    const handleSelectAllUsers = (event) => {
        setSelectedPayAmt(event.target.checked ? lists.reduce((prev, curr) => prev + curr.due, 0) : 0);
        setSelectedUsers(event.target.checked ? lists.map((list) => list.id) : []);
    };

    const handleSelectOneUser = (_eventEvent, userId, due) => {
        if (!selectedItems.includes(userId)) {
            setSelectedPayAmt(amt => amt + due);
            setSelectedUsers((prevSelected) => [...prevSelected, userId]);
        } else {
            setSelectedPayAmt(amt => amt - due);
            setSelectedUsers((prevSelected) => prevSelected.filter((id) => id !== userId));
        }
    };

    const handlePayment = async () => {

        const pay_fees = [];

        lists.forEach((fee) => {
            if (!selectedItems.includes(fee.id)) return;
            pay_fees.push({
                fee_id: fee.id,
                paid_amount: fee.due
            });
        });
        try {
            console.log({ stdInfo })
            const data = {
                user_id: stdInfo.student_info.user_id,
                student_id: stdInfo.id,
                // collected_by_user: user?.id,
                // fee_ids: selectedItems,
                // collected_amount,
                // total_payable,
                pay_fees
            }
            console.log("got__", data);

            await fetch(`${serverHost}/api/bkash/pay_with_website/website-payment`, {
                method: "POST",
                contentType: "text/plain",
                body: JSON.stringify(data),
            })
                .then(res => res.json())
                .then(resBkash => {
                    console.log({ resBkash });
                    router.push(resBkash.bkashURL);
                })
                .catch(err => {
                    console.log({ err: err.message });
                    showNotification(err?.response?.data?.message, 'error');
                })

        } catch (err) {
            showNotification(err?.response?.data?.message, 'error')
            console.log(err);

        }
    }
    console.log({stdInfo})

    return (
        <Grid maxWidth={1300} mx="auto" pb={10} >
            <Typography variant="h4" gutterBottom py={6} align="center">
                {t('Student Fees Online Payments')}
            </Typography>
            <Grid mt={8}></Grid>
            <Grid display="grid" sx={{ gridTemplateColumns: { md: "1fr 1fr" }, columnGap: 2, rowGap: 10 }} >
                <Formik
                    initialValues={{
                        student_id: '',
                        phone_number: '',
                        submit: null
                    }}
                    validationSchema={Yup.object().shape({
                        branch_id: Yup.number().required(
                            t('The branch is required')
                        ),
                        student_id: Yup.string().required(
                            t('The student id is required')
                        ),
                        // phone_number: Yup.string()
                        //     .min(11, t('Phone number must be greater then or equals 11 character')),

                    })}
                    onSubmit={handleFormSubmit}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue, resetForm }) => {
                        console.log("errors__", errors);
                        return (
                            <form onSubmit={handleSubmit}>
                                <Grid container sx={{
                                    border: `1px solid lightgray`,
                                    // boxShadow: `5px 0px 1px -10px gray`,
                                    boxShadow: '0px 0px 4px 0px rgba(138,134,138,0.71)',
                                    borderRadius: '5px',
                                    p: 2,
                                }} >
                                    {/* <Grid container item sx={{ display: "flex", justifyContent: "center", alignItems: "start", gap: 2 }}> */}

                                    {/*all branches */}
                                    <Grid item xs={12}>
                                        <Grid>
                                            <Box
                                                pr={3}
                                                sx={{
                                                    pt: `${theme.spacing(1)}`,
                                                    // pb: { xs: 1, md: 0 }
                                                }}
                                                alignSelf="center"
                                            >
                                                <b>{t('Select Branch')}: <span className=' text-orange-500'>*</span></b>
                                            </Box>
                                        </Grid>
                                        <Grid
                                            sx={{
                                                // mb: `${theme.spacing(3)}`
                                            }}
                                            item
                                            xs={12}
                                        >
                                            <Autocomplete
                                                disablePortal
                                                options={allBranches || []}
                                                value={values.branch}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        required
                                                        size="small"
                                                        sx={{
                                                            '& fieldset': {
                                                                borderRadius: '3px'
                                                            }
                                                        }}
                                                        variant='outlined'
                                                        fullWidth
                                                        error={Boolean(touched.branch_id && errors.branch_id)}
                                                        // @ts-ignore
                                                        helperText={touched.branch_id && errors.branch_id}
                                                        onBlur={handleBlur}
                                                        // label={t('Select Branch')}
                                                    />
                                                )}
                                                onChange={(event, value) => {
                                                    setFieldValue("branch_id", value.id);
                                                    setFieldValue("branch", value);
                                                }}
                                            />
                                        </Grid>
                                    </Grid>


                                    {/* student id */}
                                    <Grid item xs={12}>
                                        <Grid>
                                            <Box
                                                pr={3}
                                                sx={{
                                                    pt: `${theme.spacing(1)}`,
                                                    // pb: { xs: 1, md: 0 }
                                                }}
                                                alignSelf="center"
                                            >
                                                <b>{t('Student Id')}: <span className=' text-orange-500'>*</span></b>
                                            </Box>
                                        </Grid>
                                        <Grid
                                            sx={{
                                                // mb: `${theme.spacing(3)}`
                                            }}
                                            item
                                            xs={12}
                                        >
                                            <TextField
                                                sx={{
                                                    '& fieldset': {
                                                        borderRadius: '3px'
                                                    }
                                                }}
                                                size="small"
                                                error={Boolean(touched.student_id && errors.student_id)}
                                                fullWidth
                                                helperText={touched.student_id && errors.student_id}
                                                name="student_id"
                                                placeholder={t('student id here...')}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                value={values.student_id || ''}
                                                variant="outlined"
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* phone number */}
                                    <Grid item xs={12}>
                                        <Grid item>
                                            <Box
                                                pr={3}
                                                sx={{ pt: `${theme.spacing(1)}`, pb: { xs: 1, md: 0 } }}
                                                alignSelf="center"
                                            >
                                                <b>{t('Phone Number')}:</b>
                                            </Box>
                                        </Grid>
                                        <Grid sx={{ mb: `${theme.spacing(3)}` }} item>
                                            <TextField
                                                sx={{
                                                    '& fieldset': {
                                                        borderRadius: '3px'
                                                    }
                                                }}
                                                size="small"
                                                fullWidth
                                                name="phone_number"
                                                placeholder={t('phone number here...')}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                value={values.phone_number || ''}
                                                variant="outlined"
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* </Grid> */}

                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                                            //@ts-ignore
                                            disabled={Boolean(errors.submit) || isSubmitting}
                                            variant="contained"
                                            sx={{ height: 40, width: "100%" }}
                                        >
                                            {t(`Search Fees`)}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        );
                    }}
                </Formik>

                {/* student informations */}
                <div
                    style={{
                        // marginTop: 4,
                        padding: 1,
                        position: "relative",
                        display: "flex",
                        justifyContent: "space-between",
                        // border: (theme) => `1px solid ${theme.palette.primary.light}`,
                        // boxShadow: (theme) => `0px 0px 13px -4px ${theme.palette.primary.light}`
                        border: `1px solid lightgray`,
                        // boxShadow: `5px 0px 1px -10px gray`,
                        boxShadow: '0px 0px 4px 0px rgba(138,134,138,0.71)',
                        borderRadius: '5px',
                    }}>
                    <Grid container mt={9} px={2} color="gray" >
                        <Grid fontSize="2em" textAlign="center" mx="auto">{[stdInfo?.student_info?.first_name, stdInfo?.student_info?.middle_name, stdInfo?.student_info?.last_name].join(' ')}</Grid>
                        <Grid item display="grid" width="100%" gridTemplateColumns="1fr 1fr" columnSpacing="10px" rowGap={1}>
                            <Grid sx={{ display: "flex", alignItems: "center", columnGap: 1 }}> <AiOutlineIdcard /> Student Id: <span>{stdInfo?.student_info?.student_id}</span> </Grid>
                            <Grid sx={{ display: "flex", alignItems: "center", columnGap: 1 }}> <SiGoogleclassroom /> Class: <span>{stdInfo?.class?.name}</span></Grid>
                            <Grid sx={{ display: "flex", alignItems: "center", columnGap: 1 }}> <GiRadarCrossSection /> Batch: <span>{stdInfo?.subjects?.map(subject => subject.name)?.join(', ')}</span></Grid>
                            {stdInfo?.section?.class?.has_section ?
                                <Grid sx={{ display: "flex", alignItems: "center", columnGap: 1 }}> <MdOutlineBatchPrediction /> Batch: <span>{stdInfo?.section?.name}</span></Grid> : ''}
                            <Grid sx={{ display: "flex", alignItems: "center", columnGap: 1 }}> <FaQuidditch /> Roll No: {stdInfo?.class_roll_no}</Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        sx={{
                            width: 150,
                            height: 150,
                            borderRadius: "50%",
                            background: "white",
                            // width:"100%",
                            display: "flex",
                            // flexDirection:"column",
                            justifyContent: "center",
                            // alignContent:"center",
                            // justifyItems:"center",
                            alignItems: "center",
                            position: "absolute",
                            // right: "40%",
                            top: "-25%",
                            zIndex: "60",
                            border: '1px solid lightgray',
                            overflow: "hidden",
                            p: 1,
                            left: 0,
                            right: 0,
                            marginInline: 'auto',
                            // width: 'fit-content'
                            // mx:"auto"
                        }}>
                        <Image src={stdInfo?.student_photo ? `${serverHost}/api/get_file/${stdInfo?.student_photo}` : "/dummy.jpg"} width={150} height={150} style={{ objectPosition: "center", objectFit: "contain" }} />
                    </Grid>
                </div>
            </Grid>

            {/* info msg */}
            <Grid color={(theme) => theme.palette.warning.light} textAlign="center" py={2}> - - - Select fees for payment - - - </Grid>

            <Card sx={{ p: 1, border: (theme) => `1px solid ${theme.palette.primary.light}`, boxShadow: (theme) => `0px 0px 13px -4px ${theme.palette.primary.light}` }}>
                <Table>
                    <TableRowWrapper>
                        <TableHeaderCellWrapper padding="checkbox">
                            <Checkbox
                                checked={selectedAllUsers}
                                indeterminate={selectedSomeUsers}
                                onChange={handleSelectAllUsers}
                            />
                        </TableHeaderCellWrapper>
                        <TableHeaderCellWrapper>Fee Head</TableHeaderCellWrapper>
                        <TableHeaderCellWrapper>Subject</TableHeaderCellWrapper>
                        <TableHeaderCellWrapper>Fee Month</TableHeaderCellWrapper>
                        <TableHeaderCellWrapper align="right">Amount</TableHeaderCellWrapper>
                        <TableHeaderCellWrapper align="right">Disc. Amt.</TableHeaderCellWrapper>
                        <TableHeaderCellWrapper align="right">Late Fee</TableHeaderCellWrapper>
                        <TableHeaderCellWrapper align="right">Paid Amt.</TableHeaderCellWrapper>
                        <TableHeaderCellWrapper align="right">Due Amt.</TableHeaderCellWrapper>

                    </TableRowWrapper>

                    {
                        lists?.map(fee => {
                            const isUserSelected = selectedItems.includes(fee.id);
                            return (
                                <TableRowWrapper key={fee.id}>
                                    <TableBodyCellWrapper padding="checkbox">
                                        <Checkbox
                                            checked={isUserSelected}
                                            onChange={(event) => handleSelectOneUser(event, fee.id, fee.due)}
                                            value={isUserSelected}
                                        />
                                    </TableBodyCellWrapper>
                                    <TableBodyCellWrapper> {fee?.fees_head} </TableBodyCellWrapper>
                                    <TableBodyCellWrapper> {fee?.subject_name} </TableBodyCellWrapper>
                                    <TableBodyCellWrapper> {fee?.fees_month} </TableBodyCellWrapper>
                                    <TableBodyCellWrapper align="right"> {formatNumber(fee?.amount)} </TableBodyCellWrapper>
                                    <TableBodyCellWrapper align="right"> {formatNumber(fee?.total_discount)} </TableBodyCellWrapper>
                                    <TableBodyCellWrapper align="right"> {formatNumber(fee?.late_fee)} </TableBodyCellWrapper>
                                    <TableBodyCellWrapper align="right"> {formatNumber(fee?.total_collected_amt)} </TableBodyCellWrapper>
                                    <TableBodyCellWrapper align="right"> {formatNumber(fee?.due)} </TableBodyCellWrapper>
                                </TableRowWrapper>
                            )
                        })
                    }
                    {/* <TableRowWrapper>
                        <TableFooterCellWrapper colSpan={7}>Total Pay Amount:</TableFooterCellWrapper>
                        <TableFooterCellWrapper align="right">{formatNumber(selectedPayAmt)}</TableFooterCellWrapper>
                     </TableRowWrapper> */}
                </Table>
            </Card>

            <Grid display="grid" alignItems="end" justifyContent="right" justifyItems="right" gap={2} ml="auto" mt={1} pr={2}>
                <Grid container fontWeight={700} textTransform="uppercase" >
                    Total Selected Amount: <span style={{ color: "#E2136E", padding: '0px 5px' }}> {formatNumber(selectedPayAmt)} </span> TK
                </Grid>

                {
                    bkashActivationInfo?.is_active &&
                    <Grid container display="flex" justifyContent="right">
                        <Button sx={{
                            borderRadius: 0.5,
                            textAlign: 'center',
                            px: 'auto', display: 'flex',
                            justifyContent: 'center', alignItems: 'center',
                            height: 0.8,
                            // backgroundColor: amount && amount >= 10 && '#42a5f5',
                        }}
                            variant='contained'
                            // disabled={amount && amount >= 10 ? false : true}
                            onClick={handlePayment}>

                            <Image src={'/bkash.svg'} alt={'bkash'} width={35} height={35} />
                            Pay Bkash
                        </Button>
                        {/* <Button variant='contained' disabled={selectedItems.length === 0} sx={{ m: 1, width: "100%" }} >Pay Fees</Button> */}
                    </Grid>
                }
            </Grid>
            {/* <Grid>
                Payment Channels:
                <Grid>DBBL NEXUS, Q Cash, Union Pay, Vise, Mastercard, American Express</Grid>
                <Grid>Bkash, Nogod, Rocket, Upay, Sure Cash, Tap'n Pay, M cash, </Grid>
            </Grid> */}
        </Grid>
    )
};

export default FeesPayment;