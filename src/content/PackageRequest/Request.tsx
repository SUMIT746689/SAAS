import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/hooks/useAuth';
import Image from "next/image"
import {
  styled,
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
  Zoom,
  Typography,
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
  useTheme,
  Card
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

import useNotistick from '@/hooks/useNotistick';
import { TextFieldWrapper } from '@/components/TextFields';
import { useRouter } from 'next/navigation';


function PageHeader({school}) {
  const { t }: { t: any } = useTranslation();
 
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const theme = useTheme();
  const [documentFile, setDocumentFile] = useState();
  const router = useRouter()

  const { showNotification } = useNotistick()


  const [publicProfile, setPublicProfile] = useState({
    public: true
  });

  const handlePublicProfile = (event) => {
    setPublicProfile({
      ...publicProfile,
      [event.target.name]: event.target.checked
    });
  };


  const handleValidationSchema = Yup.object().shape({
    package_id: Yup.number()
      .min(1)
      .required(t('The package field is required')),
    document_photo: Yup.mixed().required('A file is required')
    // .test(
    //   "fileSize",
    //   "File too large",
    //   value => {
    //     console.log({value})
    //     return value && value?.size <= FILE_SIZE
    //   }
    // )
    // .test(
    //   "fileFormat",
    //   "Unsupported Format",
    //   value => value && SUPPORTED_FORMATS.includes(value.type)
    // )
  });

  const handleSubmit = async (
    _values,
    resetForm,
    setErrors,
    setStatus,
    setSubmitting
  ) => {
    try {
      const successResponse = (message) => {
        //@ts-ignore
        showNotification(`Package request ${message}`)
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
      };
      console.log({ _values });
      const formData = new FormData();
      formData.append('package_id', _values.package_id);
      formData.append('document_photo', _values.document_photo);
      // const res = await axios.post(`/api/packages`, _values);
      const response = await axios({
        method: 'post',
        url: '/api/package_requests',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response) {
        console.log("response___XXXXXXX____", response);
        successResponse('created');
      }

    } catch (err) {
      console.error(err);

      setStatus({ success: false });
      //@ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
      showNotification(err?.response?.data?.message, 'error')
    }
  };

  const FILE_SIZE = 160 * 1024;
  const SUPPORTED_FORMATS = [
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/png'
  ];
  const handlePayment = async ({
    collected_amount,
  }) => {

    try {
      const data = {
        collected_amount,
      }
      console.log("got__", data);

      const req = await axios.post('/api/package_requests/bkash/create-payment', data)

      router.push(req.data.bkashURL)
    } catch (err) {
      showNotification(err?.response?.data?.message, 'error')
      console.log(err);

    }
  }

  return (
    <>
      <Card>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          {/* <Typography variant="h4" gutterBottom>
            {t('Request for Package')}
          </Typography>
          <Typography variant="subtitle2">
            {t('Fill in the fields below to request for add a package')}
          </Typography> */}

          <Typography variant="h4" gutterBottom>
            {t('Pay Package bill')}
          </Typography>
        </DialogTitle>
        <Grid display={'flex'} justifyContent={'center'} alignItems={'center'} pb={3}>
          <Button sx={{
            borderRadius: 0.5,
            textAlign: 'center',
            px: 'auto', display: 'flex',
            justifyContent: 'center', alignItems: 'center',
            height: 0.8,
            backgroundColor: '#42a5f5',
          }}
            variant='contained'
            disabled={Number(school?.package?.price) ? false : true}
            onClick={() => handlePayment({ collected_amount: Number(school?.package?.price) })}>

            <Image src={'/BKash-Icon-Logo.wine.svg'} alt={'bkash'} width={35} height={35} />
            Pay
          </Button>

        </Grid>

        {/* <Formik
          initialValues={{
            package_id: undefined,
            document_photo: undefined,
            submit: null
          }}
          validationSchema={handleValidationSchema}
          onSubmit={async (
            _values,
            { resetForm, setErrors, setStatus, setSubmitting }
          ) =>
            handleSubmit(
              _values,
              resetForm,
              setErrors,
              setStatus,
              setSubmitting
            )
          }
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
                  <Grid container spacing={1}>
                    <Grid
                      item
                      container
                      sx={{
                        mb: `${theme.spacing(1)}`
                      }}
                    >
                      <Autocomplete
                        disablePortal
                        fullWidth
                        value={
                          packages?.data?.find(
                            (pkg: any) => pkg.id === values.package_id
                          ) || null
                        }
                        options={packages?.success ? packages.data : []}
                        isOptionEqualToValue={(option: any, value: any) =>
                          option.title === value.title
                        }
                        getOptionLabel={
                          (option) =>
                            option?.title + ' - ' + option?.price + ' '
                          // +
                          // option?.currency
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={Boolean(
                              touched?.package_id && errors?.package_id
                            )}
                            helperText={
                              touched?.package_id && errors?.package_id
                            }
                            name="package_id"
                            label={t('Select Package ')}
                          />
                        )}
                        // @ts-ignore
                        onChange={(e, value: any) => {
                          console.log({ value });
                          setFieldValue('package_id', value?.id || 0);
                        }}
                      />
                    </Grid>

                    <Grid
                      container
                      item
                    // sx={{minHeight:200}}
                    >
                      <TextField
                        // sx={{backgroundColor:'red',height:'100%',textDecoration:"none"}}
                        type="file"
                        id="outlined-basic"
                        // label="Document Photo"
                        error={Boolean(
                          touched?.document_photo && errors?.document_photo
                        )}
                        fullWidth
                        helperText={
                          touched?.document_photo && errors?.document_photo
                        }
                        name="document_photo"
                        // placeholder={t(`select related document here...`)}
                        onBlur={handleBlur}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          console.log(event.target.files[0]);
                          setFieldValue(
                            'document_photo',
                            event.target?.files[0]
                          );
                        }}
                        // value={values?.document_photo}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions
                  sx={{
                    p: 3
                  }}
                >
                  <Button
                    type="submit"
                    startIcon={
                      isSubmitting ? <CircularProgress size="1rem" /> : null
                    }
                    //@ts-ignore
                    disabled={Boolean(errors.submit) || isSubmitting}
                    variant="contained"
                  >
                    {t(`Submit`)}
                  </Button>
                </DialogActions>
              </form>
            );
          }}
        </Formik> */}





      </Card>
    </>
  );
}

export default PageHeader;
