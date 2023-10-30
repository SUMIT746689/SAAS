import {
  FC,
  ChangeEvent,
  MouseEvent,
  useState,
  ReactElement,
  Ref,
  forwardRef
} from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Card,
  Checkbox,
  Grid,
  Slide,
  Divider,
  Tooltip,
  IconButton,
  InputAdornment,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableContainer,
  TableRow,
  TextField,
  Button,
  Typography,
  Dialog,
  Zoom,
  lighten,
  styled,
  Box,
  Table
} from '@mui/material';

import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { Project, ProjectStatus } from 'src/models/project';
import { useTranslation } from 'react-i18next';
import Label from 'src/components/Label';
import BulkActions from './BulkActions';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import useNotistick from '@/hooks/useNotistick';

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
  sessions: Project[];
  reFetchData: Function;
  setEditData: Function;
}

interface Filters {
  status?: ProjectStatus;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const applyFilters = (
  sessions: Project[],
  query: string,
  filters: Filters
): Project[] => {
  return sessions.filter((project) => {
    let matches = true;

    if (query) {
      const properties = ['title', 'price'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (
          project[property]
            ?.toString()
            .toLowerCase()
            .includes(query.toLowerCase())
        ) {
          containsQuery = true;
        }
      });

      if (filters.status && project.status !== filters.status) {
        matches = false;
      }

      if (!containsQuery) {
        matches = false;
      }
    }

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      if (value && project[key] !== value) {
        matches = false;
      }
    });

    return matches;
  });
};

const applyPagination = (
  sessions: Project[],
  page: number,
  limit: number
): Project[] => {
  return sessions.slice(page * limit, page * limit + limit);
};

const Results: FC<ResultsProps> = ({ sessions, reFetchData, setEditData }) => {
  const [selectedItems, setSelectedschools] = useState<string[]>([]);
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    status: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    setQuery(event.target.value);
  };

  const handleSelectAllschools = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedschools(
      event.target.checked ? sessions.map((project) => project.id) : []
    );
  };

  const handleSelectOneProject = (
    _event: ChangeEvent<HTMLInputElement>,
    projectId: string
  ): void => {
    if (!selectedItems.includes(projectId)) {
      setSelectedschools((prevSelected) => [...prevSelected, projectId]);
    } else {
      setSelectedschools((prevSelected) =>
        prevSelected.filter((id) => id !== projectId)
      );
    }
  };

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };
  const filteredschools = applyFilters(sessions, query, filters);
  const paginatedPackages = applyPagination(filteredschools, page, limit);
  const selectedBulkActions = selectedItems.length > 0;
  const selectedSomeschools =
    selectedItems.length > 0 && selectedItems.length < sessions.length;
  const selectedAllschools = selectedItems.length === sessions.length;

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [deleteSchoolId, setDeleteSchoolId] = useState(null);

  const closeConfirmDelete = () => {
    setOpenConfirmDelete(false);
    setDeleteSchoolId(null);
  };

  const handleDeleteCompleted = async () => {
    try {
      const result = await axios.delete(`/api/packages/${deleteSchoolId}`);

      setOpenConfirmDelete(false);
      if (!result.data?.success) throw new Error('unsuccessful delete');
      showNotification('The package has been deleted successfully');

    } catch (err) {
      setOpenConfirmDelete(false);
      showNotification('The fees falied to delete ', 'error');
    }
  };

  const handleAccept = async (value, status: string) => {
    const { package_id, school_id, id } = value;
    setIsLoading(true);
    axios.patch(`/api/subscriptions/package_request`, { id, package_id, school_id, status, })
      .then((result) => {
        if (result.data.success) {
          reFetchData();
          showNotification("request sucessfully completed")
        }
        else throw new Error("request failed");
      })
      .catch((error) => { showNotification("request failed") })
      .finally(() => {
        setIsLoading(false);
      })
  }

  return (
    <>
      <Card
        sx={{
          p: 1,
          my: 2
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Box p={0.5}>
              <TextField
                sx={{
                  m: 0
                }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchTwoToneIcon />
                    </InputAdornment>
                  )
                }}
                onChange={handleQueryChange}
                placeholder={t('Search by pending packages title or price...')}
                value={query}
                fullWidth
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ minHeight: 'calc(100vh - 440px) !important' }}>
        {selectedBulkActions && (
          <Box p={2}>
            <BulkActions />
          </Box>
        )}
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
              <b>{paginatedPackages.length}</b> <b>{t('packages')}</b>
            </Box>
            <TablePagination
              component="div"
              count={filteredschools.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleLimitChange}
              page={page}
              rowsPerPage={limit}
              rowsPerPageOptions={[5, 10, 15]}
            />
          </Box>
        )}
        <Divider />

        {paginatedPackages.length === 0 ? (
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
              {t("We couldn't find any fees matching your search criteria")}
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
                        checked={selectedAllschools}
                        indeterminate={selectedSomeschools}
                        onChange={handleSelectAllschools}
                      />
                    </TableCell>
                    <TableCell>{t('School')}</TableCell>
                    <TableCell>{t('Package')}</TableCell>
                    <TableCell>{t('Price')}</TableCell>
                    <TableCell>{t('Duration')}</TableCell>
                    <TableCell>{t('Maximum Student')}</TableCell>
                    <TableCell>{t('Status')}</TableCell>
                    <TableCell align="center">{t('Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPackages.map((singlePackage) => {
                    const isschoolselected = selectedItems.includes(singlePackage.id);
                    return (
                      <TableRow
                        hover
                        key={singlePackage.id}
                        selected={isschoolselected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isschoolselected}
                            onChange={(event) =>
                              handleSelectOneProject(event, singlePackage.id)
                            }
                            value={isschoolselected}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            {singlePackage.school?.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            {singlePackage.package?.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            {singlePackage.package?.price}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            {singlePackage.package?.duration} - Days
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            {singlePackage.package?.student_count}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            noWrap
                            color={
                              // @ts-ignore
                              (singlePackage?.status === 'pending' && 'yellowgreen') ||
                              // @ts-ignore
                              (singlePackage?.status === 'approved' && 'green') ||
                              'red'
                            }
                            variant="h5"
                          >
                            {singlePackage.status}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography noWrap>
                            <Tooltip title={t('Approved')} arrow>
                              <IconButton
                                disabled={isLoading}
                                onClick={() => handleAccept(singlePackage, "approved")}
                                color="primary"
                              >
                                <DoneAllIcon sx={{ backgroundColor: 'ButtonFace', p: 1, fontSize: 40, borderRadius: 1 }} fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Declined')} arrow>
                              <IconButton
                                disabled={isLoading}
                                onClick={() => handleAccept(singlePackage, "declined")}
                                color="primary"
                              >
                                <RemoveDoneIcon sx={{ backgroundColor: 'ButtonFace', p: 1, fontSize: 40, borderRadius: 1, color: 'red' }} fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {/* <Tooltip title={t('Delete')} arrow>
                              <IconButton
                                onClick={() => handleConfirmDelete(project.id)}
                                color="primary"
                              >
                                <DeleteTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip> */}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {/* <Box p={2}>
                <TablePagination
                  component="div"
                  count={filteredschools.length}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleLimitChange}
                  page={page}
                  rowsPerPage={limit}
                  rowsPerPageOptions={[5, 10, 15]}
                />
              </Box> */}
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
              pt: 4,
              px: 6
            }}
            variant="h3"
          >
            {t('Do you really want to delete this project')}?
          </Typography>

          <Typography
            align="center"
            sx={{
              pt: 2,
              pb: 4,
              px: 6
            }}
            fontWeight="normal"
            color="text.secondary"
            variant="h4"
          >
            {t("You won't be able to revert after deletion")}
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
  sessions: PropTypes.array.isRequired
};

Results.defaultProps = {
  sessions: []
};

export default Results;
