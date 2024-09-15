import PropTypes from 'prop-types';
import { Card, Grid, TableHead, TextField, Paper, RadioGroup, FormControlLabel, Radio, Table, TableBody, TableRow } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { forwardRef, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import dayjs from 'dayjs';
import { TableVirtuoso } from 'react-virtuoso';
import useNotistick from '@/hooks/useNotistick';
import { ClassAndSectionSelect } from '@/components/Attendence';

import { MobileDatePicker } from '@mui/lab';
import { ButtonWrapper, DisableButtonWrapper } from '@/components/ButtonWrapper';
import { AutoCompleteWrapper, EmptyAutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { TextFieldWrapper } from '@/components/TextFields';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { TableBodyCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';

const columns = [
  {
    width: 30,
    label: 'Name',
    dataKey: 'name'
  },
  {
    width: 30,
    label: 'Class roll no',
    dataKey: 'class_roll_no'
  },

  {
    width: 50,
    label: 'Attendence',
    dataKey: 'attendence'
  },
  {
    width: 30,
    label: 'Phone Number',
    dataKey: 'phone_number'
  }
];

const VirtuosoTableComponents = {
  Scroller: forwardRef((props, ref) => (
    // @ts-ignore
    <div component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => <Table {...props} style={{ borderCollapse: 'separate', width: '100%' }} />,
  TableHead,
  TableRow: ({ item: _item, ...props }) => <tr {...props} />,
  // @ts-ignore
  TableBody: forwardRef((props, ref) => <tbody {...props} ref={ref} />)
};

function fixedHeaderContent() {
  return (
    <tr>
      {columns.map((column) => (
        <th
          key={column.dataKey}
          align={'center'}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            padding: '10px 2px',
            marginBottom: '1px solid black',
            backgroundColor: 'white'
          }}
        >
          {column.label}
        </th>
      ))}
    </tr>
  );
}

// function rowContent(_index, row, setSectionAttendence) {
//   //  console.log("row__", row);

//   return columns.map((column) => (
//     <td
//       key={column.dataKey}
//       style={{
//         whiteSpace: 'nowrap',
//         minWidth: column.width,
//         padding: 3,
//         margin: 'auto',
//         textAlign: 'center'
//       }}
//     >
//       {column.dataKey == 'attendence' ? (
//         <AttendenceSwitch attendence={row['attendence']} employee_id={row.id} remark={row['remark']} setSectionAttendence={setSectionAttendence} />
//       ) : (
//         row[column.dataKey]
//       )}
//     </td>
//   ));
// }

const AttendenceSwitch = ({ attendence, remark, employee_id, setSectionAttendence }) => {
  const [attendenceValue, setAttendenceValue] = useState(attendence);
  const [remarkValue, setRemarkValue] = useState(remark);

  useEffect(() => {
    setAttendenceValue(attendence);
  }, [attendence]);

  useEffect(() => {
    if (!remark) {
      setRemarkValue('');
    } else {
      setRemarkValue(remark);
    }
  }, [remark]);

  const handleUpdate = (e) => {
    if (e) {
      setAttendenceValue(e.target.value);
      handleUpdateApi(e.target.value);
    }
  };

  const handleUpdateApi = (e) => {
    setSectionAttendence((prev) => {
      const temp = {
        employee_id,
        status: e
      };

      if (remarkValue) {
        temp['remark'] = remarkValue;
      }
      const isExistIndex = prev.findIndex((i) => i?.employee_id == employee_id);
      if (isExistIndex < 0) {
        return [...prev, temp];
      } else {
        prev[isExistIndex] = temp;
        return [...prev];
      }
    });
    // axios.patch(`/api/attendance/student?school_id=${user?.school_id}&section_id=${selectedSection?.id}&date=${date}&student_id=${student_id}&status=${e}${remarkValue ? `&remark=${remarkValue}` : ''}`)
    //   .then(() => {
    //     setAttendenceValue(e)
    //   })
    //   .catch(err => console.log(err))
  };

  return (
    <>
      <TableBodyCellWrapper>
        <RadioGroup
          row
          name="attendance"
          value={attendenceValue}
          onChange={handleUpdate}
          sx={{
            display: 'flex',
            flexWrap: 'nowrap'
          }}
        >
          <FormControlLabel value="present" control={<Radio />} label="Present" />
          <FormControlLabel value="absent" control={<Radio />} label="Absent" />
          <FormControlLabel value="late" control={<Radio />} label="Late" />
          <FormControlLabel value="half_holiday" control={<Radio />} label="Half Holiday" />
          <FormControlLabel value="holiday" control={<Radio />} label="Holiday" />
        </RadioGroup>
      </TableBodyCellWrapper>

      <TableBodyCellWrapper minWidth={200}>
        <Grid pt={0.5}>
          <TextFieldWrapper
            label=""
            name={'remarks'}
            value={remarkValue}
            handleChange={(e) => {
              setRemarkValue(e.target.value);
            }}
            handleBlur={(e) => {
              if (attendenceValue && remark !== '') {
                handleUpdateApi(attendenceValue);
              }
            }}
            touched={undefined}
            errors={undefined}
            pb={0.5}
          />
        </Grid>
      </TableBodyCellWrapper>
    </>
  );
};

const allAttandenceOptions = [
  { label: 'All Present', id: 'present' },
  { label: 'All Absent', id: 'absent' },
  { label: 'All Late', id: 'late' },
  { label: 'All Half Holiday', id: 'half_holiday' },
  { label: 'All Holiday', id: 'holiday' }
];

const Results = ({ selectedClass, setSelectedClass, selectedSection, setSelectedSection }) => {
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();
  const [targetsectionStudents, setTargetsectionStudents] = useState([]);
  const [students, setStudents] = useState(null);
  const [classes, setClasses] = useState([]);
  // updated code start
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now()));
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleList, setRoleList] = useState([]);
  const [targetRoleEmployees, setTargetRoleEmployees] = useState([]);
  // updated code end
  const [sectionAttendence, setSectionAttendence] = useState([]);

  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const { user } = useAuth();
  const [selectedForAll, setSelectedForAll] = useState(null);
  const [loading, setLoading] = useState(false);

  // updated code start
  useEffect(() => {
    axios
      .get(`/api/role`)
      .then((res) => setRoleList(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (user && selectedRole && academicYear) {
      setStudents(null);
      axios
        .get(`/api/role/${selectedRole?.label}?school_id=${user?.school_id}`)
        .then((res) => {
          setTargetRoleEmployees(res.data);
        })
        .catch((err) => {
          showNotification(err?.response?.data?.message, 'error');
          console.log(err);
        });
    }
  }, [user, selectedRole, academicYear]);

  // updated code end

  useEffect(() => {
    axios
      .get(`/api/class?school_id=${user?.school_id}`)
      .then((res) => setClasses(res.data))
      .catch((err) => console.log(err));
  }, []);

  // useEffect(() => {
  //   if (user && selectedSection && academicYear) {
  //     setStudents(null);
  //     axios
  //       .get(`/api/student?school_id=${user?.school_id}&section_id=${selectedSection?.id}&academic_year_id=${academicYear?.id}`)
  //       .then((res) => {
  //         setTargetsectionStudents(res.data);
  //       })
  //       .catch((err) => {
  //         showNotification(err?.response?.data?.message, 'error');
  //         console.log(err);
  //       });
  //   }
  // }, [user, selectedSection, academicYear]);

  const handleAttendenceFind = () => {
    if (selectedRole && selectedDate && academicYear) {
      setStudents(null);
      const date = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : '';

      axios
        .get(`/api/attendance/employee?school_id=${user?.school_id}&role_id=${selectedRole?.id}&date=${date}`)
        .then((response) => {
          const temp = targetRoleEmployees?.map((i) => {
            let attendance;
            let remark;
            const check = response.data?.find((j) => j?.user_id == i.user_id);

            if (check) {
              attendance = check.status;
              if (check.remark) {
                remark = check.remark;
              }
            }
            return {
              id: i.id,
              name: `${i.first_name} ${i.middle_name ? i.middle_name : ''} ${i.last_name ? i.last_name : ''}`,
              user_id: i.user_id,
              attendence: attendance,
              remark: remark,
              phone: i?.phone
            };
          });
          setStudents(temp);
        })
        .catch((err) => {
          console.log(err);
          // showNotification(err.message, 'error')
          showNotification(err?.response?.data?.message, 'error');
        });
    }
  };

  const handleSubmit = async () => {
    try {
      const date_ = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : '';
      const date = new Date(date_);
      if (selectedForAll) {
        const res = await axios.post(`/api/attendance/employee?school_id=${user?.school_id}&date=${date}&status=${selectedForAll.id}`, {
          attendence: sectionAttendence
        });
        if (res.status === 200) {
          setSelectedForAll(null);
          handleAttendenceFind();
          setSectionAttendence([]);
          showNotification('updated successfully');
        }
      } else {
        const res = await axios.post(`/api/attendance/employee?school_id=${user?.school_id}&date=${date}`, {
          attendence: sectionAttendence
        });

        if (res.status === 200) {
          setSelectedForAll(null);
          handleAttendenceFind();
          setSectionAttendence([]);
          showNotification('updated successfully');
        }
      }
    } catch (err) {
      handleShowErrMsg(err, showNotification);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid sx={{ minHeight: 'calc(100vh - 330px) !important' }}>
      <Card
        sx={{
          borderRadius: 0.4,
          p: 1,
          pb: 0,
          mb: 2,
          maxWidth: 1200,
          display: 'grid',
          gridTemplateColumns: {
            sx: '1fr',
            md: '1fr 2fr 1fr 1fr',
            sm: '2fr 2fr'
          },
          mx: 'auto',
          columnGap: 2
        }}
      >
        <Grid
          item
          sx={{
            minWidth: '200px'
          }}
        >
          <MobileDatePicker
            label="Select Date"
            inputFormat="dd/MM/yyyy"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            renderInput={(params) => (
              <TextField
                size="small"
                sx={{
                  minWidth: '100%',
                  [`& fieldset`]: {
                    borderRadius: 0.6
                  },
                  mb: 1
                }}
                fullWidth
                {...params}
              />
            )}
          />
        </Grid>

        {selectedDate ? (
          <AutoCompleteWrapper
            minWidth="100%"
            label={t('Select Role')}
            placeholder={t('Role...')}
            limitTags={2}
            // getOptionLabel={(option) => option.id}
            options={roleList.map((i) => {
              return {
                label: i.title,
                id: i.id
              };
            })}
            value={undefined}
            handleChange={(e, v) => setSelectedRole(v ? v : null)}
          />
        ) : (
          <EmptyAutoCompleteWrapper label={t('Select Role')} placeholder={t('Role...')} options={[]} value={undefined} />
        )}

        {selectedRole ? (
          <ButtonWrapper handleClick={() => handleAttendenceFind()}>Find</ButtonWrapper>
        ) : (
          <DisableButtonWrapper>Find</DisableButtonWrapper>
        )}
        {students && students.length > 0 ? (
          <Grid>
            <AutoCompleteWrapper
              minWidth={200}
              options={allAttandenceOptions}
              value={selectedForAll}
              handleChange={(e, value: any) => {
                if (value) {
                  if (value.id !== 'notTaken') {
                    setSelectedForAll(value);
                    // setSectionAttendence state update code start
                    setSectionAttendence(
                      students?.map((item) => {
                        return {
                          employee_id: item.user_id
                        };
                      })
                    );
                    // setSectionAttendence state update code end
                  } else setSelectedForAll(null);
                }
              }}
              label={'Select For Everyone'}
              placeholder={'Everyone...'}
            />
          </Grid>
        ) : (
          <EmptyAutoCompleteWrapper label={'Select For Everyone'} placeholder={'Everyone...'} options={[]} value={undefined} />
        )}
      </Card>

      <Grid container spacing={0} justifyContent={'flex-end'}>
        <Paper sx={{ height: '55vh', width: '100%', borderRadius: 0.5, overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ position: 'sticky', background: 'white', top: -1, zIndex: 10, width: '100%', height: '100%' }}>
                <TableHeaderCellWrapper>
                  <Grid py={0.5}>Name</Grid>
                </TableHeaderCellWrapper>
                <TableHeaderCellWrapper>User Id</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Attendence</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Remarks</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Phone Number</TableHeaderCellWrapper>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* < */}
              {students?.map((std) => {
                return (
                  <TableRow key={std.id}>
                    <TableBodyCellWrapper>
                      <Grid textTransform="capitalize">{std?.name}</Grid>{' '}
                    </TableBodyCellWrapper>
                    <TableBodyCellWrapper>{std.user_id} </TableBodyCellWrapper>
                    {/* attendence with remarks components */}

                    <AttendenceSwitch
                      attendence={std.attendence}
                      remark={std.remark}
                      employee_id={std.user_id}
                      setSectionAttendence={setSectionAttendence}
                    />
                    <TableBodyCellWrapper>{std?.phone} </TableBodyCellWrapper>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
      <Grid item justifyContent="flex-end" pt={1}>
        <ButtonWrapper disabled={loading ? true : false} handleClick={handleSubmit}>
          submit
        </ButtonWrapper>
      </Grid>
    </Grid>
  );
};

Results.propTypes = {
  schools: PropTypes.array.isRequired
};

Results.defaultProps = {
  schools: []
};

export default Results;
