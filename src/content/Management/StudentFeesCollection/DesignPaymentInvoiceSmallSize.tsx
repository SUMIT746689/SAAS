import { Grid, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Avatar } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, FC, useRef } from 'react';
import { formatNumber } from '@/utils/numberFormat';
import dayjs from 'dayjs';
import { Data } from '@/models/front_end';
import Image from 'next/image';
import { getFile } from '@/utils/utilitY-functions';
import { BoltRounded } from '@mui/icons-material';
import axios from 'axios';
import { red } from '@mui/material/colors';

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

const DesignPaymentInvoiceSmallSize: FC<PaymentInvoiceType> = ({
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

  const [schoolInformation, setSchoolInformation] = useState(null);
  // school logo
  useEffect(() => {
    axios
      .get(`/api/front_end`)
      .then((res) => {
        setSchoolInformation(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  // date
  let date = dayjs(new Date(collectionDate));
  // date = date.subtract(1, 'day');
  let formattedDate = collectionDate.format('DD-MM-YYYY');

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

  console.log({ feesUserData });

  const paragraphStyle = { fontFamily: "monospace", textAlign: 'center', fontSize: '0.7rem' };

  const paragraphStyleInfo = { fontFamily: "monospace", fontSize: '0.7rem' };

  const tableCellStyle = { border: '1px solid black', paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', fontSize: '0.7rem', paddingBottom: '2px', textTransform: 'capitalize' }
  const color = "black"
  const fontFamily = "monospace"
  return (
    <Grid>
      {/* part 1 */}
      <Grid pt={2} width={'340px'}>
        {/* school information */}
        <Grid sx={{ borderBottom: '1px solid #000', alignItems: 'center' }} mb={0.5}>
          <Grid sx={{ display: 'grid', gridTemplateColumns: '1fr 4fr 1fr' }}>
            {/* school logo */}
            <Grid sx={{ my: 'auto', ml: 'auto' }}>
              {schoolInformation?.header_image ? (
                <Image
                  src={getFile(schoolInformation?.header_image)}
                  width={50}
                  height={50}
                  alt="school logo"
                // style={{ position: 'relative', bottom: 0 }}
                />
              ) : (
                ''
              )}
            </Grid>
            <Grid sx={{ textAlign: 'center', color: "black" }}>
              <h1 style={{ textAlign: "center", fontFamily: "CG Times" }}>
                {user?.school?.name}
              </h1>
              {/* @ts-ignore */}
              <p style={paragraphStyle}>
                {user?.school?.address}
              </p>
              {/* @ts-ignore */}
              <p style={paragraphStyle}>Student Payment Receipt</p>
              {/* @ts-ignore */}
              <p style={paragraphStyle}>
                Received By: {username}
              </p>
              {/* @ts-ignore */}
              <p style={paragraphStyle}>
                Student Copy
              </p>
            </Grid>
          </Grid>
          {/* <Grid width="80px" height="80px"></Grid> */}
        </Grid>

        {/* student information */}
        <Grid sx={{ display: 'flex', flexDirection: 'column' }}>
          <Grid sx={{ display: 'flex', gap: '20px' }}>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px', color: "black" }}>
              <p style={paragraphStyleInfo}>
                Rec. No.
              </p>
              <p style={paragraphStyleInfo}>
                Student Name & Id
              </p>
              <p style={paragraphStyleInfo}>
                Batch
              </p>
            </Grid>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px', color: "black" }}>
              <p style={paragraphStyleInfo}>
                : {selectedFees[0]?.tracking_number}
              </p>
              <p style={paragraphStyleInfo}>
                : {`${[feesUserData?.first_name, feesUserData?.middle_name, feesUserData?.last_name].join(' ')} (${student_id})`}
              </p>
              <p style={paragraphStyleInfo}>
                : {feesUserData?.section_name}
              </p>
            </Grid>
          </Grid>
          <Grid sx={{ display: 'flex', gap: '20px' }}>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px', color: "black" }}>
              <p style={paragraphStyleInfo}>
                Date
              </p>
              <p style={paragraphStyleInfo}>
                Class
              </p>
              <p style={paragraphStyleInfo}>
                Roll No
              </p>
              <p style={paragraphStyleInfo}>
                Phone No
              </p>
            </Grid>
            <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px', color: "black" }}>
              <p style={paragraphStyleInfo}>
                : {formattedDate}
              </p>
              <p style={paragraphStyleInfo}>
                : {feesUserData?.class_name}
              </p>
              <p style={paragraphStyleInfo}>
                : {feesUserData?.class_roll_no}
              </p>
              <p style={paragraphStyleInfo}>
                : {userInformation?.phone}
              </p>
            </Grid>
          </Grid>
        </Grid>

        {/* table one */}
        <Grid mt={1}>
          <TableContainer sx={{ borderRadius: 0, fontWeight: "normal" }}>
            <Table sx={{ minWidth: '340px', maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    style={{
                      border: '1px solid black',
                      textTransform: 'capitalize',
                      // fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      fontSize: '0.7rem',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                      // color: '#000'
                    }}
                  >
                    Particulars
                  </TableCell>
                </TableRow>

                {/* <TableRow>
                    {selectedFees.find((item) => item.teacher_name) ? (
                      <TableCell
                        style={{
                          border: '1px solid black',
                          textTransform: 'capitalize',
                          // fontWeight: 'bold',
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
                  </TableRow> */}

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
                        style={{
                          border: '1px solid black',
                          // fontWeight: 'bold',
                          color,
                          fontFamily,
                          paddingLeft: '5px',
                          paddingRight: '5px',
                          paddingTop: '2px',
                          fontSize: '0.7rem',
                          paddingBottom: '2px',
                          textTransform: 'capitalize',
                          fontWeight: "normal"

                        }}
                      >
                        {payment?.head_title && payment?.fee_id ? `${payment?.head_title} (${payment?.title})` : payment?.title} <br />

                        {/* {selectedFees.find((item) => item.teacher_name) ? `Teacher Name: ${payment?.teacher_name ? payment?.teacher_name : ''}` : ''} */}

                        {payment?.teacher_name ? `Teacher Name: ${payment?.teacher_name}` : ''}

                        {/* {[payment?.head_title, payment?.title, payment?.subject_name].filter(Boolean)[0] +
                          ' ' +
                          [payment?.head_title, payment?.title, payment?.subject_name]
                            .filter(Boolean)
                            .slice(1)
                            .map((item) => `(${item})`)
                            .join(' ')} */}
                      </TableCell>

                      {/* {selectedFees.find((item) => item.teacher_name) ? (
                          <TableCell
                            align="left"
                            style={{
                              border: '1px solid black',
                              // fontWeight: 'bold',
                              paddingLeft: '5px',
                              paddingRight: '5px',
                              paddingTop: '2px',
                              fontSize: '0.7rem',
                              paddingBottom: '2px'
                            }}
                          >
                            {payment?.teacher_name ? payment?.teacher_name : ''}
                          </TableCell>
                        ) : (
                          ''
                        )} */}

                      <TableCell
                        align="right"
                        style={{
                          border: '1px solid black',
                          // fontWeight: 'bold',
                          fontFamily,
                          color,
                          paddingLeft: '5px',
                          paddingRight: '5px',
                          paddingTop: '2px',
                          fontSize: '0.7rem',
                          paddingBottom: '2px',
                          fontWeight: "normal"

                        }}
                      >
                        {payment?.payableAmount?.toFixed(2)}
                      </TableCell>
                      {/* <TableCell
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
                      </TableCell> */}
                    </TableRow>
                  );
                })}

                <TableRow>
                  <TableCell
                    // colSpan={selectedFees.find((item) => item.teacher_name) ? 2 : 1}
                    colSpan={1}
                    component="th"
                    scope="row"
                    align="left"
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      fontFamily,
                      color,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      fontSize: '0.7rem',
                      textTransform: 'capitalize',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    Payable Amt.
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      fontFamily,
                      color,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',

                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    {/* {totalPreAmount?.toFixed(2)} */}
                    {selectedFees?.reduce((prev, payment) => prev + (payment?.payableAmount || 0), 0)?.toFixed(2)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      fontFamily,
                      color,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',

                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    Prev. Paid
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      color,
                      fontFamily,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',

                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    {totalPreAmount?.toFixed(2)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      color,
                      fontFamily,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',

                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    Prev. Discount
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      fontFamily,
                      color,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',

                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    {totalPreviousDiscount?.toFixed(2)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      color,
                      fontFamily,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',

                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    Paid Amt
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      fontFamily,
                      color,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',

                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    {totalPaidAmount?.toFixed(2)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',
                      fontFamily,
                      color,
                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    Discount
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      fontFamily,
                      color,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',
                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    {totalCurrentDisountAmount?.toFixed(2)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    style={{
                      border: '1px solid black',
                      // fontWeight: 'bold',
                      fontFamily,
                      color,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',
                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

                    }}
                  >
                    Due Amt.
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{
                      border: '1px solid black',
                      fontFamily,
                      color,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      textTransform: 'capitalize',
                      paddingTop: '2px',
                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"

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
                >
                  <TableCell
                    // colSpan={selectedFees.find((item) => item.teacher_name) ? 2 : 1}
                    colSpan={1}
                    component="th"
                    scope="row"
                    align="left"
                    style={{
                      fontFamily,
                      color,
                      border: '1px solid black',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      fontSize: '0.7rem',
                      paddingBottom: '2px',
                      fontWeight: "normal"
                    }}
                  >
                    Total Due
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{
                      fontFamily,
                      color,
                      border: '1px solid black',
                      fontSize: '0.7rem',
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
        <Grid container sx={{ gap: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }} my={1}>
          <Grid
            sx={{
              fontSize: '0.7rem'
            }}
          >
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
            <Table sx={{ minWidth: '340px', maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    style={{
                      border: '1px solid black',
                      textTransform: 'capitalize',
                      // fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      fontSize: '0.7rem',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                      // color: '#000'
                    }}
                  >
                    Payment Status
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
                      fontSize: '0.7rem',
                      paddingRight: '5px',
                      paddingTop: '2px',
                      textTransform: 'capitalize',
                      paddingBottom: '2px'
                    }}
                  >
                    Total Due
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{
                      border: '1px solid black',
                      width: '20%',
                      fontWeight: 'bold',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      fontSize: '0.7rem',
                      paddingTop: '2px',
                      paddingBottom: '2px'
                    }}
                  >
                    {totalDueAmount?.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody></TableBody>
            </Table>
          </TableContainer>
        </Grid> */}
        {/* signature  */}
        <Grid sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
          <Grid sx={{ flexGrow: 1, fontSize: '0.7rem' }}>
            <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
            <Grid>Student/Guardian Signature </Grid>
          </Grid>
          <Grid sx={{ flexGrow: 1, fontSize: '0.7rem' }}>
            <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
            <Grid>Superintendent Signature </Grid>
          </Grid>
          <Grid sx={{ flexGrow: 1, fontSize: '0.7rem' }}>
            <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
            <Grid>Accounts Officer </Grid>
          </Grid>

          <Grid sx={{ flexGrow: 1, fontSize: '0.6rem' }}>
            <Grid sx={{ textAlign: 'center' }}>Powered By Edu360</Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* part 2 */}
      {isOn && (
        <Grid pt={2} width={'340px'}>
          {/* school information */}
          <Grid sx={{ borderBottom: '1px solid #000', alignItems: 'center' }} mb={0.5}>
            <Grid sx={{ display: 'grid', gridTemplateColumns: '1fr 4fr 1fr' }}>
              {/* school logo */}
              <Grid sx={{ my: 'auto', ml: 'auto' }}>
                {schoolInformation?.header_image ? (
                  <Image
                    src={getFile(schoolInformation?.header_image)}
                    width={50}
                    height={50}
                    alt="school logo"
                  // style={{ position: 'relative', bottom: 0 }}
                  />
                ) : (
                  ''
                )}
              </Grid>
              <Grid sx={{ textAlign: 'center', color: "black" }}>
                <h1 style={{ textAlign: "center", fontFamily: "CG Times" }}>
                  {user?.school?.name}
                </h1>
                {/* @ts-ignore */}
                <p style={paragraphStyle}>
                  {user?.school?.address}
                </p>
                {/* @ts-ignore */}
                <p style={paragraphStyle}>Student Payment Receipt</p>
                {/* @ts-ignore */}
                <p style={paragraphStyle}>
                  Received By: {username}
                </p>
                {/* @ts-ignore */}
                <p style={paragraphStyle}>
                  Office Copy
                </p>
              </Grid>
            </Grid>
            {/* <Grid width="80px" height="80px"></Grid> */}
          </Grid>

          {/* student information */}
          <Grid sx={{ display: 'flex', flexDirection: 'column' }}>
            <Grid sx={{ display: 'flex', gap: '20px' }}>
              <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px', color: "black" }}>
                <p style={paragraphStyleInfo}>
                  Rec. No.
                </p>
                <p style={paragraphStyleInfo}>
                  Student Name & Id
                </p>
                <p style={paragraphStyleInfo}>
                  Batch
                </p>
              </Grid>
              <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px', color: "black" }}>
                <p style={paragraphStyleInfo}>
                  : {selectedFees[0]?.tracking_number}
                </p>
                <p style={paragraphStyleInfo}>
                  : {`${[feesUserData?.first_name, feesUserData?.middle_name, feesUserData?.last_name].join(' ')} (${student_id})`}
                </p>
                <p style={paragraphStyleInfo}>
                  : {feesUserData?.section_name}
                </p>
              </Grid>
            </Grid>
            <Grid sx={{ display: 'flex', gap: '20px' }}>
              <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px', color: "black" }}>
                <p style={paragraphStyleInfo}>
                  Date
                </p>
                <p style={paragraphStyleInfo}>
                  Class
                </p>
                <p style={paragraphStyleInfo}>
                  Roll No
                </p>
                <p style={paragraphStyleInfo}>
                  Phone No
                </p>
              </Grid>
              <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '2px', color: "black" }}>
                <p style={paragraphStyleInfo}>
                  : {formattedDate}
                </p>
                <p style={paragraphStyleInfo}>
                  : {feesUserData?.class_name}
                </p>
                <p style={paragraphStyleInfo}>
                  : {feesUserData?.class_roll_no}
                </p>
                <p style={paragraphStyleInfo}>
                  : {userInformation?.phone}
                </p>
              </Grid>
            </Grid>
          </Grid>

          {/* table one */}
          <Grid mt={1}>
            <TableContainer sx={{ borderRadius: 0, fontWeight: "normal" }}>
              <Table sx={{ minWidth: '340px', maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      style={{
                        border: '1px solid black',
                        textTransform: 'capitalize',
                        // fontWeight: 'bold',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        fontSize: '0.7rem',
                        paddingTop: '2px',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                        // color: '#000'
                      }}
                    >
                      Particulars
                    </TableCell>
                  </TableRow>

                  {/* <TableRow>
                  {selectedFees.find((item) => item.teacher_name) ? (
                    <TableCell
                      style={{
                        border: '1px solid black',
                        textTransform: 'capitalize',
                        // fontWeight: 'bold',
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
                </TableRow> */}

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
                          style={{
                            border: '1px solid black',
                            // fontWeight: 'bold',
                            color,
                            fontFamily,
                            paddingLeft: '5px',
                            paddingRight: '5px',
                            paddingTop: '2px',
                            fontSize: '0.7rem',
                            paddingBottom: '2px',
                            textTransform: 'capitalize',
                            fontWeight: "normal"

                          }}
                        >
                          {payment?.head_title && payment?.fee_id ? `${payment?.head_title} (${payment?.title})` : payment?.title} <br />

                          {/* {selectedFees.find((item) => item.teacher_name) ? `Teacher Name: ${payment?.teacher_name ? payment?.teacher_name : ''}` : ''} */}

                          {payment?.teacher_name ? `Teacher Name: ${payment?.teacher_name}` : ''}

                          {/* {[payment?.head_title, payment?.title, payment?.subject_name].filter(Boolean)[0] +
                        ' ' +
                        [payment?.head_title, payment?.title, payment?.subject_name]
                          .filter(Boolean)
                          .slice(1)
                          .map((item) => `(${item})`)
                          .join(' ')} */}
                        </TableCell>

                        {/* {selectedFees.find((item) => item.teacher_name) ? (
                        <TableCell
                          align="left"
                          style={{
                            border: '1px solid black',
                            // fontWeight: 'bold',
                            paddingLeft: '5px',
                            paddingRight: '5px',
                            paddingTop: '2px',
                            fontSize: '0.7rem',
                            paddingBottom: '2px'
                          }}
                        >
                          {payment?.teacher_name ? payment?.teacher_name : ''}
                        </TableCell>
                      ) : (
                        ''
                      )} */}

                        <TableCell
                          align="right"
                          style={{
                            border: '1px solid black',
                            // fontWeight: 'bold',
                            fontFamily,
                            color,
                            paddingLeft: '5px',
                            paddingRight: '5px',
                            paddingTop: '2px',
                            fontSize: '0.7rem',
                            paddingBottom: '2px',
                            fontWeight: "normal"

                          }}
                        >
                          {payment?.payableAmount?.toFixed(2)}
                        </TableCell>
                        {/* <TableCell
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
                    </TableCell> */}
                      </TableRow>
                    );
                  })}

                  <TableRow>
                    <TableCell
                      // colSpan={selectedFees.find((item) => item.teacher_name) ? 2 : 1}
                      colSpan={1}
                      component="th"
                      scope="row"
                      align="left"
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        fontFamily,
                        color,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        paddingTop: '2px',
                        fontSize: '0.7rem',
                        textTransform: 'capitalize',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      Payable Amt.
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        fontFamily,
                        color,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',

                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      {/* {totalPreAmount?.toFixed(2)} */}
                      {selectedFees?.reduce((prev, payment) => prev + (payment?.payableAmount || 0), 0)?.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        fontFamily,
                        color,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',

                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      Prev. Paid
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        color,
                        fontFamily,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',

                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      {totalPreAmount?.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        color,
                        fontFamily,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',

                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      Prev. Discount
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        fontFamily,
                        color,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',

                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      {totalPreviousDiscount?.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        color,
                        fontFamily,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',

                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      Paid Amt
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        fontFamily,
                        color,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',

                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      {totalPaidAmount?.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',
                        fontFamily,
                        color,
                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      Discount
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        fontFamily,
                        color,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',
                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      {totalCurrentDisountAmount?.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      style={{
                        border: '1px solid black',
                        // fontWeight: 'bold',
                        fontFamily,
                        color,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',
                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

                      }}
                    >
                      Due Amt.
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{
                        border: '1px solid black',
                        fontFamily,
                        color,
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        textTransform: 'capitalize',
                        paddingTop: '2px',
                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"

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
                  >
                    <TableCell
                      // colSpan={selectedFees.find((item) => item.teacher_name) ? 2 : 1}
                      colSpan={1}
                      component="th"
                      scope="row"
                      align="left"
                      style={{
                        fontFamily,
                        color,
                        border: '1px solid black',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        paddingTop: '2px',
                        fontSize: '0.7rem',
                        paddingBottom: '2px',
                        fontWeight: "normal"
                      }}
                    >
                      Total Due
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{
                        fontFamily,
                        color,
                        border: '1px solid black',
                        fontSize: '0.7rem',
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
          <Grid container sx={{ gap: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }} my={1}>
            <Grid
              sx={{
                fontSize: '0.7rem'
              }}
            >
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
          <Table sx={{ minWidth: '340px', maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell
                  colSpan={4}
                  style={{
                    border: '1px solid black',
                    textTransform: 'capitalize',
                    // fontWeight: 'bold',
                    paddingLeft: '5px',
                    paddingRight: '5px',
                    fontSize: '0.7rem',
                    paddingTop: '2px',
                    paddingBottom: '2px'
                    // color: '#000'
                  }}
                >
                  Payment Status
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
                    fontSize: '0.7rem',
                    paddingRight: '5px',
                    paddingTop: '2px',
                    textTransform: 'capitalize',
                    paddingBottom: '2px'
                  }}
                >
                  Total Due
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    border: '1px solid black',
                    width: '20%',
                    fontWeight: 'bold',
                    paddingLeft: '5px',
                    paddingRight: '5px',
                    fontSize: '0.7rem',
                    paddingTop: '2px',
                    paddingBottom: '2px'
                  }}
                >
                  {totalDueAmount?.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody></TableBody>
          </Table>
        </TableContainer>
      </Grid> */}
          {/* signature  */}
          <Grid sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
            <Grid sx={{ flexGrow: 1, fontSize: '0.7rem' }}>
              <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
              <Grid>Student/Guardian Signature </Grid>
            </Grid>
            <Grid sx={{ flexGrow: 1, fontSize: '0.7rem' }}>
              <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
              <Grid>Superintendent Signature </Grid>
            </Grid>
            <Grid sx={{ flexGrow: 1, fontSize: '0.7rem' }}>
              <Grid sx={{ height: '1px', backgroundColor: '#000' }}></Grid>
              <Grid>Accounts Officer </Grid>
            </Grid>

            <Grid sx={{ flexGrow: 1, fontSize: '0.6rem' }}>
              <Grid sx={{ textAlign: 'center' }}>Powered By Edu360</Grid>
            </Grid>
          </Grid>
        </Grid>

      )}

    </Grid>
  );
};

export default DesignPaymentInvoiceSmallSize;

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
