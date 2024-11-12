import Head from 'next/head';
import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Typography, Grid } from '@mui/material';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { SearchingButtonWrapper } from '@/components/ButtonWrapper';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import { TableBodyCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';
import { monthList } from '@/utils/getDay';
import { AutoCompleteWrapperWithDebounce } from '@/components/AutoCompleteWrapper';
import Footer from '@/components/Footer';
import { useState, ChangeEvent, useContext, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { useClientFetch } from 'src/hooks/useClientFetch';
import axios from 'axios';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import useNotistick from '@/hooks/useNotistick';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '@/hooks/useAuth';

// month related code start
const currentDate = new Date();
const monthIndex = currentDate.getMonth();
const monthData = monthList.map((month) => ({ label: month, value: month }));
const currentMonthName = monthList[monthIndex];
// month related code end

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)'
  },
  ':hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.10)'
  }
}));

const TableContent = ({ totalCalculation, studentDueInfo, selectedClass }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
      <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableHeaderCellWrapper>SL</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Student Id</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Name</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Class</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Group</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Batch</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Roll</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Year</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Payable Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Paid Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Discount Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Due Amount</TableHeaderCellWrapper>
          </TableRow>
        </TableHead>
        <TableBody>
          {studentDueInfo?.map((item, i) => {
            return (
              <StyledTableRow>
                <TableBodyCellWrapper>
                  <Grid py={0.5}>{i + 1}</Grid>{' '}
                </TableBodyCellWrapper>
                <TableBodyCellWrapper>{item.student_info.student_id}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{`${item.student_info.first_name ? item.student_info.first_name : ''} ${
                  item.student_info.middle_name ? item.student_info.middle_name : ''
                } ${item.student_info.last_name ? item.student_info.last_name : ''}`}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{selectedClass.label}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item?.group?.title && item?.group?.title}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item?.section?.name && item?.section?.name}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item.class_roll_no}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item?.academic_year?.title}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item.total_payable}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item.collected_amount}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{parseFloat(item.discount_amount?.toFixed(2)) + parseFloat(item.total_on_time_discount)}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item.total_payable - item.collected_amount}</TableBodyCellWrapper>
              </StyledTableRow>
            );
          })}

          <TableRow>
            <TableBodyCellWrapper colspan={8}>
              <Grid py={0.5} textAlign={'right'}>
                {' '}
                Total
              </Grid>{' '}
            </TableBodyCellWrapper>
            <TableBodyCellWrapper colspan={4}>{totalCalculation?.totalDueAmount}</TableBodyCellWrapper>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const PrintData = ({ studentDueInfo, totalCalculation, selectedClass }) => {
  const { user } = useAuth();
  const { school } = user || {};
  const { name, address } = school || {};
  return (
    <Grid mx={1}>
      <Grid textAlign="center" fontWeight={500} lineHeight={3} pt={5}>
        <Typography variant="h3" fontWeight={500}>
          {name}
        </Typography>
        <h4>{address}</h4>
        <Typography variant="h4">Student Due Report</Typography>
      </Grid>

      <TableContent studentDueInfo={studentDueInfo} totalCalculation={totalCalculation} selectedClass={selectedClass} />
    </Grid>
  );
};

const StudentDueReport = () => {
  const { showNotification } = useNotistick();
  const [selected_month, setSelectMonth] = useState<string | null>(currentMonthName);
  const [selectedClass, setSelectedClass] = useState(null);
  const [sections, setSections] = useState<Array<any>>([]);
  const [groups, setGroups] = useState<Array<any>>([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [studentInfo, setStudentInfo] = useState<Array<any>>([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [isLoading, setIsLoading] = useState(false);
  const [studentDueInfo, setStudentDueInfo] = useState<Array<any>>([]);
  const [totalCalculation, setTotalCalculation] = useState<any>({ totalDueAmount: 0 });

  const { data: classData, error: classError } = useClientFetch('/api/class');

  const monthHandleChange = (event: ChangeEvent<HTMLInputElement>, v): void => {
    setSelectMonth(v);
  };
  const handleGroupSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    setSelectedGroup(newValue);
  };
  const handleSectionSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    if (!newValue) {
      setStudentInfo([]);
      setSelectedStudent(null);
      setSelectedSection(null);
      return;
    }
    setSelectedSection(newValue);
    let sectionIdArr = [];
    if (newValue.label === 'Select all') {
      sectionIdArr = sections.filter((item) => item.id !== null).map((item) => item.id);
    } else {
      sectionIdArr = [newValue.id];
    }
    // call student api here
    getStudentInfo(sectionIdArr);
  };
  const handleStudentSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    // setSelectedStudent

    if (newValue) {
      // setSelectedStudent({
      //   label: newValue?.name,
      //   id: newValue?.id
      // });
      setSelectedStudent(newValue);
    } else {
      setSelectedStudent(null);
    }
  };

  const handleClassSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    if (newValue) {
      const targetClassSections = classData.find((i) => i.id == newValue.id);
      setSelectedClass(newValue);

      const setTargetSection = targetClassSections?.sections?.map((i) => {
        return {
          label: i.name,
          id: i.id
        };
      });
      setSections([
        {
          label: 'Select all',
          id: null
        },
        ...setTargetSection
      ]);
      const setTargetGroup = targetClassSections?.Group?.map((i) => {
        return {
          label: i?.title,
          id: i.id
        };
      });

      setGroups([
        {
          label: 'Select all',
          id: null
        },
        ...setTargetGroup
      ]);
      if (!newValue.has_section) {
        setSelectedSection({
          label: targetClassSections?.sections[0]?.name,
          id: targetClassSections?.sections[0]?.id
        });
      } else {
        setSelectedSection(null);
      }
    } else {
      setStudentInfo([]);
      setSections([]);
      setSelectedSection(null);
      setGroups([]);
      setSelectedGroup(null);
    }
  };
  const studentList = (student) => {
    let studentInfo = '';

    if (student?.student_info?.first_name) {
      studentInfo += student?.student_info?.first_name;
    }
    if (student?.class_roll_no) {
      studentInfo += '|' + student?.class_roll_no;
    }
    if (student?.student_info?.student_id) {
      studentInfo += '|' + student?.student_info?.student_id;
    }

    return studentInfo;
  };

  // fetch student related data code start
  const getStudentInfo = (section) => {
    axios
      .get(`/api/student/?section_id=${section}&academic_year_id=${academicYear?.id}`)
      .then((res) => {
        setStudentInfo(res?.data);

        // setSections([
        //   {
        //     label: 'Select all',
        //     id: null
        //   },
        //   ...setTargetSection
        // ]);
      })
      .catch((err) => {
        setStudentInfo([]);
        // console.log(err);
      });
  };
  // fetch student related data code end

  const handleClickStudentInfo = async () => {
    try {
      if (!selected_month || !selectedClass || !selectedSection || !selectedStudent) {
        showNotification('Please select a month, class, batch and student before proceeding', 'error');
        return;
      }
      setIsLoading(true);

      let groupsIds = [];
      let sectionIds = [];
      let studentIds = [];
      // group start
      if (!selectedGroup) {
      } else if (selectedGroup.label === 'Select all') {
        groupsIds = groups.filter((item) => item.id !== null).map((item) => item.id);
      } else {
        groupsIds = [selectedGroup.id];
      }
      // group end
      // section start
      if (selectedSection.label === 'Select all') {
        sectionIds = sections.filter((item) => item.id !== null).map((item) => item.id);
      } else {
        sectionIds = [selectedSection.id];
      }
      // section end
      // student start
      if (selectedStudent.label === 'Select all') {
        studentIds = studentInfo.map((item) => item.id);
      } else {
        studentIds = [selectedStudent.id];
      }
      // student end

      const res = await axios.get(
        `/api/reports/student_due_report?month_name=${selected_month}&selected_class=${selectedClass.id}&selected_group=${
          groupsIds.length > 0 ? groupsIds : ''
        }&selected_section=${sectionIds}&selected_student=${studentIds}`
      );

      let totalPayableAmount = 0;
      let totalPaidAmount = 0;
      let totalDiscountAmount = 0;
      let totalDueAmount = 0;

      if (res?.data?.studentDueInfo?.length > 0) {
        const totalAmountsByStudentId = calculateTotalAmountsByStudentId(res?.data?.studentDueInfo);
        const resultArray = Object.values(totalAmountsByStudentId);

        // total calculation part code start

        if (resultArray.length > 0) {
          resultArray.forEach((item) => {
            //  @ts-ignore
            totalPayableAmount = totalPayableAmount + item?.total_payable;
            //  @ts-ignore
            totalPaidAmount = totalPaidAmount + item?.collected_amount;
            //  @ts-ignore
            totalDiscountAmount = totalDiscountAmount + item?.total_on_time_discount + item?.previous_discount;
            //  @ts-ignore
            totalDueAmount = totalDueAmount + (item.total_payable - item.collected_amount);
          });
        }
        setTotalCalculation({
          totalPayableAmount: totalPayableAmount,
          totalPaidAmount: totalPaidAmount,
          totalDiscountAmount: totalDiscountAmount,
          totalDueAmount: totalDueAmount
        });
        setStudentDueInfo(resultArray);
      } else {
        setStudentDueInfo([]);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const calculateTotalAmountsByStudentId = (arr) => {
    return arr.reduce((acc, item) => {
      const { student, collected_amount, on_time_discount, total_payable, fee } = item;
      const { id } = student;

      // Calculate current discounts for percent and flat
      const currentPercentDiscount = fee?.Discount?.filter((d) => d.type === 'percent').reduce((sum, discount) => sum + (discount.amt || 0), 0) || 0;
      const currentFlatDiscount = fee?.Discount?.filter((d) => d.type === 'flat').reduce((sum, discount) => sum + (discount.amt || 0), 0) || 0;

      // Calculate current discount amount for percentage
      const currentPercentDiscountAmount =
        fee?.Discount?.filter((d) => d.type === 'percent').reduce((sum, discount) => sum + fee.amount * (discount.amt / 100), 0) || 0;

      // Accumulate previous discounts
      const previousPercentDiscount = acc[id] ? acc[id].previous_percent_discount + currentPercentDiscount : currentPercentDiscount;
      const previousFlatDiscount = acc[id] ? acc[id].previous_flat_discount + currentFlatDiscount : currentFlatDiscount;
      const totalOnTimeDiscount = acc[id] ? acc[id].total_on_time_discount + on_time_discount : on_time_discount;

      const totalDiscountAmount = currentPercentDiscountAmount + currentFlatDiscount;

      if (acc[id]) {
        acc[id].collected_amount += collected_amount;
        acc[id].total_payable += total_payable;
        acc[id].previous_percent_discount = previousPercentDiscount;
        acc[id].previous_flat_discount = previousFlatDiscount;
        acc[id].total_on_time_discount = totalOnTimeDiscount;
        acc[id].discount_amount += totalDiscountAmount;
      } else {
        acc[id] = {
          ...student,
          ...student.student_info,
          collected_amount,
          total_payable,
          fee,
          previous_percent_discount: previousPercentDiscount,
          previous_flat_discount: previousFlatDiscount,
          total_on_time_discount: totalOnTimeDiscount,
          discount_amount: totalDiscountAmount
        };
      }

      return acc;
    }, {});
  };
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });

  return (
    <>
      {/*  print report */}
      <Grid display="none">
        <Grid ref={componentRef}>
          <PrintData studentDueInfo={studentDueInfo} totalCalculation={totalCalculation} selectedClass={selectedClass} />
        </Grid>
      </Grid>

      <Head>
        <title>Student Due Report</title>
      </Head>
      <Typography
        variant="h4"
        textTransform="uppercase"
        py={{
          md: 3,
          xs: 2
        }}
        px={2}
      >
        Student Due Report
      </Typography>
      {/* searching part code start */}
      <Grid display="grid" gridTemplateColumns="1fr" rowGap={{ xs: 1, md: 0 }} px={1} mt={1} minHeight="fit-content">
        {/* split your code start */}
        <Grid
          sx={{
            overflow: 'hidden',
            backgroundColor: '#fff'
          }}
        >
          <Grid px={1} pt="9px">
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                columnGap: '20px',
                rowGap: '0',
                flexWrap: 'wrap'
              }}
            >
              {/* Month field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '30%',
                    xl: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapperWithDebounce
                  debounceTimeout=""
                  options={monthData}
                  value={selected_month}
                  // value={undefined}
                  handleChange={monthHandleChange}
                  label="Select Month"
                  placeholder="Month To"
                />
              </Grid>

              {/* Class field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '30%',
                    xl: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapper
                  options={
                    classData?.map((i) => {
                      return {
                        label: i.name,
                        id: i.id,
                        has_section: i.has_section
                      };
                    }) || []
                  }
                  value={selectedClass}
                  label="Select Class *"
                  placeholder="Select a Class"
                  handleChange={handleClassSelect}
                />
              </Grid>

              {/* Group field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '30%',
                    xl: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapper
                  options={groups}
                  value={selectedGroup}
                  label="Select Group"
                  placeholder="Select a Group"
                  handleChange={handleGroupSelect}
                />
              </Grid>

              {/* Section field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '30%',
                    xl: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapper
                  options={sections}
                  value={selectedSection}
                  label="Select Batch"
                  placeholder="Select a Batch"
                  handleChange={handleSectionSelect}
                />
              </Grid>
              {/* Student field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '30%',
                    xl: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapper
                  options={
                    studentInfo.length > 0
                      ? [
                          {
                            label: 'Select all',
                            id: null,
                            name: ''
                          },
                          ...studentInfo?.map((i) => {
                            return {
                              label: studentList(i),
                              id: i.id,
                              name: i?.student_info?.first_name
                            };
                          })
                        ]
                      : []
                  }
                  value={selectedStudent}
                  label="Select Student"
                  placeholder="select a student"
                  handleChange={handleStudentSelect}
                />
              </Grid>

              {/* Search button */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '30%',
                    xl: '15%'
                  },
                  flexGrow: 1,
                  position: 'relative',
                  display: 'flex',
                  gap: 1
                }}
              >
                <Grid
                  sx={{
                    flexGrow: 1
                  }}
                >
                  <SearchingButtonWrapper isLoading={isLoading} handleClick={handleClickStudentInfo} disabled={isLoading} children={'Search'} />
                </Grid>
                <Grid
                  sx={{
                    flexGrow: 1
                  }}
                >
                  <SearchingButtonWrapper
                    isLoading={false}
                    handleClick={handlePrint}
                    disabled={studentDueInfo.length === 0 ? true : false}
                    children={'Print'}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* split your code end */}
      </Grid>
      {/* searching part code end */}

      {/* table code part start */}

      <Grid
        mt={3}
        mb={4}
        px={1}
        sx={{
          width: {
            xs: '100vw',
            md: '100%'
          },
          minHeight: {
            xs: 150,
            md: 'calc(100dvh - 378px)'
          }
        }}
      >
        <TableContent studentDueInfo={studentDueInfo} totalCalculation={totalCalculation} selectedClass={selectedClass} />
      </Grid>
      {/* table code part end */}
      {/* footer */}
      <Footer />
    </>
  );
};

StudentDueReport.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_admit_card', 'show_admit_card']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default StudentDueReport;
