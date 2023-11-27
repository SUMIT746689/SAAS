import {
  FC,
  ChangeEvent,
  MouseEvent,
  SyntheticEvent,
  useState,
  ReactElement,
  Ref,
  forwardRef,
  useEffect,
  useContext
} from 'react';

import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Grid,
  Slide,
  Divider,
  Tooltip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableContainer,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tab,
  Tabs,
  TextField,
  Button,
  Typography,
  Dialog,
  Zoom,
  styled,
  Chip,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from 'src/models/user';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import ApprovalIcon from '@mui/icons-material/Approval';
import { useAuth } from '@/hooks/useAuth';
import { AcademicYearContext } from '@/contexts/UtilsContextUse';
import { accessNestedProperty, getFile } from '@/utils/utilitY-functions';

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


interface ResultsProps {
  users: User[];
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



const applyFilters = (
  users,
  query,
  filters
) => {
  return users.filter((i) => {
    let matches = true;

    if (query) {
      const properties = ['name', 'user.role.title', 'user.username', 'Leave_type'];
      let containsQuery = false;
      for (const property of properties) {

        const queryString = accessNestedProperty(i, property.split('.'))

        if (queryString?.toLowerCase().includes(query.toLowerCase())) {
          containsQuery = true;
        }
      }

      if (filters.role && i.role !== filters.role) {
        matches = false;
      }

      if (!containsQuery) {
        matches = false;
      }
    }

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      if (value && i[key] !== value) {
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
  return users.slice(page * limit, page * limit + limit);
};



const Results = ({ users, reFetchData }) => {

  const { t }: { t: any } = useTranslation();
  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    role: null
  });
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const { showNotification } = useNotistick();

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    setQuery(event.target.value);
  };



  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const filteredClasses = applyFilters(users, query, filters);
  const paginatedClasses = applyPagination(filteredClasses, page, limit);



  const [openConfirmDelete, setOpenConfirmDelete] = useState(null);



  const closeConfirmDelete = () => {
    setOpenConfirmDelete(null);
  };

  const handleDeleteCompleted = () => {
    if (openConfirmDelete && academicYear?.id) {
      axios.delete(`/api/homework/${openConfirmDelete}?academic_year_id=${academicYear?.id}`)
        .then(res => {
          showNotification(res?.data?.message)
          setOpenConfirmDelete(null);
          reFetchData()
        })
        .catch(err => showNotification(err?.response?.data?.message, 'error'))
    }
  };
  const handleCreateClassClose = () => {
    setOpen(false);
    setSelectedUser(null)
  };

  return (
    <>

      <Card sx={{ minHeight: 'calc(100vh - 330px) !important' }}>
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
            <b>{paginatedClasses.length}</b> <b>{t('Leave')}</b>
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
        {paginatedClasses.length === 0 ? (
          <>
            <Typography
              sx={{
                py: 10,
                px: 4
              }}
              variant="h3"
              fontWeight="normal"
              color="text.secondary"
              align="center"
            >
              {t("We couldn't find any class matching your search criteria")}
            </Typography>
          </>
        ) : (
          <>

            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>{t('ID')}</TableCell>
                    <TableCell align='center'>{t('Date')}</TableCell>
                    <TableCell align='center'>{t('To Date')}</TableCell>
                    <TableCell align="center">{t('Applied Date')}</TableCell>
                    <TableCell align='center'>{t('Status')}</TableCell>

                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedClasses.map((i) => {

                    return (
                      <TableRow hover key={i.id}>
                        <TableCell align='center'>
                          <Typography variant="h5">
                            {i?.id}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant="h5">
                            {dayjs(i?.date).format('YYYY-MM-DD')}
                          </Typography>
                        </TableCell>

                        <TableCell align='center'>
                          <Typography variant="h5">
                            {i?.subject?.name}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant="h5">
                            <Typography noWrap variant="h5" py={0}>

                              {i?.file_path && <a
                                style={{ width: '50px', color: 'blue', textDecoration: 'underline' }}
                                target="_blank"
                                href={getFile(i?.file_path)}
                              >
                                File link
                              </a>
                              }
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant="h5">
                            <Tooltip title={t('Delete')} arrow>
                              <IconButton
                                onClick={() => setOpenConfirmDelete(i?.id)}
                                color="primary"
                              >
                                <DeleteTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
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
      </Card>

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
            {t('Are you sure you want to permanently delete this user account')}
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


Results.propTypes = {
  users: PropTypes.array.isRequired
};

Results.defaultProps = {
  users: []
};

export default Results;
