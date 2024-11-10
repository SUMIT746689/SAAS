import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import Head from 'next/head';
import { Typography, Grid, TableFooter } from '@mui/material';
import { DatePickerWrapper } from '@/components/DatePickerWrapper';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { SearchingButtonWrapper } from '@/components/ButtonWrapper';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import { TableBodyCellWrapper, TableFooterCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';
import { useState, ChangeEvent, useRef } from 'react';
import dayjs from 'dayjs';
import Footer from '@/components/Footer';

import { styled } from '@mui/material/styles';
import axios from 'axios';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { useClientFetch } from '@/hooks/useClientFetch';
import useNotistick from '@/hooks/useNotistick';
import { useReactToPrint } from 'react-to-print';
import { formatNumber } from '@/utils/numberFormat';
import { useAuth } from '@/hooks/useAuth';
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

const IncomeReport = () => {
  const [startDate, setStartDate] = useState<any>(dayjs(Date.now()));
  const [endDate, setEndDate] = useState<any>(dayjs(Date.now()));
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // const { data: classes, muiMenuList: muiClassLists, _ } = useClientFetch(`/api/class`);
  // const [selectedCls, setSelectedCls] = useState([]);
  const { showNotification } = useNotistick();
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

  const handleSearch = () => {
    setIsLoading(true);

    axios
      .get(`/api/reports/expenses?from_date=${handleStartDate(startDate)}&to_date=${handleEndDate(endDate)}`)
      .then(({ data }) => {
        setReports(data);
        setTotal(data.reduce((prev, curr) => prev + curr.total_amount, 0));
      })
      .catch((err) => {
        handleShowErrMsg(err, showNotification);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {/* print datas */}
      <Grid display="none">
        <Grid ref={componentRef}>
          <PrintData startDate={startDate} endDate={endDate} reports={reports} total={total} />
        </Grid>
      </Grid>

      <Head>
        <title>Expense Report</title>
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
        Expense Report ( all academic Wise )
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
            <Grid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', columnGap: '20px', rowGap: '0', flexWrap: 'wrap' }}>
              {/* Start date field */}
              <Grid sx={{ flexBasis: { xs: '100%', sm: '40%', md: '15%' }, flexGrow: 1 }}>
                <DatePickerWrapper label={'From Date *'} date={startDate} handleChange={startDatePickerHandleChange} />
              </Grid>
              {/* End date field */}
              <Grid sx={{ flexBasis: { xs: '100%', sm: '40%', md: '15%' }, flexGrow: 1 }}>
                <DatePickerWrapper label={'To Date *'} date={endDate} handleChange={endDatePickerHandleChange} />
              </Grid>
              {/* Class field */}
              {/* <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    md: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapper options={[]} value={''} label="Income Category" placeholder="Select a Category" handleChange={() => {}} />
              </Grid> */}

              {/* Search button */}
              <Grid sx={{ flexBasis: { xs: '100%', sm: '40%', md: '15%' }, flexGrow: 1, position: 'relative', display: 'flex', gap: 1 }}>
                <Grid sx={{ flexGrow: 1 }}>
                  <SearchingButtonWrapper
                    isLoading={isLoading}
                    handleClick={handleSearch}
                    disabled={isLoading || !endDate || !startDate}
                    children={'Search'}
                  />
                </Grid>
                <Grid sx={{ flexGrow: 1 }}>
                  <SearchingButtonWrapper
                    isLoading={false}
                    handleClick={handlePrint}
                    disabled={reports.length === 0 ? true : false}
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
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableHeaderCellWrapper>SL</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Voucher Name</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Payment Methods</TableHeaderCellWrapper>
                {/* <TableHeaderCellWrapper>Description</TableHeaderCellWrapper> */}
                <TableHeaderCellWrapper>Last Collected Date</TableHeaderCellWrapper>
                <TableHeaderCellWrapper align="right">Amount</TableHeaderCellWrapper>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports?.map((report, index) => (
                <StyledTableRow key={report.voicher_id}>
                  <TableBodyCellWrapper>
                    <Grid py={0.5}>{index + 1}</Grid>{' '}
                  </TableBodyCellWrapper>
                  <TableBodyCellWrapper>
                    <Grid textTransform="capitalize">{report.voucher_name}</Grid>
                  </TableBodyCellWrapper>
                  <TableBodyCellWrapper>
                    <Grid textTransform="capitalize">{report.payment_methods}</Grid>
                  </TableBodyCellWrapper>
                  <TableBodyCellWrapper>{dayjs(report.created_at).format('DD-MM-YYYY h:mm A')}</TableBodyCellWrapper>
                  <TableBodyCellWrapper align="right">{formatNumber(report.total_amount)}</TableBodyCellWrapper>
                </StyledTableRow>
              ))}
            </TableBody>

            <TableFooter>
              <TableFooterCellWrapper colSpan={4} align="right">
                Total
              </TableFooterCellWrapper>
              <TableFooterCellWrapper align="right">{formatNumber(total)}</TableFooterCellWrapper>
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

const PrintData = ({ startDate, endDate, total, reports }) => {
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
        <Typography variant="h4">Expense Report</Typography>
        <h4>
          Date From: <b>{dayjs(startDate).format('DD-MM-YYYY')}</b>, Date To: <b>{dayjs(endDate).format('DD-MM-YYYY')}</b>
        </h4>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 0, pt: 2 }}>
        <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableHeaderCellWrapper>SL</TableHeaderCellWrapper>
              <TableHeaderCellWrapper>Voucher Name</TableHeaderCellWrapper>
              <TableHeaderCellWrapper>Payment Methods</TableHeaderCellWrapper>
              {/* <TableHeaderCellWrapper>Description</TableHeaderCellWrapper> */}
              <TableHeaderCellWrapper>Last Collected Date</TableHeaderCellWrapper>
              <TableHeaderCellWrapper align="right">Amount</TableHeaderCellWrapper>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports?.map((report, index) => (
              <StyledTableRow key={report.voicher_id}>
                <TableBodyCellWrapper>
                  <Grid py={0.5}>{index + 1}</Grid>{' '}
                </TableBodyCellWrapper>
                <TableBodyCellWrapper>
                  <Grid textTransform="capitalize">{report.voucher_name}</Grid>
                </TableBodyCellWrapper>
                <TableBodyCellWrapper>
                  <Grid textTransform="capitalize">{report.payment_methods}</Grid>
                </TableBodyCellWrapper>
                <TableBodyCellWrapper>{dayjs(report.created_at).format('DD-MM-YYYY h:mm A')}</TableBodyCellWrapper>
                <TableBodyCellWrapper align="right">{formatNumber(report.total_amount)}</TableBodyCellWrapper>
              </StyledTableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableFooterCellWrapper colSpan={4} align="right">
              Total
            </TableFooterCellWrapper>
            <TableFooterCellWrapper align="right">{formatNumber(total)}</TableFooterCellWrapper>
          </TableFooter>
        </Table>
      </TableContainer>
    </Grid>
  );
};

IncomeReport.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_admit_card', 'show_admit_card']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default IncomeReport;
