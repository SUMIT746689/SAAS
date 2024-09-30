import { FC, ChangeEvent, MouseEvent, useState, ReactElement, Ref, forwardRef } from 'react';
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
  styled
} from '@mui/material';

import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { Project, ProjectStatus } from 'src/models/project';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { DebounceInput } from '@/components/DebounceInput';
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

interface ResultsProps {
  grade: Project[];
  editGrade: object;
  setEditGrade: Function;
  reFetchData: Function;
}

interface Filters {
  status?: ProjectStatus;
}

const Transition = forwardRef(function Transition(props: TransitionProps & { children: ReactElement<any, any> }, ref: Ref<unknown>) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const applyFilters = (rooms: Project[], query: string, filters: Filters): Project[] => {
  return rooms.filter((project) => {
    let matches = true;

    if (query) {
      const properties = ['lower_mark', 'upper_mark', 'grade'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (project[property]?.toString().toLowerCase().includes(query.toLowerCase())) {
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

const applyPagination = (rooms: Project[], page: number, limit: number): Project[] => {
  return rooms.slice(page * limit, page * limit + limit);
};

const Results: FC<ResultsProps> = ({ grade, setEditGrade, editGrade, reFetchData }) => {
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    status: null
  });

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const filteredGrades = applyFilters(grade, query, filters);
  const paginatedGrades = applyPagination(filteredGrades, page, limit);

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
  console.log({ deleteSchoolId });

  const handleDeleteCompleted = async () => {
    try {
      await axios.delete(`/api/grade/${deleteSchoolId}`);
      closeConfirmDelete();
      reFetchData();
      showNotification('The grade has been deleted successfully');
    } catch (err) {
      setOpenConfirmDelete(false);
      showNotification('The grade falied to delete ', 'error');
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
            <Box>
              <DebounceInput
                debounceTimeout={500}
                handleDebounce={(v) => setQuery(v)}
                value={searchValue}
                handleChange={(v) => setSearchValue(v.target?.value)}
                label={'Search by grade name...'}
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
      <Card sx={{ minHeight: 'calc(100vh - 450px) !important' }}>
        <Box p={1} display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography component="span" variant="subtitle1">
              {t('Showing')}:
            </Typography>{' '}
            <b>{paginatedGrades.length}</b> <b>{t('grades')}</b>
          </Box>
          <TablePagination
            component="div"
            count={filteredGrades.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleLimitChange}
            page={page}
            rowsPerPage={limit}
            rowsPerPageOptions={[5, 10, 15]}
          />
        </Box>

        <Divider />

        {paginatedGrades.length === 0 ? (
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
              {t("We couldn't find any rooms matching your search criteria")}
            </Typography>
          </>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableHeaderCellWrapper>{t('Lower mark')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Upper mark')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Point')} </TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Grade')} </TableHeaderCellWrapper>
                    <TableHeaderCellWrapper>{t('Actions')} </TableHeaderCellWrapper>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedGrades.map((singleGrade) => {
                    return (
                      <TableRow hover key={singleGrade.id}>
                        <TableBodyCellWrapper>{singleGrade?.lower_mark}</TableBodyCellWrapper>
                        <TableBodyCellWrapper>{singleGrade?.upper_mark}</TableBodyCellWrapper>
                        <TableBodyCellWrapper>{singleGrade?.point}</TableBodyCellWrapper>
                        <TableBodyCellWrapper>{singleGrade?.grade}</TableBodyCellWrapper>

                        <TableBodyCellWrapper>
                          <Typography noWrap>
                            <Tooltip title={t('Edit')} arrow>
                              <IconButton onClick={() => setEditGrade(singleGrade)} color="primary">
                                <LaunchTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Delete')} arrow>
                              <IconButton onClick={() => handleConfirmDelete(singleGrade.id)} color="primary">
                                <DeleteTwoToneIcon fontSize="small" />
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

      <DialogWrapper open={openConfirmDelete} maxWidth="sm" fullWidth TransitionComponent={Transition} keepMounted onClose={closeConfirmDelete}>
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" p={5}>
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
  grade: PropTypes.array.isRequired
};

Results.defaultProps = {
  grade: []
};

export default Results;
