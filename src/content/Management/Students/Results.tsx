import {
  ChangeEvent,
  useState,
  ReactElement,
  Ref,
  forwardRef,
  useEffect,
  FC,
} from 'react';

import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Slide,
  Divider,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
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
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from 'src/models/user';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import BulkActions from './BulkActions';
import useNotistick from '@/hooks/useNotistick';
import NextLink from 'next/link';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import DiscountIcon from '@mui/icons-material/Discount';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

const AvatarError = styled(Avatar)(
  ({ theme }) => `
      background-color: ${theme.colors.error.lighter};
      color: ${theme.colors.error.main};
      width: ${theme.spacing(12)};
      height: ${theme.spacing(12)};

      .MuiSvgIcon-root {
        font-size: ${theme.typography.pxToRem(45)};
      }
`
);

const ButtonError = styled(Button)(
  ({ theme }) => `
     background: ${theme.colors.error.main};
     color: ${theme.palette.error.contrastText};

     &:hover {
        background: ${theme.colors.error.dark};
     }
    `
);

const ActionStyle: object = {
  height: '20px'
}
interface Filters {
  role?: string;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>
) {
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

const applyPagination = (
  users: User[],
  page: number,
  limit: number
): User[] => {
  return users?.slice(page * limit, page * limit + limit);
};

const Results: FC<{ students: any[], refetch: () => void, discount: any[], idCard: any, fee: any[] }> = ({ students, refetch, discount, idCard, fee }) => {

  const [selectedItems, setSelectedUsers] = useState([]);
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(20);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    role: null
  });

  const [discountModal, setDiscountModal] = useState(false);
  const [studentProfileModal, setStudentProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };
  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };


  const handleSelectAllUsers = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedUsers(event.target.checked ? students.map((user) => user.id) : []);
  };

  const handleSelectOneUser = (
    _event: ChangeEvent<HTMLInputElement>,
    userId: string
  ): void => {
    if (!selectedItems.includes(userId)) {
      setSelectedUsers((prevSelected) => [...prevSelected, userId]);
    } else {
      setSelectedUsers((prevSelected) =>
        prevSelected.filter((id) => id !== userId)
      );
    }
  };

  const filteredClasses = applyFilters(students, query, filters);
  const paginatedClasses = applyPagination(filteredClasses, page, limit);
  const selectedBulkActions = selectedItems.length > 0;
  const selectedSomeUsers =
    selectedItems.length > 0 && selectedItems.length < students.length;
  const selectedAllUsers = selectedItems.length === students.length;


  const [openConfirmDelete, setOpenConfirmDelete] = useState(null);


  const closeConfirmDelete = () => {
    setOpenConfirmDelete(null);
  };

  const handleDeleteCompleted = () => {

    axios.delete(`/api/student/${openConfirmDelete}`)
      .then(res => {
        setOpenConfirmDelete(null);
        refetch();
        showNotification('The student has been removed');
      })
      .catch(err => {
        setOpenConfirmDelete(null);
        showNotification('Student deletion failed !', 'error');
      })
  };
  const handleConfirmDelete = (id) => {
    setOpenConfirmDelete(id)
  }
  // console.log(selectedStudent);

  return (
    <>

      <Dialog
        fullWidth
        maxWidth="lg"
        open={studentProfileModal}
        onClose={() => {
          setStudentProfileModal(false);
        }}
        sx={{ paddingX: { xs: 3, md: 0 } }}
      >
        <Grid sx={{
          display: 'grid',
          gridTemplateColumns: {
            md: '25% 75%',
            sm: 'auto'
          },
          p: 2
        }}>
          <Grid sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 2,
            p: 2
          }}>
            <Image src={getFile(selectedStudent?.student_photo)}
              height={150}
              width={150}
              alt='Student photo'
              loading='lazy'
              style={{
                borderRadius: '50%'
              }}
            />
            <Typography variant='h3' align='center'>{[selectedStudent?.student_info?.first_name, selectedStudent?.student_info?.middle_name, selectedStudent?.student_info?.last_name]?.join(' ')}</Typography>
            <Typography variant='h4' align='center'>Class registration no : {selectedStudent?.class_registration_no}</Typography>

            <Grid sx={{
              display: 'grid',
              gridTemplateColumns: 'auto auto',
              gap: 3
            }}>
              <Typography variant='h6'>Group : <br /> {selectedStudent?.group?.title}</Typography>
              <Typography variant='h6'>Admission date : <br /> {dayjs(selectedStudent?.created_at).format('DD/MM/YYYY')}</Typography>
              <Typography variant='h6'>Academic year : <br /> {selectedStudent?.academic_year?.title}</Typography>
              <Typography variant='h6'>Roll : <br /> {selectedStudent?.class_roll_no}</Typography>
              <Typography variant='h6'>Class : <br /> {selectedStudent?.section?.class?.name}</Typography>
              <Typography variant='h6'>Section : <br /> {selectedStudent?.section?.name}</Typography>
              <Typography variant='h6'>Date of birth : <br /> {dayjs(selectedStudent?.student_info?.date_of_birth).format('DD/MM/YYYY')}</Typography>
              <Typography variant='h6'>Blood group : <br /> {selectedStudent?.student_info?.blood_group}</Typography>

            </Grid>
            <Typography variant='h5'>First admission date : {dayjs(selectedStudent?.student_info?.admission_date).format('DD/MM/YYYY')}</Typography>

          </Grid>

          <Grid sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2,
            borderLeft: {
              md: '1px solid lightgrey'
            }
          }}>
            <Grid>
              <Typography align='center' variant='h3' p={2} borderBottom={'1px dashed lightgrey'}>Basic Information</Typography>
              <Grid sx={{
                display: 'grid',
                gridTemplateColumns: {
                  md: 'auto auto',
                  sm: 'auto'
                },
                gap: 2
              }}>
                <Grid sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  pt: 2
                }}>
                  <Typography variant='h6'>User name :<br /><Typography variant='h5'> {selectedStudent?.student_info?.user?.username}</Typography> </Typography>
                  <Typography variant='h6'>Gender :<br /><Typography variant='h5'>  {selectedStudent?.student_info?.gender}</Typography></Typography>
                  <Typography variant='h6'>Phone :<br /> <Typography variant='h5'> {selectedStudent?.student_info?.phone}</Typography></Typography>
                  <Typography variant='h6'>Religion :<br /><Typography variant='h5'>  {selectedStudent?.student_info?.religion}</Typography></Typography>
                </Grid>
                <Grid borderLeft={'1px dashed lightgrey'} pl={2} sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  pt: 2
                }}>
                  <Typography variant='h6'>Email :<br /><Typography variant='h5'>  {selectedStudent?.student_info?.email}</Typography></Typography>
                  <Typography variant='h6'>Birth certificate or NID :<br /><Typography variant='h5'> {selectedStudent?.student_info?.national_id}</Typography> </Typography>
                  <Typography variant='h6'>Previous school :<br /><Typography variant='h5'>  {selectedStudent?.student_info?.previous_school}</Typography></Typography>
                  <Typography variant='h6'>Present address :<br /><Typography variant='h5'>{selectedStudent?.student_present_address} </Typography> </Typography>
                  <Typography variant='h6'>Permanent address :<br /><Typography variant='h5'>  {selectedStudent?.student_info?.student_permanent_address}</Typography></Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid>
              <Typography align='center' variant='h3' p={2} borderBottom={'1px dashed lightgrey'}>Guardian Information</Typography>
              <Grid sx={{
                display: 'grid',
                gridTemplateColumns: {
                  md: 'auto auto',
                  sm: 'auto'
                },
                gap: 2
              }}>
                <Grid sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  pt: 2
                }}>
                  <Typography variant='h6'>Guardian name :<br /><Typography variant='h5'> {selectedStudent?.guardian_name}</Typography></Typography>
                  <Typography variant='h6'>Relation with guardian :<br /><Typography variant='h5'> {selectedStudent?.relation_with_guardian}</Typography></Typography>
                  <Typography variant='h6'>Guardian phone :<br /><Typography variant='h5'> {selectedStudent?.guardian_phone}</Typography></Typography>
                  <Typography variant='h6'>Guardian profession :<br /><Typography variant='h5'> {selectedStudent?.guardian_profession}</Typography></Typography>
                </Grid>
                <Grid borderLeft={'1px dashed lightgrey'} pl={2} sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  pt: 2
                }}>
                  <Typography variant='h6'>Father's name :<br /> <Typography variant='h5'>{selectedStudent?.student_info?.father_name}</Typography></Typography>
                  <Typography variant='h6'>Father's phone :<br /> <Typography variant='h5'>{selectedStudent?.student_info?.father_phone}</Typography></Typography>
                  <Typography variant='h6'>Father's profession :<br /> <Typography variant='h5'>{selectedStudent?.student_info?.father_profession}</Typography></Typography>

                  <Typography variant='h6'>Mother's name :<br /> <Typography variant='h5'>{selectedStudent?.student_info?.mother_name}</Typography></Typography>
                  <Typography variant='h6'>Mother's phone :<br /> <Typography variant='h5'>{selectedStudent?.student_info?.mother_phone}</Typography></Typography>
                  <Typography variant='h6'>Mother's profession :<br /> <Typography variant='h5'>  {selectedStudent?.student_info?.mother_profession}</Typography></Typography>

                </Grid>
              </Grid>
            </Grid>

          </Grid>
        </Grid>
      </Dialog>


      {/* Discount and waiver fee section */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={discountModal}
        onClose={() => {
          refetch();
          setDiscountModal(false);
        }}
        sx={{ paddingX: { xs: 3, md: 0 } }}
      >
        <Grid item container flexDirection={'column'} sx={{ p: 4 }}>
          <Typography fontSize={20} fontWeight={'bold'}>Discount [Fee, month, discount title, discount amount, discount type]</Typography>
          <br />
          <Grid item container display={'grid'} p={4} border={'1px solid lightGray'} borderRadius={'8px'} sx={{ gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 1, sm: 2 } }}>
            {
              discount?.map((i: any) => (
                <SingleDiscount
                  key={i.id}
                  selectedUser={selectedStudent}
                  singleDiscount={i}
                />
              ))
            }
          </Grid>
          <br />
          <Typography fontSize={20} fontWeight={'bold'}>Waiver fee</Typography>
          <br />
          <Grid item container display={'grid'} p={4} border={'1px solid lightGray'} borderRadius={'8px'} sx={{ gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 1, sm: 2 } }}>
            {fee?.map((i: any) => (
              <SingleFee
                key={i.id}
                selectedUser={selectedStudent}
                singleFee={i}
              />
            ))}
          </Grid>
        </Grid>
      </Dialog>

      <Card sx={{ minHeight: 'calc(100vh - 410px)', borderRadius: 0 }}>

        {/* {selectedBulkActions && (
          <Box p={2}>
            <BulkActions />
          </Box>
        )} */}
        {/* {!selectedBulkActions && ( */}
        <Box
          px={2}
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
        {/* )} */}
        <Divider />

        {paginatedClasses.length === 0 ? (
          <>
            <Typography
              sx={{
                py: 10
              }}
              variant="h3"
              fontWeight="normal"
              color="text.secondary"
              align="center"
            >
              {t("We couldn't find any students matching your search criteria")}
            </Typography>
          </>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableHeaderCellWrapper padding="checkbox">
                    <Checkbox
                      checked={selectedAllUsers}
                      indeterminate={selectedSomeUsers}
                      onChange={handleSelectAllUsers}
                    />
                  </TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('User id')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('User Name')}</TableHeaderCellWrapper>

                  <TableHeaderCellWrapper>{t('student name')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('student id')}</TableHeaderCellWrapper>

                  <TableHeaderCellWrapper>{t('Class')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Class Roll')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Batch')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Phone')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper align="center">{t('Actions')}</TableHeaderCellWrapper>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClasses.map((i) => {
                  const isUserSelected = selectedItems.includes(i.id);

                  return (
                    <TableRow hover key={i.id} selected={isUserSelected}>
                      <TableHeaderCellWrapper padding="checkbox">
                        <Checkbox
                          checked={isUserSelected}
                          onChange={(event) =>
                            handleSelectOneUser(event, i.id)
                          }
                          value={isUserSelected}
                        />
                      </TableHeaderCellWrapper>
                      <TableBodyCellWrapper>
                        {i?.student_info?.user?.id}
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        {i?.student_info?.user?.username}
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        {[i?.student_info?.first_name, i?.student_info?.middle_name, i?.student_info?.last_name].join(' ')}
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        {i?.student_info?.student_id}
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        {i?.class?.name}
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        {i?.class_roll_no}
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        {i?.batches?.map(batch => batch.name)?.join(', ')}
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        <a href={`tel:${i?.student_info?.phone}`}>{i?.student_info?.phone}</a>
                      </TableBodyCellWrapper>

                      {/* <TableCell align={'center'}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: 2,
                          justifyContent: 'center'

                        }}
                      > */}
                      <TableBodyCellWrapper>
                        <Grid py={0.25} mx="auto" display="flex" justifyContent="center" columnGap={1} >
                          <Tooltip title={t('View Profile')} arrow >
                            <IconButton
                              sx={ActionStyle}
                              color="primary"
                              onClick={() => {
                                setSelectedStudent(i)
                                setStudentProfileModal(true)
                              }}
                              size="small"

                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t('Edit')} arrow>
                            <IconButton
                              color="primary"
                              sx={ActionStyle}
                              size='small'
                            >
                              <NextLink href={`/students/${i.id}/edit`}><LaunchTwoToneIcon fontSize="small" /></NextLink>
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t('Discount')} arrow>
                            <IconButton
                              sx={ActionStyle}
                              color="primary"
                              onClick={() => {
                                setSelectedStudent(i)
                                setDiscountModal(true)
                              }}
                              size="small"
                            >
                              <DiscountIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t('Delete')} arrow>
                            <IconButton
                              sx={ActionStyle}
                              onClick={() => handleConfirmDelete(i.id)}
                              color="primary"
                              size="small"
                            >
                              <DeleteTwoToneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </TableBodyCellWrapper>
                      {/* </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card >
      <div style={{ display: 'none', visibility: 'hidden' }}>
        <Grid ref={idCard} display={'grid'} gridTemplateColumns={'1fr 1fr'} container gap={1.5}>
          {students?.filter?.(j => selectedItems.includes(j.id))?.map(
            (i, index) => {

              const user = {
                id: i?.class_roll_no,
                class_registration_no: i?.class_registration_no,
                name: `${i?.student_info?.first_name ? i?.student_info?.first_name : ''} ${i?.student_info?.middle_name ? i?.student_info?.middle_name : ''} ${i?.student_info?.last_name ? i?.student_info?.last_name : ''}`,
                schoolName: i?.student_info?.school?.name,
                class: i?.section?.class?.name,
                roll: i?.class_roll_no,
                section: i?.section?.class?.has_section ? i?.section?.name : 'No section',
                blood_group: i?.student_info?.blood_group,
                academicYear: i?.academic_year?.title,
                phone: i?.student_info?.phone,
                birthDate: dayjs(i?.student_info?.date_of_birth).format('DD/MM/YYYY'),
                photo: i?.student_photo ? getFile(i?.student_photo) : '/dumy_student.png'
              };
              return <Grid sx={{
                pageBreakAfter: (index + 1) % 8 == 0 ? 'always' : 'avoid',
                p: '5px'
              }}> <IdentityCard user={user} /></Grid>
            }
          )}
        </Grid>
      </div>
      <DialogWrapper
        open={openConfirmDelete ? true : false}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
        keepMounted
        onClose={closeConfirmDelete}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          p={5}
        >
          <AvatarError>
            <CloseIcon />
          </AvatarError>

          <Typography
            align="center"
            sx={{
              py: 4,
              px: 6
            }}
            variant="h3"
          >
            {t('Are you sure you want to permanently delete this student')}
            ?
          </Typography>

          <Box>
            <Button
              variant="text"
              size="large"
              sx={{
                mx: 1
              }}
              onClick={closeConfirmDelete}
            >
              {t('Cancel')}
            </Button>
            <ButtonError
              onClick={handleDeleteCompleted}
              size="large"
              sx={{
                mx: 1,
                px: 3
              }}
              variant="contained"
            >
              {t('Delete')}
            </ButtonError>
          </Box>
        </Box>
      </DialogWrapper>


    </>
  );
};

const SingleFee = ({ singleFee, selectedUser }) => {

  const [checked, setChecked] = useState(
    selectedUser && selectedUser?.waiver_fees?.length > 0
      ? selectedUser?.waiver_fees.find((j) => j.id == singleFee.id)
        ? true
        : false
      : false
  );

  const handleWaiverFeeUpdate = (e) => {
    if (checked) {
      axios
        .put(`/api/fee/detach`, {
          fee_id: singleFee.id,
          student_id: selectedUser.id
        })
        .then(() => {
          setChecked(false);

        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .put(`/api/fee/attach`, {
          fee_id: singleFee.id,
          student_id: selectedUser.id
        })
        .then(() => {
          setChecked(true);

        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <Box display={'flex'} justifyContent="space-between" p={1} borderRadius={0.4} sx={{ backgroundColor: 'lightGray', ":hover": { backgroundColor: 'darkGray' } }} key={singleFee.id}>
      <Typography sx={{ my: 'auto', textTransform: 'capitalize', fontSize: { xs: 10, md: 15 } }}>
        {singleFee?.label}
      </Typography>
      <Switch sx={{ my: 'auto' }} checked={checked} onChange={handleWaiverFeeUpdate} />
    </Box>
  );
};

const SingleDiscount = ({ singleDiscount, selectedUser }) => {
  console.log({ singleDiscount })
  const [checked, setChecked] = useState(
    selectedUser && selectedUser?.discount?.length > 0
      ? selectedUser?.discount.find((j) => j.id == singleDiscount.id)
        ? true
        : false
      : false
  );

  const handleDiscountUpdate = (e) => {
    if (checked) {
      axios
        .put(`/api/discount/detach`, {
          discount_id: singleDiscount.id,
          student_id: selectedUser.id
        })
        .then(() => {
          setChecked(false);

        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .put(`/api/discount/attach`, {
          discount_id: singleDiscount.id,
          student_id: selectedUser.id
        })
        .then(() => {
          setChecked(true);

        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <Box display={'flex'} justifyContent="space-between" borderRadius={0.4} sx={{ backgroundColor: 'lightGray', ":hover": { backgroundColor: 'darkGray' } }} key={singleDiscount.id}>
      <Typography sx={{ my: 'auto', textTransform: 'capitalize', fontSize: { xs: 8, md: 12 }, pl: 0.5 }}>
        {singleDiscount?.label}
      </Typography>
      <Switch sx={{ my: 'auto' }} checked={checked} onChange={handleDiscountUpdate} />
    </Box>
  );
};


Results.propTypes = {
  students: PropTypes.array.isRequired
};

Results.defaultProps = {
  students: []
};

export default Results;
