import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import Footer from 'src/components/Footer';
// import DesignInvoice from './design_invoice';
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
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { DateRangePickerWrapper } from '@/components/DatePickerWrapper';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { useClientFetch } from 'src/hooks/useClientFetch';
import { Data } from '@/models/front_end';
import { handleEndDate, handleStartDate } from '@/utils/customizeDate';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';

const tableStyle: object = {
  border: '1px solid black',
  borderCollapse: 'collapse',
  textAlign: 'center',
  padding: '2px',
  fontSize: '0.6em'
  // backgroundColor: '#cccccc'
};
function FeesPaymentReport() {
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
  const [account, setAccount] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState([]);
  const [open, setOpen] = useState(false);
  const selectedInvoiceRef = useRef();

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

    console.log(paginatedTransaction, page, limit);

    setPaginatedTransection(paginatedTransaction);
  }, [datas, filter, page]);

  useEffect(() => {
    axios.get('/api/account').then((res) =>
      setAccount(
        res?.data?.map((i) => ({
          label: i.title,
          id: i.id
        }))
      )
    );
    getData(dayjs().startOf('date'), dayjs().endOf('date'));
  }, []);

  const getData = (startDate, endDate) => {

    axios
      .get(
        `/api/reports/student_payment_collection_history?from_date=${handleStartDate(startDate)}&to_date=${handleEndDate(endDate)}${selectedAccount ? `&account_id=${selectedAccount?.id}` : ''}`
      )
      .then((res) => {
        let sumTotal = 0,
          SumCollectedAmount = 0;
        for (const c of res.data) {
          // sumTotal += (c?.collected_amount - c?.student?.discount)
          // sumTotal += (c?.collected_amount )
          SumCollectedAmount += c?.collected_amount;
        }
        setDatas({
          // sumTotal: sumTotal?.toFixed(2),
          SumCollectedAmount: SumCollectedAmount?.toFixed(2),
          data: res.data
        });
      })
      .catch((err) => console.log(err));
  };
  const handlePaymentHistoryFind = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      getData(startDate, endDate);
    }
  };

  const bulkAction = datas?.data?.length;

  const handleCreateClassOpen = () => {
    setOpen(true);
  };
  const handleCreateClassClose = () => {
    setOpen(false);
    setSelectedInvoice([]);
  };
  const handlePrint = useReactToPrint({
    content: () => selectedInvoiceRef.current
    // pageStyle: `@media print {
    //   @page {
    //     size: 210mm 115mm;
    //   }
    // }`
  });

  const handleRemoveReceipt = (id)=>{
   axios.delete(`/api/student_fees/${id}`)
   .then(res=>{
    showNotification('successfull');
    getData(startDate, endDate);
  }) 
   .catch(err=> handleShowErrMsg(err,showNotification))
  }

  return (
    <>
      <Head>
        <title>Recipt report</title>
      </Head>
      <PageTitleWrapper>
        <PageHeader title={'Modify Collected Fees'} />
      </PageTitleWrapper>

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
            <AutoCompleteWrapper
              minWidth="100%"
              label={t('Select account')}
              placeholder={t('Account...')}
              limitTags={2}
              // getOptionLabel={(option) => option.id}
              options={account}
              value={undefined}
              handleChange={(e, v) => setSelectedAccount(v ? v : null)}
            />
          </Grid>
          <Grid item>
            <DateRangePickerWrapper startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
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
                  <ButtonWrapper handleClick={null} startIcon={<LocalPrintshopIcon />} disabled={paginatedTransection.length === 0 ? true : false}>
                    Print
                  </ButtonWrapper>
                )}
              />
            </Grid>
          )}
        </Card>
      </form>

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
                rowsPerPageOptions={[5, 10, 15]}
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
                        <TableCell>{t('Tracking no')}</TableCell>
                        <TableCell>{t('Student')}</TableCell>
                        <TableCell>{t('Batch Name [Entry Time]')}</TableCell>
                        <TableCell>{t('Class roll')}</TableCell>
                        <TableCell>{t('Transaction Date')}</TableCell>
                        <TableCell>{t('Class')}</TableCell>
                        <TableCell>{t('Collected by')}</TableCell>
                        <TableCell>{t('Payment via')}</TableCell>
                        <TableCell>{t('Fee title')}</TableCell>
                        <TableCell>{t('Collected amount')}</TableCell>
                        <TableCell>{t('Action')}</TableCell>
                        {/* <TableCell>{t('Discount')}</TableCell> */}

                        {/* <TableCell>{t('Total')}</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTransection?.map((i) => {
                        return (
                          <TableRow hover key={i?.id}>
                            <TableCell>
                              <Typography noWrap variant="h5">
                                {i?.transaction?.tracking_number}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {[
                                  i?.student?.student_info?.first_name,
                                  i?.student?.student_info?.middle_name,
                                  i?.student?.student_info?.last_name
                                ].join(' ')}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {i?.student?.batches?.map((batch) => `${batch.name} [${batch.std_entry_time ? dayjs?.(batch.std_entry_time).format('h:mm A') : ' '}]`).join(', ')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography noWrap variant="h5">
                                {i?.student?.class_roll_no}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography noWrap variant="h5">
                                {dayjs(i?.created_at).format('MMM D, YYYY h:mm A')}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {i?.student?.class?.name}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {i?.collected_by_user?.username}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {i?.payment_method}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {i?.fee?.title}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5" textAlign="right">
                                {i?.collected_amount}
                              </Typography>
                            </TableCell>

                            <TableCell align="center">
                              <Typography noWrap variant="h5">
                                {/* <ButtonWrapper
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
                                </ButtonWrapper> */}
                                <ButtonWrapper handleClick={()=>handleRemoveReceipt(i?.id)}>
                                  Delete
                                </ButtonWrapper>
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={8}></TableCell>
                        <TableCell sx={{ textAlign: "right", color: "black", fontWeight: 500 }}>{t('Total Collected amount')}</TableCell>
                        <TableCell sx={{ textAlign: "right", color: "black", fontWeight: 500 }}>{datas?.SumCollectedAmount}</TableCell>
                        {/* <TableCell>{t('Total')}</TableCell> */}
                        {/* <TableCell>{datas?.sumTotal}</TableCell> */}
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              </>
            )}
          </Grid>
        </Card>
      </Grid>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={handleCreateClassClose}>
        <Grid p={2} position={'relative'} height={'fit-content'}>
          <Grid position={'absolute'} top={'8px'} right={'16px'}>
            <ButtonWrapper handleClick={handlePrint} startIcon={<LocalPrintshopIcon />}>
              Print
            </ButtonWrapper>
          </Grid>
          {/* <DesignInvoice schoolData={schoolData} selectedInvoice={selectedInvoice} /> */}
        </Grid>

        <Grid sx={{ display: 'none' }}>
          <Grid px={4} sx={{ backgroundColor: '#fff' }} ref={selectedInvoiceRef}>
            {/* <DesignInvoice schoolData={schoolData} selectedInvoice={selectedInvoice} /> */}
          </Grid>
        </Grid>
        {/* old code  */}
        {/* <Grid ref={selectedInvoiceRef}> <PaymentInvoice printFees={selectedInvoice} student={selectedInvoice[0]?.student} /> </Grid> */}
      </Dialog>

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
                <th style={tableStyle}>{t('Invoice no')}</th>
                <th style={tableStyle}>{t('Student')}</th>
                <th style={tableStyle}>{t('Class')}</th>
                <th style={tableStyle}>{t('Batch')}</th>
                <th style={tableStyle}>{t('Class roll')}</th>
                <th style={tableStyle}>{t('Transaction Date')}</th>
                <th style={tableStyle}>{t('Collected by')}</th>
                <th style={tableStyle}>{t('Payment via')}</th>
                <th style={tableStyle}>{t('Fee title')}</th>
                <th style={tableStyle}>{t('Collected amount')}</th>
              </tr>
            </thead>
            <tbody
              style={{
                overflowX: 'auto',
                overflowY: 'auto'
              }}
            >
              {datas.data?.map((i) => {
                let name = i?.student?.student_info?.first_name;
                if (i?.student?.student_info?.middle_name) {
                  name += i?.student?.student_info?.middle_name;
                }
                if (i?.student?.student_info?.last_name) {
                  name += i?.student?.student_info?.last_name;
                }
                return (
                  <tr>
                    <td style={tableStyle}>{i?.transaction?.tracking_number}</td>
                    <td style={tableStyle}>{name}</td>
                    <td style={tableStyle}>{i?.student?.class?.name}</td>
                    <td style={tableStyle}>{i?.student?.batches?.map((batch) => `${batch.name}[${batch.std_entry_time ? dayjs?.(batch.std_entry_time).format('h:mm A') : ' '}]`).join(', ')}</td>
                    <td style={tableStyle}>{i?.student?.class_roll_no}</td>
                    <td style={tableStyle}>{dayjs(i?.created_at).format('DD/MM/YYYY h:mm A')}</td>
                    <td style={tableStyle}>{i?.collected_by_user?.username}</td>
                    <td style={tableStyle}>{i?.payment_method}</td>
                    <td style={tableStyle}>{i?.fee?.title}</td>
                    <td style={{ ...tableStyle, textAlign: "end" }}>{i?.collected_amount}</td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ ...tableStyle, textAlign: "end" }} colSpan={9}>{t('Total Collected amount')}</td>
                <td style={{ ...tableStyle, textAlign: "end" }}>{datas?.SumCollectedAmount}</td>
              </tr>
            </tbody>
          </Table>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

FeesPaymentReport.getLayout = (page) => (
  <Authenticated name="report">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default FeesPaymentReport;
