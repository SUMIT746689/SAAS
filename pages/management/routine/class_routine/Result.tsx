import { Grid, TextField, Typography, Button, Tooltip, IconButton } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import { TableBodyCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';
import TableContainer from '@mui/material/TableContainer';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

// const routineData = [
//   {
//     day: 'Saturday',
//     routine_info: [
//       {
//         class: 'Nine',
//         section: 'PC-C',
//         teacher: 'Najmus Shakib',
//         subject: 'Bangla',
//         start_time: '12:00am',
//         end_time: '1:00am',
//         id: 1
//       },
//       {
//         class: 'Six',
//         section: 'PC-E',
//         teacher: 'Najmus Sadad',
//         subject: 'English',
//         start_time: '12:00am',
//         end_time: '1:00am',
//         id: 1
//       }
//     ]
//   },
//   {
//     day: 'Sunday',
//     routine_info: [
//       {
//         class: 'Six',
//         section: 'PC-E',
//         teacher: 'Najmus Sadad',
//         subject: 'English',
//         start_time: '12:00am',
//         end_time: '1:00am',
//         id: 1
//       }
//     ]
//   }
// ];

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)'
  },
  ':hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.10)'
  }
}));

const Result = ({ routineInfo, setEditData, setOpen, handleDeleteRoutine }) => {
  const { t }: { t: any } = useTranslation();

  return (
    <Grid component={Paper} sx={{ borderRadius: 0.5 }} mx={1} mt={3}>
      {routineInfo?.map((item, i) => {
        return (
          <Grid key={i}>
            <Grid
              sx={{
                borderRadious: 0,
                background: (themes) => themes.colors.primary.dark,
                py: 1,
                px: 1,
                color: 'white',
                fontWeight: 700,
                textAlign: 'left'
              }}
            >
              {item.day}
            </Grid>
            <Grid sx={{ pt: 2, px: 1, pb: 2 }}>
              <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
                <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCellWrapper>Class</TableHeaderCellWrapper>
                      <TableHeaderCellWrapper>Section</TableHeaderCellWrapper>
                      <TableHeaderCellWrapper>Subject</TableHeaderCellWrapper>
                      <TableHeaderCellWrapper>Teacher</TableHeaderCellWrapper>
                      <TableHeaderCellWrapper>Start Time</TableHeaderCellWrapper>
                      <TableHeaderCellWrapper>End Time</TableHeaderCellWrapper>
                      <TableHeaderCellWrapper>Action</TableHeaderCellWrapper>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {item.routine_info?.map((item, i) => {
                      return (
                        <StyledTableRow key={i}>
                          <TableBodyCellWrapper>{item.class}</TableBodyCellWrapper>
                          <TableBodyCellWrapper>{item.section}</TableBodyCellWrapper>
                          <TableBodyCellWrapper>{item.subject}</TableBodyCellWrapper>
                          <TableBodyCellWrapper>{item.teacher}</TableBodyCellWrapper>
                          <TableBodyCellWrapper>{item.start_time}</TableBodyCellWrapper>
                          <TableBodyCellWrapper>{item.end_time}</TableBodyCellWrapper>
                          <TableBodyCellWrapper>
                            {' '}
                            <Typography noWrap py={0.25} display="flex" justifyContent="center" columnGap={0.5}>
                              <Tooltip title={t('Edit')} arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditData(item);
                                    setOpen(true);
                                  }}
                                  color="primary"
                                >
                                  <LaunchTwoToneIcon sx={{ fontSize: 14 }} fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('Delete')} arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    handleDeleteRoutine(item);
                                  }}
                                  color="primary"
                                >
                                  <DeleteTwoToneIcon sx={{ fontSize: 14, color: 'red' }} fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Typography>
                          </TableBodyCellWrapper>
                        </StyledTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Result;
