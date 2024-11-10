import { Grid, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Avatar } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, FC, useRef } from 'react';
import { formatNumber } from '@/utils/numberFormat';
import dayjs from 'dayjs';
import { Data } from '@/models/front_end';
import Image from 'next/image';
import { getFile } from '@/utils/utilitY-functions';
import discount from 'pages/api/discount';

const DesignInvoice = ({ schoolData, selectedInvoice }) => {
  const { user } = useAuth();
  const [word, setWord] = useState(numberToWordConverter(selectedInvoice[0]?.collected_amount | 0));
  const [calDiscount, setCalDiscount] = useState<Number>(0);

  useEffect(() => {
    // calculate discount
    let discount = 0;
    for (let i = 0; i < selectedInvoice?.length; i++) {
      for (let j = 0; j < selectedInvoice[i]?.fee?.Discount?.length; j++) {
        if (selectedInvoice[i]?.fee?.id === selectedInvoice[i]?.fee?.Discount[j]?.fee_id) {
          if (selectedInvoice[i]?.fee?.Discount[j]?.type === 'flat') {
            discount = discount + parseInt(selectedInvoice[i]?.fee?.Discount[j]?.amt); // 100
          } else if (selectedInvoice[i]?.fee?.Discount[j]?.type === 'percent') {
            discount = discount + parseInt(selectedInvoice[i]?.fee?.amount) / parseInt(selectedInvoice[i]?.fee?.Discount[j]?.amt);
          }
        }
      }
    }

    setCalDiscount(discount);
  }, []);

  return (
    <Grid>
      {/* part 1 */}
      <Grid pt={2}>
        {/* school information */}

        <Grid sx={{ borderBottom: '1px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} pb={1} mb={0.5}>
          <Grid width="80px" height="80px">
            {schoolData?.header_image && (
              <Avatar
                variant="rounded"
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  boxShadow: '-2px 0px 20px 0px rgba(173,173,173,1)',
                  border: '2px solid white'
                }}
              >
                <Image
                  src={getFile(schoolData?.header_image)}
                  alt="photo"
                  height={80}
                  width={80}
                  style={{ width: '100% ', height: '100%', objectFit: 'contain' }}
                />
              </Avatar>
            )}
          </Grid>
          <Grid>
            {' '}
            <Typography variant="h4" sx={{ textAlign: 'center' }}>
              {user?.school?.name}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              {user?.school?.address}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              Recipt Report
            </Typography>
          </Grid>
          <Grid width="80px" height="80px"></Grid>
        </Grid>

        {/* student information */}
        <Grid sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Grid sx={{ display: 'flex', gap: '20px' }}>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography variant="body1" sx={{ color: '#000' }}>
                Rec. No.
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                Student Name
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                Batch
              </Typography>
            </Grid>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {selectedInvoice[0]?.tracking_number}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                :{' '}
                {[
                  selectedInvoice[0]?.student?.student_info?.first_name,
                  selectedInvoice[0]?.student?.student_info?.middle_name,
                  selectedInvoice[0]?.student?.student_info?.last_name
                ].join(' ')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
               : {selectedInvoice[0]?.student?.batches?.map((batch) => `${batch.name}[${batch.std_entry_time ? dayjs?.(batch.std_entry_time).format('h:mm A') : ' ' }]`).join(', ')}
                              
                {/* : {selectedInvoice[0]?.student?.section?.name} */}
              </Typography>
            </Grid>
          </Grid>
          <Grid sx={{ display: 'flex', gap: '20px' }}>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography variant="body1" sx={{ color: '#000' }}>
                Date
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                Class
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                Roll No
              </Typography>
            </Grid>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {dayjs(selectedInvoice[0]?.collection_date).format('DD/MM/YYYY')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {selectedInvoice[0]?.student?.class?.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {selectedInvoice[0]?.student?.class_roll_no}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* table one */}
        <Grid mt={1}>
          <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
            <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell
                    style={{
                      border: '1px solid black',
                      textTransform: 'capitalize',
                      fontWeight: 'bold',
                      width: '25%',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      color: '#000'
                    }}
                  >
                    Particulars
                  </TableCell>
                  <TableCell
                    style={{
                      border: '1px solid black',
                      textTransform: 'capitalize',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      color: '#000'
                    }}
                  >
                    Payable Amt.
                  </TableCell>
                  <TableCell
                    style={{
                      border: '1px solid black',
                      textTransform: 'capitalize',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      color: '#000'
                    }}
                  >
                    Paid Amt
                  </TableCell>
                  <TableCell
                    style={{
                      border: '1px solid black',
                      textTransform: 'capitalize',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      color: '#000'
                    }}
                  >
                    Discount
                  </TableCell>

                  <TableCell
                    style={{
                      border: '1px solid black',
                      textTransform: 'capitalize',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      color: '#000'
                    }}
                  >
                    Due Amt.
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    align="left"
                    style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                  >
                    {selectedInvoice[0]?.fee?.fees_head?.title && selectedInvoice[0]?.fee?.title
                      ? `${selectedInvoice[0]?.fee?.fees_head?.title} (${selectedInvoice[0]?.fee?.title})`
                      : selectedInvoice[0]?.fee?.title}
                  </TableCell>

                  <TableCell
                    align="left"
                    style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                  >
                    {selectedInvoice[0]?.amount - selectedInvoice[0]?.paidAmount}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                  >
                    {selectedInvoice[0]?.paidAmount}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                  >
                    {calDiscount + selectedInvoice[0]?.on_time_discount}
                  </TableCell>

                  <TableCell
                    align="left"
                    style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                  >
                    {selectedInvoice[0]?.total_payable - selectedInvoice[0]?.collected_amount}
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    align="left"
                    style={{
                      border: '1px solid black',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    Total
                  </TableCell>

                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {selectedInvoice[0]?.amount - selectedInvoice[0]?.paidAmount}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {selectedInvoice[0]?.paidAmount}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {calDiscount + selectedInvoice[0]?.on_time_discount}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {selectedInvoice[0]?.total_payable - selectedInvoice[0]?.collected_amount}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        {/* taka in words */}

        <Grid container sx={{ fontWeight: 'bold' }} my={1} justifyContent="space-between">
          <Grid sx={{ textTransform: 'capitalize' }}>
            IN WORD:{' '}
            <b>
              {' '}
              {word} {user?.school?.currency} only
            </b>
          </Grid>
          <Grid>
            Paid: <b>{formatNumber(selectedInvoice[0]?.collected_amount)}</b>
          </Grid>
        </Grid>

        {/* table two */}
        <Grid mt={1} mb={6}>
          <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
            <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    style={{
                      border: '1px solid black',
                      textTransform: 'capitalize',
                      fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      color: '#000'
                    }}
                  >
                    Payment Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      width: '30%',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    Total Amount to Pay
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      width: '20%',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {selectedInvoice[0]?.amount - selectedInvoice[0]?.paidAmount}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      width: '30%',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    Total Paid
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      width: '20%',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {selectedInvoice[0]?.paidAmount}
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      width: '30%',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    Discount
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      width: '20%',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {calDiscount + selectedInvoice[0]?.on_time_discount}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      width: '30%',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    Total Due
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      width: '20%',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {selectedInvoice[0]?.total_payable - selectedInvoice[0]?.collected_amount}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        {/* signature  */}
        <Grid sx={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <Grid sx={{ flexGrow: 1 }}>
            <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
            <Grid textAlign="center">Student/Gurdiant Signature </Grid>
          </Grid>
          <Grid sx={{ flexGrow: 1 }}>
            <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
            <Grid textAlign="center">Superintendent Signature </Grid>
          </Grid>
          <Grid sx={{ flexGrow: 1 }}>
            <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
            <Grid textAlign="center">Accounts Officer </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DesignInvoice;

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
