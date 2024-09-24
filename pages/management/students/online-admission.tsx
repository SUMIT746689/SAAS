import {
  ChangeEvent,
  useState,
  ReactElement,
  Ref,
  forwardRef,
  useEffect,
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
import ApprovalIcon from '@mui/icons-material/Approval';
import useNotistick from '@/hooks/useNotistick';
import NextLink from 'next/link';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import DiscountIcon from '@mui/icons-material/Discount';
import VisibilityIcon from '@mui/icons-material/Visibility';

import axios from 'axios';
import Head from 'next/head';
import Footer from '@/components/Footer';
import { Authenticated } from '@/components/Authenticated';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import StudentForm from '@/components/Student/StudentForm';
import PageHeader from '@/components/PageHeaderDocs';
import PageHead from 'src/content/Management/Students/OnlineAddmission/PageHeader';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { customizeDateWithTime } from '@/utils/customizeDate';
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
interface Filters {
  role?: string;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const applyFilters = (
  users,
  query,
  filters
) => {
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

const Results = () => {
  const [users, setUsers] = useState([])
  const [selectedItems, setSelectedUsers] = useState([]);
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    role: null
  });

  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(null);

  const refetch = () => {
    axios.get('/api/onlineAdmission')
      .then(res => setUsers(res.data))
      .catch(err => console.log(err))
  }

  useEffect(() => {
    refetch()
  }, [])

  const handleCreateProjectClose = () => {
    setOpen(false)
    setSelectedStudent(null)
    refetch();
  }
  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };
  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };


  const handleSelectAllUsers = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedUsers(event.target.checked ? users.map((user) => user.id) : []);
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

  const filteredClasses = applyFilters(users, query, filters);
  const paginatedClasses = applyPagination(filteredClasses, page, limit);
  const selectedBulkActions = selectedItems.length > 0;
  const selectedSomeUsers =
    selectedItems.length > 0 && selectedItems.length < users.length;
  const selectedAllUsers = selectedItems.length === users.length;

  const closeConfirmDelete = () => {
    setOpenConfirmDelete(null);
  };

  const handleDeleteCompleted = () => {

    axios.delete(`/api/onlineAdmission/${openConfirmDelete}`)
      .then(res => {
        setOpenConfirmDelete(null);
        refetch();
        showNotification('Admission request has been removed');
      })
      .catch(err => {
        setOpenConfirmDelete(null);
        showNotification('Admission request deletion failed !', 'error');
      })
  };
  const handleConfirmDelete = (id) => {
    setOpenConfirmDelete(id)
  }
  const [editSection, setEditSection] = useState();
  return (
    <>
      <Head>
        <title>Online admission - Management</title>
      </Head>

      <PageTitleWrapper>
        <PageHead
          editSection={editSection}
          setEditSection={setEditSection}
          reFetchData={() => { }}
        />
      </PageTitleWrapper>

      <Dialog
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleCreateProjectClose}
        scroll='body'
      >
        <Grid p={2}>
          <Typography variant='h2' align='center' py={2}> Online Admission Approval</Typography>
          <StudentForm
            student={selectedStudent?.student}
            handleClose={handleCreateProjectClose}
            onlineAdmission_id={selectedStudent?.id}
          />
        </Grid>

      </Dialog>

      <Card sx={{ minHeight: 'calc(100vh - 215px)',mx:0.5 }}>


        {!selectedBulkActions && (
          <Box
            p={2}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography component="span" variant="subtitle1">
                {t('Showing')}:
              </Typography>{' '}
              <b>{paginatedClasses.length}</b> <b>{t('Admission request')}</b>
            </Box>
            <TablePagination
              component="div"
              count={filteredClasses.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleLimitChange}
              page={page}
              rowsPerPage={limit}
              rowsPerPageOptions={[5, 10, 15]}
            />
          </Box>
        )}
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
              {t("We couldn't find any Admission request")}
            </Typography>
          </>
        ) : (
          <>
            <TableContainer >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableHeaderCellWrapper align={'center'}>{t('ID')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align={'center'}>{t('Name')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align={'center'}>{t('User Name')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align={'center'}>{t('Password')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align={'center'}>{t('Class')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align={'center'}>{t('Academic year')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align={'center'}>{t('Submission Time')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align={'center'}>{t('Actions')}</TableHeaderCellWrapper>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedClasses.map((i) => {
                    return (
                      <TableRow hover key={i.id} >
                        <TableBodyCellWrapper align={'center'}>
                          {i?.id}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper align={'center'}>
                          {i?.student?.first_name} {i?.student?.middle_name} {i?.student?.last_name}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper align={'center'}>
                        {i?.student?.username}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper align={'center'}>
                        {i?.student?.password}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper align={'center'}>
                          {i?.student?.class_name}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper align={'center'}>
                          {i?.student?.academic_year_title}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper align={'center'}>
                          {customizeDateWithTime(i?.student?.admission_date)}
                        </TableBodyCellWrapper>

                        <TableBodyCellWrapper align={'center'} >

                          <Tooltip title={t('Approve')} arrow>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setSelectedStudent(i)
                                setOpen(true)
                              }}
                            >
                              <ApprovalIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t('Delete')} arrow sx={{ml:1}}>
                            <IconButton
                              onClick={() => handleConfirmDelete(i.id)}
                              color="primary"
                            >
                              <DeleteTwoToneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableBodyCellWrapper>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Card>

      <Footer />

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


Results.getLayout = (page) => (
  <Authenticated name="student">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Results;
