import { ChangeEvent, useState, ReactElement, Ref, forwardRef, FC } from 'react';
import PropTypes from 'prop-types';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Checkbox,
  TableCell,
  Avatar,
  Box,
  Card,
  Slide,
  Divider,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TableRow,
  Button,
  Typography,
  Dialog,
  styled,
  TablePagination,
  Grid,
  Switch,
  Tooltip,
  IconButton
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from 'src/models/user';
import { useTranslation } from 'react-i18next';
// import BulkActions from './../BulkActions';
import useNotistick from '@/hooks/useNotistick';
import dayjs from 'dayjs';
import axios from 'axios';
import Image from 'next/image';
import IdentityCard from '@/content/Management/Students/StudentIdCardDesign';
import { getFile } from '@/utils/utilitY-functions';
import { TableBodyCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';

const DialogWrapper = styled(Dialog)(
  () => `
      .MuiDialog-paper {
        overflow: visible;
      }
`
);
const ActionStyle: object = {
  height: '20px',
  cursor:"pointer"
};

const Transition = forwardRef(function Transition(props: TransitionProps & { children: ReactElement<any, any> }, ref: Ref<unknown>) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const applyFilters = (users, query, filters) => {
  return users?.filter((user) => {
    let matches = true;

    if (query) {
      const properties = ['first_name', 'class_roll_no'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (user[property]?.toLowerCase().includes(query.toLowerCase())) {
          containsQuery = true;
        }
        if (user?.student_info[property]?.toLowerCase().includes(query.toLowerCase())) {
          containsQuery = true;
        }
      });

      if (filters.role && user.role !== filters.role) {
        matches = false;
      }

      if (!containsQuery) {
        matches = false;
      }
    }

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      if (value && user[key] !== value) {
        matches = false;
      }
    });

    return matches;
  });
};

const applyPagination = (users, page, limit) => {
  return users?.slice(page * limit, page * limit + limit);
};

const Results = ({ query, setQuery, selectedItems, setSelectedUsers, students, refetch, discount, idCard, fee }) => {
  // const [selectedItems, setSelectedUsers] = useState<string[]>([]);
  const { t } = useTranslation();
  const { showNotification } = useNotistick();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProfileModal, setStudentProfileModal] = useState(false);
  const [page, setPage] = useState<number>(0);
  // const [activeSeparateStudent, setActiveSeparateStudent] = useState(false);
  const [limit, setLimit] = useState<number>(20);
  // const [query, setQuery] = useState<string>('');

  const handleActiveSeparateStudent = async (i) => {
    console.log(i.id);
    const res = await axios.post(`/api/student/active-separate-student`, {
      student_id: i.id
    });
    refetch();
    showNotification('successfully active student')
    // console.log(res.data);
  };

  const [filters, setFilters] = useState<{ role?: string }>({
    role: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value, 10));
  };

  const handleSelectAllUsers = (event: ChangeEvent<HTMLInputElement>): void => {
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const userIds = students.slice(startIndex, endIndex).map((user) => user.id);
    if (event.target.checked) {
      setSelectedUsers((prevSelected) => [...new Set([...prevSelected, ...userIds])]);
    } else {
      setSelectedUsers((prevSelected) => prevSelected.filter((id) => !userIds.includes(id)));
    }
  };

  const handleSelectOneUser = (_event: ChangeEvent<HTMLInputElement>, userId: string): void => {
    if (!selectedItems.includes(userId)) {
      setSelectedUsers((prevSelected) => [...prevSelected, userId]);
    } else {
      setSelectedUsers((prevSelected) => prevSelected.filter((id) => id !== userId));
    }
  };

  const filteredClasses = applyFilters(students, query, filters);
  const paginatedClasses = applyPagination(filteredClasses, page, limit);
  const selectedBulkActions = selectedItems.length > 0;
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  const selectedSomeUsers = selectedItems.length > 0 && selectedItems.length < paginatedClasses.length;
  const selectedAllUsers = paginatedClasses.every((student) => selectedItems.includes(student.id));
  // console.log({ paginatedClasses });
  return (
    <>
      {/* view students profile code start*/}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={studentProfileModal}
        onClose={() => {
          setStudentProfileModal(false);
        }}
        sx={{ paddingX: { xs: 3, md: 0 } }}
      >
        <Grid
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              md: '25% 75%',
              sm: 'auto'
            },
            p: 2
          }}
        >
          <Grid
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              gap: 2,
              p: 2
            }}
          >
            <Image
              src={getFile(selectedStudent?.student_photo)}
              height={150}
              width={150}
              alt="Student photo"
              loading="lazy"
              style={{
                borderRadius: '50%'
              }}
            />
            <Typography variant="h3" align="center">
              {[
                selectedStudent?.student_info?.first_name,
                selectedStudent?.student_info?.middle_name,
                selectedStudent?.student_info?.last_name
              ]?.join(' ')}
            </Typography>
            <Typography variant="h4" align="center">
              Class registration no : {selectedStudent?.class_registration_no}
            </Typography>

            <Grid
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                gap: 3
              }}
            >
              <Typography variant="h6">
                Group : <br /> {selectedStudent?.group?.title}
              </Typography>
              <Typography variant="h6">
                Admission date : <br /> {dayjs(selectedStudent?.created_at).format('DD/MM/YYYY')}
              </Typography>
              <Typography variant="h6">
                Academic year : <br /> {selectedStudent?.academic_year?.title}
              </Typography>
              <Typography variant="h6">
                Roll : <br /> {selectedStudent?.class_roll_no}
              </Typography>
              <Typography variant="h6">
                Class : <br /> {selectedStudent?.section?.class?.name}
              </Typography>
              <Typography variant="h6">
                Section : <br /> {selectedStudent?.section?.name}
              </Typography>
              <Typography variant="h6">
                Date of birth : <br /> {dayjs(selectedStudent?.student_info?.date_of_birth).format('DD/MM/YYYY')}
              </Typography>
              <Typography variant="h6">
                Blood group : <br /> {selectedStudent?.student_info?.blood_group}
              </Typography>
            </Grid>
            <Typography variant="h5">First admission date : {dayjs(selectedStudent?.student_info?.admission_date).format('DD/MM/YYYY')}</Typography>
          </Grid>

          <Grid
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2,
              borderLeft: {
                md: '1px solid lightgrey'
              }
            }}
          >
            <Grid>
              <Typography align="center" variant="h3" p={2} borderBottom={'1px dashed lightgrey'}>
                Basic Information
              </Typography>
              <Grid
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    md: 'auto auto',
                    sm: 'auto'
                  },
                  gap: 2
                }}
              >
                <Grid
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    pt: 2
                  }}
                >
                  <Typography variant="h6">
                    User name :<br />
                    <Typography variant="h5"> {selectedStudent?.student_info?.user?.username}</Typography>{' '}
                  </Typography>
                  <Typography variant="h6">
                    Gender :<br />
                    <Typography variant="h5"> {selectedStudent?.student_info?.gender}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Phone :<br /> <Typography variant="h5"> {selectedStudent?.student_info?.phone}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Religion :<br />
                    <Typography variant="h5"> {selectedStudent?.student_info?.religion}</Typography>
                  </Typography>
                </Grid>
                <Grid
                  borderLeft={'1px dashed lightgrey'}
                  pl={2}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    pt: 2
                  }}
                >
                  <Typography variant="h6">
                    Email :<br />
                    <Typography variant="h5"> {selectedStudent?.student_info?.email}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Birth certificate or NID :<br />
                    <Typography variant="h5"> {selectedStudent?.student_info?.national_id}</Typography>{' '}
                  </Typography>
                  <Typography variant="h6">
                    Previous school :<br />
                    <Typography variant="h5"> {selectedStudent?.student_info?.previous_school}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Present address :<br />
                    <Typography variant="h5">{selectedStudent?.student_present_address} </Typography>{' '}
                  </Typography>
                  <Typography variant="h6">
                    Permanent address :<br />
                    <Typography variant="h5"> {selectedStudent?.student_info?.student_permanent_address}</Typography>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid>
              <Typography align="center" variant="h3" p={2} borderBottom={'1px dashed lightgrey'}>
                Guardian Information
              </Typography>
              <Grid
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    md: 'auto auto',
                    sm: 'auto'
                  },
                  gap: 2
                }}
              >
                <Grid
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    pt: 2
                  }}
                >
                  <Typography variant="h6">
                    Guardian name :<br />
                    <Typography variant="h5"> {selectedStudent?.guardian_name}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Relation with guardian :<br />
                    <Typography variant="h5"> {selectedStudent?.relation_with_guardian}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Guardian phone :<br />
                    <Typography variant="h5"> {selectedStudent?.guardian_phone}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Guardian profession :<br />
                    <Typography variant="h5"> {selectedStudent?.guardian_profession}</Typography>
                  </Typography>
                </Grid>
                <Grid
                  borderLeft={'1px dashed lightgrey'}
                  pl={2}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    pt: 2
                  }}
                >
                  <Typography variant="h6">
                    Father's name :<br /> <Typography variant="h5">{selectedStudent?.student_info?.father_name}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Father's phone :<br /> <Typography variant="h5">{selectedStudent?.student_info?.father_phone}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Father's profession :<br /> <Typography variant="h5">{selectedStudent?.student_info?.father_profession}</Typography>
                  </Typography>

                  <Typography variant="h6">
                    Mother's name :<br /> <Typography variant="h5">{selectedStudent?.student_info?.mother_name}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Mother's phone :<br /> <Typography variant="h5">{selectedStudent?.student_info?.mother_phone}</Typography>
                  </Typography>
                  <Typography variant="h6">
                    Mother's profession :<br /> <Typography variant="h5"> {selectedStudent?.student_info?.mother_profession}</Typography>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
      {/* view students profile code end*/}

      <Card sx={{ minHeight: 'calc(100vh - 410px)', borderRadius: 0 }}>
        {!selectedBulkActions && (
          <Box
            sx={{
              px: { xs: '9px', md: '18px' }
            }}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography component="span" variant="subtitle1">
                {t('Showing')}:
              </Typography>{' '}
              <b>{paginatedClasses.length}</b> <b>{t('students')}</b>
            </Box>
            <TablePagination
              component="div"
              count={filteredClasses.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleLimitChange}
              page={page}
              rowsPerPage={limit}
              rowsPerPageOptions={[20, 50, 70]}
            />
          </Box>
        )}
        <Divider />

        {paginatedClasses.length === 0 ? (
          <Typography sx={{ py: 10 }} variant="h3" fontWeight="normal" color="text.secondary" align="center">
            {t("We couldn't find any students matching your search criteria")}
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {/* <TableCell padding="checkbox">
                    <Checkbox checked={selectedAllUsers} indeterminate={selectedSomeUsers} onChange={handleSelectAllUsers} />
                  </TableCell> */}
                  <TableHeaderCellWrapper>{t('student name')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('status')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Year')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Photo')}</TableHeaderCellWrapper>

                  <TableHeaderCellWrapper>{t('student id')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Gender')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Class')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Class Roll')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Section')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Group')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Phone')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Action')}</TableHeaderCellWrapper>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClasses.map((i) => {
                  const isUserSelected = selectedItems.includes(i.id);
                  return (
                    <TableRow hover key={i.id} selected={isUserSelected}>
                      {/* <TableCell padding="checkbox">
                        <Checkbox checked={isUserSelected} onChange={(event) => handleSelectOneUser(event, i.id)} />
                      </TableCell> */}

                      <TableBodyCellWrapper>
                        {[i?.student_info?.first_name, i?.student_info?.middle_name, i?.student_info?.last_name].join(' ')}
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>Separated</TableBodyCellWrapper>
                      <TableBodyCellWrapper>{i?.academic_year?.title}</TableBodyCellWrapper>

                      <TableBodyCellWrapper sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid sx={{ width: '50px', height: '50px', border: '1px solid #e0e0e0', borderRadius: '100%', overflow: 'hidden' }}>
                          <Image src={getFile(i?.student_photo)} alt={`${i?.student_info?.first_name}`} width={50} height={50} />
                        </Grid>
                      </TableBodyCellWrapper>

                      <TableBodyCellWrapper>{i?.student_info?.student_id}</TableBodyCellWrapper>
                      <TableBodyCellWrapper sx={{ textTransform: 'capitalize' }}>{i?.student_info?.gender}</TableBodyCellWrapper>
                      <TableBodyCellWrapper>{i?.section?.class?.name}</TableBodyCellWrapper>
                      <TableBodyCellWrapper>{i?.class_roll_no}</TableBodyCellWrapper>
                      <TableBodyCellWrapper>{i?.section?.class?.has_section ? i?.section?.name : 'no section'}</TableBodyCellWrapper>
                      <TableBodyCellWrapper>{i?.group?.title ? i?.group?.title : 'no section'}</TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        <a href={`tel:${i?.student_info?.phone}`}>{i?.student_info?.phone}</a>
                      </TableBodyCellWrapper>

                      <TableBodyCellWrapper>
                        <Grid display="flex" gap={2}>
                          <Tooltip title={t('View Profile')} arrow>
                            <IconButton
                              sx={ActionStyle}
                              color="primary"
                              onClick={() => {
                                setSelectedStudent(i);
                                setStudentProfileModal(true);
                              }}
                              size="small"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* <Tooltip title={t('Unseparate List')} arrow>
                          <IconButton sx={ActionStyle} color="primary" size="small">
                            <VisibilityIcon
                              onClick={() => {
                                handleActiveSeparateStudent(i);
                              }}
                              fontSize="small"
                            />
                          </IconButton>
                        </Tooltip> */}
                          <Tooltip title={t('Active Student')} arrow>
                            <PersonRemoveIcon
                              sx={ActionStyle}
                              color="primary"
                              onClick={() => {
                                handleActiveSeparateStudent(i);
                              }}
                              fontSize="small"
                              
                            />
                          </Tooltip>
                        </Grid>
                      </TableBodyCellWrapper>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </>
  );
};

Results.propTypes = {
  students: PropTypes.array.isRequired
};

Results.defaultProps = {
  students: []
};

export default Results;
