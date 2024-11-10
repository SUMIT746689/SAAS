import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import Head from 'next/head';
import { Typography, Grid } from '@mui/material';
import { DatePickerWrapper } from '@/components/DatePickerWrapper';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { SearchingButtonWrapper } from '@/components/ButtonWrapper';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import { TableBodyCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';
import { useState, ChangeEvent, useRef } from 'react';
import dayjs from 'dayjs';
import { styled } from '@mui/material/styles';
import { AutoCompleteWrapperWithDebounce } from '@/components/AutoCompleteWrapper';
import Footer from '@/components/Footer';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { useReactToPrint } from 'react-to-print';
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

// period related code start
const periodNames = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'Date Range'];
const currentPeriodName = periodNames[0];
// period related code end

const TableContent = ({ totalExpense }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
      <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableHeaderCellWrapper style={{ width: '2%' }}>SL</TableHeaderCellWrapper>
            <TableHeaderCellWrapper style={{ width: '60%' }}>Particulars</TableHeaderCellWrapper>
            <TableHeaderCellWrapper style={{ width: '38%' }}> Amount</TableHeaderCellWrapper>
          </TableRow>
        </TableHead>
        <TableBody>
          <StyledTableRow>
            <TableBodyCellWrapper>
              <Grid py={0.5}>1</Grid>{' '}
            </TableBodyCellWrapper>
            <TableBodyCellWrapper>Expense</TableBodyCellWrapper>
            <TableBodyCellWrapper>{`TK.${totalExpense}`}</TableBodyCellWrapper>
          </StyledTableRow>
          <TableRow>
            <TableBodyCellWrapper colspan={2}>
              <Grid py={0.5} textAlign={'right'}>
                {' '}
                Total
              </Grid>{' '}
            </TableBodyCellWrapper>
            <TableBodyCellWrapper>{`TK.${totalExpense}`}</TableBodyCellWrapper>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const PrintData = ({ startDate, endDate, totalExpense }) => {
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
        <Typography variant="h4">EXPENSE SUMMARY</Typography>
        <h4>
          Date From: <b>{dayjs(startDate).format('DD-MM-YYYY')}</b>, Date To: <b>{dayjs(endDate).format('DD-MM-YYYY')}</b>
        </h4>
      </Grid>

      <TableContent totalExpense={totalExpense} />
    </Grid>
  );
};

const ExpenseSummary = () => {
  const [selected_period, setSelectPeriod] = useState<string | null>(currentPeriodName);
  const [hideStartAndEndDate, setHideStartAndEndDate] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<any>(dayjs(Date.now()));
  const [endDate, setEndDate] = useState<any>(dayjs(Date.now()));
  const [isLoading, setIsLoading] = useState(false);
  const [totalExpense, setTotalExpense] = useState<number>(0);
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

  const getFormattedDate = (date) => {
    return date?.format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ [(Bangladesh Standard Time)]');
  };

  const periodHandleChange = (event: ChangeEvent<HTMLInputElement>, v): void => {
    const today = dayjs(Date.now());
    let start;

    setSelectPeriod(v);
    if (v === 'Date Range') {
      setHideStartAndEndDate(false);
      return;
    } else if (v === 'Today') {
      start = today;
    } else if (v === 'Last 7 Days') {
      start = today.subtract(7, 'day');
    } else if (v === 'Last 30 Days') {
      start = today.subtract(1, 'month');
    } else if (v === 'Last 3 Months') {
      start = today.subtract(3, 'month');
    } else if (v === 'Last 6 Months') {
      start = today.subtract(6, 'month');
    }

    setHideStartAndEndDate(true);
    setStartDate(getFormattedDate(start));
    setEndDate(getFormattedDate(today));
  };

  const handleSearch = () => {
    setIsLoading(true);
    axios
      .get(`/api/reports/expense_summary?from_date=${handleStartDate(startDate)}&to_date=${handleEndDate(endDate)}`)
      .then(({ data }) => {
        if (data?.total) {
          setTotalExpense(data?.total);
        } else {
          setTotalExpense(0);
        }
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
      {/*  print report */}
      <Grid display="none">
        <Grid ref={componentRef}>
          <PrintData startDate={startDate} endDate={endDate} totalExpense={totalExpense} />
        </Grid>
      </Grid>

      <Head>
        <title>Expense_Summary</title>
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
        Expense Summary
      </Typography>
      {/* searching part code start */}
      <Grid display="grid" gridTemplateColumns="1fr" rowGap={{ xs: 1, md: 0 }} px={1} mt={1} minHeight="fit-content">
        {/* split your code start */}
        <Grid
          sx={{
            overflow: 'hidden',
            backgroundColor: '#fff',
            width: {
              xs: '100%',
              md: hideStartAndEndDate ? '50%' : '100%'
            },
            margin: '0 auto'
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
              {/* Period field */}
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
                <AutoCompleteWrapperWithDebounce
                  debounceTimeout=""
                  options={periodNames}
                  value={selected_period}
                  // value={undefined}
                  handleChange={periodHandleChange}
                  label="Select Period"
                  placeholder="Period To"
                />
              </Grid>
              {/* Start date field */}
              {hideStartAndEndDate ? (
                ''
              ) : (
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
              )}

              {/* End date field */}
              {hideStartAndEndDate ? (
                ''
              ) : (
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
              )}

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
                  <SearchingButtonWrapper
                    isLoading={isLoading}
                    handleClick={handleSearch}
                    disabled={isLoading || !endDate || !startDate}
                    children={'Search'}
                  />
                </Grid>
                <Grid
                  sx={{
                    flexGrow: 1
                  }}
                >
                  <SearchingButtonWrapper isLoading={isLoading} handleClick={handlePrint} disabled={totalExpense ? false : true} children={'Print'} />
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
                <TableHeaderCellWrapper style={{ width: '60%' }}>Particulars</TableHeaderCellWrapper>
                <TableHeaderCellWrapper style={{ width: '38%' }}> Amount</TableHeaderCellWrapper>
              </TableRow>
            </TableHead>
            <TableBody>
              <StyledTableRow>
                <TableBodyCellWrapper>
                  <Grid py={0.5}>1</Grid>{' '}
                </TableBodyCellWrapper>
                <TableBodyCellWrapper>Expense</TableBodyCellWrapper>
                <TableBodyCellWrapper>{`TK.${totalExpense}`}</TableBodyCellWrapper>
              </StyledTableRow>
              <TableRow>
                <TableBodyCellWrapper colspan={2}>
                  <Grid py={0.5} textAlign={'right'}>
                    {' '}
                    Total
                  </Grid>{' '}
                </TableBodyCellWrapper>
                <TableBodyCellWrapper>{`TK.${totalExpense}`}</TableBodyCellWrapper>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      {/* table code part end */}
      {/* footer */}
      <Footer />
    </>
  );
};

ExpenseSummary.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_admit_card', 'show_admit_card']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ExpenseSummary;
