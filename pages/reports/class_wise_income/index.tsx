import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import Head from 'next/head';
import { Typography, Grid } from '@mui/material';
import { DatePickerWrapper } from '@/components/DatePickerWrapper';
import { AutoCompleteWrapper, AutoCompleteWrapperWithoutRenderInput } from '@/components/AutoCompleteWrapper';
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
import Footer from '@/components/Footer';
import { useClientFetch } from '@/hooks/useClientFetch';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { formatNumber } from '@/utils/numberFormat';
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

const ClassWiseIncome = () => {
  const [startDate, setStartDate] = useState<any>(dayjs(Date.now()));
  const [endDate, setEndDate] = useState<any>(dayjs(Date.now()));
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: classes, muiMenuList: muiClassLists, _ } = useClientFetch(`/api/class`);
  const [selectedCls, setSelectedCls] = useState([]);
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
    const class_ids = selectedCls?.map((cls) => cls.id);
    axios
      .get(`/api/reports/class_wise_incomes?from_date=${handleStartDate(startDate)}&to_date=${handleEndDate(endDate)}&class_ids=${class_ids}`)
      .then(({ data }) => {
        let total_collected_amt = 0;

        const customData = data.map((cls_wise_fees) => {
          total_collected_amt += cls_wise_fees.total_collected_amt;
          const cls_name = classes?.find((cls) => cls.id === cls_wise_fees.class_id)?.name;
          return { ...cls_wise_fees, class_name: cls_name };
        });
        setReports(customData);
        setTotal({ total_collected_amt });
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
      <Head>
        <title>Class Wise Income</title>
      </Head>

      {/* print datas */}
      <Grid display="none">
        <Grid ref={componentRef}>
          <PrintData startDate={startDate} endDate={endDate} reports={reports} classes={classes} total={total} />
        </Grid>
      </Grid>

      <Typography
        variant="h4"
        textTransform="uppercase"
        py={{
          md: 3,
          xs: 2
        }}
        px={2}
      >
        Class Wise Income
      </Typography>
      {/* searching part code start */}
      <Grid container display="grid" gridTemplateColumns="1fr" rowGap={{ xs: 1, md: 0 }} px={1} mt={1} minHeight="fit-content">
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
              {/* Class field */}
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
                <AutoCompleteWrapper
                  label="Select Classes"
                  placeholder="select classes..."
                  name="class"
                  multiple={true}
                  value={selectedCls}
                  options={[{ label: 'Select All', id: 'select_all' }, ...muiClassLists] || []}
                  error={undefined}
                  touched={undefined}
                  handleChange={(_, value) => {
                    const lastselectVal = value[value.length - 1];
                    if (lastselectVal?.id === 'select_all') return setSelectedCls(muiClassLists);
                    setSelectedCls(value);
                  }}
                />
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
                  <SearchingButtonWrapper
                    isLoading={isLoading}
                    handleClick={handleSearch}
                    disabled={isLoading || selectedCls.length === 0 || !endDate || !startDate}
                    children={'Search'}
                  />
                </Grid>
                <Grid
                  sx={{
                    flexGrow: 1
                  }}
                >
                  <SearchingButtonWrapper
                    isLoading={false}
                    handleClick={() => handlePrint()}
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
                <TableHeaderCellWrapper style={{ width: '2%' }}>SL</TableHeaderCellWrapper>
                <TableHeaderCellWrapper style={{ width: '60%' }}>Class Name</TableHeaderCellWrapper>
                <TableHeaderCellWrapper style={{ width: '38%' }} align="right">
                  Fees
                </TableHeaderCellWrapper>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports?.map((report, index) => (
                <StyledTableRow key={report.class_id}>
                  <TableBodyCellWrapper>
                    <Grid py={0.5}>{index}</Grid>{' '}
                  </TableBodyCellWrapper>
                  <TableBodyCellWrapper>{classes?.find((cls) => cls.id === report.class_id)?.name}</TableBodyCellWrapper>
                  <TableBodyCellWrapper align="right">{formatNumber(report.total_collected_amt)}</TableBodyCellWrapper>
                </StyledTableRow>
              ))}

              <TableRow>
                <TableBodyCellWrapper colspan={2}>
                  <Grid py={0.5} textAlign={'right'}>
                    {' '}
                    Total
                  </Grid>{' '}
                </TableBodyCellWrapper>
                <TableBodyCellWrapper align="right">{formatNumber(total?.total_collected_amt || 0)}</TableBodyCellWrapper>
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

const PrintData = ({ startDate, endDate, reports, classes, total }) => {
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
        <Typography variant="h4">Class Wise Income</Typography>
        <h4>
          Date From: <b>{dayjs(startDate).format('DD-MM-YYYY')}</b>, Date To: <b>{dayjs(endDate).format('DD-MM-YYYY')}</b>
        </h4>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 0, mt: 2 }}>
        <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableHeaderCellWrapper style={{ width: '2%' }}>SL</TableHeaderCellWrapper>
              <TableHeaderCellWrapper style={{ width: '60%' }}>Class Name</TableHeaderCellWrapper>
              <TableHeaderCellWrapper style={{ width: '38%' }} align="right">
                Fees
              </TableHeaderCellWrapper>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports?.map((report, index) => (
              <StyledTableRow key={report.class_id}>
                <TableBodyCellWrapper>
                  <Grid py={0.5}>{index}</Grid>{' '}
                </TableBodyCellWrapper>
                <TableBodyCellWrapper>{classes?.find((cls) => cls.id === report.class_id)?.name}</TableBodyCellWrapper>
                <TableBodyCellWrapper align="right">{formatNumber(report.total_collected_amt)}</TableBodyCellWrapper>
              </StyledTableRow>
            ))}

            <TableRow>
              <TableBodyCellWrapper colspan={2}>
                <Grid py={0.5} textAlign={'right'}>
                  {' '}
                  Total
                </Grid>{' '}
              </TableBodyCellWrapper>
              <TableBodyCellWrapper align="right">{formatNumber(total?.total_collected_amt || 0)}</TableBodyCellWrapper>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

ClassWiseIncome.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_admit_card', 'show_admit_card']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ClassWiseIncome;
