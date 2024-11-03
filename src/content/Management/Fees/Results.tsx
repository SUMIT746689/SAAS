import { FC, ChangeEvent, useState, ReactElement, Ref, forwardRef } from 'react';
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
  TextField,
  Button,
  Typography,
  Dialog,
  Zoom,
  lighten,
  styled
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { Project, ProjectStatus } from 'src/models/project';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import BulkActions from './BulkActions';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import dayjs from 'dayjs';
import { formatNumber } from '@/utils/numberFormat';
import { useAuth } from '@/hooks/useAuth';
import { TableEmptyWrapper } from '@/components/TableWrapper';
import { DebounceInput } from '@/components/DebounceInput';
import { TableBodyCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import { ButtonWrapper } from '@/components/ButtonWrapper';

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
  setEditData: Function;
  reFetchData: Function;
}

interface Filters {
  status?: ProjectStatus;
}

const Transition = forwardRef(function Transition(props: TransitionProps & { children: ReactElement<any, any> }, ref: Ref<unknown>) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const applyFilters = (sessions: Project[], query: string, filters: Filters): Project[] => {
  return sessions.filter((project) => {
    let matches = true;

    if (query) {
      const properties = ['name', 'title', 'id', 'amount'];
      const nestedProperties = ['fees_head', 'class'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (project[property]?.toString().toLowerCase().includes(query.toLowerCase())) {
          return (containsQuery = true);
        }
        nestedProperties.forEach((nestedProperty) => {
          if (project[nestedProperty] && project[nestedProperty][property]?.toString().toLowerCase().includes(query.toLowerCase())) {
            containsQuery = true;
          }
        });
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

const applyPagination = (sessions: Project[], page: number, limit: number): Project[] => {
  return sessions.slice(page * limit, page * limit + limit);
};

const Results: FC<ResultsProps> = ({ sessions, setEditData, reFetchData }) => {
  console.log({ sessions });
  const [selectedItems, setSelectedschools] = useState<string[]>([]);
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(12);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    status: null
  });

  const { user } = useAuth();
  const { school } = user ?? {};
  const { currency } = school ?? {};

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    setQuery(event.target.value);
  };

  const handleSelectAllschools = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedschools(event.target.checked ? sessions.map((project) => project.id) : []);
  };

  const handleSelectOneProject = (_event: ChangeEvent<HTMLInputElement>, projectId: string): void => {
    if (!selectedItems.includes(projectId)) {
      setSelectedschools((prevSelected) => [...prevSelected, projectId]);
    } else {
      setSelectedschools((prevSelected) => prevSelected.filter((id) => id !== projectId));
    }
  };

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const filteredschools = applyFilters(sessions, query, filters);
  const paginatedFees = applyPagination(filteredschools, page, limit);
  const selectedBulkActions = selectedItems.length > 0;
  const selectedSomeschools = selectedItems.length > 0 && selectedItems.length < sessions.length;
  const selectedAllschools = selectedItems.length === sessions.length;

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [deleteSchoolId, setDeleteSchoolId] = useState(null);

  const handleConfirmDelete = (id: string) => {
    setDeleteSchoolId(id);
    setOpenConfirmDelete(true);
  };
  const closeConfirmDelete = () => {
    setOpenConfirmDelete(false);
    setDeleteSchoolId(null);
  };

  const handleDeleteCompleted = async () => {
    try {
      const result = await axios.delete(`/api/fee/${deleteSchoolId}`);
      setOpenConfirmDelete(false);
      if (!result.data?.success) throw new Error('unsuccessful delete');
      showNotification('The fees has been deleted successfully');
      reFetchData();
    } catch (err) {
      setOpenConfirmDelete(false);
      showNotification(err?.response?.data?.message, 'error');
    }
  };
  console.log({ page });
  return (
    <>
      <Card
        sx={{
          p: 0.5,
          mb: 1
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Box p={0.5}>
              <DebounceInput
                debounceTimeout={500}
                handleDebounce={(v) => setQuery(v)}
                value={searchValue}
                handleChange={(v) => {
                  setSearchValue(v.target?.value);
                  setPage(0);
                }}
                label={'Search by fees title, id or amount......'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchTwoToneIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ minHeight: 'calc(100vh - 376px) !important', borderRadius: 0 }}>
        {selectedBulkActions && (
          <Box p={2}>
            <BulkActions />
          </Box>
        )}
        {!selectedBulkActions && (
          <Box borderRadius={0} px={2} display="flex" alignItems="center" justifyContent="space-between">
            <Box fontSize={12}>
              <Typography component="span" variant="subtitle1" fontSize={12}>
                {t('Showing')}:
              </Typography>{' '}
              <b>{paginatedFees.length}</b> <b>{t('fees')}</b>
            </Box>
            <TablePagination
              sx={{ fontSize: 11, ':root': { fontSize: 10 } }}
              count={filteredschools.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleLimitChange}
              page={page}
              rowsPerPage={limit}
              rowsPerPageOptions={[12, 24, 36, 50]}
            />
          </Box>
        )}
        <Divider />

        {paginatedFees.length === 0 ? (
          <TableEmptyWrapper title="fees" />
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableHeaderCellWrapper padding="checkbox">
                      {/* <Checkbox
                        checked={selectedAllschools}
                        indeterminate={selectedSomeschools}
                        onChange={handleSelectAllschools}
                      /> */}
                      <Grid>{t('ID')}</Grid>
                    </TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Fee Head')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Fee')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Fee for')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Amount')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Class')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Subject')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Last date')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Late fee')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align="center">{t('Actions')}</TableHeaderCellWrapper>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedFees.map((fee) => {
                    const isschoolselected = selectedItems.includes(fee.id);

                    return (
                      <TableRow hover key={fee.id} selected={isschoolselected}>
                        <TableBodyCellWrapper padding="checkbox">
                          {/* <Checkbox
                            checked={isschoolselected}
                            onChange={(event) =>
                              handleSelectOneProject(event, fee.id)
                            }
                            value={isschoolselected}
                          /> */}
                          {/* <Typography noWrap align="center" variant="h5"> */}
                          <Grid>{fee.id}</Grid>
                          {/* </Typography> */}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper>{fee?.fees_head?.title}</TableBodyCellWrapper>
                        <TableBodyCellWrapper>{fee?.title}</TableBodyCellWrapper>
                        <TableBodyCellWrapper>{fee?.for}</TableBodyCellWrapper>
                        <TableBodyCellWrapper>
                          {formatNumber(fee.amount)} {currency}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper>{fee.class?.name}</TableBodyCellWrapper>
                        <TableBodyCellWrapper>{fee.subject?.name}</TableBodyCellWrapper>
                        <TableBodyCellWrapper color="green">{dayjs(fee?.last_date).format('YYYY-MM-DD , HH:mm')}</TableBodyCellWrapper>
                        <TableBodyCellWrapper>
                          {fee?.late_fee ? formatNumber(fee?.late_fee?.toFixed(2)) : 0} {currency}
                        </TableBodyCellWrapper>

                        <TableBodyCellWrapper align="center" width={60}>
                          <Typography noWrap py={0.25} display="flex" justifyContent="center" columnGap={0.5}>
                            <Tooltip title={t('Edit')} arrow>
                              <IconButton size="small" onClick={() => setEditData(fee)} color="primary">
                                <LaunchTwoToneIcon sx={{ fontSize: 14 }} fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Delete')} arrow>
                              <IconButton size="small" onClick={() => handleConfirmDelete(fee.id)} color="primary">
                                <DeleteTwoToneIcon sx={{ fontSize: 14, color: 'red' }} fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Typography>
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

      <DialogWrapper open={openConfirmDelete} maxWidth="xs" fullWidth TransitionComponent={Transition} keepMounted onClose={closeConfirmDelete}>
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" p={1}>
          <AvatarError sx={{ width: 50, height: 50 }}>
            <CloseIcon sx={{ p: 1 }} />
          </AvatarError>

          <Typography
            align="center"
            sx={{
              pt: 4,
              px: 6
            }}
            variant="h5"
          >
            {t('Do you really want to delete this fee')}?
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

          <Box display="flex" columnGap={2}>
            <ButtonWrapper handleClick={closeConfirmDelete} color="error">
              {t('Cancel')}
            </ButtonWrapper>

            <ButtonWrapper variant="outlined" handleClick={handleDeleteCompleted}>
              {t('Delete')}
            </ButtonWrapper>
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
