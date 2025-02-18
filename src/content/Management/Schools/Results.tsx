import {
  FC,
  ChangeEvent,
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
  Table,
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
  styled,
  Box
} from '@mui/material';

import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { Project, ProjectStatus } from 'src/models/project';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import BulkActions from './BulkActions';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import axios from 'axios';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import dayjs from 'dayjs';
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
  schools: Project[];
  editSchool: object;
  setEditSchool: object;
  setOpenopenSubscriptionModal: Function;
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
  schools: Project[],
  query: string,
  filters: Filters
): Project[] => {
  return schools.filter((project) => {
    let matches = true;

    if (query) {
      const properties = ['name'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (project[property].toLowerCase().includes(query.toLowerCase())) {
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
  schools: Project[],
  page: number,
  limit: number
): Project[] => {
  return schools.slice(page * limit, page * limit + limit);
};
// @ts-ignore
const Results: FC<ResultsProps> = ({
  schools,
  setEditSchool,
  setOpenopenSubscriptionModal
}) => {
  const [selectedItems, setSelectedschools] = useState<string[]>([]);
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    status: null
  });

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    setQuery(event.target.value);
  };

  const handleSelectAllschools = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedschools(
      event.target.checked ? schools.map((project) => project.id) : []
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

  const filteredschools = applyFilters(schools, query, filters);
  const paginatedschools = applyPagination(filteredschools, page, limit);
  const selectedBulkActions = selectedItems.length > 0;
  const selectedSomeschools =
    selectedItems.length > 0 && selectedItems.length < schools.length;
  const selectedAllschools = selectedItems.length === schools.length;

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [deleteSchoolId, setDeleteSchoolId] = useState(null);

  const closeConfirmDelete = () => {
    setOpenConfirmDelete(false);
    setDeleteSchoolId(null);
  };

  const handleDeleteCompleted = async () => {
    try {
      const result = await axios.delete(`/api/school/${deleteSchoolId}`);
      setOpenConfirmDelete(false);
      if (!result.data?.success) throw new Error('unsuccessful delete');
      showNotification('The schools has been deleted successfully')
    } catch (err) {
      setOpenConfirmDelete(false);
      showNotification('The school falied to delete ', 'error');
    }
  };

  return (
    <>
      <Card
        sx={{
          p: 1,
          mb: 2
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box p={0.5}>
              <TextField
                sx={{
                  m: 0,
                  borderRadius: 0.6,
                }}
                size='small'

                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchTwoToneIcon />
                    </InputAdornment>
                  )
                }}
                onChange={handleQueryChange}
                placeholder={t('Search by school name...')}
                value={query}
                fullWidth
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Card>

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
              <b>{paginatedschools.length}</b> <b>{t('schools')}</b>
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

        {paginatedschools.length === 0 ? (
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
              {t("We couldn't find any schools matching your search criteria")}
            </Typography>
          </>
        ) : (
          <>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Id')}</TableCell>
                    <TableCell>{t('Name')}</TableCell>
                    <TableCell>{t('Subscription Start')}</TableCell>
                    <TableCell>{t('Subscription End')}</TableCell>
                    <TableCell>{t('Contact Number')}</TableCell>
                    <TableCell>{t('Email')}</TableCell>
                    <TableCell align="center">{t('Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedschools?.map((school) => {
                    return (
                      <TableRow
                        hover
                        key={school.id}

                      >

                        <TableCell>
                          <Typography noWrap variant="h5">
                            {school?.id}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography noWrap variant="h5">
                            {school?.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography noWrap variant="h5">
                            {school?.subscription[0]?.start_date &&
                              dayjs(school?.subscription[0]?.start_date).format(
                                'DD-MM-YYYY'
                              )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            noWrap
                            variant="h5"
                            color={
                              school?.subscription[0]?.end_date + 86400000 <
                                new Date().getTime()
                                ? 'red'
                                : 'primary'
                            }
                          >
                            {school?.subscription[0]?.end_date &&
                              dayjs(school?.subscription[0]?.end_date).format(
                                'DD-MM-YYYY'
                              )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5" color="yellowgreen">
                            <a href={`tel:${school.phone}`}>{school?.phone}</a>
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            <a href={`mailto:${school?.email}`}>
                              {school?.email}
                            </a>
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography noWrap>
                            <Tooltip title={t('Manage Subscription')} arrow>
                              <IconButton
                                onClick={() =>
                                  setOpenopenSubscriptionModal(school)
                                }
                                color="primary"
                              >
                                {/* <DeleteTwoToneIcon fontSize="small" /> */}
                                <SubscriptionsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t('Edit')} arrow>
                              <IconButton
                                color="primary"
                                onClick={() => {
                                  //@ts-ignore
                                  setEditSchool(school);
                                }}
                              >
                                <LaunchTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {/* <Tooltip title={t('Delete')} arrow>
                                <IconButton
                                  onClick={() =>
                                    handleConfirmDelete(school.id)
                                  }
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
            {t('Do you really want to delete this school')}?
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
  schools: PropTypes.array.isRequired
};

Results.defaultProps = {
  schools: []
};

export default Results;
