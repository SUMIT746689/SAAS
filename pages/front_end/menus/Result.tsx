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

const Result = ({ menuInfo, setEditData, setOpen, handleDeleteMenu, setMenuItemId, setMenuLabel }) => {
  const { t }: { t: any } = useTranslation();

  return (
    <Grid component={Paper} sx={{ borderRadius: 0.5 }} mx={1} mt={3}>
      <Grid sx={{ pt: 2, px: 1, pb: 2 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableHeaderCellWrapper>Sl</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>English Title</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Bangla Title</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Link Type</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Website Link</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Status</TableHeaderCellWrapper>
                <TableHeaderCellWrapper>Action</TableHeaderCellWrapper>
              </TableRow>
            </TableHead>
            <TableBody>
              {menuInfo?.map((item, i: number) => {
                return (
                  <StyledTableRow key={i}>
                    <TableBodyCellWrapper>{i + 1}</TableBodyCellWrapper>
                    <TableBodyCellWrapper>{item.english_title}</TableBodyCellWrapper>
                    <TableBodyCellWrapper>{item.bangla_title}</TableBodyCellWrapper>
                    <TableBodyCellWrapper>{item.link_type}</TableBodyCellWrapper>
                    <TableBodyCellWrapper>{item.website_link || (item.link_type === "no link" ? '' : `${item.websiteDynamicPage?.english_title} ( ${item.websiteDynamicPage?.bangla_title} )`)}</TableBodyCellWrapper>
                    <TableBodyCellWrapper>{item.status}</TableBodyCellWrapper>
                    <TableBodyCellWrapper>
                      {' '}
                      <Typography noWrap py={0.25} display="flex" justifyContent="center" columnGap={0.5}>
                        <Tooltip title={t('Edit')} arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditData(item);
                              setOpen(true);

                              if (item?.parent?.english_title) {
                                setMenuItemId(item?.parent?.id);
                                setMenuLabel(item?.parent?.english_title);
                              } else {
                                setMenuItemId(null);
                                setMenuLabel('');
                              }
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
                              handleDeleteMenu(item);
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
};

export default Result;
