import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { useTranslation } from 'react-i18next';
import { Grid, Button, Box, Paper } from '@mui/material';
import { TextFieldWrapper } from '@/components/TextFields';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useNotistick from '@/hooks/useNotistick';
import axios from 'axios';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';

const PaymentOptions = ({
  studentClass,
  printAndCollect,
  setPrintAndCollect,
  onTimeDiscountArr,
  setOnTimeDiscountArr,
  children,
  totalDueValue,
  collectionDate,
  handleStudentPaymentCollect,
  setPrintFees,
  amount,
  setAmount,
  totalFeesCalculate,
  setTotalFeesCalculate,
  setFeesAmount,
  setFeesName,
  collect_other_fees_btn,
  feesName,
  feesAmount,
  transID,
  setTransID,
  selectedGateway,
  setSelectedGateway,
  selectedAccount,
  setSelectedAccount,
  deSelectAllCheckbox,
  trackingCollectButton,
  setTrackingCollectButton,
  tableData,
  feesUserData,
  selectedRows,
  accountsOption,
  accounts,
  btnHandleClick,
  gatewayOption,
  setGatewayOption
}) => {
  const { t }: { t: any } = useTranslation();
  // const [selectedAccount, setSelectedAccount] = useState(null);
  // const [selectedGateway, setSelectedGateway] = useState(null);
  // const [transID, setTransID] = useState(null);
  // const [amount, setAmount] = useState(null);
  const { user } = useAuth();

  const { showNotification } = useNotistick();

  // totalAmount calculation
  useEffect(() => {
    if (amount && feesAmount) {
      setTotalFeesCalculate(Number(amount) + Number(feesAmount));
    } else if (amount) {
      setTotalFeesCalculate(Number(amount));
    } else if (feesAmount) {
      setTotalFeesCalculate(Number(feesAmount));
    } else {
      setTotalFeesCalculate(0);
    }
  }, [amount, feesAmount]);
  // dueAmount update
  useEffect(() => {
    let dueValue = 0;

    // amount option update
    for (let i = 0; i < selectedRows.length; i++) {
      for (let j = 0; j < tableData.length; j++) {
        if (selectedRows[i] === tableData[j].feeId) {
          dueValue = dueValue + tableData[j].dueAmount;
        }
      }
    }
    if (dueValue > 0) {
      setAmount(dueValue);
    } else {
      setAmount(null);
    }
  }, [selectedRows, tableData]);

  // handleCollectFunction
  const handleCollect = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, v) => {
    const dueAmount = [];

    for (let i = 0; i < selectedRows.length; i++) {
      for (let j = 0; j < tableData.length; j++) {
        if (selectedRows[i] === tableData[j].feeId) {
          dueAmount.push(tableData[j].dueAmount);
        }
      }
    }
    const totalDueAmount = dueAmount.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    if (!selectedAccount?.id) {
      showNotification('please select bank account.', 'error');
      return;
    }
    // handle pay via input field error message
    if (!selectedGateway?.id) {
      showNotification('please select pay via option.', 'error');
      return;
    }
    // handle transId input field error message

    if (selectedGateway?.label?.toLowerCase() !== 'cash' ? true : false) {
      if (!transID) {
        showNotification('please provide the transaction id.', 'error');
        return;
      }
    }

    // amount calculation part start
    let error_row_count = 0;
    let error_row_due_value = 0;
    for (let i = 0; i < dueAmount.length; i++) {
      error_row_due_value += Number(dueAmount[i]);
      if (error_row_due_value < Number(amount)) {
        error_row_count += 1;
      }
    }

    const total_amount = dueAmount.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);
    const copy_dueAmount_arr = dueAmount;
    let remaining_due_value = null;
    if (!amount && !totalFeesCalculate) {
      // showNotification('please fill out amount field.', 'error');
      // return;
    } else if (Number(amount) > Number(total_amount)) {
      showNotification('The amount is less than or equal to the due amount.', 'error');
      return;
    } else if (total_amount === amount) {
    } else if (amount < total_amount) {
      // amount = 35000
      copy_dueAmount_arr.pop();
      const total_amount_without_last_item = copy_dueAmount_arr.reduce((accumulator, currentValue) => {
        // 30000 user input is 31000 selected item 3
        return accumulator + currentValue;
      }, 0);

      if (Number(total_amount_without_last_item) === Number(amount)) {
        // error message because now have no remaining value for last item
        showNotification('please deselect the last row in the table as it does not contain any remaining values.', 'error');
        return;
      } else if (Number(amount) < Number(total_amount_without_last_item)) {
        // error message because now amount is less than selected first 2 items but user already select 3rd items.
        showNotification(
          `The amount is less than the total number of selected items (${error_row_count + 1}) but the user has selected (${
            selectedRows.length
          }) items. Please adjust the amount or deselect some items.`,
          'error'
        );
        return;
      } else if (Number(amount) > Number(total_amount_without_last_item)) {
        // user select 3 items andd amount is 31000 so first 2 items total value is 30000 now remaining value is 1000. So this value will be added for next item that means 3rd items
        remaining_due_value = Number(amount) - Number(total_amount_without_last_item); // amount = 31000, total_amount_without_lat_item = 30000 , result = 1000
        copy_dueAmount_arr.push(remaining_due_value);
      }
    }

    // amount calculation part end

    let finalArray = [];
    let collect_filter_data = [];
    const feesWithDueArray = selectedRows.map((id, index) => {
      return { id, due: copy_dueAmount_arr[index] };
    });

    if (feesWithDueArray.length > 1) {
      finalArray = feesWithDueArray.map((item, i) => {
        return {
          ...item,
          collected_amount: item.due
        };
      });
    } else {
      finalArray = feesWithDueArray;
    }

    for (let i = 0; i < tableData.length; i++) {
      for (let j = 0; j < finalArray.length; j++) {
        if (tableData[i].feeId === finalArray[j].id) {
          collect_filter_data.push({
            id: finalArray[j].id,
            collected_amount: finalArray[j].due,
            total_payable: Number(tableData[i].dueAmount),
            on_time_discount: 0
          });
        }
      }
    }

    // on time discount code start
    for (let i = 0; i < onTimeDiscountArr.length; i++) {
      for (let j = 0; j < collect_filter_data.length; j++) {
        if (onTimeDiscountArr[i].id == collect_filter_data[j].id) {
          collect_filter_data[j].on_time_discount = onTimeDiscountArr[i].value;
        }
      }
    }
    // on time discount code end

    // amount calculation part end

    let other_fees_data = null;
    if (feesName && feesAmount) {
      other_fees_data = {
        student_id: feesUserData.id,
        collected_by_user: user?.id,
        //  fee_id: selectedRows,  // optional
        account_id: selectedAccount?.id,
        payment_method_id: selectedGateway?.id,
        collected_amount: amount ? Number(totalFeesCalculate) - Number(amount) : Number(totalFeesCalculate),
        transID: transID ? transID : null,
        total_payable: [amount ? Number(totalFeesCalculate) - Number(amount) : Number(totalFeesCalculate)],
        sent_sms: false,
        collect_filter_data: [
          {
            collected_amount: amount ? Number(totalFeesCalculate) - Number(amount) : Number(totalFeesCalculate),
            total_payable: amount ? Number(totalFeesCalculate) - Number(amount) : Number(totalFeesCalculate)
          }
        ],
        fees_name: feesName
      };
    }

    axios
      .post('/api/student_payment_collect/multiples_fees', {
        studentClass,
        collection_date: collectionDate,
        student_id: feesUserData.id,
        collected_by_user: user?.id,
        fee_id: selectedRows,
        account_id: selectedAccount?.id,
        payment_method_id: selectedGateway?.id,
        collected_amount: amount,
        transID: transID ? transID : null,
        total_payable: copy_dueAmount_arr,
        sent_sms: false,
        collect_filter_data,
        other_fees_data
      })
      .then((res) => {
        if (res.data.success) {
          const printResult = res?.data?.result.map((item, i) => {
            const last_date = new Date(item?.last_date ? item?.last_date : '').getTime();
            const today = new Date(collectionDate).getTime();

            return {
              on_time_discount: item?.on_time_discount ? item?.on_time_discount : 0,
              fee_id: item?.fee_id ? item?.fee_id : '',
              paidAmount: item?.collect_amount,
              tracking_number: item?.tracking_number,
              created_at: item?.created_at,
              last_payment_date: item?.last_payment_date,
              account: item?.account_name,
              transID: item?.transID,
              payment_method: item?.payment_method,
              status: item?.status,
              other_fee_name: item?.other_fee_name ? item?.other_fee_name : '',
              amount: item?.amount ? item?.amount : 0,
              // late_fee: item?.late_fee ? item?.late_fee : 0,
              late_fee: today > last_date ? item?.late_fee : 0,
              last_date: item?.last_date ? item?.last_date : 0,
              title: item?.title ? item?.title : 0
            };
          });

          for (let i = 0; i < printResult?.length; i++) {
            for (let j = 0; j < tableData?.length; j++) {
              if (printResult[i]?.fee_id === tableData[j]?.feeId) {
                printResult[i].head_title = tableData[j].head_title;
              }
            }
          }

          setOnTimeDiscountArr([]);
          setPrintFees(printResult);
          handleStudentPaymentCollect(printResult);
          btnHandleClick();
          deSelectAllCheckbox();
          setFeesAmount('');
          setFeesName('');

          // check print and collect functionality code start
          if (v === 'print and collect') {
            setPrintAndCollect(true);
          }
          // check print and collect functionality code end
          showNotification(`Congratulations! Payment Successfully Processed`, 'success');
        }
      })
      .catch((error) => {
        handleShowErrMsg(error, showNotification);
      });
  };

  return (
    <>
      <Box
        component={Paper}
        sx={{
          boxShadow: '10 10 10',
          backgroundColor: '#fff',
          padding: 1,
          // py:"auto"
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          borderRadius: 0.5
        }}
      >
        <Grid
          sx={{
            display: 'grid',
            gridTemplateColumns: { sm: 'repeat(2, 1fr)', md: 'repeat(4,1fr)', xl: 'repeat(5, 1fr)' },
            gap: 1
            // justifyContent: 'center',
          }}
        >
          <AutoCompleteWrapper
            label={t('Account')}
            placeholder={t('Select account...')}
            options={accountsOption}
            value={selectedAccount}
            handleChange={(e, v) => {
              if (v) {
                const temp = accounts
                  ?.find((i) => i.id === v?.id)
                  ?.payment_method?.map((j) => ({
                    label: j.title,
                    id: j.id
                  }));

                setGatewayOption(temp);
              } else {
                setGatewayOption([]);
              }

              setSelectedAccount(v);
              setSelectedGateway(null);
            }}
          />
          <AutoCompleteWrapper
            label={t('Pay via')}
            placeholder={t('Select Pay via...')}
            options={gatewayOption}
            value={selectedGateway}
            handleChange={(e, value) => {
              if (value == 'Cash') {
                setTransID(null);
              }

              setSelectedGateway(value);
            }}
          />
          {selectedGateway?.label && selectedGateway?.label?.toLowerCase() !== 'cash' && (
            <TextFieldWrapper
              label="trans ID"
              name=""
              value={transID}
              touched={undefined}
              errors={undefined}
              handleChange={(e) => {
                setTransID(e.target.value);
              }}
              handleBlur={undefined}
              required={selectedGateway?.label !== 'Cash' ? true : false}
            />
          )}

          <TextFieldWrapper
            // disabled={selectedRows.length > 1 ? true : false}
            label="Amount"
            name=""
            type="number"
            touched={undefined}
            errors={undefined}
            value={amount || ''}
            handleChange={(e) => {
              if (!e.target.value) {
                setAmount('');
                return;
              }

              if (Number(e.target.value) < Number(totalDueValue)) {
                const int_value = Number(e.target.value);
                const value = Math.abs(int_value);
                setAmount(value);
              }
            }}
            handleBlur={undefined}
          />

          <TextFieldWrapper
            disabled={true}
            label="Total Amount"
            name=""
            type="number"
            touched={undefined}
            errors={undefined}
            value={totalFeesCalculate || ''}
            handleChange={() => {}}
            handleBlur={undefined}
          />
        </Grid>

        <Grid item display="grid" gridTemplateColumns={{ sm: '3fr 1fr' }} gridAutoFlow="dense" gap={1} width="100%" height="auto">
          <Grid item display={{ xs: 'none', sm: 'grid' }}>
            {children}
          </Grid>
          <Button
            variant="contained"
            disabled={(selectedRows.length > 0 || totalFeesCalculate > 0) && feesUserData?.id ? false : true}
            //disabled={feesUserData?.id ? false : true}
            onClick={(e) => handleCollect(e, 'collect')}
            sx={{ borderRadius: 0.5, padding: '6px', width: '100%' }}
          >
            Collect
          </Button>

          {/* <Button
            variant="contained"
            disabled={(selectedRows.length > 0 || totalFeesCalculate > 0) && feesUserData?.id ? false : true}
            //disabled={feesUserData?.id ? false : true}
            onClick={(e) => handleCollect(e, 'print and collect')}
            sx={{ borderRadius: 0.5, padding: '6px', width: '100%' }}
          >
            Print and Collect
          </Button> */}

          <Grid display={{ sm: 'none' }}>{children}</Grid>
        </Grid>
      </Box>
    </>
  );
};

export default PaymentOptions;
