import { useClientFetch } from '@/hooks/useClientFetch';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { FC, useEffect, useState } from 'react';
const color = '#00C6FF';
type AttendanceProps = {
  todayAttendance: any;
};
export const Attendance: FC<AttendanceProps> = ({ todayAttendance }) => {
  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1;
  // console.log(currentMonth)
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth + 1);

  const [studentsAttendPercent, setStudentsAttendPercent] = useState(0);
  const [teachersAttendPercent, setTeachersAttendPercent] = useState(0);
  const [employeesAttendPercent, setEmployeesAttendPercent] = useState(0);
  const [addtedanceFilter, setAttendancesFilter] = useState('Today');

  const studentsAttendance = (start_date, end_date) => {
    let url = `/api/attendance/day_wise/students?start_date=${start_date}&end_date=${end_date}`;
    axios
      .get(url)
      .then((response) => {
        // console.log({ "response   ":response });
        if (!Array.isArray(response.data)) setStudentsAttendPercent(0);
        setStudentsAttendPercent(parseInt(response.data?.attendance_percent) || 0);
      })
      .catch((error) => {
        console.log({ error });
      });
  };
  const teachersAttendance = (start_date, end_date) => {
    let url = `/api/attendance/day_wise/teachers?start_date=${start_date}&end_date=${end_date}`;
    axios
      .get(url)
      .then((responseByTeacher) => {
        // console.log("responseByTeacher" ,responseByTeacher );
        if (!Array.isArray(responseByTeacher.data)) setTeachersAttendPercent(0);
        setTeachersAttendPercent(parseInt(responseByTeacher.data?.attendance_percent) || 0);
      })
      .catch((error) => {
        console.log({ error });
      });
  };
  const employeesAttendance = (start_date, end_date) => {
    let url = `/api/attendance/day_wise/employees?start_date=${start_date}&end_date=${end_date}`;

    axios
      .get(url)
      .then((response) => {
        // console.log({ response });
        if (!Array.isArray(response.data)) setEmployeesAttendPercent(0);
        setEmployeesAttendPercent(parseInt(response.data?.attendance_percent) || 0);
      })
      .catch((error) => {
        console.log({ error });
      });
  };

  useEffect(() => {
    let start_date = new Date(currentYear, currentMonth - 1, 1).toISOString();
    let end_date = new Date(currentYear, currentMonth - 1, 1).toISOString();

    if (addtedanceFilter === 'Today') {
      start_date = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      end_date = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
    } else if (addtedanceFilter === 'This Week') {
      const curr = new Date('Sat, 24 Aug 2024 11:53:52 GMT');
      const customDay = [1, 2, 3, 4, 5, 6, 0];
      const first = curr.getDate() - customDay[curr.getDay()];
      start_date = new Date(curr.setDate(first)).toISOString();
      end_date = new Date(Date.now()).toISOString();
    }
    // else if (addtedanceFilter === 'This Month') {
    //   const curr = new Date();
    //   const firstDayOfMonth = new Date(curr.getFullYear(), curr.getMonth(), 1);
    //   start_date = new Date(firstDayOfMonth).toISOString();
    //   end_date = new Date(Date.now()).toISOString();
    //   console.log({end_date})
    // }
    else {
      start_date = new Date(currentYear, currentMonth - 1, 1).toISOString();
      end_date = new Date(currentYear, currentMonth - 1, daysInCurrentMonth + 1).toISOString();
    }
    studentsAttendance(start_date, end_date);
    teachersAttendance(start_date, end_date);
    employeesAttendance(start_date, end_date);
  }, [addtedanceFilter]);

  return (
    <Card sx={{ py: 1, px: 1 }}>
      <Grid sx={{ fontSize: { xs: 16, xl: 18 }, fontWeight: 700, textAlign: 'center' }}>Attendance</Grid>

      {/* <Grid display="grid" gridTemplateColumns={'1fr 1fr 1fr'} py={2} columnGap={0.5}> */}
      <Grid display="flex" justifyContent={'space-between'} maxWidth={200} mx="auto" pt={2} columnGap={0.5}>
        <ButtonWrapper
          isActive={addtedanceFilter}
          handleClick={() => {
            setAttendancesFilter('Today');
          }}
        >
          Today
        </ButtonWrapper>
        <ButtonWrapper
          isActive={addtedanceFilter}
          handleClick={() => {
            setAttendancesFilter('This Week');
          }}
        >
          This Week
        </ButtonWrapper>
        <ButtonWrapper
          isActive={addtedanceFilter}
          handleClick={() => {
            setAttendancesFilter('This Month');
          }}
        >
          This Month
        </ButtonWrapper>
      </Grid>

      <Grid
        sx={{
          display: 'grid',
          gap: 0.5,
          pt: 0.5
          // borderTop: '1px solid lightgray'
        }}
      >
        <ChartCard color="#FF715B" title="Students" width={`${studentsAttendPercent || 0}%`} />
        <ChartCard color="#34D1BF" title="Teachers" width={`${teachersAttendPercent}%`} />
        <ChartCard color="#0496FF" title="Staffs" width={`${employeesAttendPercent}%`} />
      </Grid>
    </Card>
  );
};

const ButtonWrapper = ({ isActive, handleClick, children }) => {
  return (
    <Button
      onClick={handleClick}
      variant="contained"
      sx={{
        backgroundColor: isActive === children ? ' #00C6FF' : '#e6f9ff',
        color: isActive === children ? 'white' : '#00C6FF',
        ':hover': {
          backgroundColor: isActive === children ? ' #00C6FF' : '#e6f9ff',
          color: isActive === children ? 'white' : '#00C6FF'
        },
        fontSize: 9,
        borderRadius: 0.5,
        px: 0,
        py: 0.5
      }}
    >
      {children}
    </Button>
  );
};

const ChartCard = ({ width, title, color }) => {
  return (
    <>
      <Grid fontWeight={700} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Grid fontSize={10}>{title}</Grid>
        <Grid fontSize={10} my="auto" color={color}>
          {width}
        </Grid>
      </Grid>

      <Grid sx={{ position: 'relative' }}>
        <Grid
          sx={{
            zIndex: 20,
            top: 0,
            left: 0,
            position: 'absolute',
            backgroundColor: color,
            height: 7,
            width: { width },
            transition: 'width 0.5s ease-in-out',
            borderRadius: 0.5
          }}
        ></Grid>
        <Grid
          sx={{ zIndex: 30, top: 0, left: 0, backgroundColor: 'lightgray', height: 7, width: '100%', transition: 'width 5sec', borderRadius: 0.5 }}
        ></Grid>
      </Grid>
    </>
  );
};
