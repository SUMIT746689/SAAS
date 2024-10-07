import { FC, ChangeEvent, useState, ReactElement, Ref, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, Checkbox, Slide, Divider, Tooltip, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import type { Project, ProjectStatus } from 'src/models/project';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import SearchInputWrapper from '@/components/SearchInput';
import BulkActions from '@/components/BulkAction';
import { DialogWrapper } from '@/components/DialogWrapper';
import { TableContainerWrapper, TableEmptyWrapper, TableHeadWrapper } from '@/components/TableWrapper';
import Image from 'next/image';
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
      const properties = ['id', 'title'];
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
  const [limit, setLimit] = useState<number>(5);
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
  const [deleteEntry, setDeleteEntry] = useState(null);

  const handleConfirmDelete = (id: string, file_url: string) => {
    setDeleteEntry({ id, file_url });
    setOpenConfirmDelete(true);
  };
  const closeConfirmDelete = () => {
    setOpenConfirmDelete(false);
    setDeleteEntry(null);
  };

  const handleDeleteCompleted = async () => {
    try {
      const result = await axios.delete(`/api/notices/${deleteEntry.id}?file_url=${deleteEntry?.file_url}`);
      console.log({ result });
      setOpenConfirmDelete(false);
      if (!result.data?.success) throw new Error('unsuccessful delete');
      showNotification('Notice has been deleted successfully');
      reFetchData();
    } catch (err) {
      console.log(err);

      setOpenConfirmDelete(false);
      showNotification(err?.response?.data?.message, 'error');
    }
  };

  return (
    <>
      <SearchInputWrapper placeholder="Search by id or title..." handleQueryChange={handleQueryChange} query={query} />

      <Card sx={{ minHeight: 'calc(100vh - 438px) !important' }}>
        {selectedBulkActions && (
          <Box p={2}>
            <BulkActions />
          </Box>
        )}
        {!selectedBulkActions && (
          <>
            <TableHeadWrapper
              title="notice"
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
          <TableEmptyWrapper title="notice" />
        ) : (
          <>
            <TableContainerWrapper
              tableHead={
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedAllschools} indeterminate={selectedSomeschools} onChange={handleSelectAllschools} />
                  </TableCell>
                  <TableCell>{t('id')}</TableCell>
                  <TableCell>{t('title')}</TableCell>
                  <TableCell>{t('photo')}</TableCell>
                  <TableCell align="center">{t('Actions')}</TableCell>
                </TableRow>
              }
              tableBody={
                <>
                  {paginatedFees.map((notice) => {
                    const isschoolselected = selectedItems.includes(notice.id);
                    return (
                      <TableRow hover key={notice.id} selected={isschoolselected}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isschoolselected}
                            onChange={(event) => handleSelectOneProject(event, notice.id)}
                            value={isschoolselected}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            {notice.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap variant="h5">
                            {notice.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <a style={{ width: '50px' }} target="_blank" href={getFile(notice?.file_url)}>
                            {notice?.file_url || ''}
                          </a>
                        </TableCell>

                        <TableCell align="center">
                          <Typography noWrap>
                            <Tooltip title={t('Edit')} arrow>
                              <IconButton onClick={() => setEditData(notice)} color="primary">
                                <LaunchTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Delete')} arrow>
                              <IconButton onClick={() => handleConfirmDelete(notice.id, notice?.file_url)} color="primary">
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
