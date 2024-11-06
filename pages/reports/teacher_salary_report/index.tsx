import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import Footer from 'src/components/Footer';

import {
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import dayjs from 'dayjs';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import PageHeader from 'src/content/Management/Attendence/PageHeader';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { MobileDatePicker } from '@mui/lab';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { DateRangePickerWrapper } from '@/components/DatePickerWrapper';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import PaymentInvoice from '@/content/Management/StudentFeesCollection/PaymentInvoice';
import { useClientFetch } from 'src/hooks/useClientFetch';
import { Data } from '@/models/front_end';
import { handleEndDate, handleStartDate } from '@/utils/customizeDate';

const tableStyle: object = {
  border: '1px solid black',
  borderCollapse: 'collapse',
  textAlign: 'center',
  padding: '2px',
  fontSize: '0.8em'
  // backgroundColor: '#cccccc'
};
function TeacherReport() {
  const { data: schoolData }: { data: Data } = useClientFetch('/api/front_end');
  const { t }: { t: any } = useTranslation();
  const [datas, setDatas] = useState<any>([]);

  const printPageRef = useRef();

  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(15);
  const [filter, setFilter] = useState<string>('all');
  const [paginatedTransection, setPaginatedTransection] = useState<any>([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState([]);
  const [open, setOpen] = useState(false);
  const selectedInvoiceRef = useRef();
  const [totalPage, setTotalPage] = useState(0);

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event): void => {
    setLimit(parseInt(event.target.value));
  };

  const applyPagination = (sessions, page, limit) => {
    return sessions.slice(page * limit, page * limit + limit);
  };

  useEffect(() => {
    // @ts-ignore
    const paginatedTransaction = applyPagination(datas?.data || [], page, limit);
    setPaginatedTransection(paginatedTransaction);
  }, [datas, filter, page]);

  useEffect(() => {
    axios.get('/api/student_fee_wise_teacher_pays').then((res) => {
      const seen = new Set();
      const arr = res?.data.response?.filter((i) => {
        const duplicate = seen.has(i.teacher_id);
        seen.add(i.teacher_id);
        if (!duplicate) {
          return true;
        } else {
          return false;
        }
      });
      setTotalPage(Number(res.data.total_page));

      setTeachers(
        arr?.map((i) => ({
          label: [i?.teacher?.first_name, i?.teacher?.middle_name, i?.teacher?.last_name].join(' '),
          id: i?.teacher?.id
        }))
      );
    });
    // getData(dayjs().startOf('date'), dayjs().endOf('date'));
  }, []);

  const getData = (startDate, endDate) => {
    // const tempToDate = new Date(endDate);
    // tempToDate.setDate(tempToDate.getDate() + 1);
    let url;
    if (selectedTeacher) {
      url = `/api/student_fee_wise_teacher_pays?from_date=${handleStartDate(startDate)}&to_date=${handleEndDate(endDate)}&selected_teacher=${selectedTeacher.id}`;
    } else {
      url = `/api/student_fee_wise_teacher_pays?from_date=${handleStartDate(startDate)}&to_date=${handleEndDate(endDate)}`;
    }
    axios
      .get(url)
      .then((res) => {
        setDatas({
          data: res?.data.response
        });
      })
      .catch((err) => {
        if (err?.message) {
          showNotification(`${err?.message}`, 'error');
          return;
        } else {
          showNotification(`${err}`, 'error');
          return;
        }
      });
  };
  const handlePaymentHistoryFind = (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      showNotification('Please select both a start date and an end date to proceed.', 'error');
      return;
    } else if (startDate && endDate) {
      // const fromDate = new Date(new Date(startDate).getTime() - 21600000);
      // const toDate = new Date(new Date(endDate).getTime() - 21600000 + 86399999);

      const fromDate = new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString();
      const toDate = new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString();

      // const startD
      // console.log({ fromDate, toDate });

      getData(fromDate, toDate);
    }
  };

  const bulkAction = totalPage;

  return (
    <>
      <Head>
        <title>Teacher salary report</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader title={'Teacher salary report'} />
      </PageTitleWrapper>
      {/* searching code start */}
      <Grid px={1} mt={1} minHeight="fit-content">
        <Grid sx={{ px: 1 }}>
          <form onSubmit={handlePaymentHistoryFind}>
            <Card
              sx={{
                display: 'grid',
                mx: 'auto',
                p: 1,
                gridTemplateColumns: { sm: 'auto', md: '1fr 2fr 1fr 0.5fr 0.5fr' },
                gap: 1
              }}
            >
              <Grid item>
                <DateRangePickerWrapper startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
              </Grid>
              <Grid item>
                <AutoCompleteWrapper
                  minWidth="100%"
                  label={t('Select teacher')}
                  placeholder={t('Teacher...')}
                  limitTags={2}
                  // getOptionLabel={(option) => option.id}
                  options={teachers}
                  value={undefined}
                  handleChange={(e, v) => setSelectedTeacher(v ? v : null)}
                />
              </Grid>
              <Grid item>
                <ButtonWrapper disabled={startDate && !endDate ? true : false} type="submit" handleClick={null}>
                  Search
                </ButtonWrapper>
              </Grid>
              {datas?.data && (
                <Grid item>
                  <ReactToPrint
                    content={() => printPageRef.current}
                    // pageStyle={`{ size: 2.5in 4in }`}
                    pageStyle={`@page { size: A4; } .printable-item { page-break-after: always; }`}
                    trigger={() => (
                      <ButtonWrapper
                        handleClick={null}
                        startIcon={<LocalPrintshopIcon />}
                        disabled={paginatedTransection.length === 0 ? true : false}
                      >
                        Print
                      </ButtonWrapper>
                    )}
                  />
                </Grid>
              )}
            </Card>
          </form>
        </Grid>
      </Grid>
      {/* table code start */}
      <Grid px={1} mt={1} minHeight="fit-content">
        <Grid sx={{ mt: 1, px: 1 }} container item>
          <Card sx={{ width: '100%' }}>
            <Grid
              item
              sx={{
                // maxHeight: 'calc(1080vh - 450px) !important',
                minHeight: 'calc(108vh - 450px) !important',
                overflow: 'auto'
              }}
              justifyContent={'flex-end'}
            >
              <Box p={2} display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography component="span" variant="subtitle1">
                    {t('Showing')}:
                  </Typography>{' '}
                  <b>{paginatedTransection.length}</b> <b>{t('transections')}</b>
                </Box>
                <TablePagination
                  component="div"
                  count={bulkAction}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleLimitChange}
                  page={page}
                  rowsPerPage={limit}
                  rowsPerPageOptions={[50, 75, 100]}
                />
              </Box>

              <Divider />
              {paginatedTransection.length === 0 ? (
                <>
                  <Typography
                    sx={{
                      py: 10,
                      px: 4
                    }}
                    variant="h3"
                    fontWeight="normal"
                    color="text.secondary"
                    align="center"
                  >
                    {t("We couldn't find any transection matching your search criteria")}
                  </Typography>
                </>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('Sl')}</TableCell>
                          <TableCell>{t('Class')}</TableCell>
                          {/* <TableCell>{t('Batch')}</TableCell> */}
                          <TableCell>{t('Subject')}</TableCell>
                          <TableCell>{t('Fees id')}</TableCell>
                          <TableCell>{t('Fee head')}</TableCell>
                          <TableCell>{t('Fee title')}</TableCell>
                          <TableCell>{t('Teacher pay type')}</TableCell>
                          <TableCell>{t('Teacher percentage/flat')}</TableCell>
                          <TableCell>{t('Teacher Name')}</TableCell>
                          <TableCell>{t('Teacher amount')}</TableCell>
                          <TableCell>{t('Collected amount')}</TableCell>
                          {/* <TableCell>{t('Discount')}</TableCell> */}

                          {/* <TableCell>{t('Total')}</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedTransection?.map((item, i) => {
                          return (
                            <TableRow hover key={i}>
                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {i + 1}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {item.subject.class.name}
                                </Typography>
                              </TableCell>
                              {/* <TableCell>
                                <Typography noWrap variant="h5">
                                  {' Processing'}
                                </Typography>
                              </TableCell> */}

                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {item.subject.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {item.studentFee.fee.id}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {item.studentFee.fee.fees_head.title}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {item.studentFee.fee.title}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {item.teacher_pay_type}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {item.teacher_pay_type === 'percentage' ? `${item.percentage_amount}%` : item.fixed_amount}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {[item.teacher.first_name, item.teacher.middle_name, item.teacher.last_name].join(' ')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {item.amount}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography noWrap variant="h5">
                                  {item.studentFee.collected_amount}
                                </Typography>
                              </TableCell>

                              {/* <TableCell align="center">
                            <Typography noWrap variant="h5">
                              <ButtonWrapper
                                handleClick={() => {
                                  setSelectedInvoice([
                                    {
                                      ...i,
                                      paidAmount: i?.collected_amount,
                                      collected_by_user: i?.collected_by_user?.username,
                                      title: i?.fee?.title ? i?.fee?.title : i?.other_fee_name,
                                      last_payment_date: i?.created_at,
                                      late_fee: i?.fee?.late_fee ? i?.fee.late_fee : null,
                                      amount: i?.total_payable,
                                      tracking_number: i?.transaction?.tracking_number
                                    }
                                  ]);
                                  handleCreateClassOpen();
                                }}
                                startIcon={<LocalPrintshopIcon />}
                              >
                                Invoice
                              </ButtonWrapper>
                            </Typography>
                          </TableCell> */}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      {/* <TableFooter>
                      <TableRow>
                        <TableCell colSpan={8}></TableCell>
                        <TableCell>{t('Total Collected amount')}</TableCell>
                        <TableCell>{datas?.SumCollectedAmount}</TableCell>
                    
                      </TableRow>
                    </TableFooter> */}
                    </Table>
                  </TableContainer>
                </>
              )}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* print page */}

      <Grid
        sx={{
          display: 'none'
        }}
      >
        <Grid
          ref={printPageRef}
          sx={{
            p: 2
          }}
        >
          <Grid
            sx={{
              textAlign: 'center',
              paddingBottom: 1
            }}
          >
            <h1
              style={{
                fontSize: '25px'
              }}
            >
              Recipt Report
            </h1>
          </Grid>
          <Table size="small">
            <thead>
              <tr>
                <th style={tableStyle}>{t('Sl')}</th>
                <th style={tableStyle}>{t('Class')}</th>
                <th style={tableStyle}>{t('Subject')}</th>
                <th style={tableStyle}>{t('Fees id')}</th>
                <th style={tableStyle}>{t('Fee head')}</th>
                <th style={tableStyle}>{t('Fee title')}</th>
                <th style={tableStyle}>{t('Teacher pay type')}</th>
                <th style={tableStyle}>{t('Teacher percentage/flat')}</th>
                <th style={tableStyle}>{t('Teacher Name')}</th>
                <th style={tableStyle}>{t('Teacher amount')}</th>
                <th style={tableStyle}>{t('Collected amount')}</th>
                {/* <th style={tableStyle}>{t('Discount')}</th> */}
                {/* <th style={tableStyle}>{t('Total')}</th> */}
              </tr>
            </thead>
            <tbody
              style={{
                overflowX: 'auto',
                overflowY: 'auto'
              }}
            >
              {datas.data?.map((item, i) => {
                return (
                  <tr key={i}>
                    <td style={tableStyle}> {i + 1}</td>
                    <td style={tableStyle}> {item.subject.class.name}</td>
                    <td style={tableStyle}> {item.subject.name}</td>
                    <td style={tableStyle}> {item.studentFee.fee.id}</td>
                    <td style={tableStyle}> {item.studentFee.fee.fees_head.title}</td>
                    <td style={tableStyle}> {item.studentFee.fee.title}</td>
                    <td style={tableStyle}> {item.teacher_pay_type}</td>
                    <td style={tableStyle}> {item.teacher_pay_type === 'percentage' ? `${item.percentage_amount}%` : item.fixed_amount}</td>
                    <td style={tableStyle}> {[item.teacher.first_name, item.teacher.middle_name, item.teacher.last_name].join(' ')}</td>
                    <td style={tableStyle}> {item.amount}</td>
                    <td style={tableStyle}> {item.studentFee.collected_amount}</td>
                    {/* <td style={tableStyle}>{i?.student?.discount}</td> */}
                    {/* <td style={tableStyle}>{total?.toFixed(2)}</td> */}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

TeacherReport.getLayout = (page) => (
  <Authenticated name="report">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default TeacherReport;
