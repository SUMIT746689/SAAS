'use client';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Grid, DialogContent, TextField, Typography, Card } from '@mui/material';
import Image from 'next/image';

function PdfDatas({ school, values, serverHost }) {
  const { t }: { t: any } = useTranslation();

  return (
    <>
      <Grid display="grid" sx={{ p: 8, pageBreakBefore: 'always', pageBreakInside: 'avoid' }}>
        <Grid display="grid" gridTemplateColumns="1fr 1fr 1fr" justifyContent="space-between">
          <Grid sx={{ borderRadius: 1, overflow: 'hidden', border: '5px solid white', height: 150, width: 150 }}>
            <Image
              src={`${serverHost}/api/get_file/${school?.websiteui[0].header_image?.replace(/\\/g, '/')}`}
              width={150}
              height={150}
              alt={'school_image'}
              loading="lazy"
              objectFit="contain"
              objectPosition="center"
            />
          </Grid>

          <Grid fontFamily="cursive" textAlign="center" pt={4}>
            <Typography variant="h5" color="goldenrod" fontFamily="cursive">
              {school?.name}
            </Typography>
            <Grid>{school?.address}</Grid>
          </Grid>

          <Grid display="flex" justifyContent="end">
            <Card sx={{ borderRadius: 1, overflow: 'hidden', border: '5px solid white', height: 100, width: 100, boxShadow: 0.5 }}>
              {
                values?.student?.student_photo_path && (
                  <Image
                    src={`${serverHost}/api/get_file/${values?.student?.student_photo_path?.replace(/\\/g, '/')}`}
                    width={150}
                    height={150}
                    alt={'Student Photo'}
                    loading="lazy"
                    objectFit="contain"
                    objectPosition="center"
                  />
                )
                // <ShowImage file={values?.student?.student_photo_path} alt={"Student Photo"} />
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
                value={values?.student?.first_name ?? ''}
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
                value={values?.student?.middle_name ?? ''}
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
                value={values?.student?.last_name ?? ''}
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
                value={values?.student?.admission_date ?? '' ? dayjs(values?.student?.admission_date).format('DD/MM/YYYY h:mm A') : ''}
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
                value={values?.student?.date_of_birth ?? '' ? dayjs(values?.student?.date_of_birth).format('DD/MM/YYYY') : ''}
                variant="outlined"
              />
            </Grid>

            {/* phone */}
            <Grid item xs={6}>
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
                value={values?.student?.phone ?? ''}
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
                value={values?.student?.class_name ?? ''}
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
                value={values?.student?.academic_year_title ?? ''}
                variant="outlined"
              />
            </Grid>

            {/* father_name */}
            <Grid item xs={12}>
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
                value={values?.student?.father_name ?? ''}
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
                value={values?.student?.father_phone ?? ''}
                variant="outlined"
              />
            </Grid>

            {/* mother_name */}
            <Grid item xs={12}>
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
                value={values?.student?.mother_name ?? ''}
                variant="outlined"
              />
            </Grid>

            {/* mother_phone */}
            <Grid item xs={6}>
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
                value={values?.student?.mother_phone ?? ''}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Grid sx={{ display: 'flex', justifyContent: 'space-between', px: 10, pt: 8 }}>
          {/* <Grid sx={{ borderTop: "1px solid lightgray" }}>Guardian Signature</Grid> */}
          <Grid item xs={6}>
            <TextField
              size="small"
              sx={{
                '& fieldset': {
                  borderRadius: '3px'
                }
              }}
              fullWidth
              label={t('')}
              name="mother_phone"
              type="text"
              value={values?.student?.mother_phone ?? ''}
              variant="outlined"
            />
          </Grid>

          <Grid sx={{ borderTop: '1px solid lightgray', mt: 8 }}>Principal Signature</Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default PdfDatas;
