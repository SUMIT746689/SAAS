import { Grid, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Avatar } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, FC, useRef } from 'react';
import { formatNumber } from '@/utils/numberFormat';
import dayjs from 'dayjs';
import { Data } from '@/models/front_end';
import Image from 'next/image';
import { getFile } from '@/utils/utilitY-functions';

type PaymentInvoiceType = {
  collectionDate: any;
  leftFeesTableTotalCalculation: object | null;
  feesUserData: any;
  totalDueValue: string;
  leftFeesTableData: Array<any>;
  setShowPrint?: (arg: boolean) => void;
  printFees: any[];
  student: any;
  student_id: any;
  printAndCollect: Boolean;
  setPrintAndCollect?: (arg: boolean) => void;
  setIsCompleteUpdate: (arg: boolean) => void;
  schoolData: Data;
  teacherFees: any[];
  userInformation: any;
  isOn: boolean;
};

const DesignPaymentInvoice: FC<PaymentInvoiceType> = ({
  userInformation,
  schoolData,
  printAndCollect,
  setPrintAndCollect,
  student_id,
  collectionDate,
  leftFeesTableTotalCalculation,
  feesUserData,
  totalDueValue,
  leftFeesTableData,
  setShowPrint,
  printFees,
  student,
  setIsCompleteUpdate,
  teacherFees,
  isOn
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
  const [totalPreviousDiscount, setTotalPreviousDiscount] = useState(0);

  const { username } = user || {};

  // date
  let date = dayjs(new Date(collectionDate));
  // date = date.subtract(1, 'day');
  let formattedDate = collectionDate.format('DD-MM-YYYY');
  // console.log({date,formattedDate},collectionDate.format('DD-MM-YYYY'));
  useEffect(() => {
    // update teacher name information part code start
    for (let i = 0; i < teacherFees.length; i++) {
      for (let j = 0; j < leftFeesTableData.length; j++) {
        if (teacherFees[i].subject_id === leftFeesTableData[j].subject_id && teacherFees[i].class_id === leftFeesTableData[j].class_id) {
          leftFeesTableData[j]['teacher_name'] = [
            teacherFees[i].teacher.first_name,
            teacherFees[i].teacher.middle_name,
            teacherFees[i].teacher.last_name
          ]
            .filter(Boolean)
            .join(' ');
        }
      }
    }
    // update teacher name information part code end

    let temp = printFees.map((payment: any) => {
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

      return {
        ...payment
      };
    });

    // update printFees data start
    for (let i = 0; i < temp.length; i++) {
      for (let j = 0; j < leftFeesTableData.length; j++) {
        if (temp[i].fee_id === leftFeesTableData[j].feeId) {
          let sum = 0;
          sum =
            Number(temp[i].payableAmount) -
            (Number(leftFeesTableData[j].dueAmount) +
              Number(temp[i].paidAmount) +
              Number(leftFeesTableData[j].on_time_discount + leftFeesTableData[j].discount));

          temp[i].prevAmount = sum;
          temp[i].due = leftFeesTableData[j].dueAmount;
          // temp[i].head_title = leftFeesTableData[j].head_title;
          temp[i].prev_disount = leftFeesTableData[j].discount + (leftFeesTableData[j].on_time_discount - temp[i].on_time_discount);
          temp[i].payableAmount = temp[i].payableAmount - leftFeesTableData[j].discount;
          temp[i]['subject_name'] = leftFeesTableData[j]?.subject_name;
          temp[i]['teacher_name'] = leftFeesTableData[j]?.teacher_name;
        }
      }
    }

    // update printFees data end
    const totalCurrentDiscountValue = temp.reduce((prev, curr) => prev + Number(curr.on_time_discount), 0) || 0;
    setTotalCurrentDiscountAmount(totalCurrentDiscountValue);
    const totalPrePaidvalue =
      temp.reduce((prev, curr) => {
        if (curr?.prevAmount) {
          return prev + Number(curr.prevAmount);
        } else {
          return prev;
        }
      }, 0) || 0;

    setTotalPreDueAmount(totalPrePaidvalue);
    const totalDueValue = temp.reduce((prev, curr) => prev + Number(curr.due), 0) || 0;

    setTotalDueAmount(Number(totalDueValue));

    const totalPaidAmount_ = temp.reduce((prev, curr) => prev + (Number(curr.paidAmount) || 0), 0) || 0;

    setTotalPaidAmount(totalPaidAmount_);
    setWord(numberToWordConverter(totalPaidAmount_));

    // findout head title
    // for (let i = 0; i < temp.length; i++) {
    //   for (let j = 0; j < leftFeesTableData.length; j++) {
    //     if (temp[i].fee_id === leftFeesTableData[j].feeId) {
    //       temp[i].head_title = leftFeesTableData[j].head_title;
    //     }
    //   }
    // }

    const totalPrevDiscountValue =
      temp.reduce((prev, curr) => {
        if (curr?.prev_disount) {
          return prev + Number(curr.prev_disount);
        } else {
          return prev;
        }
      }, 0) || 0;

    setTotalPreviousDiscount(Number(totalPrevDiscountValue));
    const totalAmount = temp.reduce((prev, curr) => prev + Number(curr.payableAmount), 0) || 0;
    setTotalFeeamount(totalAmount);

    setSelectedFees(temp);
    if (printFees.length > 0) {
      setShowPrint(true);
      // setTimeout(() => setIsCompleteUpdate(true), 1);

      // setPrintAndCollect(true);
    }
  }, [printFees, leftFeesTableData]);

  let calAmount = totalPreAmount + totalPaidAmount;
  let sumPaidAmount = Number(calAmount.toFixed(2));

  return (
    <Grid px={4}>
      {/* part 1 */}
      {isOn && (
        <Grid pt={2} height={`${selectedFees.length <= 5 ? '50vh' : '100vh'}`}>
          {/* school information */}

          <Grid
            sx={{
              borderBottom: '1px solid #000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            pb={1}
            mb={0.5}
          >
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
                    height={50}
                    width={50}
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
                Student Payment Receipt
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                Received By: {username}
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                Office Copy
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
                  Student Name & Id
                </Typography>
                <Typography variant="body1" sx={{ color: '#000' }}>
                  Batch
                </Typography>
              </Grid>
              <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <Typography variant="body1" sx={{ color: '#000' }}>
                  : {selectedFees[0]?.tracking_number}
                </Typography>
                <Typography variant="body1" sx={{ color: '#000' }}>
                  : {`${[feesUserData?.first_name, feesUserData?.middle_name, feesUserData?.last_name].join(' ')} (${student_id})`}
                </Typography>
                <Typography variant="body1" sx={{ color: '#000' }}>
                  : {feesUserData?.section_name}
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
                <Typography variant="body1" sx={{ color: '#000' }}>
                  Phone No
                </Typography>
              </Grid>
              <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <Typography variant="body1" sx={{ color: '#000' }}>
                  : {formattedDate}
                </Typography>
                <Typography variant="body1" sx={{ color: '#000' }}>
                  : {feesUserData?.class_name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#000' }}>
                  : {feesUserData?.class_roll_no}
                </Typography>
                <Typography variant="body1" sx={{ color: '#000' }}>
                  : {userInformation?.phone}
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

                    {selectedFees.find((item) => item.teacher_name) ? (
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
                        Teacher Name
                      </TableCell>
                    ) : (
                      ''
                    )}

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
                      Prev. Paid
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
                      Prev. Discount
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
                  {selectedFees?.map((payment, index) => {
                    return (
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
                          {payment?.head_title && payment?.fee_id ? `${payment?.head_title} (${payment?.title})` : payment?.title}

                          {/* {[payment?.head_title, payment?.title, payment?.subject_name].filter(Boolean)[0] +
                          ' ' +
                          [payment?.head_title, payment?.title, payment?.subject_name]
                            .filter(Boolean)
                            .slice(1)
                            .map((item) => `(${item})`)
                            .join(' ')} */}
                        </TableCell>

                        {selectedFees.find((item) => item.teacher_name) ? (
                          <TableCell
                            align="left"
                            style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                          >
                            {payment?.teacher_name ? payment?.teacher_name : ''}
                          </TableCell>
                        ) : (
                          ''
                        )}

                        <TableCell
                          align="left"
                          style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                        >
                          {payment?.payableAmount?.toFixed(2)}
                        </TableCell>
                        <TableCell
                          align="left"
                          style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                        >
                          {payment.prevAmount ? formatNumber(payment?.prevAmount?.toFixed(2)) : 0}
                        </TableCell>
                        <TableCell
                          align="left"
                          style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                        >
                          {payment.prev_disount ? formatNumber(payment.prev_disount?.toFixed(2)) : 0}
                        </TableCell>
                        <TableCell
                          align="left"
                          style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                        >
                          {payment.paidAmount ? formatNumber(payment.paidAmount?.toFixed(2)) : 0}
                        </TableCell>
                        <TableCell
                          align="left"
                          style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                        >
                          {payment.on_time_discount && payment.fee_id ? formatNumber(payment.on_time_discount?.toFixed(2)) : 0}
                        </TableCell>
                        <TableCell
                          align="left"
                          style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                        >
                          {payment.paidAmount ? formatNumber(payment.due?.toFixed(2)) : 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell
                      colSpan={selectedFees.find((item) => item.teacher_name) ? 2 : 1}
                      component="th"
                      scope="row"
                      align="left"
                      style={{
                        border: '1px solid black',
                        fontWeight: 'bold',
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
                        fontWeight: 'bold',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        paddingTop: '2px',
                        paddingBottom: '2px'
                      }}
                    >
                      {totalFeeamount?.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="left"
                      style={{
                        border: '1px solid black',
                        fontWeight: 'bold',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        paddingTop: '2px',
                        paddingBottom: '2px'
                      }}
                    >
                      {totalPreAmount?.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="left"
                      style={{
                        border: '1px solid black',
                        fontWeight: 'bold',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        paddingTop: '2px',
                        paddingBottom: '2px'
                      }}
                    >
                      {totalPreviousDiscount?.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="left"
                      style={{
                        border: '1px solid black',
                        fontWeight: 'bold',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        paddingTop: '2px',
                        paddingBottom: '2px'
                      }}
                    >
                      {totalPaidAmount?.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="left"
                      style={{
                        border: '1px solid black',
                        fontWeight: 'bold',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        paddingTop: '2px',
                        paddingBottom: '2px'
                      }}
                    >
                      {totalCurrentDisountAmount?.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="left"
                      style={{
                        border: '1px solid black',
                        fontWeight: 'bold',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        paddingTop: '2px',
                        paddingBottom: '2px'
                      }}
                    >
                      {totalDueAmount?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          {/* taka in words */}
          {/* <Typography variant="body1" sx={{ fontWeight: 'bold' }} my={1}>
          In Words: One Thousand
        </Typography> */}
          <Grid container sx={{ fontWeight: 'bold' }} my={1} justifyContent="space-between">
            <Grid sx={{ textTransform: 'capitalize' }}>
              IN WORD:{' '}
              <b>
                {word} {user?.school?.currency} only
              </b>
            </Grid>
            <Grid>
              Paid: <b>{formatNumber(parseFloat(Number(totalPaidAmount).toFixed(2)))}</b>
            </Grid>
          </Grid>
          {/* table two */}
          {/* <Grid mt={1} mb={6}>
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
                  <TableCell
                    align="left"
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
                    Total Due
                  </TableCell>
                  <TableCell
                    align="left"
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
                    {totalDueAmount?.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                ></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid> */}
          {/* signature  */}
          <Grid sx={{ display: 'flex', justifyContent: 'space-between', gap: 8, pt: 3 }}>
            <Grid sx={{ flexGrow: 1 }}>
              <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
              <Grid textAlign="center">Student/Guardian Signature </Grid>
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
      )}

      {/* part 2 */}
      <Grid pt={2} height="50vh">
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
              Student Payment Receipt
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              Received By: {username}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              Student Copy
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
                Student Name & Id
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                Batch
              </Typography>
            </Grid>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {selectedFees[0]?.tracking_number}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {`${[feesUserData?.first_name, feesUserData?.middle_name, feesUserData?.last_name].join(' ')} (${student_id})`}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {feesUserData?.section_name}
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
              <Typography variant="body1" sx={{ color: '#000' }}>
                Phone No
              </Typography>
            </Grid>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {formattedDate}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {feesUserData?.class_name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {feesUserData?.class_roll_no}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>
                : {userInformation?.phone}
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
                  {selectedFees.find((item) => item.teacher_name) ? (
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
                      Teacher Name
                    </TableCell>
                  ) : (
                    ''
                  )}

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
                    Prev. Paid
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
                    Prev. Discount
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
                {selectedFees?.map((payment, index) => {
                  return (
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
                        {payment?.head_title && payment?.fee_id ? `${payment?.head_title} (${payment?.title})` : payment?.title}
                      </TableCell>

                      {selectedFees.find((item) => item.teacher_name) ? (
                        <TableCell
                          align="left"
                          style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                        >
                          {payment?.teacher_name ? payment?.teacher_name : ''}
                        </TableCell>
                      ) : (
                        ''
                      )}

                      <TableCell
                        align="left"
                        style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                      >
                        {payment?.payableAmount?.toFixed(2)}
                      </TableCell>
                      <TableCell
                        align="left"
                        style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                      >
                        {payment.prevAmount ? formatNumber(payment?.prevAmount?.toFixed(2)) : 0}
                      </TableCell>
                      <TableCell
                        align="left"
                        style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                      >
                        {payment.prev_disount ? formatNumber(payment.prev_disount?.toFixed(2)) : 0}
                      </TableCell>
                      <TableCell
                        align="left"
                        style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                      >
                        {payment.paidAmount ? formatNumber(payment.paidAmount?.toFixed(2)) : 0}
                      </TableCell>
                      <TableCell
                        align="left"
                        style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                      >
                        {payment.on_time_discount && payment.fee_id ? formatNumber(payment.on_time_discount?.toFixed(2)) : 0}
                      </TableCell>
                      <TableCell
                        align="left"
                        style={{ border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px' }}
                      >
                        {payment.paidAmount ? formatNumber(payment.due?.toFixed(2)) : 0}
                      </TableCell>
                    </TableRow>
                  );
                })}

                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell
                    colSpan={selectedFees.find((item) => item.teacher_name) ? 2 : 1}
                    component="th"
                    scope="row"
                    align="left"
                    style={{
                      border: '1px solid black',
                      fontWeight: 'bold',
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
                      fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {totalFeeamount?.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {totalPreAmount?.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {totalPreviousDiscount?.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {totalPaidAmount?.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {totalCurrentDisountAmount?.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{
                      border: '1px solid black',
                      fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {totalDueAmount?.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        {/* taka in words */}
        {/* <Typography variant="body1" sx={{ fontWeight: 'bold' }} my={1}>
             In Words: One Thousand
           </Typography> */}
        <Grid container sx={{ fontWeight: 'bold' }} my={1} justifyContent="space-between">
          <Grid sx={{ textTransform: 'capitalize' }}>
            IN WORD:{' '}
            <b>
              {word} {user?.school?.currency} only
            </b>
          </Grid>
          <Grid>
            Paid: <b>{formatNumber(parseFloat(Number(totalPaidAmount).toFixed(2)))}</b>
          </Grid>
        </Grid>
        {/* table two */}
        {/* <Grid mt={1} mb={6}>
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
                  <TableCell
                    align="left"
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
                    Total Due
                  </TableCell>
                  <TableCell
                    align="left"
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
                    {totalDueAmount?.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                ></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid> */}
        {/* signature  */}
        <Grid sx={{ display: 'flex', justifyContent: 'space-between', gap: 8, pt: 3 }}>
          <Grid sx={{ flexGrow: 1 }}>
            <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
            <Grid textAlign="center">Student/Guardian Signature </Grid>
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

export default DesignPaymentInvoice;

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
