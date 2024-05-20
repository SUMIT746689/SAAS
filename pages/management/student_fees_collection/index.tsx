import Head from 'next/head';
import { useState, useEffect, useRef, ChangeEvent, MouseEvent, useContext } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import Footer from 'src/components/Footer';
import { Button, Card, Grid } from '@mui/material';
import type { Project } from 'src/models/project';
import Results from 'src/content/Management/StudentFeesCollection/Results';
import { useClientFetch } from 'src/hooks/useClientFetch';
import PaymentInvoice from '@/content/Management/StudentFeesCollection/PaymentInvoice';
import DesignPaymentInvoice from '@/content/Management/StudentFeesCollection/DesignPaymentInvoice';
import { useReactToPrint } from 'react-to-print';
import { ButtonWrapper, SearchingButtonWrapper } from '@/components/ButtonWrapper';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import LeftBox from '@/content/FeesCollect/LeftBox';
import RightBox from '@/content/FeesCollect/RightBox';
import LeftFeesTable from '@/content/FeesCollect/LeftFeesTable';
import RightFeesTable from '@/content/FeesCollect/RightFeesTable';
import PaymentOptions from '@/content/FeesCollect/PaymentOptions';
import Reset_Sent_SMS_Collect_Invoice from '@/content/FeesCollect/Reset_Sent_SMS_Collect_Invoice';
import dayjs from 'dayjs';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { monthList } from '@/utils/getDay';

// updated searching code start

// const monthData = [
//   { label: 'January', id: 1 },
//   { label: 'February', id: 2 },
//   { label: 'March', id: 3 },
//   { label: 'April', id: 4 },
//   { label: 'May', id: 5 },
//   { label: 'June', id: 6 },
//   { label: 'July', id: 7 },
//   { label: 'August', id: 8 },
//   { label: 'September', id: 9 },
//   { label: 'October', id: 10 },
//   { label: 'November', id: 11 },
//   { label: 'December', id: 12 }
// ];
const monthData = monthList.map((month) => ({ label: month, value: month }));

// updated searching code end

function Managementschools() {
  // updated code start
  const [searchValue, setSearchValue] = useState<any>(null);
  const [searchOptionData, setSearchOptionData] = useState<Array<any>>([]);
  const [userInformation, setUserInformation] = useState<any>(null);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [leftFeesTableData, setLeftFeesTableData] = useState<Array<any>>([]);
  const [totalDueValue, setTotalDueValue] = useState<string>('0');
  const [feesUserData, setFeesUserData] = useState<object>({});
  const [selectedRowsFeesTable, setSelectedRowsFeesTable] = useState([]);
  const [leftFeesTableTotalCalculation, setLeftFeesTableTotalCalculation] = useState<object | null>(null);
  const [trackingCollectButton, setTrackingCollectButton] = useState<Boolean>(false);
  const [selectAll, setSelectAll] = useState<Boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [transID, setTransID] = useState<string | null>(null);
  const [feesName, setFeesName] = useState<any>(null);
  const [feesAmount, setFeesAmount] = useState<string | null>(null);
  const [collect_other_fees_btn, setCollect_other_fees_btn] = useState<boolean>(false);
  const [totalFeesCalculate, setTotalFeesCalculate] = useState<string | null>(null);
  const [amount, setAmount] = useState(null);
  const [student_id, setStudentId] = useState<string>('');
  const [collectionDate, setCollectionDate] = useState<any>(dayjs(Date.now()));
  const [leftFeesTableColumnDataState, setLeftFeesTableColumnDataState] = useState<any>();
  //const [currDiscount, setCurrDiscount] = useState<string | null>(null);
  const [currDiscount, setCurrDiscount] = useState({});
  const [selected_month, setSelectMonth] = useState<string | null>(null);
  // handleDebounce function

  const handleDebounce = (value) => {
    if (value?.length >= 3) {
      axios
        .get(`/api/student/search-students?search_value=${value?.toLowerCase()}`)
        .then((res) => {
          const userInfoArr = res.data.map((item) => {
            return {
              label: `${item.first_name} | ${item.class_name} | ${item.class_roll_no} | ${item.section_name}`,
              id: item.id,
              student_id: item.student_id,
              student_table_id: item.student_table_id
            };
          });
          setSearchOptionData(userInfoArr);
        })
        .catch((error) => {});
    } else if (value?.length < 3) {
      setSearchOptionData([]);
    } else if (!value) {
      setSearchOptionData([]);
    }
  };

  const searchHandleChange = async (event: ChangeEvent<HTMLInputElement>, v) => {
    setSearchValue(v);
  };
  const searchHandleUpdate = async (event: ChangeEvent<HTMLInputElement>, v) => {
    setStudentId(v?.student_id || '');
    setSearchValue(v || null);
  };
  const datePickerHandleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setCollectionDate(event);
  };

  const leftFeesTableColumnData = (data, default_current_discount = []) => {
    let totalDue = 0,
      totalCurrentDue = 0;
    let totalObj = {
      amount: 0,
      late_fee: 0,
      paidAmount: 0,
      discount: 0,
      currDiscount: 0,
      dueAmount: 0
    };

    // fees array
    let feesData = data?.fees?.map((item) => {
      const last_trnsaction_time = new Date(item?.last_payment_date).getTime();
      const last_date_time = new Date(item?.last_date).getTime();
      // old code
      // const currentDate = new Date();
      const currentDate = new Date(collectionDate);

      const formattedDate = currentDate.toISOString();
      const check_last_transaction_time = new Date(formattedDate).getTime();

      let late_fee_value = null;
      let due_fee_value = null;
      let paid_amount_value = null;

      if (last_trnsaction_time < last_date_time) {
        late_fee_value = 0;
      } else if (last_trnsaction_time > last_date_time) {
        late_fee_value = item.late_fee ? item.late_fee : 0;
      } else if (check_last_transaction_time < last_date_time) {
        late_fee_value = 0;
      } else if (check_last_transaction_time > last_date_time) {
        late_fee_value = item.late_fee ? item.late_fee : 0;
      }

      // check duevalue
      if (late_fee_value === 0) {
        due_fee_value = item.status === 'paid' ? 0 : item.amount - (item.paidAmount || 0) - (item.on_time_discount || 0);
      } else if (late_fee_value > 0) {
        due_fee_value = item.status === 'paid' ? 0 : item.amount + item.late_fee - (item.paidAmount || 0) - (item.on_time_discount || 0);
      }

      // check  paidAmount
      if (item.status === 'paid') {
        paid_amount_value = item.amount;
      } else {
        paid_amount_value = item.paidAmount ? item.paidAmount : 0;
      }

      return {
        feeId: item.id,
        title: item.title,
        head_title: item?.fees_head?.title,
        amount: item.amount ? item.amount : 0,
        late_fee: late_fee_value,
        paidAmount: paid_amount_value,
        discount: 0,
        dueAmount: due_fee_value,
        on_time_discount: item.on_time_discount
      };
    });

    // calculate discount
    for (let i = 0; i < feesData.length; i++) {
      for (let j = 0; j < data?.discount.length; j++) {
        if (feesData[i].feeId === data?.discount[j].fee_id) {
          if (data?.discount[j].type === 'flat') {
            feesData[i].discount = feesData[i].discount + parseInt(data.discount[j].amt); // 100
          } else if (data?.discount[j].type === 'percent') {
            feesData[i].discount = feesData[i].discount + parseInt(feesData[i].amount) / parseInt(data.discount[j].amt);
          }
        }
      }
    }

    // calculate dueAmount
    feesData = feesData.map((item) => {
      return {
        ...item,
        dueAmount: parseInt(item.dueAmount) - parseInt(item.discount),
        mainDueAmount: parseInt(item.dueAmount) - parseInt(item.discount)
        // on_time_discount: 0
      };
    });

    // // calculate totalDue

    // feesData.forEach((item) => {
    //   totalDue = totalDue + parseInt(item.dueAmount);
    // });

    // total (amount , Late Fee,  Paid Amount, Discount, Due)  functionality

    // feesData.forEach((item) => {
    //   totalObj.amount = totalObj.amount + item.amount;
    //   totalObj.late_fee = totalObj.late_fee + item.late_fee;
    //   totalObj.paidAmount = totalObj.paidAmount + item.paidAmount;
    //   totalObj.discount = totalObj.discount + item.discount;
    //   totalObj.dueAmount = totalObj.dueAmount + item.dueAmount;
    // });

    // re-calculate due-amount based on current_discount

    if (default_current_discount.length > 0) {
      for (let i = 0; i < default_current_discount.length; i++) {
        for (let j = 0; j < feesData.length; j++) {
          if (default_current_discount[i].id === feesData[j].feeId && !Number.isNaN(default_current_discount[i].value)) {
            feesData[j].dueAmount = parseInt(feesData[j].dueAmount) - parseInt(default_current_discount[i].value);
            // feesData[j].currDiscount = parseInt(
            //   default_current_discount[i].value
            // );
            feesData[j].on_time_discount = parseInt(default_current_discount[i].value);
          }
        }
      }

      // calculate current totalDue

      default_current_discount.forEach((item) => {
        totalCurrentDue += parseInt(item.value);
      });
    }

    // calculate totalDue

    feesData.forEach((item) => {
      totalDue = totalDue + parseInt(item.dueAmount);
    });

    // total (amount , Late Fee,  Paid Amount, Discount, Due)  functionality

    feesData.forEach((item) => {
      totalObj.amount = totalObj.amount + item.amount;
      totalObj.late_fee = totalObj.late_fee + item.late_fee;
      totalObj.paidAmount = totalObj.paidAmount + item.paidAmount;
      totalObj.discount = totalObj.discount + item.discount;
      totalObj.currDiscount = totalCurrentDue ? totalCurrentDue : 0;
      totalObj.dueAmount = totalObj.dueAmount + item.dueAmount;
    });

    // console.log('feesData');
    // console.log(feesData);
    // console.log('total Due');
    // console.log(totalDue);
    // console.log('total object');
    // console.log(totalObj);

    setLeftFeesTableData(feesData);
    setTotalDueValue(totalDue.toString());
    setFeesUserData(data);
    setLeftFeesTableTotalCalculation({
      ...totalObj
    });

    // discount array

    // student information code start

    setUserInformation(data);
    // student information code end
  };
  const btnHandleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    setSelectedRowsFeesTable([]);
    setSelectAll(false);
    setCurrDiscount({});
    setLeftFeesTableData(() => []);
    setLeftFeesTableData(() => []);
    if (student_id) {
      const res = await axios.get(`/api/student/search-students?student_id=${student_id?.toLowerCase()}`);
      if (res?.data?.length > 0) {
        const response = await axios.get(
          `/api/student_payment_collect/${res?.data[0]?.student_table_id}?academic_year_id=${academicYear.id}&selected_month=${selected_month}`
        );
        // set search level code
        setSearchValue(`${res?.data[0]?.first_name} | ${res?.data[0]?.class_name} | ${res?.data[0]?.class_roll_no} | ${res?.data[0]?.section_name}`);

        setLeftFeesTableColumnDataState(response?.data?.data);
        leftFeesTableColumnData({ ...response?.data?.data });
      } else {
        setSearchValue('');
        return showNotification('student_id not founds', 'error');
      }
    } else if (searchValue?.id && academicYear?.id) {
      const res = await axios.get(
        `/api/student_payment_collect/${searchValue.student_table_id}?academic_year_id=${academicYear.id}&selected_month=${selected_month}`
      );

      setLeftFeesTableColumnDataState(res?.data?.data);
      leftFeesTableColumnData(res?.data?.data);
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       if (
  //         trackingCollectButton === true &&
  //         searchValue?.id &&
  //         academicYear?.id
  //       ) {
  //         const res = await axios.get(
  //           `/api/student_payment_collect/${searchValue.student_table_id}?academic_year_id=${academicYear.id}&selected_month=${selected_month}`
  //         );
  //         setLeftFeesTableColumnDataState(res?.data?.data);
  //         leftFeesTableColumnData(res?.data?.data);
  //       }
  //     } catch (error) { }
  //   };

  //   fetchData();
  // }, [trackingCollectButton]);

  const deSelectAllCheckbox = () => {
    setSelectAll(false);
    setSelectedRowsFeesTable([]);
  };

  // updated searching code end

  // updated reset button code start
  const resetBtnHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSearchValue('');
    setLeftFeesTableData([]);
    setFeesName('');
    setFeesAmount('');
    setSelectedAccount(null);
    setSelectedGateway(null);
    setTransID('');
    setAmount(null);
    setUserInformation({});
    setSelectedRowsFeesTable([]);
    setSelectAll(false);
    setPrintFees([]);
    setStudentId('');
    setCurrDiscount({});
  };

  // updated reset button code end
  function handleStudentPaymentCollect(res_arr) {
    const calculate_arr = res_arr?.map((fee_, index) => {
      const last_payment_date = fee_?.status !== 'unpaid' ? fee_?.last_payment_date : '';

      // old code
      // const last_date = new Date(fee.last_date);
      // const today = new Date();

      // update code
      const last_date = new Date(fee_.last_date).getTime();
      const today = new Date(collectionDate).getTime();

      const status_color = { p: 0.5 };
      let due = 0,
        total_payable_amt,
        due_fee = 0,
        payableAmount = 0;

      if (fee_?.status == 'paid' || fee_?.status === 'paid late') {
        due = 0;
        total_payable_amt = '';
      } else {
        const late_fee = fee_.late_fee ? fee_.late_fee : 0;
        if (late_fee && today > last_date) {
          // due fee part start
          due = Number(fee_?.amount) + Number(fee_?.late_fee) - (fee_?.paidAmount ? Number(fee_?.paidAmount) : 0);

          // due fee part end
          payableAmount = Number(fee_?.amount) + Number(fee_?.late_fee);
          total_payable_amt = `${Number(fee_?.amount).toFixed(1)} + ${Number(fee_?.late_fee).toFixed(1)} = ${payableAmount.toFixed(2)}`;
        } else {
          total_payable_amt = '';
        }

        // updated due calculation start

        // updated due calculation end

        due = fee_?.amount + late_fee - (fee_.paidAmount ? fee_.paidAmount : fee_?.status == 'unpaid' ? 0 : fee_?.amount);

        // console.log(fee.title, 'due__', due, today < last_date);

        if (today < last_date) {
          due -= late_fee;
        }
      }

      if (fee_?.status === 'paid' || fee_?.status === 'paid late') {
        status_color['color'] = 'green';
      } else if (fee_?.status === 'partial paid') {
        status_color['color'] = 'blue';
      } else {
        status_color['color'] = 'red';
      }

      fee_['last_payment_date'] = last_payment_date;
      fee_['due'] = due;
      fee_['total_payable_amt'] = total_payable_amt;
      fee_['payableAmount'] = payableAmount;
      fee_['status_color'] = status_color;
      fee_['sl'] = index + 1;
      return fee_;
    });

    setDatas(calculate_arr);
  }

  // update setSession functionality code start

  // update setSession functionality code end
  const [datas, setDatas] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [printFees, setPrintFees] = useState([]);
  const [prinCollectedtFees, setPrinCollectedtFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState<any>([]);
  const [selectedFees, setSelectedFees] = useState<any[]>([]);
  const { showNotification } = useNotistick();
  const [isSentSmsLoading, setIsSentSmsLoading] = useState(false);
  const { data: accounts } = useClientFetch(`/api/account`);
  const { data: classData, error: classError } = useClientFetch('/api/class');
  const [gatewayOption, setGatewayOption] = useState([]);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    const temp = datas.filter((i) => {
      const got = printFees.find((j) => j.fee_id === i.fee_id && i.fee_id !== '');

      if (got) {
        for (const index in got) {
          i[index] = got[index];
        }
        return true;
      }

      return false;
    });

    let lastOne = printFees.find((item, i) => {
      if (!item.fee_id) {
        return item;
      }
    });

    if (lastOne) {
      temp.push({
        ...temp[0],

        amount: lastOne.paidAmount,
        late_fee: 0,
        account: lastOne.account,
        created_at: lastOne.created_at,
        fee_id: lastOne.fee_id,
        last_payment_date: lastOne.last_payment_date,
        paidAmount: lastOne.paidAmount,
        payment_method: lastOne.payment_method,
        status: lastOne.status,
        tracking_number: lastOne.tracking_number,
        title: lastOne.other_fee_name,
        transID: lastOne.transID,
        due: 0
      });
    }

    setPrinCollectedtFees(temp);
  }, [printFees]);

  const printPageRef = useRef();
  const printSelectedPageRef = useRef();
  const printAllPageARef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printPageRef.current
  });

  const handlePrintSelected = useReactToPrint({
    content: () => printSelectedPageRef.current
  });

  const handlePrintAll = useReactToPrint({
    content: () => printAllPageARef.current
  });

  // useEffect(() => {
  //   console.log('Hello useEffect hook ');
  //   console.log(userInformation?.section_id);
  //   console.log(academicYear);
  //   if (userInformation?.section_id && academicYear) {
  //     axios
  //       .get(
  //         `/api/student/student-list?academic_year_id=${academicYear?.id}&section_id=${userInformation?.section_id}`
  //       )
  //       .then((res) => {
  //         // setStudents(res.data);
  //       })
  //       .catch((err) => console.log(err));
  //   }
  // }, [userInformation.section_id, academicYear]);

  const handleSentSms = async () => {
    // updated code start
    const student_list = await axios.get(`/api/student/student-list?academic_year_id=${academicYear?.id}&section_id=${userInformation?.section_id}`);

    const singleUser = student_list.data.find((item, i) => {
      return item.student_information_id === userInformation.id;
    });

    // updated code end

    if (!singleUser?.student_info?.phone) return showNotification('phone number not founds', 'error');

    setIsSentSmsLoading(true);

    let full_title = '';
    let total_due = 0;
    let total_paid_amount = 0;

    for (let i = 0; i < prinCollectedtFees.length; i++) {
      full_title += '|' + prinCollectedtFees[i].title;
      if (prinCollectedtFees[i].fee_id) {
        total_due += prinCollectedtFees[i].due;
      }
    }

    for (let i = 0; i < printFees.length; i++) {
      total_paid_amount += printFees[i].paidAmount;
    }

    full_title = full_title.substring(1);

    // const sms_text = `${prinCollectedtFees[0].title} fees, paid amount: ${printFees[0].paidAmount} TK(${printFees[0].status}), due: ${prinCollectedtFees[0].due} TK. Tracking number: ${printFees[0].tracking_number}`;
    const sms_text = `${full_title} fees, paid amount: ${total_paid_amount} TK. Tracking number: ${printFees[0].tracking_number}`;

    axios
      .post('/api/sent_sms/student_fees', {
        sms_text,
        contacts: singleUser?.student_info?.phone
      })
      .then(({ data }) => {
        if (data?.success) showNotification('sending sms successfully');
      })
      .catch((err) => {
        showNotification('faild to sending sms ', 'error');
      })
      .finally(() => {
        setIsSentSmsLoading(false);
      });
  };

  // useEffect(() => {
  //   if (!showPrint || prinCollectedtFees.length === 0) return;
  //   handlePrint();
  //   setShowPrint(false);
  // }, [showPrint]);

  useEffect(() => {
    // label: i.title,
    // id: i.id,
    // is_dafault: i.is_dafault
    const defaultAcc = accounts?.find((acc) => acc.is_dafault);
    if (!defaultAcc) return;

    setSelectedAccount({ label: defaultAcc.title, id: defaultAcc.id });
    const getCashGateway = defaultAcc.payment_method.find((method) => method.title.toLowerCase() === 'cash');

    if (!getCashGateway) return;
    setGatewayOption(
      defaultAcc.payment_method.map((j) => ({
        label: j.title,
        id: j.id
      }))
    );
    const customizeSelectedGateway = { label: getCashGateway.title, id: getCashGateway.id };
    console.log({ customizeSelectedGateway });
    setSelectedGateway(customizeSelectedGateway);
  }, [accounts]);

  useEffect(() => {
    console.log({ accounts, selectedAccount, selectedGateway });
  }, [selectedGateway]);

  return (
    <>
      <Head>
        <title>Student Fee Collection - Management</title>
      </Head>

      <Grid minHeight={'calc(100vh - 223px)'}>
        {/* <Grid sx={{ display: 'none' }}>
          <Grid ref={printPageRef}>
            <PaymentInvoice
              collectionDate={collectionDate}
              leftFeesTableTotalCalculation={leftFeesTableTotalCalculation}
              feesUserData={feesUserData}
              totalDueValue={totalDueValue}
              leftFeesTableData={leftFeesTableData}
              setShowPrint={setShowPrint}
              printFees={prinCollectedtFees}
              student={selectedStudent}
            />
            <PaymentInvoice
              collectionDate={collectionDate}
              leftFeesTableTotalCalculation={leftFeesTableTotalCalculation}
              feesUserData={feesUserData}
              totalDueValue={totalDueValue}
              leftFeesTableData={leftFeesTableData}
              setShowPrint={setShowPrint}
              printFees={prinCollectedtFees}
              student={selectedStudent}
            />
          </Grid>
        </Grid> */}

        <Grid sx={{ display: 'none' }}>
          <Grid px={4} sx={{ backgroundColor: '#fff' }} ref={printPageRef}>
            <DesignPaymentInvoice
              student_id={student_id}
              collectionDate={collectionDate}
              leftFeesTableTotalCalculation={leftFeesTableTotalCalculation}
              feesUserData={feesUserData}
              totalDueValue={totalDueValue}
              leftFeesTableData={leftFeesTableData}
              setShowPrint={setShowPrint}
              printFees={prinCollectedtFees}
              student={selectedStudent}
            />
          </Grid>
        </Grid>

        {/* updated searching code start */}
        <Grid
          px={1}
          mt={1}
          display="grid"
          gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
          columnGap={1}
          rowGap={{ xs: 1, md: 0 }}
          minHeight="fit-content"
        >
          <LeftBox
            setSelectAll={setSelectAll}
            selected_month={selected_month}
            setSelectMonth={setSelectMonth}
            debounceTimeout={500}
            handleDebounce={handleDebounce}
            searchHandleUpdate={searchHandleUpdate}
            searchData={searchOptionData}
            searchValue={searchValue}
            searchHandleChange={searchHandleChange}
            datePickerHandleChange={datePickerHandleChange}
            monthData={monthData}
            btnHandleClick={btnHandleClick}
            setStudentId={setStudentId}
            student_id={student_id}
            collectionDate={collectionDate}
            setCollectionDate={setCollectionDate}
          />
          <RightBox userInformation={userInformation} />
        </Grid>
        {/* updated searching code end */}
        {/* fees collection code start*/}
        <Grid
          px={1}
          mt={1}
          display="grid"
          gridTemplateColumns={{
            xs: '1fr'
            // md: '1fr 1fr'
          }}
          columnGap={1}
          gap={{ xs: 1 }}
          // minHeight="fit-content"
        >
          <LeftFeesTable
            leftFeesTableData={leftFeesTableData}
            leftFeesTableColumnDataState={leftFeesTableColumnDataState}
            leftFeesTableColumnData={leftFeesTableColumnData}
            currDiscount={currDiscount}
            setCurrDiscount={setCurrDiscount}
            selectAll={selectAll}
            setSelectAll={setSelectAll}
            leftFeesTableTotalCalculation={leftFeesTableTotalCalculation}
            tableData={leftFeesTableData}
            feesUserData={feesUserData}
            selectedRows={selectedRowsFeesTable}
            setSelectedRows={setSelectedRowsFeesTable}
          />
        </Grid>

        <Grid display="grid" gridTemplateColumns={{ md: '30vh 1fr' }} px={1} mt={1} gap={1}>
          <RightFeesTable
            collect_other_fees_btn={collect_other_fees_btn}
            setCollect_other_fees_btn={setCollect_other_fees_btn}
            feesName={feesName}
            setFeesName={setFeesName}
            feesAmount={feesAmount}
            setFeesAmount={setFeesAmount}
            transID={transID}
            feesUserData={feesUserData}
            selectedAccount={selectedAccount}
            selectedGateway={selectedGateway}
          />
          <PaymentOptions
            totalDueValue={totalDueValue}
            collectionDate={collectionDate}
            handleStudentPaymentCollect={handleStudentPaymentCollect}
            setPrintFees={setPrintFees}
            amount={amount}
            setAmount={setAmount}
            totalFeesCalculate={totalFeesCalculate}
            setTotalFeesCalculate={setTotalFeesCalculate}
            setFeesAmount={setFeesAmount}
            setFeesName={setFeesName}
            collect_other_fees_btn={collect_other_fees_btn}
            feesName={feesName}
            feesAmount={feesAmount}
            transID={transID}
            setTransID={setTransID}
            selectedGateway={selectedGateway}
            setSelectedGateway={setSelectedGateway}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            deSelectAllCheckbox={deSelectAllCheckbox}
            trackingCollectButton={trackingCollectButton}
            setTrackingCollectButton={setTrackingCollectButton}
            tableData={leftFeesTableData}
            feesUserData={feesUserData}
            selectedRows={selectedRowsFeesTable}
            accounts={accounts}
            accountsOption={
              accounts?.map((i) => ({
                label: i.title,
                id: i.id,
                is_dafault: i.is_dafault
              })) || []
            }
            gatewayOption={gatewayOption}
            setGatewayOption={setGatewayOption}
            btnHandleClick={btnHandleClick}
          >
            <Reset_Sent_SMS_Collect_Invoice
              handlePrint={handlePrint}
              prinCollectedtFees={prinCollectedtFees}
              printFees={printFees}
              handleSentSms={handleSentSms}
              isSentSmsLoading={isSentSmsLoading}
              resetBtnHandleClick={resetBtnHandleClick}
            />
          </PaymentOptions>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

Managementschools.getLayout = (page) => (
  <Authenticated name="collect_fee">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Managementschools;
