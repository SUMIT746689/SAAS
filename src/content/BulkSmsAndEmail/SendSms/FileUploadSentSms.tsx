import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Grid, DialogContent, Card, DialogActions, Button, CircularProgress, Chip } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DisableTextWrapper, NewFileUploadFieldWrapper, TextAreaWrapper, TextFieldWrapper } from '@/components/TextFields';
import { useRef, useState } from 'react';
import { read, utils } from "xlsx";
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import Link from 'next/dist/client/link';
import { handleCreateFileObj } from 'utilities_api/handleCreateFileObject';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';


function PageHeader({ sms_gateway }) {
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();
  const [selectSheetHeaders, setSelectSheetHeaders] = useState([]);
  const fileUploadRef = useRef();
  
  const handleFormSubmit = async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
    try {

      const successResponse = (message) => {
        showNotification('send sms ' + message + ' successfully');
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        setSelectSheetHeaders(() => []);
        // reFetchData();
      };

      const datas = new FormData()
      // datas.set('file', "asss")

      for (const [key, value] of Object.entries(_values)) {
        console.log(`${key}: ${value}`);
        // @ts-ignore
        if (key === "contact_column") datas.set(key, value.id)
        else if (value) datas.set(key, _values[key]);
      }
      console.log({ datas })
      // const {file_upload} = _values;
      // const fileToBlob = new Blob([new Uint8Array(await file_upload.arrayBuffer())], {type: file_upload.type });
      // _values.file_upload.arrayBuffer().then((arrayBuffer) => {
      //   const blob = new Blob([new Uint8Array(arrayBuffer)], {type: file_upload.type });
      //   console.log({blob});
      // }); 
      // _values.file_upload = fileToBlob;
      console.log({ _values })
      const { data } = await axios.post(`/api/sent_sms/dynamic`, datas);
      successResponse('created');

    } catch (err) {
      console.error(err);
      handleShowErrMsg(err, showNotification);
      setStatus({ success: false });
      //@ts-ignore
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  };

  const handleFileChange = async (event, setFieldValue) => {
    if (!event.target.files[0]) return;
    const reader = new FileReader();


    reader.onload = async function (e) {
      const data = e.target.result;
      const workbook = read(data, { type: 'array' })
      /* DO SOMETHING WITH workbook HERE */
      const firstSheetName = workbook.SheetNames[0]
      /* Get worksheet */
      const worksheet = workbook.Sheets[firstSheetName]
      const excelArrayDatas = utils.sheet_to_json(worksheet, { raw: true });
      setFieldValue("body", '')
      setFieldValue("contact_column", null)

      if (excelArrayDatas.length > 30_000) {
        showNotification("file is to large", "error")
        setFieldValue("file_upload", null);
        setSelectSheetHeaders(() => []);
        return;
      }
      const fileHeads = Object.keys(excelArrayDatas[0]);
      console.log({ fileHeads })
      setSelectSheetHeaders(() => fileHeads);


      // set upload file 
      const { err, files, objFiles } = handleCreateFileObj(event)
      if (err) showNotification(err, "error");
      setFieldValue('file_upload', files[0]);
      setFieldValue('preview_file_upload', objFiles[0]);

      // setPreviewFile(() => imgPrev)

      // const workbook = read(data, { type: "array" });

      // console.log({ workbook })
      // const { Sheets } = workbook;
      // console.log({ Sheets })
      // const { Sheet1 } = {} = Sheets || {};
      // const { Sheet1: { A1 } } = {} = Sheets || {};
      // console.log({ Sheet1 })
      // // setFieldValue("file_upload", e );
      // setSelectSheetHeaders(() => getSheetHeaders(Sheet1))
    }
    reader.readAsArrayBuffer(event.target.files[0]);
  }

  const handleRemove = (setFile) => {
    setFile('file_upload', '');
    setFile('preview_file_upload', '');
  }

  // function handleFile(file /*:File*/) {
  //   /* Boilerplate to set up FileReader */
  //   const reader = new FileReader();
  //   const rABS = !!reader.readAsBinaryString;
  //   reader.onload = e => {
  //     /* Parse data */
  //     const bstr = e.target.result;
  //     const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
  //     /* Get first worksheet */
  //     const wsname = wb.SheetNames[0];
  //     const ws = wb.Sheets[wsname];
  //     console.log(rABS, wb);
  //     /* Convert array of arrays */
  //     const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  //     /* Update state */
  //     console.log({ data: data, cols: make_cols(ws["!ref"]) });
  //   };
  //   reader.readAsBinaryString(file)
  // };

  return (
    <>
      <Card sx={{ mt: 1, borderRadius: 0, boxShadow: "none", mb: 'auto' }}>
        {/* dialog title */}
        {/* <DialogTitleWrapper name={"Sms Templates"} /> */}

        <Formik
          initialValues={{
            campaign_name: '',
            sms_gateway: sms_gateway?.details?.sender_id || '',
            sms_gateway_id: sms_gateway?.id || undefined,
            contact_column: null,
            // template_id: undefined,
            body: '',
            // recipient_type: undefined,
            // class_id: undefined,
            // section_id: [],
            // role_id: [],
            // name: [],
            schedule_date: undefined,
            schedule_time: undefined,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            campaign_name: Yup.string()
              .max(255)
              .required(t('The campaign name field is required')),
            body: Yup.string()
              .max(255)
              .required(t('The body field is required')),
            // sms_gateway_id: Yup.number()
            //   .min(0)
            //   .required(t('The sms gateway field is required')),
            // recipient_type: Yup.string()
            //   .min(4)
            //   .required(t('The type field is required')),
          })}
          onSubmit={handleFormSubmit}
        >
          {({
            errors, handleBlur, handleChange, handleSubmit,
            isSubmitting, touched, values,
            setFieldValue
          }) => {
            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  sx={{ p: 3 }}
                >
                  <Grid container rowGap={1}>

                    <Grid container>
                      <Grid pb={0.5}>Campaign Name: *</Grid>
                      <TextFieldWrapper
                        label=""
                        name="campaign_name"
                        value={values.campaign_name}
                        touched={touched.campaign_name}
                        errors={errors.campaign_name}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        required={true}
                      />
                    </Grid>

                    <Grid container>
                      <Grid pb={0.5}>Selected Sms Gateway: *</Grid>
                      <DisableTextWrapper
                        label=""
                        touched={values.sms_gateway}
                        errors={errors.sms_gateway}
                        value={values.sms_gateway}
                      />
                      {
                        Boolean(
                          // touched.sms_gateway_id 
                          // && 
                          errors.sms_gateway_id
                        ) &&
                        <Grid display="flex" columnGap={2} justifyContent="space-between">
                          <Grid pb={2} color="red" fontSize={13} fontWeight={600}> {errors.sms_gateway_id} </Grid>
                          <Link href="/settings/sms" ><Grid textTransform="uppercase" color="violet" px={1} mb="auto" sx={{ ':hover': { cursor: "pointer", color: "blue" } }}> create sms gateway {'->'}</Grid></Link>
                        </Grid>

                      }
                    </Grid>

                    <Grid >Upload File: *</Grid>
                    <Grid item width="100%">
                      <NewFileUploadFieldWrapper
                        label='File Upload'
                        htmlFor="file_upload"
                        accept=".xlsx, .xls, .csv, text/csv"
                        handleChangeFile={(event) => { handleFileChange(event, setFieldValue) }}
                        ref={fileUploadRef}
                      />
                    </Grid>

                    {values?.file_upload?.name &&
                      <>
                        <Grid color="#57ca22" width="100%" fontWeight={500}>Upload File Name:</Grid>
                        <Grid ><Chip variant='outlined' label="File Name: " sx={{ borderRadius: 0, height: 40 }} /><Chip color="success" variant="outlined" label={values.file_upload?.name} sx={{ borderRadius: 0, height: 40 }} /></Grid>
                      </>
                    }

                    <Grid width="100%">
                      <Grid pb={0.5}>Select Mobile Number: * (from upload file column) </Grid>
                      <AutoCompleteWrapper
                        minWidth="100%"
                        label=''
                        placeholder='select mobile number column... '
                        options={selectSheetHeaders?.map(i => {
                          return {
                            label: i,
                            id: i
                          }
                        }) || []}
                        value={values.contact_column}
                        handleChange={(e, value) => {
                          console.log("contact", value)
                          setFieldValue("contact_column", value)
                        }}
                      />
                    </Grid>

                    <Grid display="flex" width={'100%'} gap={1} mt={1} mb={0.5} justifyContent={'right'} >
                      {/* {selectSheetHeaders.map((value)=><Card sx={{p:1,my:'auto', borderRadius:0.5}} elevation={3}> {`\#{${value}}`}</Card>)} */}

                      <Grid display={"flex"} justifyContent={"right"} flexWrap={"wrap"} gap={0.5}>
                        {selectSheetHeaders.map((value, index) => <Chip key={index} color="primary" onClick={(e) => {
                          setFieldValue("body", (values.body || '') + ` #${value}#`)
                        }} sx={{ borderRadius: 0.5, fontSize: 13, fontWeight: 700 }} label={`#${value}#`} clickable />)}
                      </Grid>

                    </Grid>

                    {/* <DynamicSelectTemplate /> */}
                    <Grid container>
                      <Grid pb={0.5}> Enter SMS Content: *</Grid>
                      <TextAreaWrapper
                        sx={{ pb: 0 }}
                        label=""
                        name="body"
                        value={values.body}
                        touched={touched.body}
                        errors={errors.body}
                        handleChange={(v) => {
                          if (v.target.value.length > 1000) return;
                          handleChange(v);
                        }}
                        handleBlur={handleBlur}
                      />
                    </Grid>

                    <Grid sx={{ pb: 1, ml: 'auto' }}>
                      {`
                      ${values.body?.length ?? 0} characters | 
                      ${1000 - (values.body?.length ?? 0)} characters left |
                      ${!values.body?.length || values.body?.length === 0 ?
                          0
                          :
                          values.body?.length <= 160 ? 1 : Math.ceil(values.body?.length / 153)} SMS
                      `}
                    </Grid>

                  </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    type="submit"
                    sx={{ borderRadius: 0.5 }}
                    // handleClick={undefined}
                    variant="contained"
                    startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                    //@ts-ignore
                    disabled={Boolean(errors.submit) || isSubmitting}
                  >
                    {t(`${'Send Sms'}`)}
                  </Button>
                </DialogActions>
              </form>
            );
          }}
        </Formik>
      </Card>
    </>
  );
}

export default PageHeader;


const SheetJSFT = [
  "xlsx",
  "xlsb",
  "xlsm",
  "xls",
  "xml",
  "csv",
  "txt",
  "ods",
  "fods",
  "uos",
  "sylk",
  "dif",
  "dbf",
  "prn",
  "qpw",
  "123",
  "wb*",
  "wq*",
  "html",
  "htm"
]
  .map(function (x) {
    return "." + x;
  })
  .join(",");

/* generate an array of column objects */
// const make_cols = refstr => {
//   let o = [],
//     C = XLSX.utils.decode_range(refstr).e.c + 1;
//   for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i };
//   return o;
// };
