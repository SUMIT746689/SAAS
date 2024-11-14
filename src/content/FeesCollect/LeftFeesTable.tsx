import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import { TextFieldWrapper } from '@/components/TextFields';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

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

function createData(name: string, calories: number, fat: number, carbs: number, protein: number, due: number) {
  return { name, calories, fat, carbs, protein, due };
}

const rows = [
  createData('Tuition Fees', 159, 100, 6.0, 24, 4.0),
  createData('Admission Fees', 237, 100, 9.0, 37, 4.3),
  createData('Total', 262, 100, 16.0, 24, 6.0)
];

const TableHeaderCellWrapper = ({ children, ...parmas }) => {
  return (
    <TableCell sx={{ border: '1px solid lightgray', px: 0.6, py: 0, fontSize: { xs: 9, md: 10, xl: 11 } }} {...parmas}>
      {' '}
      {children}{' '}
    </TableCell>
  );
};

const TableCellWrapper = ({ children, ...parmas }) => {
  return (
    <TableCell sx={{ border: '1px solid lightgray', px: 0.6, py: 0, fontSize: { xs: 10, md: 11, xl: 12 } }} {...parmas}>
      {' '}
      {children}{' '}
    </TableCell>
  );
};

const TableFooterCellWrapper = ({ children, ...parmas }) => {
  return (
    <TableCell sx={{ border: '1px solid lightgray', px: 0.6, py: 1, fontSize: { xs: 10, md: 11, xl: 12 } }} {...parmas}>
      {' '}
      {children}{' '}
    </TableCell>
  );
};

export default function LeftFeesTable({
  onTimeDiscountArr,
  setOnTimeDiscountArr,
  leftFeesTableData,
  leftFeesTableColumnDataState,
  leftFeesTableColumnData,
  currDiscount,
  setCurrDiscount,
  leftFeesTableTotalCalculation,
  tableData,
  feesUserData,
  selectedRows,
  setSelectedRows,
  selectAll,
  setSelectAll
}) {
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelectedRows = tableData.map((row) => row.feeId);

      let newArrSelectedRow = [];

      for (let i = 0; i < newSelectedRows.length; i++) {
        for (let j = 0; j < tableData.length; j++) {
          if (tableData[j].feeId === newSelectedRows[i] && tableData[j].dueAmount > 0) {
            newArrSelectedRow.push(newSelectedRows[i]);
          }
        }
      }

      // old version code
      // setSelectedRows(newSelectedRows);
      // setSelectAll(true);

      // new version code
      setSelectedRows(newArrSelectedRow);
      setSelectAll(true);
    } else {
      setSelectedRows([]);
      setSelectAll(false);
    }
  };

  const handleClick = (event, feeId) => {
    const selectedIndex = selectedRows.indexOf(feeId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, feeId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selectedRows.slice(0, selectedIndex), selectedRows.slice(selectedIndex + 1));
    }

    // check if dueAmount is 0 or greater than
    // let newSelectedRow = tableData.filter((item, i) => {
    //   if (item.feeId === newSelected[i] && item.dueAmount > 0) {
    //     console.log('item');
    //     console.log(item);
    //     return item.feeId;
    //   }
    // });
    let newSelectedRow = [];

    for (let i = 0; i < newSelected.length; i++) {
      for (let j = 0; j < tableData.length; j++) {
        if (tableData[j].feeId === newSelected[i] && tableData[j].dueAmount > 0) {
          newSelectedRow.push(newSelected[i]);
        }
      }
    }

    // old version code

    // setSelectedRows(newSelected);
    // setSelectAll(newSelected.length === tableData.length);

    // new version code

    setSelectedRows(newSelectedRow);
    setSelectAll(newSelected.length === tableData.length);
  };

  const handleCurrDiscountChange = (feeId, value) => {
    const obj = { ...currDiscount, [feeId]: value };
    const arr = [];

    for (const key in obj) {
      arr.push({ id: Number(key), value: obj[key] });
    }

    const singleFeeInfo = leftFeesTableData?.find((item) => {
      return item?.feeId === feeId;
    });

    if (isNaN(value)) {
      for (let key in obj) {
        if (isNaN(obj[key])) {
          delete obj[key];
        }
      }
      setOnTimeDiscountArr(arr);
      setCurrDiscount(obj);
      leftFeesTableColumnData(leftFeesTableColumnDataState, arr);
      return;
    }

    if (Number(value) < Number(singleFeeInfo?.mainDueAmount)) {
      setOnTimeDiscountArr(arr);
      setCurrDiscount(obj);
      leftFeesTableColumnData(leftFeesTableColumnDataState, arr);
    }
  };

  function DisplayTable(DataArr) {
    const filterArr = DataArr.filter((row) => {
      return row.dueAmount > 0;
    });

    return filterArr.map((row) => {
      return (
        <StyledTableRow key={row.title} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
          {/* <TableRow key={row.title} sx={{ '&:last-child td, &:last-child th': { border: 0 }}}> */}
          <TableCellWrapper align="center" width={10}>
            <Checkbox size="small" checked={selectedRows.indexOf(row.feeId) !== -1} onChange={(event) => handleClick(event, row.feeId)} />
          </TableCellWrapper>
          <TableCellWrapper component="th" scope="row">
            {row.head_title}
          </TableCellWrapper>
          <TableCellWrapper component="th" scope="row">
            <Grid textTransform="capitalize">{row.title}</Grid>
          </TableCellWrapper>
          <TableCellWrapper component="th" scope="row">
            {row.fees_type.split('_').join(' ')}
          </TableCellWrapper>
          <TableCellWrapper component="th" scope="row">
            {row.batch_name}
          </TableCellWrapper>
          <TableCellWrapper component="th" scope="row">
            {row.subject_name}
          </TableCellWrapper>
          <TableCellWrapper align="right">{row.amount}</TableCellWrapper>
          <TableCellWrapper align="right">{row.late_fee}</TableCellWrapper>
          <TableCellWrapper align="right">{row.discount.toFixed(2)}</TableCellWrapper>
          <TableCellWrapper align="right">{row.paidAmount.toFixed(2)}</TableCellWrapper>

          <TableCellWrapper>
            <Grid>
              <TextFieldWrapper
                pb={0}
                disabled={selectedRows.find((item) => item === row.feeId) ? false : true}
                label=""
                name="type discount amount"
                type="number"
                touched={undefined}
                errors={undefined}
                // value={currDiscount || ''}
                value={currDiscount[row.feeId] || ''}
                handleChange={(e) => {
                  const int_value = Number(e.target.value);
                  const value = Math.abs(int_value);
                  handleCurrDiscountChange(row.feeId, value);
                }}
                handleBlur={undefined}
                inputProps={{ style: { px: 2, py: 2, fontSize: { xs: 10, sm: 11, md: 10 } } }}
              />
            </Grid>
          </TableCellWrapper>
          <TableCellWrapper align="right">
            <Grid pr={1}>{row.dueAmount.toFixed(2)}</Grid>
          </TableCellWrapper>
          {/* </TableRow> */}
        </StyledTableRow>
      );
    });
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
      <Table
        // sx={{ minWidth: 650, height: tableData.length === 0 ? 250 : '' }}
        aria-label="simple table"
      >
        <TableHead>
          <TableRow>
            <TableHeaderCellWrapper align="center" width={10}>
              <Checkbox
                size="small"
                indeterminate={selectedRows.length > 0 && selectedRows.length < tableData.length}
                checked={selectAll}
                onChange={handleSelectAllClick}
              />
            </TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Fees Head</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Fees</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Fees Type</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Batch</TableHeaderCellWrapper>
            <TableHeaderCellWrapper>Subject</TableHeaderCellWrapper>
            <TableHeaderCellWrapper align="right"> Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper align="right"> Late Fee</TableHeaderCellWrapper>
            <TableHeaderCellWrapper align="right"> Prev. Discount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper align="right">Paid Amount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper align="right">Curr. Discount</TableHeaderCellWrapper>
            <TableHeaderCellWrapper align="right" pr={5}>
              <Grid pr={1}>Due</Grid>
            </TableHeaderCellWrapper>
          </TableRow>
        </TableHead>
        <TableBody>
          {DisplayTable(tableData)}
          {/* {tableData.map((row) => (
            <TableRow key={row.title} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCellWrapper align="center" width={10}>
                <Checkbox size="small" checked={selectedRows.indexOf(row.feeId) !== -1} onChange={(event) => handleClick(event, row.feeId)} />
              </TableCellWrapper>
              <TableCellWrapper component="th" scope="row">
                {row.head_title}
              </TableCellWrapper>
              <TableCellWrapper component="th" scope="row">
                {row.title}
              </TableCellWrapper>
              <TableCellWrapper align="right">{row.amount}</TableCellWrapper>
              <TableCellWrapper align="right">{row.late_fee}</TableCellWrapper>
              <TableCellWrapper align="right">{row.discount}</TableCellWrapper>
              <TableCellWrapper align="right">{row.paidAmount}</TableCellWrapper>

              <TableCellWrapper>
                <TextFieldWrapper
                  pb={0}
                  disabled={selectedRows.find((item) => item === row.feeId) ? false : true}
                  label="Amount"
                  name=""
                  type="number"
                  touched={undefined}
                  errors={undefined}
                  // value={currDiscount || ''}
                  value={currDiscount[row.feeId] || ''}
                  handleChange={(e) => {
                    const int_value = Number(e.target.value);
                    const value = Math.abs(int_value);
                    handleCurrDiscountChange(row.feeId, value);
                  }}
                  handleBlur={undefined}
                  inputProps={{
                    style: {
                      px: 2,
                      py: 2,
                      fontSize: { xs: 10, sm: 11, md: 12 }
                    }
                  }}
                />
              </TableCellWrapper>
              <TableCellWrapper align="right">
                <Grid pr={1}>{row.dueAmount}</Grid>
              </TableCellWrapper>
            </TableRow>
          ))} */}
          {DisplayTable(tableData).length === 0 ? (
            ''
          ) : (
            <TableRow
            // sx={{ '&:last-child td, &:last-child th': { border: 0 }, py: 1 }}
            >
              <td colSpan={5}></td>
              <TableFooterCellWrapper component="th" scope="row">
                {leftFeesTableTotalCalculation && 'Total'}
              </TableFooterCellWrapper>
              <TableFooterCellWrapper align="right">
                {' '}
                {leftFeesTableTotalCalculation && leftFeesTableTotalCalculation.amount.toFixed(2)}
              </TableFooterCellWrapper>
              <TableFooterCellWrapper align="right">
                {leftFeesTableTotalCalculation && leftFeesTableTotalCalculation.late_fee.toFixed(2)}
              </TableFooterCellWrapper>
              <TableFooterCellWrapper align="right">
                {leftFeesTableTotalCalculation && leftFeesTableTotalCalculation.discount.toFixed(2)}
              </TableFooterCellWrapper>
              <TableFooterCellWrapper align="right">
                {leftFeesTableTotalCalculation && leftFeesTableTotalCalculation.paidAmount.toFixed(2)}
              </TableFooterCellWrapper>
              <TableFooterCellWrapper align="center">
                {leftFeesTableTotalCalculation && leftFeesTableTotalCalculation.currDiscount.toFixed(2)}
              </TableFooterCellWrapper>
              <TableFooterCellWrapper align="right">
                <Grid pr={1}>{leftFeesTableTotalCalculation && leftFeesTableTotalCalculation.dueAmount.toFixed(2)}</Grid>
              </TableFooterCellWrapper>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
