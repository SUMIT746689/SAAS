import Steps from '@/content/Management/Students/Registration/Steps';
import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import RegistrationFirstPart from '@/content/Management/Students/RegistrationFirstPart';
import RegistrationSecondPart from '@/content/Management/Students/RegistrationSecondPart';
import RegistrationThirdPart from '@/content/Management/Students/RegistrationThirdPart';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function StudentForm({ student = null, handleClose = null, onlineAdmission_id = null }) {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [totalFormData, setTotalFormData] = useState({});
  const [classesFlag, setClassesFlag] = useState(false);
  const [academicYears, setacademicYears] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axios
      .get('/api/academic_years')
      .then((res) =>
        setacademicYears(
          res?.data?.data?.map((i) => {
            return {
              label: i.title,
              id: i.id
            };
          }) || []
        )
      )
      .catch((err) => console.log(err));

    axios
      .get('/api/class')
      .then((res) => {
        setClasses(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleCreateClassClose = () => {
    if (handleClose) handleClose();
    else router.push('/management/students');
  };
  console.log("totalFormData___", totalFormData);
  return (
    <>
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
              student={student}
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
              student={student}
            />
          )}
          {activeStep === 2 && (
            <RegistrationThirdPart
              totalFormData={totalFormData}
              setTotalFormData={setTotalFormData}
              setActiveStep={setActiveStep}
              handleCreateClassClose={handleCreateClassClose}
              setUsersFlag={setClassesFlag}
              student={student}
              onlineAdmission_id={onlineAdmission_id}
              handleClose={handleClose}
            />
          )}
        </Grid>
      </Grid>
    </>
  )
}