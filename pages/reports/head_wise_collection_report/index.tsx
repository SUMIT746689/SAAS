import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import Head from 'next/head';
import { Typography, Grid, TableFooter } from '@mui/material';
import { DatePickerWrapper } from '@/components/DatePickerWrapper';
import { SearchingButtonWrapper } from '@/components/ButtonWrapper';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import { TableBodyCellWrapper, TableFooterCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';
import { useState, ChangeEvent } from 'react';
import dayjs from 'dayjs';
import Footer from '@/components/Footer';

import { styled } from '@mui/material/styles';
import axios from 'axios';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import useNotistick from '@/hooks/useNotistick';
import { formatNumber } from '@/utils/numberFormat';
import { useAuth } from '@/hooks/useAuth';

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

const TableContent = ({ studentFees, selectedClass }) => {

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
      <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableHeaderCellWrapper>SL</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Student Id</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Student Name</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Class</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Group</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Section</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Roll</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Payable Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Previous Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Discount Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Payment</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Total Due Amount</TableHeaderCellWrapper>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            studentFees?.map((item, i) => {
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
                  <TableBodyCellWrapper>{item.student?.student_info?.student_id}</TableBodyCellWrapper>
                  <TableBodyCellWrapper>{
                    `${item.student.student_info.first_name ? item.student.student_info.first_name + ' ' : ''}
                ${item.student.student_info.middle_name ? item.student.student_info.middle_name + ' ' : ''}
                ${item.student.student_info.last_name ? item.student.student_info.last_name + ' ' : ''}`
                  }</TableBodyCellWrapper>
                  <TableBodyCellWrapper>{selectedClass?.label}</TableBodyCellWrapper>
                  <TableBodyCellWrapper>{item.student?.group?.title}</TableBodyCellWrapper>
                  <TableBodyCellWrapper>{item.student.section?.name}</TableBodyCellWrapper>
                  <TableBodyCellWrapper>{item.student?.class_roll_no}</TableBodyCellWrapper>
                  <TableBodyCellWrapper align="right">{formatNumber(item.total_payable || 0)}</TableBodyCellWrapper>
                  <TableBodyCellWrapper align="right">{formatNumber(item.collected_amount || 0)}</TableBodyCellWrapper>
                  <TableBodyCellWrapper align="right"> </TableBodyCellWrapper>
                  <TableBodyCellWrapper align="right"> </TableBodyCellWrapper>
                  <TableBodyCellWrapper align="right">{formatNumber(item.total_payable - item.collected_amount)}</TableBodyCellWrapper>
                </StyledTableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const PrintData = ({ startDate, endDate, studentFees, selectedClass }) => {
  const { user } = useAuth();
  const { school } = user || {};
  const { name, address } = school || {};
  return (
    <Grid mx={1}>
      <Grid textAlign="center" fontWeight={500} lineHeight={3} pt={5}>
        <Typography variant="h3" fontWeight={500}>{name}</Typography>
        <h4>{address}</h4>
        <Typography variant='h4'>Income Report</Typography>
        <h4>Date From: <b>{dayjs(startDate).format('DD-MM-YYYY')}</b>, Date To: <b>{dayjs(endDate).format('DD-MM-YYYY')}</b></h4>
      </Grid>

      <TableContent studentFees={studentFees} selectedClass={selectedClass} />
    </Grid>
  )
}


const HeadWiseCollectionReport = () => {
  const [startDate, setStartDate] = useState<any>(dayjs(Date.now()));
  const [endDate, setEndDate] = useState<any>(dayjs(Date.now()));
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const { showNotification } = useNotistick();
  const [total, setTotal] = useState();

  const startDatePickerHandleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setStartDate(event);
  };
  const endDatePickerHandleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEndDate(event);
  };

  const handleSearch = () => {
    setIsLoading(true)

    axios.get(`/api/reports/head_wise_collections?from_date=${startDate}&to_date=${endDate}`)
      .then(({ data }) => {
        console.log({ data })
        setReports(data);
        setTotal(data.reduce((prev, curr) => prev + curr.total_collected_amt, 0))
      })
      .catch(err => {
        handleShowErrMsg(err, showNotification)
      })
      .finally(() => {
        setIsLoading(false)
      })
  };

  // head_wise_collections.ts
  return (
    <>
      <Head>
        <title>Head_Wise_Collection_Report</title>
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
        Head Wise Collection Report
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
                    md: '15%'
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
                    md: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <DatePickerWrapper label={'End Date *'} date={endDate} handleChange={endDatePickerHandleChange} />
              </Grid>

              {/* Search button */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '15%'
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
                  <SearchingButtonWrapper isLoading={isLoading} handleClick={handleSearch} disabled={false} children={'Search'} />
                </Grid>
                <Grid
                  sx={{
                    flexGrow: 1
                  }}
                >
                  <SearchingButtonWrapper isLoading={isLoading} handleClick={() => { }} disabled={isLoading} children={'Print'} />
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
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableHeaderCellWrapper style={{ width: '2%' }}>SL</TableHeaderCellWrapper>
                <TableHeaderCellWrapper style={{ width: '50%' }}>Name</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Amount</TableHeaderCellWrapper>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                reports?.map((report, index) => (
                  <StyledTableRow key={report.id}>
                    <TableBodyCellWrapper>
                      <Grid py={0.5}>{index + 1}</Grid>{' '}
                    </TableBodyCellWrapper>
                    <TableBodyCellWrapper>{report.title}</TableBodyCellWrapper>
                    <TableBodyCellWrapper align="right">{formatNumber(report.total_collected_amt)}</TableBodyCellWrapper>
                  </StyledTableRow>
                ))
              }
            </TableBody>
            <TableFooter>
              <TableFooterCellWrapper colSpan={2} align="right"> Total</TableFooterCellWrapper>
              <TableFooterCellWrapper align="right"> {formatNumber(total)}</TableFooterCellWrapper>

            </TableFooter>
          </Table>
        </TableContainer>
      </Grid>
      {/* table code part end */}
      {/* footer */}
      <Footer />
    </>
  );
};

HeadWiseCollectionReport.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_admit_card', 'show_admit_card']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default HeadWiseCollectionReport;
