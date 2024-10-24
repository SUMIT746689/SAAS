import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, Card, CircularProgress, Grid } from '@mui/material';
import { NewFileUploadFieldWrapper, PreviewImageCard, TextAreaWrapper, TextFieldWrapper } from '@/components/TextFields';
import Image from 'next/image';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { getFile } from '@/utils/utilitY-functions';
import { DialogTitleWrapper } from '@/components/DialogWrapper';
import { handleFileChange, handleFileRemove } from 'utilities_api/handleFileUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const Results = ({ data, reFetchData }) => {
  const { t }: { t: any } = useTranslation();
  // const [notice, setNotice] = useState([{ title: '', headLine: '', body: undefined, link: undefined }]);

  // const [header_image, setHeader_image] = useState(null)
  // const [carousel_image, setCarousel_image] = useState(null)
  // const [gallery, setGallery] = useState(null)
  // const [history_photo, setHistory_photo] = useState(null)
  // const [chairman_photo, setChairman_photo] = useState(null)
  // const [principal_photo, setPrincipal_photo] = useState(null)

  const { showNotification } = useNotistick();
  const getValue = (carousel_image) => {
    let cnt = [];
    for (const i in carousel_image) {
      cnt.push(carousel_image[i]);
    }
    return cnt.map((j) => j.name).join(', ');
  };

  const handleChangeFromArr = (totalValues, index, setField, name, key, event) => {
    const value = event.target.value;
    const filterValues = totalValues.map((val, ind) => {
      if (ind !== index) return val;
      val[key] = value;
      return val;
    });
    setField(name, filterValues);
  };

  const handleRemoveFromArr = (totalValues, index, setField, name) => {
    const filterValues = totalValues.filter((val, ind) => ind !== index);
    setField(name, filterValues);
  };
  return (
    <Formik
      enableReinitialize
      initialValues={{
        header_image: data ? data?.header_image : undefined,
        preview_header_image: [],

        carousel_image: undefined,
        preview_carousel_image: [],

        // history_photo: data?.history_photo || undefined,
        // preview_history_photo: [],
        // school_history: data?.school_history || '',

        about_school_photo: data?.about_school_photo || undefined,
        preview_about_school_photo: [],
        english_about_school_desc: data?.english_about_school_desc || undefined,
        bangla_about_school_desc: data?.bangla_about_school_desc || undefined,

        english_chairman_name: data?.english_chairman_name || '',
        bangla_chairman_name: data?.bangla_chairman_name || '',
        chairman_photo: data?.chairman_photo || undefined,
        preview_chairman_photo: [],
        english_chairman_speech: data?.english_chairman_speech || '',
        bangla_chairman_speech: data?.bangla_chairman_speech || '',

        english_principal_name: data?.english_principal_name || '',
        bangla_principal_name: data?.bangla_principal_name || '',
        principal_photo: data?.principal_photo || '',
        preview_principal_photo: [],
        english_principal_speech: data?.english_principal_speech || '',
        bangla_principal_speech: data?.bangla_principal_speech || '',

        english_assist_principal_name: data?.english_assist_principal_name || '',
        bangla_assist_principal_name: data?.bangla_assist_principal_name || '',
        assist_principal_photo: data?.assist_principal_photo || '',
        preview_assist_principal_photo: [],
        english_assist_principal_speech: data?.english_assist_principal_speech || '',
        bangla_assist_principal_speech: data?.bangla_assist_principal_speech || '',

        eiin_number: data?.eiin_number || '',

        facebook_link: data?.facebook_link || '',
        twitter_link: data?.twitter_link || '',
        google_link: data?.google_link || '',
        linkedin_link: data?.linkedin_link || '',
        youtube_link: data?.youtube_link || '',

        gallery: undefined,
        preview_gallery: [],

        e_books_section: data?.e_books_section || [{ title: null, url: null }],
        downloads_section: data?.downloads_section || [{ title: null, url: null }],

        submit: null
      }}
      // validationSchema={Yup.object().shape({
      //   title: Yup.string().max(255).required(t('The title field is required')),
      //   price: Yup.number().min(1).required(t('The price field is required')),
      //   duration: Yup.number()
      //     .min(1)
      //     .required(t('The duration field is required'))
      // })}
      onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          const successResponse = (message) => {
            setStatus({ success: true });
            setSubmitting(false);
            showNotification(message);
          };

          const formData = new FormData();

          for (let i in _values) {
            if (i.includes('preview_')) continue;
            if (i == 'carousel_image') {
              const temp = _values[i];
              for (const j in temp) {
                if (typeof temp[j] == 'object') {
                  formData.append('carousel_image', temp[j]);
                }
              }
            }
            // else if (i == 'gallery') {
            //   const temp = _values[i]
            //   for (const j in temp) {
            //     if (typeof (temp[j]) == 'object') {
            //       formData.append('gallery', temp[j])
            //     }
            //   }
            // }
            else if (
              ['header_image', 'about_school_photo', 'chairman_photo', 'principal_photo', 'assist_principal_photo'].includes(i) &&
              _values[i]
            ) {
              formData.append(`${i}`, _values[i][0]);
            } else if (['e_books_section', 'downloads_section'].includes(i) && _values[i]) {
              formData.append(`${i}`, JSON.stringify(_values[i]));
            } else {
              console.log({ i: _values[i] });
              formData.append(`${i}`, _values[i]);
            }
          }

          axios
            .put('/api/front_end', formData)
            .then((res) => {
              reFetchData();
              successResponse('Front end information updated !');
            })
            .catch((err) => {
              console.log(err);
              showNotification('Front end information update failed !', 'error');
            });
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
        return (
          <>
            <form onSubmit={handleSubmit}>
              <Card sx={{ maxWidth: 1400 }}>
                <DialogTitleWrapper name={'Website Dynamic Fields'} editData={undefined} />
                <Grid container columnSpacing={1} paddingTop={2} borderTop="1px solid lightGray" borderBottom="1px solid lightGray" p={2}>
                  {/* Eiin number  */}
                  <Grid container item borderRadius="10px" marginBottom="10px">
                    <Grid item>
                      Eiin Number: <span style={{ color: 'red' }}>*</span>
                    </Grid>
                    <TextFieldWrapper
                      touched={touched.eiin_number}
                      errors={errors.eiin_number}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="eiin_number"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.eiin_number}
                      autocomplete="false"
                      required={true}
                    />
                  </Grid>

                  {/* carousel_image */}
                  <Grid item xs={12} pb={0.5}>
                    <NewFileUploadFieldWrapper
                      htmlFor="carousel_image"
                      accept="image/*"
                      handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'carousel_image', 'preview_carousel_image')}
                      label="Carousel Image"
                      multiple={true}
                    />
                    <Grid item display="flex" columnGap={0.5}>
                      {values?.preview_carousel_image?.map((image, index) => (
                        <>
                          <PreviewImageCard
                            data={image}
                            index={index}
                            key={index}
                            handleRemove={() => handleFileRemove(setFieldValue, 'carousel_image', 'preview_carousel_image')}
                          />
                        </>
                      ))}
                    </Grid>
                    {Array.isArray(data?.carousel_image) && (
                      <Grid item display="flex" gap={1} sx={{ overflowX: 'auto' }} columnSpacing={0.5}>
                        {data?.carousel_image?.map((image) => (
                          <Image
                            src={getFile(image?.path)}
                            height={150}
                            width={150}
                            alt="Header image"
                            loading="lazy"
                            style={{ objectFit: 'contain', height: '150px' }}
                          />
                        ))}
                      </Grid>
                    )}
                  </Grid>

                  {/* heaer image */}
                  <Grid item xs={12} md={6} pb={0.5}>
                    <NewFileUploadFieldWrapper
                      htmlFor="header_image"
                      accept="image/*"
                      handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'header_image', 'preview_header_image')}
                      label="Header Image"
                    />
                    <Grid item>
                      {values?.preview_header_image?.map((image, index) => (
                        <>
                          <PreviewImageCard
                            data={image}
                            index={index}
                            key={index}
                            handleRemove={() => handleFileRemove(setFieldValue, 'header_image', 'preview_header_image')}
                          />
                        </>
                      ))}
                    </Grid>
                    {data?.header_image && (
                      <Grid item>
                        <Image src={getFile(data?.header_image)} height={150} width={150} alt="Header image" loading="lazy" />
                      </Grid>
                    )}

                    {/* <Grid item sx={{
                      pt: '25px'
                    }}>
                      <FileUploadFieldWrapper
                        htmlFor="header_image"
                        label="Select School logo"
                        name="header_image"
                        value={values?.header_image?.name || values?.header_image || ''}
                        handleChangeFile={(e) => {
                          if (e.target?.files?.length) {
                            const photoUrl = URL.createObjectURL(e.target.files[0]);
                            setHeader_image(photoUrl)
                            setFieldValue('header_image', e.target.files[0])
                          }
                        }}
                        handleRemoveFile={(e) => {
                          setHeader_image(null);
                          setFieldValue('header_image', undefined)
                        }}
                      />

                    </Grid> */}
                  </Grid>

                  {/* gallery */}
                  {/* <Grid item xs={12} md={6} pb={0.5}>
                    <NewFileUploadFieldWrapper
                      htmlFor="gallery"
                      accept="image/*"
                      handleChangeFile={(e) => handleFileChange(e, setFieldValue, "gallery", "preview_gallery")}
                      label='Gallery'
                      multiple={true}
                    />
                    <Grid item display="flex" columnSpacing={1}>
                      {
                        values?.preview_gallery?.map((image, index) => (
                          <>
                            <PreviewImageCard
                              data={image}
                              index={index}
                              key={index}
                              handleRemove={() => handleFileRemove(setFieldValue, "gallery", "preview_gallery")}
                            />
                          </>
                        ))
                      }
                    </Grid>

                    {
                      Array.isArray(data?.gallery) && <Grid item display="flex" flexWrap="nowrap" gap={1} sx={{ overflowX: "auto" }} columnSpacing={0.5}>
                        {
                          data?.gallery?.map((image) => (
                            <Image src={getFile(image?.path)}
                              height={150}
                              width={150}
                              alt='Gallery'
                              loading='lazy'
                              style={{ objectFit: "contain", height: "150px" }}
                            />
                          ))
                        }
                      </Grid>
                    }
                  </Grid> */}

                  {/* history_photo */}
                  {/* <Grid item xs={12} md={6} pb={0.5}>
                    <NewFileUploadFieldWrapper
                      htmlFor="history_photo"
                      accept="image/*"
                      handleChangeFile={(e) => handleFileChange(e, setFieldValue, "history_photo", "preview_history_photo")}
                      label='History Photo'
                    />
                    <Grid item>
                      {
                        values?.preview_history_photo?.map((image, index) => (
                          <>
                            <PreviewImageCard
                              data={image}
                              index={index}
                              key={index}
                              handleRemove={() => handleFileRemove(setFieldValue, "history_photo", "preview_history_photo")}
                            />
                          </>
                        ))
                      }
                    </Grid>
                    {
                      data?.history_photo && <Grid item>
                        <Image src={getFile(data?.history_photo)}
                          height={150}
                          width={150}
                          alt='History Photo'
                          loading='lazy'
                        />

                      </Grid>
                    }
                  </Grid> */}

                  {/* school_history */}
                  {/* <Grid container item borderRadius='10px' marginBottom='10px'>
                    <Grid>About School (English):</Grid>
                    <TextAreaWrapper
                      touched={touched.english_about_school_desc}
                      errors={errors.english_about_school_desc}
                      label={t('')}
                      name="english_about_school_desc"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.english_about_school_desc}
                    />
                  </Grid> */}

                  {/* about_school_photo */}
                  <Grid item xs={12} md={6} pb={0.5}>
                    <NewFileUploadFieldWrapper
                      htmlFor="about_school_photo"
                      accept="image/*"
                      handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'about_school_photo', 'preview_about_school_photo')}
                      label="About School Photo"
                    />
                    <Grid item>
                      {values?.preview_about_school_photo?.map((image, index) => (
                        <>
                          <PreviewImageCard
                            data={image}
                            index={index}
                            key={index}
                            handleRemove={() => handleFileRemove(setFieldValue, 'about_school_photo', 'preview_about_school_photo')}
                          />
                        </>
                      ))}
                    </Grid>
                    {data?.about_school_photo && (
                      <Grid item>
                        <Image src={getFile(data?.about_school_photo)} height={150} width={150} alt="About School Photo" loading="lazy" />
                      </Grid>
                    )}
                  </Grid>

                  {/* about school */}
                  <Grid item xs={12} md={6} pt={1} borderRadius="10px" marginBottom="10px">
                    <Grid>About School (English):</Grid>
                    <TextAreaWrapper
                      touched={touched.english_about_school_desc}
                      errors={errors.english_about_school_desc}
                      label={t('')}
                      name="english_about_school_desc"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.english_about_school_desc}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} pt={1} borderRadius="10px" marginBottom="10px">
                    <Grid>About School (বাংলা):</Grid>

                    <TextAreaWrapper
                      touched={touched.bangla_about_school_desc}
                      errors={errors.bangla_about_school_desc}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="bangla_about_school_desc"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.bangla_about_school_desc}
                    />

                    {/* <TextField
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
                      minRows={10}
                      maxRows={14}
                      multiline
                    /> */}
                  </Grid>

                  {/* chairman_photo */}
                  <Grid item xs={12} md={6} pb={0.5}>
                    <NewFileUploadFieldWrapper
                      htmlFor="chairman_photo"
                      accept="image/*"
                      handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'chairman_photo', 'preview_chairman_photo')}
                      label="Chairman Photo"
                    />
                    <Grid item>
                      {values?.preview_chairman_photo?.map((image, index) => (
                        <>
                          <PreviewImageCard
                            data={image}
                            index={index}
                            key={index}
                            handleRemove={() => handleFileRemove(setFieldValue, 'chairman_photo', 'preview_chairman_photo')}
                          />
                        </>
                      ))}
                    </Grid>
                    {data?.chairman_photo && (
                      <Grid item>
                        <Image src={getFile(data?.chairman_photo)} height={150} width={150} alt="Chairman Photo" loading="lazy" />
                      </Grid>
                    )}
                  </Grid>

                  {/* principal_photo */}
                  <Grid item xs={12} md={6} pb={0.5}>
                    <NewFileUploadFieldWrapper
                      htmlFor="principal_photo"
                      accept="image/*"
                      handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'principal_photo', 'preview_principal_photo')}
                      label="Principal Photo"
                    />
                    <Grid item>
                      {values?.preview_principal_photo?.map((image, index) => (
                        <>
                          <PreviewImageCard
                            data={image}
                            index={index}
                            key={index}
                            handleRemove={() => handleFileRemove(setFieldValue, 'principal_photo', 'preview_principal_photo')}
                          />
                        </>
                      ))}
                    </Grid>
                    {data?.principal_photo && (
                      <Grid item>
                        <Image src={getFile(data?.principal_photo)} height={150} width={150} alt="Principal Photo" loading="lazy" />
                      </Grid>
                    )}
                  </Grid>

                  {/* Assistant_principal_photo */}
                  <Grid item xs={12} md={6} pb={0.5}>
                    <NewFileUploadFieldWrapper
                      htmlFor="assist_principal_photo"
                      accept="image/*"
                      handleChangeFile={(e) => handleFileChange(e, setFieldValue, 'assist_principal_photo', 'preview_assist_principal_photo')}
                      label="Assistant Principal Photo"
                    />
                    <Grid item>
                      {values?.preview_assist_principal_photo?.map((image, index) => (
                        <>
                          <PreviewImageCard
                            data={image}
                            index={index}
                            key={index}
                            handleRemove={() => handleFileRemove(setFieldValue, 'assist_principal_photo', 'preview_assist_principal_photo')}
                          />
                        </>
                      ))}
                    </Grid>
                    {data?.assist_principal_photo && (
                      <Grid item>
                        <Image src={getFile(data?.assist_principal_photo)} height={150} width={150} alt="Principal Photo" loading="lazy" />
                      </Grid>
                    )}
                  </Grid>

                  <Grid xs={12} md={6}></Grid>

                  {/* chairman_name  */}
                  <Grid container item xs={12} md={6} pt={1}>
                    <Grid item>Chairman Role Name (English):</Grid>
                    <TextFieldWrapper
                      touched={touched.english_chairman_name}
                      errors={errors.english_chairman_name}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="english_chairman_name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.english_chairman_name}
                      autocomplete="false"
                    />
                  </Grid>
                  <Grid container item xs={12} md={6} pt={1}>
                    <Grid item>Chairman Role Name (বাংলা):</Grid>
                    <TextFieldWrapper
                      touched={touched.bangla_chairman_name}
                      errors={errors.bangla_chairman_name}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="bangla_chairman_name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.bangla_chairman_name}
                      autocomplete="false"
                    />
                  </Grid>

                  {/* chairman_speech */}
                  <Grid item xs={12} md={6}>
                    <Grid>Chairman Speech (English):</Grid>
                    <TextAreaWrapper
                      touched={touched.english_chairman_speech}
                      errors={errors.english_chairman_speech}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="english_chairman_speech"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.english_chairman_speech}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Grid>Chairman Speech (বাংলা):</Grid>
                    <TextAreaWrapper
                      touched={touched.bangla_chairman_speech}
                      errors={errors.bangla_chairman_speech}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="bangla_chairman_speech"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.bangla_chairman_speech}
                    />
                  </Grid>

                  {/* principal_name  */}
                  <Grid container item xs={12} md={6}>
                    <Grid item>Principal Role Name (English):</Grid>
                    <TextFieldWrapper
                      touched={touched.english_principal_name}
                      errors={errors.english_principal_name}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="english_principal_name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.english_principal_name}
                      autocomplete="false"
                    />
                  </Grid>
                  <Grid container item xs={12} md={6}>
                    <Grid item>Principal Role Name (বাংলা):</Grid>
                    <TextFieldWrapper
                      touched={touched.bangla_principal_name}
                      errors={errors.bangla_principal_name}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="bangla_principal_name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.bangla_principal_name}
                      autocomplete="false"
                    />
                  </Grid>

                  {/* principal_speech */}
                  <Grid item xs={12} md={6}>
                    <Grid>Principal Speech (English):</Grid>
                    <TextAreaWrapper
                      touched={touched.english_principal_speech}
                      errors={errors.english_principal_speech}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="english_principal_speech"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.english_principal_speech}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Grid>Principal Speech (বাংলা):</Grid>
                    <TextAreaWrapper
                      touched={touched.bangla_principal_speech}
                      errors={errors.bangla_principal_speech}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="bangla_principal_speech"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.bangla_principal_speech}
                    />
                  </Grid>

                  {/* assist_principal_name  */}
                  <Grid container item xs={12} md={6}>
                    <Grid item>Assistant Principal Role Name (English):</Grid>
                    <TextFieldWrapper
                      touched={touched.english_assist_principal_name}
                      errors={errors.english_assist_principal_name}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="english_assist_principal_name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.english_assist_principal_name}
                      autocomplete="false"
                    />
                  </Grid>
                  <Grid container item xs={12} md={6}>
                    <Grid item>Assistant Principal Role Name (বাংলা):</Grid>
                    <TextFieldWrapper
                      touched={touched.bangla_assist_principal_name}
                      errors={errors.bangla_assist_principal_name}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="bangla_assist_principal_name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.bangla_assist_principal_name}
                      autocomplete="false"
                    />
                  </Grid>

                  {/* Assistant_principal_speech */}
                  <Grid item xs={12} md={6}>
                    <Grid>Assistant Principal Speech (English):</Grid>
                    <TextAreaWrapper
                      touched={touched.english_assist_principal_speech}
                      errors={errors.english_assist_principal_speech}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="english_assist_principal_speech"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.english_assist_principal_speech}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Grid>Assistant Principal Speech (বাংলা):</Grid>
                    <TextAreaWrapper
                      touched={touched.bangla_assist_principal_speech}
                      errors={errors.bangla_assist_principal_speech}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="bangla_assist_principal_speech"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.bangla_assist_principal_speech}
                    />
                  </Grid>

                  {/* facebook_link */}
                  <Grid item xs={12} md={6}>
                    <Grid>Facebook page link:</Grid>
                    <TextFieldWrapper
                      touched={touched.facebook_link}
                      errors={errors.facebook_link}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="facebook_link"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.facebook_link}
                    />
                  </Grid>

                  {/* twitter_link */}
                  <Grid item xs={12} md={6}>
                    <Grid>Twitter page link:</Grid>
                    <TextFieldWrapper
                      touched={touched.twitter_link}
                      errors={errors.twitter_link}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="twitter_link"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.twitter_link}
                    />
                  </Grid>

                  {/* google_link */}
                  <Grid item xs={12} md={6}>
                    <Grid>Google++ profile link:</Grid>
                    <TextFieldWrapper
                      touched={touched.google_link}
                      errors={errors.google_link}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="google_link"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.google_link}
                    />
                  </Grid>

                  {/* linkedin_link */}
                  <Grid item xs={12} md={6}>
                    <Grid item>Linkedin profile link:</Grid>
                    <TextFieldWrapper
                      touched={touched.linkedin_link}
                      errors={errors.linkedin_link}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="linkedin_link"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.linkedin_link}
                    />
                  </Grid>

                  {/* youtube_link */}
                  <Grid item xs={12} md={6}>
                    <Grid>Youtube profile link:</Grid>
                    <TextFieldWrapper
                      touched={touched.youtube_link}
                      errors={errors.youtube_link}
                      // label={t('Eiin number')}
                      label={t('')}
                      name="youtube_link"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      value={values.youtube_link}
                    />
                  </Grid>

                  {/* ebooks sections */}
                  <Grid item xs={12}>
                    <Grid>E-books Section:</Grid>
                    <Grid item display="grid" gridTemplateColumns="1fr 1fr auto" columnGap={1} px={2}>
                      {values.e_books_section?.map((ebook, index) => (
                        <>
                          <Grid>
                            E-book Title:
                            <TextFieldWrapper
                              touched={touched.e_books_section}
                              errors={errors.e_books_section}
                              // label={t('Eiin number')}
                              label={t('')}
                              name={'e-book title'}
                              handleBlur={handleBlur}
                              handleChange={(e) => handleChangeFromArr(values.e_books_section, index, setFieldValue, 'e_books_section', 'title', e)}
                              value={ebook?.title}
                            />
                          </Grid>
                          <Grid>
                            E-book Url:
                            <TextFieldWrapper
                              touched={touched.e_books_section}
                              errors={errors.e_books_section}
                              // label={t('Eiin number')}
                              label={t('')}
                              name={'e-book url'}
                              handleBlur={handleBlur}
                              handleChange={(event) =>
                                handleChangeFromArr(values.e_books_section, index, setFieldValue, 'e_books_section', 'url', event)
                              }
                              value={ebook?.url}
                            />
                          </Grid>
                          {/* <Grid > */}
                          <DeleteOutlineIcon
                            onClick={() => handleRemoveFromArr(values.e_books_section, index, setFieldValue, 'e_books_section')}
                            color="warning"
                            sx={{ cursor: 'pointer', height: 37, mt: 2.3, p: 1, fontSize: 50, border: '2px solid' }}
                          />
                          {/* </Grid> */}
                        </>
                      ))}
                    </Grid>
                    <ButtonWrapper
                      sx={{ mx: 2 }}
                      handleClick={() => setFieldValue('e_books_section', [...values.e_books_section, { title: null, url: null }])}
                    >
                      {' '}
                      + Add More Ebooks Section{' '}
                    </ButtonWrapper>
                  </Grid>

                  {/* downloads sections */}
                  <Grid item xs={12}>
                    <Grid>Downloads Section:</Grid>
                    <Grid item display="grid" gridTemplateColumns="1fr 1fr auto" columnGap={1} px={2}>
                      {values.downloads_section?.map((download_sec, index) => (
                        <>
                          <Grid>
                            Download Title:
                            <TextFieldWrapper
                              touched={touched.downloads_section}
                              errors={errors.downloads_section}
                              // label={t('Eiin number')}
                              label={t('')}
                              name={'title'}
                              handleBlur={handleBlur}
                              handleChange={(event) =>
                                handleChangeFromArr(values.downloads_section, index, setFieldValue, 'downloads_section', 'title', event)
                              }
                              value={download_sec.title}
                            />
                          </Grid>
                          <Grid>
                            Download Url:
                            <TextFieldWrapper
                              touched={touched.downloads_section}
                              errors={errors.downloads_section}
                              // label={t('Eiin number')}
                              label={t('')}
                              name={'url'}
                              handleBlur={handleBlur}
                              handleChange={(event) =>
                                handleChangeFromArr(values.downloads_section, index, setFieldValue, 'downloads_section', 'url', event)
                              }
                              value={download_sec.url}
                            />
                          </Grid>
                          {/* <Grid > */}
                          <DeleteOutlineIcon
                            onClick={() => handleRemoveFromArr(values.downloads_section, index, setFieldValue, 'downloads_section')}
                            color="warning"
                            sx={{ cursor: 'pointer', height: 37, mt: 2.3, p: 1, fontSize: 50, border: '2px solid' }}
                          />
                          {/* </Grid> */}
                        </>
                      ))}
                    </Grid>
                    <ButtonWrapper
                      sx={{ mx: 2 }}
                      handleClick={() => setFieldValue('downloads_section', [...values.downloads_section, { title: null, url: null }])}
                    >
                      {' '}
                      + Add More Downloads Section{' '}
                    </ButtonWrapper>
                  </Grid>
                </Grid>

                <Grid display={'flex'} alignContent="center" justifyContent={'center'} alignItems="center" padding={2}>
                  <Button
                    sx={{
                      borderRadius: 0.5,
                      height: 36,
                      width: '50%'
                    }}
                    type="submit"
                    startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                    disabled={Boolean(errors.submit) || isSubmitting}
                    variant="contained"
                  >
                    {t('Save')}
                  </Button>
                </Grid>
              </Card>
            </form>
          </>
        );
      }}
    </Formik>
  );
};

export default Results;
