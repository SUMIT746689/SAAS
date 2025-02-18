import { Authenticated } from '@/components/Authenticated';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Formik } from 'formik';
import { Card, CircularProgress, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import * as Yup from 'yup';
import { useClientFetch } from '@/hooks/useClientFetch';
import useNotistick from '@/hooks/useNotistick';
import { TextFieldWrapper } from '@/components/TextFields';
import Footer from '@/components/Footer';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { verifyIsMasking } from 'utilities_api/verify';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';


const VoiceGateway = () => {
    const { t }: { t: any } = useTranslation();
    const { data, reFetchData } = useClientFetch('/api/voice_msgs/gateways');
    const { data: schools, reFetchData: reFetchSchoolData } = useClientFetch('/api/school');
    console.log({ schools })

    const { showNotification } = useNotistick();
    return (
        <>
            <Formik
                enableReinitialize
                initialValues={{
                    id: data?.data[0]?.id || 0,
                    api_key: data?.data[0]?.details?.api_key || '',
                    sender_id: data?.data[0]?.details?.sender_id || '',
                    submit: null
                }}
                validationSchema={Yup.object().shape({
                    sender_id: Yup.string().max(255).required(t('The sender_id field is required')),
                })}
                onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
                    try {
                        const successResponse = (message) => {
                            resetForm();
                            setStatus({ success: true });
                            setSubmitting(false);
                        };

                        const v = {
                            id: _values.id,
                            // title: _values.title,
                            details: {
                                // sms_gateway: _values.sms_gateway,
                                api_key: _values.api_key,
                                sender_id: _values.sender_id
                            }
                        }
                        axios.post('/api/voice_gateways', v)
                            .then(res => {
                                showNotification('sms information updated!')
                                reFetchData();
                            })
                            .catch(err => {
                                handleShowErrMsg(err, showNotification)
                                console.log(err);

                            })

                    } catch (err) {
                        console.error(err);

                        setStatus({ success: false });
                        //@ts-ignore
                        setErrors({ submit: err.message });
                        setSubmitting(false);
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => {
                    console.log({ values })
                    return (
                        <>
                            <Grid container
                                display="flex"
                                alignContent="center"
                                direction="column"
                                justifyContent="center"
                                alignItems="center"
                                height={'calc(100vh - 213px)'}
                            >
                                <form onSubmit={handleSubmit}>
                                    <Card sx={{
                                        minWidth: '400px',
                                        boxShadow: 'black',
                                    }} >
                                        <Grid container direction={'column'} alignItems={'center'} gap={1} marginTop={3}>
                                            <DialogTitle sx={{ p: 3, borderBottom: 1, borderColor: "lightgray" }} >
                                                <Typography variant="h4" gutterBottom>
                                                    Voice Gateway
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    {t(`Fill in the fields below to add or update sms gateway `)}
                                                </Typography>
                                            </DialogTitle>

                                            <DialogContent sx={{ minWidth: '100%', display: "grid", rowGap: 2 }} >
                                                <Grid />
                                                <Grid>
                                                    <Grid>Select School:</Grid>
                                                    <TextFieldWrapper
                                                        label=""
                                                        errors={errors?.api_key}
                                                        touched={touched?.api_key}
                                                        name="api_key"
                                                        handleBlur={handleBlur}
                                                        handleChange={handleChange}
                                                        value={values?.api_key}
                                                    />

                                                    {/* sender_id */}
                                                    {/* <Grid>Api Key:</Grid>
                                                    <TextFieldWrapper
                                                        label=""
                                                        errors={errors?.api_key}
                                                        touched={touched?.api_key}
                                                        name="api_key"
                                                        handleBlur={handleBlur}
                                                        handleChange={handleChange}
                                                        value={values?.api_key}
                                                    /> */}
                                                    <Grid>Sender Id:</Grid>
                                                    <TextFieldWrapper
                                                        label=""
                                                        errors={errors?.sender_id}
                                                        touched={touched?.sender_id}
                                                        name="sender_id"
                                                        handleBlur={handleBlur}
                                                        handleChange={handleChange}
                                                        value={values?.sender_id}
                                                    />
                                                    {values?.sender_id && <Grid fontWeight={600}>Sms Type: <span style={{ fontSize: '15px', color: "#a21caf" }}>{verifyIsMasking(values?.sender_id) ? 'Masking' : 'Non Masking'}</span></Grid>}
                                                </Grid>
                                            </DialogContent>

                                            <DialogActions sx={{
                                                width: '100%',
                                                justifyContent: 'center',
                                                borderTop: '1px solid lightgray',
                                                px: 3,
                                                pt: 3
                                            }}>
                                                <ButtonWrapper
                                                    handleClick={undefined}
                                                    type="submit"
                                                    startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                                                    //@ts-ignore
                                                    disabled={Boolean(errors.submit) || isSubmitting}
                                                    variant="contained"
                                                >
                                                    {t('Submit')}
                                                </ButtonWrapper>
                                            </DialogActions>

                                        </Grid>

                                    </Card >
                                </form>
                            </Grid>
                        </>
                    );
                }}
            </Formik >

            <Footer />

        </>
    );
};

VoiceGateway.getLayout = (page) => {
    return (
        <Authenticated requiredPermissions={['create_voice_sms_gateway', 'show_voice_sms_gateway']}>
            <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
        </Authenticated>
    );
};

export default VoiceGateway;