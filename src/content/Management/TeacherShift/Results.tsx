import {
  FC,
  ChangeEvent,
  useState,
  ReactElement,
  Ref,
  forwardRef,
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
  TablePagination,
  TableContainer,
  TableRow,
  Button,
  Typography,
  Dialog,
  styled,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from 'src/models/user';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import useNotistick from '@/hooks/useNotistick';
import axios from 'axios';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import dayjs from 'dayjs';

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
  setEditSection: Function;
  reFetchData: Function;
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
  return users.filter((user) => {
    let matches = true;

    if (query) {
      const properties = ['email', 'name', 'username'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (user[property]?.toLowerCase().includes(query.toLowerCase())) {
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
  users,
  page,
  limit
) => {
  return users.slice(page * limit, page * limit + limit);
};

const Results: FC<ResultsProps> = ({ setEditSection, users, reFetchData }) => {

  const [selectedItems, setSelectedUsers] = useState<string[]>([]);
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();


  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    role: null
  });

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

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const filteredGroups = applyFilters(users, query, filters);
  const paginatedGroups = applyPagination(filteredGroups, page, limit);
  const selectedSomeUsers =
    selectedItems.length > 0 && selectedItems.length < users.length;
  const selectedAllUsers = selectedItems.length === users.length;

  const [openConfirmDelete, setOpenConfirmDelete] = useState(null);

  const handleConfirmDelete = (id) => {
    setOpenConfirmDelete(id);
  };

  const closeConfirmDelete = () => {
    setOpenConfirmDelete(null);
  };

  const handleDeleteCompleted = () => {

    axios.delete(`/api/teacher_shifts/${openConfirmDelete}`)
      .then(() => {
        reFetchData();
        showNotification('The teacher shift has been deleted successfully');
      })
      .catch(err => handleShowErrMsg(err, showNotification))
      .finally(() => setOpenConfirmDelete(null))
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
            <b>{paginatedGroups.length}</b> <b>{t('teacher shifts')}</b>
          </Box>
          <TablePagination
            component="div"
            count={filteredGroups.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleLimitChange}
            page={page}
            rowsPerPage={limit}
            rowsPerPageOptions={[5, 10, 15]}
          />
        </Box>

        <Divider />

        {paginatedGroups.length === 0 ? (
          <>
            <Typography
              sx={{
                py: 10,
                px: 3
              }}
              variant="h3"
              fontWeight="normal"
              color="text.secondary"
              align="center"
            >
              {t("We couldn't find any teacher shifts matching your search criteria")}
            </Typography>
          </>
        ) : (
          <>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedAllUsers}
                        indeterminate={selectedSomeUsers}
                        onChange={handleSelectAllUsers}
                      />
                    </TableCell>
                    <TableCell>{t('Section name')}</TableCell>
                    <TableCell >{t('Entry Time')}</TableCell>
                    <TableCell >{t('Late Time')}</TableCell>
                    <TableCell >{t('Absence Time')}</TableCell>
                    <TableCell >{t('Exit Time')}</TableCell>
                    <TableCell align="center">{t('Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedGroups.map((group) => {

                    const isUserSelected = selectedItems.includes(group.id);
                    return (
                      <TableRow hover key={group.id} selected={isUserSelected}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isUserSelected}
                            onChange={(event) =>
                              handleSelectOneUser(event, group.id)
                            }
                            value={isUserSelected}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="h5">
                            {group?.title}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="h5">
                            {group?.entry_time ? dayjs(group.entry_time).format('hh:mm:ss A') : '' }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="h5">
                            {group?.entry_time ? dayjs(group.late_time).format('hh:mm:ss A') : '' }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="h5">
                            {group?.entry_time ? dayjs(group.absence_time).format('hh:mm:ss A') : '' }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="h5">
                            {group?.entry_time ? dayjs(group.exit_time).format('hh:mm:ss A') : '' }
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography noWrap>
                            <Tooltip title={t('View')} arrow>
                              <IconButton
                                color="primary"
                                onClick={() => setEditSection(group)}
                              >
                                <LaunchTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t('Delete')} arrow>
                              <IconButton
                                onClick={() => handleConfirmDelete(group.id)}
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
        open={openConfirmDelete}
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
