'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Grid, Typography } from '@mui/material';
import Steps from './admissionForm/Steps';
import { useRouter } from 'next/navigation';
import { LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import RegistrationFirstPart from './admissionForm/RegistrationFirstPart';
import RegistrationSecondPart from './admissionForm/RegistrationSecondPart';
import RegistrationThirdPart from './admissionForm/RegistrationThirdPart';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import PdfDatas from './admissionForm/PdfDatas';
import { useReactToPrint } from 'react-to-print';

const OnlineAdmission = ({ classes, academicYears, serverHost, school_id, studentAdmissionForm, school }) => {
  // console.log("classes,academicYears__", classes, academicYears);
  const router = useRouter();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [totalFormData, setTotalFormData] = useState({});
  const [classesFlag, setClassesFlag] = useState(false);
  const registration3rdPart = useRef(null);
  const componentRef = useRef(null);
  const central = useRef(null);
  const [pdfDatas, setPdfDatas] = useState({});

  const handleCreateClassClose = () => {
    router.push('/online-admission');
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid py={8}>
          <h1 className=" text-center text-3xl text-sky-700 font-semibold">Online Admission</h1>
          <br />
          {studentAdmissionForm?.file_url && (
            <Grid mx="auto" sx={{ display: 'flex', justifyContent: 'center' }}>
              <Link href={`${serverHost}/api/get_file/${studentAdmissionForm?.file_url}`} target="_blank" download={true}>
                <Button variant="contained" color="warning">
                  Download Form
                </Button>
              </Link>
            </Grid>
          )}
          <br />

          <Grid>
            <Steps activeStep={activeStep} setActiveStep={setActiveStep} />
          </Grid>
          <Grid
            container
            sx={{
              px: '10%',
              borderRadius: 1
            }}
          >
            <Grid
              sx={{
                backgroundColor: 'white',
                p: 2,
                boxShadow: 3,
                mt: 3
              }}
            >
              {activeStep === 0 && (
                <RegistrationFirstPart
                  setTotalFormData={setTotalFormData}
                  setActiveStep={setActiveStep}
                  handleCreateClassClose={handleCreateClassClose}
                />
              )}
              {activeStep === 1 && (
                <RegistrationSecondPart
                  totalFormData={totalFormData}
                  setTotalFormData={setTotalFormData}
                  setActiveStep={setActiveStep}
                  handleCreateClassClose={handleCreateClassClose}
                  classes={classes}
                  academicYears={academicYears}
                />
              )}
              {activeStep === 2 && (
                <RegistrationThirdPart
                  totalFormData={totalFormData}
                  setTotalFormData={setTotalFormData}
                  school_id={school_id}
                  setActiveStep={setActiveStep}
                  handleCreateClassClose={handleCreateClassClose}
                  setUsersFlag={setClassesFlag}
                  serverHost={serverHost}
                  ref={registration3rdPart}
                  setPdfDatas={setPdfDatas}
                  handlePrint={handlePrint}
                />
              )}
            </Grid>

            {/* <Data ref={central}>{marged?.map(i=><React.Fragment>{i}</React.Fragment>)}</Data> */}
          </Grid>
        </Grid>
      </LocalizationProvider>

      {Object.keys(pdfDatas).length > 0 && (
        <Grid display="grid" sx={{ width: '100%', pb: 8 }}>
          <Button variant="outlined" onClick={handlePrint} sx={{ mx: 'auto' }}>
            Download Submission Form
          </Button>
        </Grid>
      )}

      <Grid sx={{ height: 0, overflow: 'hidden' }}>
        <Grid ref={componentRef}>
          <PdfDatas school={school} values={pdfDatas} serverHost={serverHost} />
        </Grid>
      </Grid>
    </>
  );
};

const Data = ({ children }) => {
  return <>{children}</>;
};

export default OnlineAdmission;
