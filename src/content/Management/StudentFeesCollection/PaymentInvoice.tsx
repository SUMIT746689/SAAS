import { useAuth } from '@/hooks/useAuth';
import { formatNumber } from '@/utils/numberFormat';
import { Avatar, Grid, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography } from '@mui/material';
import { Box } from '@mui/system';
import dayjs from 'dayjs';

import { useState, useEffect, FC, useRef } from 'react';

type PaymentInvoiceType = {
  collectionDate: any;
  leftFeesTableTotalCalculation: object | null;
  feesUserData: object;
  totalDueValue: string;
  leftFeesTableData: Array<any>;
  setShowPrint?: (arg: boolean) => void;
  printFees: any[];
  student: any;
};

const PaymentInvoice: FC<PaymentInvoiceType> = ({
  collectionDate,
  leftFeesTableTotalCalculation,
  feesUserData,
  totalDueValue,
  leftFeesTableData,
  setShowPrint,
  printFees,
  student
}) => {
  const dueRef = useRef(0);
  const { user } = useAuth();
  const [word, setWord] = useState('');
  const [totalFeeamount, setTotalFeeamount] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [selectedFees, setSelectedFees] = useState([]);
  const [totalDueAmount, setTotalDueAmount] = useState(0);
  const [totalPreAmount, setTotalPreDueAmount] = useState(0);
  const [totalCurrentDisountAmount, setTotalCurrentDiscountAmount] = useState(0);

  useEffect(() => {
    const temp = printFees.map((payment: any) => {
      const last_date = new Date(payment.last_date);
      // @ts-ignore
      const today = payment?.last_payment_date ? new Date(payment?.last_payment_date) : new Date(collectionDate);
      let payableAmount = payment.amount;

      if ((payment?.status !== 'paid' || payment?.status !== 'paid late') && today > last_date) {
        payableAmount += payment.late_fee ? payment.late_fee : 0;
      }
      payment['payableAmount'] = payableAmount;
      if (payment?.tracking_number) {
        payment['tracking_number'] = payment.tracking_number;
      }
      if (payment?.created_at) {
        payment['created_at'] = payment.created_at;
      }

      return payment;
    });

    // update printFees data start
    for (let i = 0; i < temp.length; i++) {
      for (let j = 0; j < leftFeesTableData.length; j++) {
        if (temp[i].fee_id === leftFeesTableData[j].feeId) {
          const sum =
            parseInt(temp[i].payableAmount) -
            (parseInt(leftFeesTableData[j].dueAmount) + parseInt(temp[i].paidAmount) + parseInt(leftFeesTableData[j].on_time_discount)); // 20000 - 0 + 14000 + 4000

          temp[i].prevAmount = sum;
          temp[i].due = leftFeesTableData[j].dueAmount;
        }
        //else {
        //   temp[i].prevAmount = 0;
        // }
      }
    }

    // update printFees data end
    const totalCurrentDiscountValue = temp.reduce((prev, curr) => prev + Number(curr.on_time_discount), 0) || 0;
    setTotalCurrentDiscountAmount(totalCurrentDiscountValue);
    const totalPrePaidvalue = temp.reduce((prev, curr) => prev + Number(curr.prevAmount), 0) || 0;
    setTotalPreDueAmount(totalPrePaidvalue);
    const totalDueValue = temp.reduce((prev, curr) => prev + Number(curr.due), 0) || 0;

    setTotalDueAmount(parseInt(totalDueValue));

    const totalAmount = temp.reduce((prev, curr) => prev + Number(curr.payableAmount), 0) || 0;

    setTotalFeeamount(totalAmount);

    const totalPaidAmount_ = temp.reduce((prev, curr) => prev + (Number(curr.paidAmount) || 0), 0) || 0;

    setTotalPaidAmount(totalPaidAmount_);
    setWord(numberToWordConverter(totalPaidAmount_));

    setSelectedFees(temp);
    if (printFees.length > 0) setShowPrint(true);
  }, [printFees, leftFeesTableData]);

  return (
    <Box
      p={6}
      height={'screen'}
      sx={{
        display: 'block',
        pageBreakAfter: 'always'
      }}
    >
      <Grid container pt={10} spacing={2} justifyContent={'space-between'}>
        <Grid width={'20%'} item>
          <Avatar variant="rounded">{/* {user?.school?.image && <img src={`/${user.school.image}`} />} */}</Avatar>
        </Grid>
        <Grid width={'60%'} item>
          <Typography variant="h3" align="center">
            {user?.school?.name}
          </Typography>
          <Typography variant="h6" align="center" sx={{ borderBottom: 1 }}>
            {user?.school?.address}
          </Typography>
          <Typography variant="h6" align="center">
            {user?.school?.phone}
          </Typography>
        </Grid>
        <Grid width={'20%'} item>
          Payment Receipt
        </Grid>
      </Grid>

      <Grid sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr ', gridGap: 2 }} mt={4}>
        <Grid>
          <Grid>
            Student Name: <b>{[student?.student_info?.first_name, student?.student_info?.middle_name, student?.student_info?.last_name].join(' ')}</b>
          </Grid>
          <Grid>
            Roll: <b>{student?.class_roll_no}</b>
          </Grid>
          <Grid>
            Gaurdian Number:{' '}
            <a href={`tel:${student?.guardian_phone}`}>
              <b>{student?.guardian_phone}</b>
            </a>
          </Grid>
        </Grid>
        <Grid>
          <Grid>
            {' '}
            Tracking number: <b>{selectedFees[0]?.tracking_number}</b>
          </Grid>
          <Grid>
            {' '}
            Invoice Created:{' '}
            <b>
              {selectedFees[0]?.created_at ? dayjs(selectedFees[0]?.created_at).format('DD/MM/YYYY, h:mm a') : selectedFees[0]?.last_payment_date}
            </b>
          </Grid>
          <Grid>
            {' '}
            Payment Collected by: <b>{selectedFees[0]?.collected_by_user}</b>
          </Grid>
        </Grid>
      </Grid>

      <Grid sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr ', gridGap: 2 }} mt={2}>
        <Grid>
          {' '}
          Account: <b>{selectedFees[0]?.account?.title || selectedFees[0]?.account}</b>
        </Grid>
        {selectedFees[0]?.transID && (
          <>
            <Grid>
              {' '}
              TrxID: <b>{selectedFees[0]?.transID}</b>
            </Grid>
            <Grid>
              {' '}
              Payment gateway: <b>{selectedFees[0]?.payment_method}</b>
            </Grid>
          </>
        )}
      </Grid>

      <Grid container pt={4}>
        <TableContainer sx={{ border: 1, borderColor: 'gray', borderRadius: 0.5 }}>
          <Table aria-label="simple table" sx={{ b: 1 }} size="small">
            <TableHead>
              <TableRow sx={{ p: 1 }}>
                <TableCell sx={{ p: 1, fontSize: 11 }}>SN</TableCell>
                <TableCell sx={{ p: 1 }} align="right">
                  Title
                </TableCell>
                <TableCell sx={{ p: 1 }} align="right">
                  Last Pay Date
                </TableCell>
                <TableCell sx={{ p: 1 }} align="right">
                  Late fine
                </TableCell>
                <TableCell sx={{ p: 1 }} align="right">
                  Amount
                </TableCell>
                <TableCell sx={{ p: 1 }} align="right">
                  Prev. Paid
                </TableCell>
                <TableCell sx={{ p: 1 }} align="right">
                  Curr. Paid
                </TableCell>
                <TableCell sx={{ p: 1 }} align="right">
                  Curr. Discount
                </TableCell>
                <TableCell sx={{ p: 1 }} align="right">
                  Due
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedFees?.map((payment, index) => {
                return (
                  <TableRow
                    key={payment.id}
                    sx={{ p: 1 }}
                    // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ p: 1 }}>{index + 1}</TableCell>
                    <TableCell sx={{ p: 1 }} align="right">
                      {payment.title}
                    </TableCell>
                    <TableCell sx={{ p: 1 }} align="right">
                      {dayjs(payment?.last_payment_date).format('DD/MM/YYYY, h:mm a')}
                    </TableCell>
                    <TableCell sx={{ p: 1 }} align="right">
                      {formatNumber(payment?.late_fee)}
                    </TableCell>
                    <TableCell sx={{ p: 1 }} align="right">
                      {formatNumber(payment?.amount)}
                    </TableCell>
                    <TableCell sx={{ p: 1 }} align="right">
                      {payment.prevAmount ? formatNumber(payment?.prevAmount) : 0}
                    </TableCell>
                    <TableCell sx={{ p: 1 }} align="right">
                      {payment.paidAmount ? formatNumber(payment.paidAmount) : 0}
                    </TableCell>
                    <TableCell sx={{ p: 1 }} align="right">
                      {payment.on_time_discount ? formatNumber(payment.on_time_discount) : 0}
                    </TableCell>
                    <TableCell sx={{ p: 1 }} align="right">
                      {payment.paidAmount ? formatNumber(payment.due) : 0}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}></TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {/* Total Amount */}
                  Total
                </TableCell>
                <TableCell sx={{ p: 1, fontWeight: 'bold' }} align="right">
                  {totalFeeamount}
                </TableCell>

                <TableCell sx={{ p: 1, fontWeight: 'bold' }} align="right">
                  {totalPreAmount}
                </TableCell>
                <TableCell sx={{ p: 1, fontWeight: 'bold' }} align="right">
                  {totalPaidAmount}
                </TableCell>
                {/* <TableCell sx={{ p: 1, fontWeight: 'bold' }} align="right">
                  Total due:
                </TableCell> */}
                <TableCell sx={{ p: 1, fontWeight: 'bold' }} align="right">
                  {totalCurrentDisountAmount}
                </TableCell>
                <TableCell sx={{ p: 1, fontWeight: 'bold' }} align="right">
                  {totalDueAmount}
                </TableCell>
                {/* <TableCell>{t('Total')}</TableCell> */}
                {/* <TableCell>{datas?.sumTotal}</TableCell> */}
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Grid>

      <Grid container mt={1} px={1} justifyContent="space-between">
        <Grid sx={{ textTransform: 'capitalize' }}>
          IN WORD:{' '}
          <b>
            {word} {user?.school?.currency} only
          </b>
        </Grid>
        <Grid>
          Paid: <b>{formatNumber(totalPaidAmount)}</b>
        </Grid>
      </Grid>

      <Grid container mt={10} justifyContent="space-between">
        <Grid borderTop={1} sx={{ borderColor: 'gray' }}>
          Approved By
        </Grid>

        <Grid display={'flex'} flexDirection={'column'} textAlign={'center'} sx={{ borderColor: 'gray' }}>
          <b>{selectedFees[0]?.collected_by_user}</b>
          <Typography borderTop={1}>Received By</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentInvoice;

const th = ['', 'thousand', 'million', 'billion', 'trillion'];
const dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const numberToWordConverter = (s) => {
  s = s.toString();
  s = s.replace(/[\, ]/g, '');
  if (s != parseFloat(s)) return 'not a number';
  var x = s.indexOf('.');
  if (x == -1) x = s.length;
  if (x > 15) return 'too big';
  var n = s.split('');
  var str = '';
  var sk = 0;
  for (var i = 0; i < x; i++) {
    if ((x - i) % 3 == 2) {
      if (n[i] == '1') {
        str += tn[Number(n[i + 1])] + ' ';
        i++;
        sk = 1;
      } else if (n[i] != 0) {
        str += tw[n[i] - 2] + ' ';
        sk = 1;
      }
    } else if (n[i] != 0) {
      // 0235
      str += dg[n[i]] + ' ';
      if ((x - i) % 3 == 0) str += 'hundred ';
      sk = 1;
    }
    if ((x - i) % 3 == 1) {
      if (sk) str += th[(x - i - 1) / 3] + ' ';
      sk = 0;
    }
  }

  if (x != s.length) {
    var y = s.length;
    str += 'point ';
    // @ts-ignore
    for (var i = x + 1; i < y; i++) str += dg[n[i]] + ' ';
  }

  return str.replace(/\s+/g, ' ');
};
