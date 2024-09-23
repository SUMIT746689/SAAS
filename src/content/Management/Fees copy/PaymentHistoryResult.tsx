import Head from 'next/head';
import { useState, useEffect, useRef, useContext } from 'react';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import Footer from 'src/components/Footer';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import type { Project } from 'src/models/project';
import { useClientFetch } from 'src/hooks/useClientFetch';
import { useTranslation } from 'next-i18next';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { useAuth } from '@/hooks/useAuth';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import dayjs from 'dayjs';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import PageHeader from 'src/content/Management/Attendence/PageHeader';
import { TableHeadWrapper } from '@/components/TableWrapper';
import ReactToPrint from 'react-to-print';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { UncontrolledTextFieldWrapper } from '@/components/TextFields';
const tableStyle: object = {
  border: '1px solid black',
  borderCollapse: 'collapse',
  textAlign: 'center',
  padding: '2px',
  fontSize: '0.8em'

  // backgroundColor: '#cccccc'
};
function FeesPaymentReport({ data }) {
  const { t }: { t: any } = useTranslation();
  const [datas, setDatas] = useState<any>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [students, setStudents] = useState<[object?]>([]);

  const [filteredFees, setFilteredFees] = useState<any>([]);
  const { data: classData, error: classError } = useClientFetch('/api/class');

  const printPageRef = useRef();

  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [filter, setFilter] = useState<string>('all');
  const [paginatedTransection, setPaginatedTransection] = useState<any>([]);

  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event): void => {
    setLimit(parseInt(event.target.value));
  };

  const applyPagination = (sessions, page, limit) => {
    return sessions.slice(page * limit, page * limit + limit);
  };

  const applyFilters = (sessions, filter) => {
    return sessions.filter((project) => {
      let matches = true;

      if (filter === 'all') return matches;
      else if (filter) if (project.status !== filter) matches = false;

      return matches;
    });
  };

  // @ts-ignore
  useEffect(() => {
    // @ts-ignore
    const filteredfeesdata = applyFilters(data?.fees || [], filter);
    setFilteredFees(filteredfeesdata);
    const paginatedTransaction = applyPagination(filteredfeesdata, page, limit);

    console.log(paginatedTransaction, page, limit);

    setPaginatedTransection(paginatedTransaction);
  }, [data, filter, page]);

  const [sections, setSections] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  return (
    <>
      <Card sx={{ display: 'grid', maxWidth: 900, mx: 'auto', pt: 1, px: 1, gridTemplateColumns: { sm: 'auto auto auto' }, gap: 1 }}>
        <Grid item>
          <UncontrolledTextFieldWrapper label="Name" value={data.name} />
        </Grid>
        <Grid item>
          <UncontrolledTextFieldWrapper label="Class" value={data.class} />
        </Grid>
        <Grid item>
          <UncontrolledTextFieldWrapper label="Section" value={data.section} />
        </Grid>
      </Card>

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
            {data && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  pt: 2,
                  pl: 1
                }}
              >
                <Grid
                  item
                  sx={{
                    display: 'flex',
                    gap: 1,
                    maxHeight: 40
                  }}
                >
                  <FormControl>
                    <InputLabel size="small" sx={{ backgroundColor: 'white' }} id="demo-simple-select-label">
                      Filter By
                    </InputLabel>
                    <Select
                      fullWidth
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      size="small"
                      label="Filter By"
                      sx={{
                        [`& fieldset`]: {
                          borderRadius: 0.6
                        },
                        px: '10px',
                        minWidth: '50px'
                      }}
                      value={filter}
                      onChange={(e: any) => {
                        setFilter(e.target.value);
                      }}
                    >
                      <MenuItem value={'all'}>ALL</MenuItem>
                      <MenuItem value={'paid'}>PAID</MenuItem>
                      <MenuItem value={'paid late'}>PAID LATE</MenuItem>
                      <MenuItem value={'partial paid'}>PARTIAL PAID</MenuItem>
                      <MenuItem value={'unpaid'}>UNPAID</MenuItem>
                    </Select>
                  </FormControl>

                  <ReactToPrint
                    content={() => printPageRef.current}
                    // pageStyle={`{ size: 2.5in 4in }`}
                    trigger={() => (
                      <Button startIcon={<LocalPrintshopIcon />} variant="contained">
                        print
                      </Button>
                    )}
                  />
                </Grid>

                <TableHeadWrapper
                  title={'Transaction'}
                  total={paginatedTransection.length}
                  count={filteredFees.length}
                  rowsPerPage={limit}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleLimitChange}
                />
              </Box>
            )}
            <Divider />
            {paginatedTransection.length !== 0 && (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Fee Title')}</TableCell>
                        <TableCell>{t('Fee Amount')}</TableCell>
                        <TableCell>{t('Paid Amount')}</TableCell>
                        <TableCell>{t('Status')}</TableCell>
                        <TableCell>{t('Fine')}</TableCell>
                        <TableCell>{t('Last date')}</TableCell>
                        <TableCell>{t('Due')}</TableCell>
                        <TableCell>{t('Last payment date')}</TableCell>
                        <TableCell>{t('Total payable amount')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTransection?.map((project) => {
                        const last_date = dayjs(project.last_date).valueOf();
                        const today = dayjs(project.last_payment_date).valueOf();
                        const changeColor =
                          today > last_date
                            ? {
                                color: 'red'
                              }
                            : {};

                        let due = project?.amount;

                        if (today > last_date) {
                          console.log(
                            project?.title,
                            dayjs(project?.last_payment_date).format('MMMM D, YYYY h:mm A'),
                            '         ',
                            dayjs(project.last_payment_date).format('MMMM D, YYYY h:mm A'),
                            ' late!!!!!!!!!!'
                          );

                          due += project.late_fee ? project.late_fee : 0;

                          if (project.paidAmount) {
                            due -= project.paidAmount;
                          }
                        } else {
                          if (project.paidAmount) {
                            due -= project.paidAmount;
                          }
                        }
                        if (project?.status == 'paid' || project?.status === 'paid late') {
                          due = 0;
                        }

                        return (
                          <TableRow hover key={project.id}>
                            <TableCell>
                              <Typography noWrap variant="h5">
                                {project?.title}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {project?.amount.toFixed(1)}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {project?.paidAmount?.toFixed(1)}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={
                                // @ts-ignore
                                project?.status === 'paid' || project?.status === 'paid late'
                                  ? { color: 'green' }
                                  : // @ts-ignore
                                  project?.status === 'partial paid'
                                  ? { color: 'blue' }
                                  : { color: 'red' }
                              }
                            >
                              <Typography noWrap variant="h5">
                                {/* @ts-ignore */}
                                {project?.status.toUpperCase()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography noWrap variant="h5">
                                {project?.late_fee?.toFixed(1)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography noWrap variant="h5">
                                {dayjs(project?.last_date).format('MMMM D, YYYY h:mm A')}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {due?.toFixed(1)}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5">
                                {project?.status !== 'unpaid' ? dayjs(project?.last_payment_date).format('MMMM D, YYYY h:mm A') : ''}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap variant="h5" sx={changeColor}>
                                {today <= last_date || project?.status === 'paid late'
                                  ? ''
                                  : `${Number(project?.amount).toFixed(1)} + ${Number(project?.late_fee).toFixed(1)} = ${(
                                      project?.amount + project?.late_fee
                                    ).toFixed(1)}`}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Grid>
        </Card>
      </Grid>

      <Grid
        sx={{
          display: 'none'
        }}
      >
        <Grid
          ref={printPageRef}
          sx={{
            p: 1
          }}
        >
          <Grid
            sx={{
              textAlign: 'center',
              paddingBottom: 1
            }}
          >
            <h2>Class roll : {data?.class_roll_no}</h2>
            <h2>Class registration no : {data?.class_registration_no}</h2>
            <h2>Discount : {data?.discount}</h2>
          </Grid>
          <Table size="small">
            <thead>
              <tr>
                <th style={tableStyle}>{t('Fee Title')}</th>
                <th style={tableStyle}>{t('Fee Amount')}</th>
                <th style={tableStyle}>{t('Paid Amount')}</th>
                <th style={tableStyle}>{t('Status')}</th>
                <th style={tableStyle}>{t('Fine')}</th>
                <th style={tableStyle}>{t('Last date')}</th>
                <th style={tableStyle}>{t('Due')}</th>
                <th style={tableStyle}>{t('Last payment date')}</th>
                <th style={tableStyle}>{t('Total payable amount')}</th>
              </tr>
            </thead>
            <tbody
              style={{
                overflowX: 'auto',
                overflowY: 'auto'
              }}
            >
              {filteredFees?.map((project) => {
                const last_date = dayjs(project.last_date).valueOf();
                const today = dayjs(project.last_payment_date).valueOf();
                const changeColor =
                  today > last_date
                    ? {
                        color: 'red'
                      }
                    : {};

                let due = project?.amount;

                if (today > last_date) {
                  console.log(
                    project?.title,
                    dayjs(project?.last_payment_date).format('MMMM D, YYYY h:mm A'),
                    '         ',
                    dayjs(project.last_payment_date).format('MMMM D, YYYY h:mm A'),
                    ' late!!!!!!!!!!'
                  );

                  due += project.late_fee ? project.late_fee : 0;

                  if (project.paidAmount) {
                    due -= project.paidAmount;
                  }
                } else {
                  if (project.paidAmount) {
                    due -= project.paidAmount;
                  }
                }
                if (project?.status == 'paid' || project?.status === 'paid late') {
                  due = 0;
                }

                return (
                  <tr>
                    <td style={tableStyle}>{project?.title}</td>
                    <td style={tableStyle}>{project?.amount.toFixed(1)}</td>
                    <td style={tableStyle}>{project?.paidAmount?.toFixed(1)}</td>
                    <td
                      style={{
                        ...tableStyle,
                        color:
                          project?.status === 'paid' || project?.status === 'paid late'
                            ? 'green'
                            : project?.status === 'partial paid'
                            ? 'blue'
                            : 'red'
                      }}
                    >
                      {project?.status.toUpperCase()}
                    </td>
                    <td style={tableStyle}>{project?.late_fee?.toFixed(1)}</td>
                    <td style={tableStyle}>{dayjs(project?.last_date).format('MMMM D, YYYY h:mm A')}</td>
                    <td style={tableStyle}>{due?.toFixed(1)}</td>
                    <td style={tableStyle}>{project?.status !== 'unpaid' ? dayjs(project?.last_payment_date).format('MMMM D, YYYY h:mm A') : ''}</td>
                    <td style={{ ...tableStyle, ...changeColor }}>
                      {today <= last_date || project?.status === 'paid late'
                        ? ''
                        : `${Number(project?.amount).toFixed(1)} + ${Number(project?.late_fee).toFixed(1)} = ${(
                            project?.amount + project?.late_fee
                          ).toFixed(1)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Grid>
      </Grid>
    </>
  );
}

// FeesPaymentReport.getLayout = (page) => (
//     <Authenticated name="student_fee_collect">
//         <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
//     </Authenticated>
// );

export default FeesPaymentReport;
