import { FC, ChangeEvent, useState, ReactElement, Ref, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, Checkbox, Slide, Divider, Tooltip, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import type { Project, ProjectStatus } from 'src/models/project';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import SearchInputWrapper from '@/components/SearchInput';
import BulkActions from '@/components/BulkAction';
import { DialogWrapper } from '@/components/DialogWrapper';
import { TableContainerWrapper, TableEmptyWrapper, TableHeadWrapper } from '@/components/TableWrapper';
import Image from 'next/image';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { getFile } from '@/utils/utilitY-functions';

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
  console.log({ sessions });
  return sessions?.filter((project) => {
    let matches = true;

    if (query) {
      const properties = ['id', 'title', 'body'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (project[property]?.toString().toLowerCase().includes(query.toLowerCase())) {
          containsQuery = true;
        }
      });

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
  const [selectedItems, setSelectedschools] = useState<string[]>([]);
  const { t }: { t: any } = useTranslation();
  const { showNotification } = useNotistick();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    status: null
  });

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
      const result = await axios.delete(`/api/front_end/website_dynamic_pages/${deleteSchoolId}`);
      setOpenConfirmDelete(false);
      if (!result.data?.success) throw new Error('unsuccessful delete');
      showNotification('The fees has been deleted successfully');
      reFetchData();
    } catch (err) {
      setOpenConfirmDelete(false);
      showNotification(err?.response?.data?.message, 'error');
    }
  };

  return (
    <>
      <Card sx={{ px: 1, pt: 1, mb: 1 }}>
        <SearchInputWrapper placeholder="Search by id or certificate name..." handleQueryChange={handleQueryChange} query={query} />
      </Card>

      <Card sx={{ minHeight: 'calc(100vh - 438px) !important' }}>
        {selectedBulkActions && (
          <Box p={2}>
            <BulkActions />
          </Box>
        )}
        {!selectedBulkActions && (
          <>
            <TableHeadWrapper
              title="Program page"
              total={paginatedFees.length}
              count={filteredschools.length}
              page={page}
              rowsPerPage={limit}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleLimitChange}
            />
          </>
        )}
        <Divider />

        {paginatedFees.length === 0 ? (
          <TableEmptyWrapper title="email tamplates" />
        ) : (
          <>
            <TableContainerWrapper
              tableHead={
                <TableRow>
                  <TableCell>{t('id')}</TableCell>
                  <TableCell>{t('title')}</TableCell>
                  {/* <TableCell>{t('body')}</TableCell> */}
                  <TableCell>{t('banner photo')}</TableCell>
                  <TableCell align="center">{t('Actions')}</TableCell>
                </TableRow>
              }
              tableBody={
                <>
                  {paginatedFees.map((dynamicPage) => {
                    const isschoolselected = selectedItems.includes(dynamicPage.id);
                    return (
                      <TableRow hover key={dynamicPage.id} selected={isschoolselected}>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            {dynamicPage.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            {dynamicPage.title}
                          </Typography>
                        </TableCell>

                        {/* <TableCell>
                          <Typography noWrap variant="h5" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                            {dynamicPage.body}
                          </Typography>
                        </TableCell> */}

                        <TableCell>
                          <Typography noWrap variant="h5">
                            {dynamicPage.banner_photo ? (
                              <Image width={250} height={250} src={getFile(dynamicPage.feature_photo)} className="w-fit h-10" alt="feature photo" />
                            ) : (
                              'N/A'
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography noWrap>
                            <Tooltip title={t('Edit')} arrow>
                              <IconButton onClick={() => setEditData(dynamicPage)} color="primary">
                                <LaunchTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Delete')} arrow>
                              <IconButton onClick={() => handleConfirmDelete(dynamicPage.id)} color="error">
                                <DeleteTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              }
            />
          </>
        )}
      </Card>

      <DialogWrapper
        openConfirmDelete={openConfirmDelete}
        closeConfirmDelete={closeConfirmDelete}
        handleDeleteCompleted={handleDeleteCompleted}
        Transition={Transition}
      />
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
