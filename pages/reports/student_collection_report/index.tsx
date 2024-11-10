import Head from 'next/head';
import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Typography, Grid, selectClasses } from '@mui/material';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { SearchingButtonWrapper } from '@/components/ButtonWrapper';
import { DatePickerWrapper } from '@/components/DatePickerWrapper';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import { TableBodyCellWrapper, TableHeaderCellWrapper, TableFooterCellWrapper } from '@/components/Table/Table';
import { useState, ChangeEvent, useRef } from 'react';
import dayjs from 'dayjs';
import { useClientFetch } from 'src/hooks/useClientFetch';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import Footer from '@/components/Footer';

import { styled } from '@mui/material/styles';
import { formatNumber } from '@/utils/numberFormat';
import { useAuth } from '@/hooks/useAuth';
import { useReactToPrint } from 'react-to-print';
import { handleEndDate, handleStartDate } from '@/utils/customizeDate';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)'
  },
  ':hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.10)'
  }
  // hide last border
  // '&:last-child td, &:last-child th': {
  //   border: 0
  // }
}));

const TableContent = ({ studentFees, selectedClass, totalPreviousAmt, totalDiscountAmt, totalPaymentAmt, totalDueAmt }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
      <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableHeaderCellWrapper>SL</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Fees Name</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Student Id</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Student Name</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Collection Date</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Class</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Group</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Batch</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Roll</TableHeaderCellWrapper>
            {/* <TableHeaderCellWrapper>Payable Amount</TableHeaderCellWrapper> */}
            <TableHeaderCellWrapper>Previous Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Discount Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Payment</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Total Due Amount</TableHeaderCellWrapper>
          </TableRow>
        </TableHead>
        <TableBody>
          {studentFees?.map((item, i) => {
            return (
              <StyledTableRow
                key={i}
                sx={
                  {
                    //   '&:last-child td, &:last-child th': { border: 0 }
                  }
                }
              >
                <TableBodyCellWrapper>
                  <Grid py={0.5}>{i + 1}</Grid>{' '}
                </TableBodyCellWrapper>
                <TableBodyCellWrapper>{item?.transaction?.voucher_name}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item.student?.student_info?.student_id}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{`${item.student.student_info.first_name ? item.student.student_info.first_name + ' ' : ''}
                ${item.student.student_info.middle_name ? item.student.student_info.middle_name + ' ' : ''}
                ${item.student.student_info.last_name ? item.student.student_info.last_name + ' ' : ''}`}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item?.collection_date ? dayjs(item?.collection_date).format('DD-MM-YYYY, hh:mm a'): ''}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{selectedClass?.label}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item.student?.group?.title}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{Array.isArray(item?.student?.batches) && item?.student?.batches.map(batch => batch.name).join(', ')}</TableBodyCellWrapper>
                <TableBodyCellWrapper>{item.student?.class_roll_no}</TableBodyCellWrapper>
                {/* <TableBodyCellWrapper align="right">{formatNumber(item.total_payable || 0)}</TableBodyCellWrapper> */}
                <TableBodyCellWrapper align="right">{formatNumber(item.collected_amount || 0)}</TableBodyCellWrapper>
                <TableBodyCellWrapper align="right">
                  {' '}
                  {formatNumber((item.discount ? item.discount : 0 + item.on_time_discount) || 0)}
                </TableBodyCellWrapper>
                <TableBodyCellWrapper align="right">{formatNumber(item.collected_amount || 0)} </TableBodyCellWrapper>
                <TableBodyCellWrapper align="right">{formatNumber(item.total_payable - item.collected_amount)}</TableBodyCellWrapper>
              </StyledTableRow>
            );
          })}
        </TableBody>
        {/* <TableFooter>
          <TableFooterCellWrapper colSpan={8} align="right">
            Total
          </TableFooterCellWrapper>

          <TableFooterCellWrapper align="right">{totalPreviousAmt}</TableFooterCellWrapper>
          <TableFooterCellWrapper align="right">{totalDiscountAmt}</TableFooterCellWrapper>
          <TableFooterCellWrapper align="right">{totalPaymentAmt}</TableFooterCellWrapper>
          <TableFooterCellWrapper align="right">{totalDueAmt}</TableFooterCellWrapper>
        </TableFooter> */}
      </Table>
    </TableContainer>
  );
};

const PrintData = ({ startDate, endDate, studentFees, selectedClass, totalPreviousAmt, totalDiscountAmt, totalPaymentAmt, totalDueAmt }) => {
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
        <Typography variant="h4">Student Collections Report</Typography>
        <h4>
          Date From: <b>{dayjs(startDate).format('DD-MM-YYYY')}</b>, Date To: <b>{dayjs(endDate).format('DD-MM-YYYY')}</b>
        </h4>
      </Grid>

      <TableContent
        studentFees={studentFees}
        selectedClass={selectedClass}
        totalPreviousAmt={totalPreviousAmt}
        totalDiscountAmt={totalDiscountAmt}
        totalPaymentAmt={totalPaymentAmt}
        totalDueAmt={totalDueAmt}
      />
    </Grid>
  );
};

const StudentCollectionReport = () => {
  const { showNotification } = useNotistick();
  const { data: classData, error: classError } = useClientFetch('/api/class');
  const [startDate, setStartDate] = useState<any>(dayjs(Date.now()));
  const [endDate, setEndDate] = useState<any>(dayjs(Date.now()));
  const [selectedClass, setSelectedClass] = useState(null);
  const [sections, setSections] = useState<Array<any>>([]);
  const [selectedSection, setSelectedSection] = useState([]);
  const [groups, setGroups] = useState<Array<any>>([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [studentFees, setStudentFees] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPreviousAmt, setTotalPreviousAmt] = useState<Number>(0);
  const [totalDiscountAmt, setTotalDiscountAmt] = useState<Number>(0);
  const [totalPaymentAmt, setTotalPaymentAmt] = useState<Number>(0);
  const [totalDueAmt, setTotalDueAmt] = useState<Number>(0);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });

  const startDatePickerHandleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setStartDate(event);
  };
  const endDatePickerHandleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEndDate(event);
  };

  const handleGroupSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    setSelectedGroup(newValue);
  };
  const handleSectionSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    setSelectedSection(newValue);
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
        // {
        //   label: 'Select all',
        //   id: null
        // },
        ...setTargetSection
      ]);
      const setTargetGroup = targetClassSections?.Group?.map((i) => {
        return {
          label: i.title,
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
        setSelectedSection([{
          label: targetClassSections?.sections[0]?.name,
          id: targetClassSections?.sections[0]?.id
        }]);
      } else {
        setSelectedSection([]);
      }
    } else {
      setSections([]);
      setSelectedSection([]);
      setGroups([]);
      setSelectedGroup([]);
    }
  };

  // fetch student related data code start
  const getStudentInfo = () => {
    // console.log({ selectedSection });
    let groupSectionArr = selectedSection?.map(section => section.id);
    // console.log({ groupSectionArr });
    let groupQueryArr = [selectedGroup?.id];
    // if (!selectedSection?.id) {
    //   groupSectionArr = sections
    //     ?.map((item) => {
    //       return item.id;
    //     })
    //     ?.filter((item) => {
    //       return item !== null;
    //     });
    // }
    if (!selectedGroup?.id) {
      groupQueryArr = [];
    }

    return axios.get(
      `/api/reports/student_collections?from_date=${handleStartDate(startDate)}&to_date=${handleEndDate(endDate)}&selected_class=${selectedClass?.id}&selected_group=${groupQueryArr?.length > 0 ? groupQueryArr : ''
      }&selected_section=${groupSectionArr}`
    );
  };
  // fetch student related data code end

  const handleClickStudentInfo = async () => {
    try {
      if (!selectedClass) {
        showNotification('Please select a class before proceeding', 'error');
        return;
      }
      setIsLoading(true);
      const res = await getStudentInfo();

      // calculate discount
      let discount = 0;
      for (let i = 0; i < res?.data?.result.length; i++) {
        for (let j = 0; j < res?.data?.result[i]?.fee?.Discount.length; j++) {
          if (res?.data?.result[i]?.fee?.id === res?.data?.result[i]?.fee?.Discount[j].fee_id) {
            if (res?.data?.result[i]?.fee?.Discount[j].type === 'flat') {
              res.data.result[i].discount =
                (res.data.result[i].discount ? res.data.result[i].discount : 0) + parseInt(res?.data?.result[i]?.fee?.Discount[j].amt); // 100
            } else if (res?.data?.result[i]?.fee?.Discount[j].type === 'percent') {
              res.data.result[i].discount =
                (res.data.result[i].discount ? res.data.result[i].discount : 0) +
                parseInt(res?.data?.result[i]?.fee.amount) / parseInt(res?.data?.result[i]?.fee?.Discount[j].amt);
            }
          }
        }
      }

      // calculate total prvious amount, total discount amount, total payment, total due amount
      let totalPreviousAmt = 0,
        totalDiscountAmt = 0,
        totalPaymentAmt = 0,
        totalDueAmt = 0;

      res?.data?.result.forEach((item) => {
        totalPreviousAmt = totalPreviousAmt + item?.collected_amount;
        totalDiscountAmt = totalDiscountAmt + ((item?.discount ? item?.discount : 0) + item?.on_time_discount);
        totalPaymentAmt = totalPaymentAmt + item?.collected_amount;
        totalDueAmt = totalDueAmt + item?.total_payable - item?.collected_amount;
      });

      setTotalPreviousAmt(totalPreviousAmt);
      setTotalDiscountAmt(totalDiscountAmt);
      setTotalPaymentAmt(totalPaymentAmt);
      setTotalDueAmt(totalDueAmt);

      setStudentFees(res?.data?.result);
    } catch (error) {
      // console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/*  print report */}
      <Grid display="none">
        <Grid ref={componentRef}>
          <PrintData
            startDate={startDate}
            endDate={endDate}
            selectedClass={selectedClass}
            studentFees={studentFees}
            totalPreviousAmt={totalPreviousAmt}
            totalDiscountAmt={totalDiscountAmt}
            totalPaymentAmt={totalPaymentAmt}
            totalDueAmt={totalDueAmt}
          />
        </Grid>
      </Grid>

      <Head>
        <title>Student Collection Report</title>
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
        Student Collection Report (ALL ACADEMIC)
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
              {/* Start date field */}
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
                <DatePickerWrapper label={'Start Date *'} date={startDate} handleChange={startDatePickerHandleChange} />
              </Grid>
              {/* End date field */}
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
                <DatePickerWrapper label={'End Date *'} date={endDate} handleChange={endDatePickerHandleChange} />
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
                  multiple={true}
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
                    disabled={studentFees.length === 0 ? true : false}
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
        <TableContent
          studentFees={studentFees}
          selectedClass={selectedClass}
          totalPreviousAmt={totalPreviousAmt}
          totalDiscountAmt={totalDiscountAmt}
          totalPaymentAmt={totalPaymentAmt}
          totalDueAmt={totalDueAmt}
        />
      </Grid>
      {/* table code part end */}
      {/* footer */}
      <Footer />
    </>
  );
};

StudentCollectionReport.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_admit_card', 'show_admit_card']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default StudentCollectionReport;
