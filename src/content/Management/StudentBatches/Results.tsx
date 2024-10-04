import { ChangeEvent, useState, ReactElement, Ref, forwardRef, useEffect, FC } from 'react';

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
  Switch
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from 'src/models/user';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
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
import BulkActions from '@/components/BulkAction';
import AddIcon from '@mui/icons-material/Add';
import Add from './Add';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import ClearIcon from '@mui/icons-material/Clear';

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
  height: '15px',
  width: '15px',
  padding: 0.5
};
interface Filters {
  role?: string;
}

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

const applyPagination = (users: User[], page: number, limit: number): User[] => {
  return users?.slice(page * limit, page * limit + limit);
};

const Results: FC<{ students: any[]; refetch: () => void; discount: any[]; idCard: any; fee: any[]; selectedClass: any; selectedSection: any }> = ({
  students,
  refetch,
  selectedClass,
  selectedSection
}) => {
  const [selectedItems, setSelectedUsers] = useState([]);
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    role: null
  });

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };
  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const handleSelectAllUsers = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedUsers(event.target.checked ? students.map((user) => user.id) : []);
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
  const selectedSomeUsers = selectedItems.length > 0 && selectedItems.length < students.length;
  const selectedAllUsers = selectedItems.length === students.length;

  const [openConfirmDelete, setOpenConfirmDelete] = useState(null);

  const closeConfirmDelete = () => {
    setOpenConfirmDelete(null);
  };

  const handleDeleteCompleted = () => {
    if (!openConfirmDelete?.student_id || !openConfirmDelete.section_id) return showNotification('student id or batch id not founds', 'error');
    axios
      .delete(`/api/student_batches/${openConfirmDelete.student_id}?section_id=${openConfirmDelete.section_id}`)
      .then((res) => {
        setOpenConfirmDelete(null);
        showNotification('The batch has been removed');
        refetch();
      })
      .catch((err) => {
        setOpenConfirmDelete(null);
        showNotification('batch deletion failed !', 'error');
      });
  };

  const handleConfirmDelete = ({ student_id, section_id }) => {
    setOpenConfirmDelete({ student_id, section_id });
  };
  // console.log(selectedStudent);
  const [addSubject, setAddSubject] = useState();
  const [searchValue, setSearchValue] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleFetch = async () => {
    try {
      if (!searchValue || searchValue.length < 3) return setSearchResults([]);
      setSearchLoading(true);
      const { data } = await axios.get(`/api/student/search-students?search_value=${searchValue}`);
      setSearchResults(data);
    } catch (err) {
      setSearchResults([]);
      handleShowErrMsg(err, showNotification);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const getData = setTimeout(() => {
      handleFetch();
    }, 400);

    return () => clearTimeout(getData);
  }, [searchValue]);

  // const [deleteIsLoading, setDeleteIsLoading] = useState(false)

  // const handleDeleteSubject = (student_id, subject_id) => {
  //     setDeleteIsLoading(true);
  //     axios.delete(`/api/student_class_subjects/${student_id}?subject_id=${subject_id}`)
  //         .then(res => showNotification('deleted successfull'))
  //         .catch(err => handleShowErrMsg(err, showNotification))
  //         .finally(() => setDeleteIsLoading(false))
  // }

  return (
    <>
      {addSubject && (
        <Add
          refetch={refetch}
          isOpen={true}
          selectCls={selectedClass}
          student_id={addSubject}
          setAddSubject={setAddSubject}
          sections={selectedClass?.sections?.map((section) => ({ value: section.id, label: section.name })) || []}
        />
      )}

      <Card sx={{ minHeight: 'calc(100vh - 410px)', borderRadius: 0 }}>
        {selectedBulkActions && (
          <Box p={2}>
            <BulkActions />
          </Box>
        )}
        {!selectedBulkActions && (
          <Box p={1} display="flex" alignItems="center" justifyContent="space-between">
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
              rowsPerPageOptions={[25, 50, 75, 100]}
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
              {t("We couldn't find any students matching your search criteria")}
            </Typography>
          </>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {/* <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedAllUsers}
                        indeterminate={selectedSomeUsers}
                        onChange={handleSelectAllUsers}
                      />
                    </TableCell> */}
                  <TableHeaderCellWrapper>SL</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('student name')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Batch')}</TableHeaderCellWrapper>
                  <TableHeaderCellWrapper>{t('Class')}</TableHeaderCellWrapper>
                  {/* <TableHeaderCellWrapper>{t('Section')}</TableHeaderCellWrapper> */}
                  <TableHeaderCellWrapper align="center">{t('Actions')}</TableHeaderCellWrapper>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClasses.map((i) => {
                  const isUserSelected = selectedItems.includes(i.id);

                  return (
                    <TableRow hover key={i.id} selected={isUserSelected}>
                      {/* <TableBodyCellWrapper padding="checkbox">
                                            <Checkbox
                                                checked={isUserSelected}
                                                onChange={(event) =>
                                                handleSelectOneUser(event, i.id)
                                                }
                                                value={isUserSelected}
                                            />
                                            </TableBodyCellWrapper> */}
                      <TableBodyCellWrapper>
                        <Grid py={0.5}>{i.id}</Grid>
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        {[i?.student_info?.first_name, i?.student_info?.middle_name, i?.student_info?.last_name].join(' ')}
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>
                        <Grid display="flex" gap={0.5}>
                          {i?.batches?.map((list) => (
                            <Grid key={list.id} sx={{ border: '1px solid gray', borderRadius: 0.25, px: 0.5, py: 0.25 }}>
                              {list.name}
                              <button
                                // disabled={deleteIsLoading}
                                onClick={() => {
                                  // handleDeleteSubject(i.id, list.id)
                                  handleConfirmDelete({ student_id: i.id, section_id: list.id });
                                }}
                              >
                                <ClearIcon sx={{ cursor: 'pointer', fontSize: 13, ':hover': { bgcolor: 'red', color: 'white' } }} />
                              </button>
                            </Grid>
                          ))}
                        </Grid>
                      </TableBodyCellWrapper>
                      <TableBodyCellWrapper>{selectedClass?.label}</TableBodyCellWrapper>
                      {/* <TableBodyCellWrapper>
                        {selectedClass?.has_section ? selectedSection?.label : ''}
                      </TableBodyCellWrapper> */}
                      <TableBodyCellWrapper>
                        <Grid display="flex" columnGap={1} justifyContent="center">
                          <Tooltip title={t('Add Batch')} arrow>
                            <IconButton
                              color="primary"
                              sx={ActionStyle}
                              // @ts-ignore
                              onClick={() => {
                                setAddSubject(i.id);
                              }}
                              //  onClick={<Page}
                            >
                              <AddIcon />
                            </IconButton>
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

      <DialogWrapper
        open={openConfirmDelete ? true : false}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
        keepMounted
        onClose={closeConfirmDelete}
      >
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" p={2}>
          <AvatarError sx={{ width: 40, height: 40 }}>
            <CloseIcon sx={{ p: 1 }} />
          </AvatarError>

          <Typography
            align="center"
            sx={{
              py: 4,
              px: 6
            }}
            variant="h4"
          >
            {t('Are you sure you want to permanently delete this student class subject')}?
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
  students: PropTypes.array.isRequired
};

Results.defaultProps = {
  students: []
};

export default Results;
