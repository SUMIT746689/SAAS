import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress, DialogActions, DialogContent, Grid, TextField, Zoom } from '@mui/material';
import { NewHTTPClient } from '@/lib/HTTPClient';
import { FC, useEffect, useState } from 'react';
import { ResultProps } from '@/models/front_end';
import { FileUploadFieldWrapper } from '@/components/TextFields';
import Image from 'next/image';
import axios from 'axios';


const Results = ({ data, reFetchData }) => {

  console.log("data__", data);

  const { t }: { t: any } = useTranslation();
  const [notice, setNotice] = useState(['']);

  // const [header_image, setHeader_image] = useState(null)
  // const [carousel_image, setCarousel_image] = useState(null)
  // const [chairman_photo, setChairman_photo] = useState(null)
  // const [principal_photo, setPrincipal_photo] = useState(null)

  // useEffect(() => {
  //   console.log("carousel_image__", typeof (carousel_image), carousel_image);

  //   let cnt = []
  //   for (const i in carousel_image) {
  //     cnt.push(carousel_image[i])
  //   }
  //   console.log(cnt);
  // }, [carousel_image])
  useEffect(() => {
    if (data) {
      setNotice(data?.latest_news)
    }
  }, [data])

  const getValue = (carousel_image) => {
    let cnt = []
    for (const i in carousel_image) {
      cnt.push(carousel_image[i])
    }
    return cnt.map(j => j.name).join(', ')
  }
  return (
    <Formik
      enableReinitialize

      initialValues={{
        header_image: data ? data?.header_image?.replace(/\\/g, '/') : undefined,
        carousel_image: undefined,

        history_photo: data?.history_photo.replace(/\\/g, '/') || '',
        school_history: data?.school_history || '',

        chairman_photo: data?.chairman_photo?.replace(/\\/g, '/') || '',
        chairman_speech: data?.chairman_speech || '',

        principal_photo: data?.principal_photo?.replace(/\\/g, '/') || '',
        principal_speech: data?.principal_speech || '',

        latest_news: notice,

        submit: data?.latest_news || null
      }}
      // validationSchema={Yup.object().shape({
      //   title: Yup.string().max(255).required(t('The title field is required')),
      //   price: Yup.number().min(1).required(t('The price field is required')),
      //   duration: Yup.number()
      //     .min(1)
      //     .required(t('The duration field is required'))
      // })}
      onSubmit={async (
        _values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        try {
          const successResponse = (message) => {
            resetForm();
            setStatus({ success: true });
            setSubmitting(false);
            reFetchData();
          };

          // console.log("incomming _values", _values);

          // let cnt = [];
          // for (const j in _values['carousel_image']) {
          //   console.log({ j })
          //   if (typeof (_values['carousel_image'][j]) == 'object') {
          //     cnt.push(_values['carousel_image'][j])
          //   }

          // }
          // console.log("cnt__", cnt);

          // _values['carousel_image'] = cnt


          console.log("_values", _values);


          const formData = new FormData();

          for (let i in _values) {
            if (i == 'carousel_image') {
              const temp = _values[i]
              let nameList: any = []
              for (const j in temp) {
                if (typeof (temp[j]) == 'object') {
                  nameList.push({ name: temp[j].name })
                  formData.append('carousel_image', temp[j])
                }
              }
              // if (nameList.length) {
              //   nameList.forEach(element => {
              //     console.log({element})
              //     formData.append(`carousel_image_name_list[]`, element.name);
              //     // formData.append(`carousel_image_name_list[]`, nameList);
              //   });
              // }
            }
            else {
              if (i == 'latest_news') {
                notice.forEach(element => {
                  console.log({ element })
                  formData.append(`latest_news[]`, element);
                });
              } else {
                formData.append(`${i}`, _values[i]);
              }

            }
          }


          axios.put('/api/front_end', formData)
            .then(res => {
              console.log(res);
              reFetchData();
            }).catch(err => {
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
          <>
            <form onSubmit={handleSubmit}>

              <Grid spacing={2} gap={2} >

                {/* header_image */}
                <Grid container justifyContent='space-around' border='1px solid #cccccc' borderRadius='10px' marginBottom='10px'>
                  <Grid item>
                    <Image src={`/${data?.header_image.replace(/\\/g, '/')}`}
                      height={200}
                      width={200}
                      alt='Header Image'
                      loading='lazy'
                    />

                  </Grid>
                  <Grid item sx={{
                    pt: '25px'
                  }}>
                    <FileUploadFieldWrapper
                      htmlFor="header_image"
                      label="select Header image"
                      name="header_image"
                      value={values?.header_image?.name || values?.header_image || ''}
                      handleChangeFile={(e) => { setFieldValue('header_image', e.target.files[0]) }}
                      handleRemoveFile={(e) => { setFieldValue('header_image', undefined) }}
                    />

                  </Grid>
                </Grid>
                {/* carousel_image */}
                <Grid container gap={1} justifyContent='center' border='1px solid #cccccc' borderRadius='10px' marginBottom='10px'>

                  {
                    data &&
                    <>
                      {
                        data?.carousel_image?.map(i => <Grid item >
                          <Image
                            src={`/${i.path.replace(/\\/g, '/')}`}
                            height={120}
                            width={120}
                            alt='Carousel Image'
                            loading='lazy'

                          />

                        </Grid>)
                      }

                    </>
                  }



                  <Grid container justifyContent='center' sx={{
                    pt: '25px'
                  }}>
                    <FileUploadFieldWrapper
                      htmlFor="carousel_image"
                      label="select Carousel Image"
                      name="carousel_image"
                      multiple={true}
                      value={values?.carousel_image ? getValue(values?.carousel_image) : ''}
                      // carousel_image?.map(j=>j?.name)?.join(', ') ||
                      handleChangeFile={(e) => {



                        setFieldValue('carousel_image', e.target.files)
                      }}
                      handleRemoveFile={(e) => { setFieldValue('carousel_image', undefined) }}
                    />

                  </Grid>
                </Grid>

                {/* school_history */}
                <Grid container item borderRadius='10px' marginBottom='10px'>
                  <TextField
                    id="outlined-basic"
                    label="School history"
                    error={Boolean(touched?.school_history && errors?.school_history)}
                    fullWidth
                    helperText={touched?.school_history && errors?.school_history}
                    name="school_history"
                    placeholder={t(`History Description here...`)}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values?.school_history}
                    variant="outlined"
                    minRows={4}
                    maxRows={5}
                    multiline
                  />
                </Grid>

                {/* history_photo */}
                <Grid container justifyContent='space-around' border='1px solid #cccccc' borderRadius='10px' marginBottom='10px'>
                  <Grid item>
                    <Image
                      height={200}
                      width={200}
                      alt='History photo'
                      src={`/${data?.history_photo?.replace(/\\/g, '/')}`}
                      loading='lazy'
                    />

                  </Grid>
                  <Grid item sx={{
                    pt: '25px'
                  }}>
                    <FileUploadFieldWrapper
                      htmlFor="history_photo"
                      label="select History photo"
                      name="history_photo"
                      value={values?.history_photo?.name || values?.history_photo || ''}
                      handleChangeFile={(e) => { setFieldValue('history_photo', e.target.files[0]) }}
                      handleRemoveFile={(e) => { setFieldValue('history_photo', undefined) }}
                    />

                  </Grid>
                </Grid>
                {/* chairman_photo */}
                <Grid container justifyContent='space-around' border='1px solid #cccccc' borderRadius='10px' marginBottom='10px'>
                  <Grid item>
                    <Image
                      height={200}
                      width={200}
                      alt='Chairman photo'
                      src={`/${data?.chairman_photo?.replace(/\\/g, '/')}`}
                      loading='lazy'
                    />

                  </Grid>
                  <Grid item sx={{
                    pt: '25px'
                  }}>
                    <FileUploadFieldWrapper
                      htmlFor="chairman_photo"
                      label="select chairman photo"
                      name="chairman_photo"
                      value={values?.chairman_photo?.name || values?.chairman_photo || ''}
                      handleChangeFile={(e) => { setFieldValue('chairman_photo', e.target.files[0]) }}
                      handleRemoveFile={(e) => { setFieldValue('chairman_photo', undefined) }}
                    />

                  </Grid>
                </Grid>
                {/* chairman_speech */}
                <Grid container item borderRadius='10px' marginBottom='10px'>
                  <TextField
                    id="outlined-basic"
                    label="Chairman Speech"
                    error={Boolean(touched?.chairman_speech && errors?.chairman_speech)}
                    fullWidth
                    helperText={touched?.chairman_speech && errors?.chairman_speech}
                    name="chairman_speech"
                    placeholder={t(`Chairman Speech here...`)}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values?.chairman_speech}
                    variant="outlined"
                    minRows={4}
                    maxRows={5}
                    multiline
                  />
                </Grid>

                {/* principal_photo */}
                <Grid container justifyContent='space-around' border='1px solid #cccccc' borderRadius='10px' marginBottom='10px'>
                  <Grid item>
                    <Image
                      height={200}
                      width={200}
                      alt='Principal photo'
                      src={`/${data?.principal_photo?.replace(/\\/g, '/')}`}
                      loading='lazy'
                    />

                  </Grid>
                  <Grid item sx={{
                    pt: '25px'
                  }}>
                    <FileUploadFieldWrapper
                      htmlFor="principal photo"
                      label="select principal photo"
                      name="principal_photo"
                      value={values?.principal_photo?.name || values?.principal_photo || ''}
                      handleChangeFile={(e) => { setFieldValue('principal_photo', e.target.files[0]) }}
                      handleRemoveFile={(e) => { setFieldValue('principal_photo', undefined) }}
                    />

                  </Grid>
                </Grid>
                {/* principal_speech */}
                <Grid container item borderRadius='10px' marginBottom='10px'>
                  <TextField
                    id="outlined-basic"
                    label="Principal speech"
                    error={Boolean(touched?.principal_speech && errors?.principal_speech)}
                    fullWidth
                    helperText={touched?.principal_speech && errors?.principal_speech}
                    name="principal_speech"
                    placeholder={t(`Principal speech here...`)}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values?.principal_speech}
                    variant="outlined"
                    minRows={4}
                    maxRows={5}
                    multiline
                  />
                </Grid>
                <Grid item borderRadius='10px' marginBottom='10px'>

                  {notice.map((field, index) => (
                    <Grid container gap={2}>
                      <Grid >
                        <TextField
                          key={index}
                          value={field}
                          onChange={(e) => {
                            const updatedFields = [...notice];
                            updatedFields[index] = e.target.value;
                            setNotice(updatedFields);
                          }}
                          label="Input Field"
                          variant="outlined"
                          margin="normal"
                        />
                      </Grid>
                      <Grid >
                        <Button variant="contained" sx={{
                          marginTop: '18px'
                        }} onClick={() => {
                          const temp = [...notice]
                          temp.splice(index, 1)
                          setNotice(temp)
                        }}>
                          remove
                        </Button>
                      </Grid>


                    </Grid>
                  ))}
                  <Button variant="contained" onClick={() => setNotice([...notice, ''])}>
                    Add notice
                  </Button>

                </Grid>
              </Grid>

              <DialogActions
                sx={{
                  p: 3
                }}
              >

                <Button
                  type="submit"
                  startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}

                  disabled={Boolean(errors.submit) || isSubmitting}
                  variant="contained"
                >
                  {t('Add frontend')}
                </Button>
              </DialogActions>
            </form>
          </>
        );
      }}
    </Formik>
  )
};

export default Results;
