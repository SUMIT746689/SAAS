import {
  FC,
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
  Tabs,
  TextField,
  Button,
  Typography,
  Dialog,
  styled,
  Chip,
  Modal,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Autocomplete
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import KeyIcon from '@mui/icons-material/Key';
import Link from 'src/components/Link';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from 'src/models/user';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import Label from 'src/components/Label';
import BulkActions from './BulkActions';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import axios from 'axios';
import { useAuth } from 'src/hooks/useAuth';
import useNotistick from '@/hooks/useNotistick';
import { fetchData } from '@/utils/post';
import { useSearchUsers } from '@/hooks/useSearchUsers';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import dayjs from 'dayjs';
import { DebounceInput } from '@/components/DebounceInput';
import LoginIcon from '@mui/icons-material/Login';
import { accessNestedProperty } from '@/utils/utilitY-functions';
import { customizeDate } from '@/utils/customizeDate';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
  users: User[]
  reFetchData: Function
  setEditUser: Function
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
  users: User[],
  query: string,
  filters: Filters
): User[] => {
  return users.filter((user) => {
    let matches = true;

    if (query) {
      const properties = ['username', 'school.name'];
      let containsQuery = false;

      for (const property of properties) {
        const queryString = accessNestedProperty(user, property.split('.'))
        if (queryString?.toLowerCase().includes(query.toLowerCase())) {
          containsQuery = true;
        }
      }

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
  return users.slice(page * limit, page * limit + limit);
};

const Results = ({ users, roleOptions, reFetchData, setEditUser }) => {

  const [selectedItems, setSelectedUsers] = useState<string[]>([]);
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();
  const { user, superAdminLogInAsAdmin } = useAuth();


  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    role: null
  });
  const [allUsers, setAllUsers] = useState(users);
  const [searchToken, setSearchToken] = useState(null);


  const getNsetOptions = () => {
    axios.get(`/api/user?role=${searchToken}`)
      .then(res => setAllUsers(res.data))
      .catch(err => console.log(err))
  };

  useEffect(() => {
    if (searchToken) {
      getNsetOptions();
    } else {
      reFetchData()
    }
  }, [searchToken]);


  useEffect(() => {
    setAllUsers(users)
  }, [users])





  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    setQuery(event.target.value);
  };

  const handleSelectAllUsers = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedUsers(event.target.checked ? allUsers.map((user) => user.id) : []);
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

  const filteredUsers = applyFilters(allUsers, query, filters);
  const paginatedUsers = applyPagination(filteredUsers, page, limit);
  const selectedBulkActions = selectedItems.length > 0;
  const selectedSomeUsers =
    selectedItems.length > 0 && selectedItems.length < allUsers.length;
  const selectedAllUsers = selectedItems.length === allUsers.length;

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [userDeleteId, setUserDeleteId] = useState(null)
  const handleConfirmDelete = () => {
    setOpenConfirmDelete(true);
  };

  const closeConfirmDelete = () => {
    setUserDeleteId(null)
    setOpenConfirmDelete(false);
  };

  const handleDeleteCompleted = () => {
    if (userDeleteId) {
      axios
        .delete(`/api/user/${userDeleteId}`)
        .then((res) => {
          closeConfirmDelete()
          reFetchData()
          showNotification('The user has been removed');
        })
        .catch((err) => console.log(err));
    }

  };
  const [permissionModal, setPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  //change user active or disable 
  const handleUserEnabled = async (user) => {
    // console.log({user})
    const [err, response]: any = await fetchData(`/api/user/activition/${user.id}`, 'patch', { is_enabled: !user.is_enabled, role: user.user_role });
    if (response.message) reFetchData(true)
    console.log({ err, response });
  }
  //@ts-ignore
  const isNotSuperAdmin = user?.role?.title !== 'SUPER_ADMIN'
  return (
    <>
      <Dialog
        fullWidth
        maxWidth='lg'
        open={permissionModal}
        onClose={() => {
          setPermissionModal(false);
        }}
        sx={{ paddingX: { xs: 3, md: 0 } }}
      >
        <Grid item container flexDirection={'column'} sx={{ p: 4 }}>
          <Grid display="flex" alignItems="center" gap={2} sx={{ mb: { xs: 2, md: 4 } }} >
            <Avatar 
              src={selectedUser?.avatar}
            />
            
              <Typography fontSize={20} fontWeight={'bold'}>{selectedUser?.username}</Typography>
          
          </Grid>

          <Grid item container display={'grid'} sx={{ gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' }, gap: { xs: 1, sm: 1 } }}>
            {user?.permissions?.map((i: any) => (
              <SinglePermission
                key={i.id}
                selectedUser={selectedUser}
                singlePermission={i}
                setAllUsers={setAllUsers}
              />
            ))}
          </Grid>
        </Grid>
      </Dialog>

      <Card sx={{ minHeight: 'calc(100vh - 330px) !important' }}>
        <Grid p={2}
          sx={isNotSuperAdmin ? {
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            gap: 4
          } : {}}>
          {!selectedBulkActions && (<>
            {/* <TextField
              sx={{
                m: 0
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchTwoToneIcon />
                  </InputAdornment>
                )
              }}
              onChange={handleQueryChange}
              placeholder={t('Search by name, email or username...')}
              value={query}
              size="small"
              fullWidth
              margin="normal"
              variant="outlined"
            /> */}
            <DebounceInput
              debounceTimeout={1000}
              handleDebounce={(v) => setQuery(v)}
              label={t('Search by Username or School...')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchTwoToneIcon />
                  </InputAdornment>
                )
              }}
            />
            {

              isNotSuperAdmin && <Autocomplete
                size="small"
                options={roleOptions || []}
                value={searchToken}
                onChange={(e, v) => setSearchToken(v)}
                renderInput={(params) => <TextField
                  sx={{
                    [`& fieldset`]: {
                      borderRadius: 0.6,
                    }
                  }}
                  {...params}
                  label="Filter by role"
                />
                }
              />
            }


          </>)}
          {/* {selectedBulkActions && <BulkActions />} */}
        </Grid>
        <Box py={1} px={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between">
          <Box>
            <Typography component="span" variant="subtitle1">
              {t('Showing')}:
            </Typography>{' '}
            <b>{paginatedUsers.length}</b> <b>{t('users')}</b>
          </Box>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleLimitChange}
            page={page}
            rowsPerPage={limit}
            rowsPerPageOptions={[5, 10, 15]}
          />

        </Box>
        <Divider />


        {paginatedUsers.length === 0 ? (
          <>
            <Typography
              sx={{
                py: 10,
                minHeight: '55vh'
              }}
              variant="h3"
              fontWeight="normal"
              color="text.secondary"
              align="center"
            >
              {t("We couldn't find any users matching your search criteria")}
            </Typography>
          </>
        ) : (
          <>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography noWrap>{t('Username')}</Typography></TableCell>
                    <TableCell><Typography noWrap>{t('Role')}</Typography></TableCell>
                    <TableCell><Typography noWrap>{t('Created at')}</Typography></TableCell>
                    <TableCell><Typography noWrap>{t('School name')}</Typography></TableCell>

                    <TableCell><Typography noWrap align='center'>{t('Active Status')}</Typography></TableCell>
                    <TableCell><Typography noWrap align='center'>{t('Actions')}</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((i) => {


                    const isUserSelected = selectedItems.includes(i.id);
                    return (
                      <TableRow hover key={i.id} selected={isUserSelected}>
                        <TableCell>
                          <Typography noWrap variant="h5">{i?.username}</Typography>
                        </TableCell>
                        <TableCell>
                          {/* @ts-ignore */}
                          <Chip
                            label={i?.user_role?.title}
                            size="medium"
                            color={i.role_id ? 'primary' : 'error'}
                          />

                        </TableCell>
                        <TableCell>
                          {/* @ts-ignore */}
                          <Typography variant="h5" noWrap >
                            {customizeDate(i?.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {/* @ts-ignore */}
                          <Typography variant="h5" noWrap >
                            {i?.school?.name}
                          </Typography>
                        </TableCell>


                        <TableCell align='center'>
                          {/* @ts-ignore */}
                          <Typography variant="h5" color={i?.is_enabled ? 'green' : 'red'}>
                            {/* {user?.is_enabled ? 'Enable' : 'Disable'} */}
                            <Switch checked={i?.is_enabled} onClick={() => handleUserEnabled(i)} />
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography noWrap align='center' sx={{ display: 'flex', flexWrap: "nowrap", justifyContent: 'space-around', }}>

                            <MenuList
                              targetUser={i}
                              setEditUser={setEditUser}
                              reFetchData={reFetchData}
                              setSelectedUser={setSelectedUser}
                              setPermissionModal={setPermissionModal}
                              setUserDeleteId={setUserDeleteId}
                              handleConfirmDelete={handleConfirmDelete}
                            />


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
const SinglePermission = ({ setAllUsers, singlePermission, selectedUser }) => {
  const [checked, setChecked] = useState(
    selectedUser && selectedUser?.permissions?.length > 0
      ? selectedUser?.permissions.find((j) => j.id == singlePermission.id)
        ? true
        : false
      : false
  );

  const handlePermissionUpdate = (e) => {
    if (checked) {
      axios
        .put(`/api/permission/detach-user`, {
          permission_id: singlePermission.id,
          user_id: selectedUser.id
        })
        .then(() => {
          setChecked(false);
          axios.get('/api/user').then((res) => setAllUsers(res.data));
          // console.log("e.currentTarget.checked__", e.currentTarget.checked);
          console.log('e.target.checked__', e.target.checked);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .put(`/api/permission/attach-user`, {
          permission_id: singlePermission.id,
          user_id: selectedUser.id
        })
        .then(() => {
          axios.get('/api/user').then((res) => setAllUsers(res.data));
          setChecked(true);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <Box display={'flex'} justifyContent="space-between" p={1} borderRadius={0.4} sx={{ backgroundColor: 'lightGray', ":hover": { backgroundColor: 'darkGray' } }} key={singlePermission.id}>
      <Typography variant='body2' sx={{ my: 'auto', textTransform: 'capitalize', }}>{singlePermission?.name}</Typography>
      <Switch sx={{ my: 'auto' }} checked={checked} onChange={handlePermissionUpdate} />
    </Box>
  );
};


const MenuList = ({ targetUser, setEditUser, reFetchData, setSelectedUser, setPermissionModal, setUserDeleteId, handleConfirmDelete }) => {
  const { superAdminLogInAsAdmin } = useAuth();
  const { t }: { t: any } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      <ButtonWrapper
        handleClick={handleClick}
        variant="outlined"
      >
        Actions
      </ButtonWrapper>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <li>
          <ButtonWrapper
            startIcon={<LoginIcon fontSize="small" />}
            variant="outlined"
            handleClick={async () => {
              try {
                // @ts-ignore
                await superAdminLogInAsAdmin(targetUser.id);
              } catch (err) {
                console.error(err);
              }
            }}
          >
            {t('Log in')}
          </ButtonWrapper>
        </li>

        <li>
          <ButtonWrapper
            startIcon={<LaunchTwoToneIcon fontSize="small" />}
            handleClick={() => setEditUser(targetUser)}
            variant="outlined"
          >
            {t('Edit')}
          </ButtonWrapper>
        </li>

        {
          !targetUser.role_id &&
          (<li>
            <ButtonWrapper
              startIcon={<RestartAltIcon fontSize="small" />}
              variant="outlined"
              handleClick={() => {
                try {
                  axios.put(`/api/permission/attach-user`, {
                    role_id: targetUser.user_role.id,
                    user_id: targetUser.id
                  })
                    .then(() => {
                      reFetchData()
                    })
                } catch (err) {
                  console.log(err);

                }

              }}
            >
              {t('Reset Permission')}
            </ButtonWrapper>
          </li>)
        }


        <li>
          <ButtonWrapper
            startIcon={<KeyIcon fontSize="small" />}
            variant="outlined"
            handleClick={() => {
              axios
                .get(`/api/user/${targetUser?.id}`)
                .then((res) => {
                  console.log('selectedUser__', res.data);
                  setSelectedUser(res.data);
                  setPermissionModal(true);
                })
                .catch((err) => console.log(err));
            }}
          >
            {t('Permission')}
          </ButtonWrapper>
        </li>

        <li onClick={handleClose}>
          <ButtonWrapper
            startIcon={<DeleteTwoToneIcon fontSize="small" />}
            variant="outlined"
            handleClick={() => {
              setUserDeleteId(targetUser?.id)
              handleConfirmDelete()
            }}
            sx={{ color: 'red' }}
          >
            {t('Delete')}
          </ButtonWrapper>
        </li>


      </Menu>
    </div>
  );
};


Results.propTypes = {
  users: PropTypes.array.isRequired
};

Results.defaultProps = {
  users: []
};

export default Results;
