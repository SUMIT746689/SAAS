import { Authenticated } from '@/components/Authenticated';
import Footer from '@/components/Footer';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Button, ButtonGroup, Grid } from '@mui/material';
import Head from 'next/head';
import PageBodyWrapper from '@/components/PageBodyWrapper';
import EmailPage from '@/content/BulkSmsAndEmail/SendEmail/EmailPage';
import FileUploadSentEmailPage from '@/content/BulkSmsAndEmail/SendEmail/FileUploadSentEmail';
import { useState } from 'react';

const Packages = () => {
  const [type, setType] = useState("EMAIL")
  return (
    <>
      <Head>
        <title>Send EMAIL or Email</title>
      </Head>
      <PageBodyWrapper>
        <Grid
          // sx={{ display: 'flex', marginX: 'auto' }}
          // justifyContent="center"
          gap={2}
          px={1}
        >
          <Grid display="flex" justifyContent="center">
            <ButtonGroup
              disableElevation
              variant="contained"
              aria-label="Disabled elevation buttons"
              sx={{ borderRadius: 0.5, mt: 1 }}
            >
              <Button onClick={() => { setType("EMAIL") }} variant={type === "EMAIL" ? "contained" : "outlined"} sx={{ borderRadius: 0.5 }}> SENT EMAIL</Button>
              <Button onClick={() => { setType("UPLOAD_FILE") }} variant={type === "UPLOAD_FILE" ? "contained" : "outlined"} sx={{ borderRadius: 0.5 }}> UPLOAD FILE </Button>
            </ButtonGroup>
          </Grid>

          {type === "EMAIL" ?
            <EmailPage />
            :
            <FileUploadSentEmailPage />
          }
        </Grid>

        <Footer />
      </PageBodyWrapper>
    </>
  );
};

Packages.getLayout = (page) => (
  <Authenticated >
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Packages;
