import { FC, ChangeEvent, useState, ReactElement, Ref, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Card, Grid, Slide, Divider, Tooltip, IconButton, InputAdornment, Table, TableBody, TableCell, TableHead, TablePagination, TableContainer, TableRow, TextField, Button, Typography, Dialog, styled } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { Project, ProjectStatus } from 'src/models/project';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
// import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
// import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { TableBodyCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';
// import ClearIcon from '@mui/icons-material/Clear';
// import CheckIcon from '@mui/icons-material/Check';
// import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';

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
      const properties = ['title'];
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
  sessions: Project[],
  page: number,
  limit: number
): Project[] => {
  return sessions.slice(page * limit, page * limit + limit);
};

const Results: FC<ResultsProps> = ({
  sessions,
  setEditData,
  reFetchData
}) => {
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

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const filteredschools = applyFilters(sessions, query, filters);
  const paginatedschools = applyPagination(filteredschools, page, limit);

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [deleteSchoolId, setDeleteSchoolId] = useState(null);


  const closeConfirmDelete = () => {
    setOpenConfirmDelete(false);
    setDeleteSchoolId(null);
  };


  return (
    <>
      <Card
        sx={{
          p: 0.5,
          mb: 1
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box p={1}>
              <TextField
                sx={{
                  m: 0
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
                placeholder={t('Search by sms gateways...')}
                value={query}
                fullWidth
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ minHeight: 'calc(100vh - 428px) !important' }}>
        <Box
          p={1}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography component="span" variant="subtitle1">
              {t('Showing')}:
            </Typography>{' '}
            <b>{paginatedschools.length}</b> <b>{t('sms gateways')}</b>
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
              {t(
                "We couldn't find any sms gateways matching your search criteria"
              )}
            </Typography>
          </>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableHeaderCellWrapper align="center">{t('Id')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align="center">{t('School Name')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align="center">{t('Sender Id')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align="center">{t('Sms Api Key')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align="center">{t('Actions')}</TableHeaderCellWrapper>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedschools.map((project) => {

                    return (
                      <TableRow
                        hover
                        key={project.id}
                      >
                        <TableBodyCellWrapper align="center">
                          {project?.id}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper align="center">
                          {project?.school?.name}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper align="center">
                          {project?.details?.sender_id}
                        </TableBodyCellWrapper>

                        <TableBodyCellWrapper align="center">
                          {project?.details?.sms_api_key}
                        </TableBodyCellWrapper>

                        <TableBodyCellWrapper align="center">
                          <Typography noWrap>

                            <Tooltip title={t('Edit')} arrow>
                              <IconButton
                                onClick={() => setEditData(project)}
                                color="primary"
                              >
                                <LaunchTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {/* <Tooltip title={t('Delete')} arrow>
                              <IconButton
                                onClick={() =>
                                  handleConfirmDelete(project.id)
                                }
                                color="primary"
                              >
                                <DeleteTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip> */}
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
            {/* <ButtonError
              onClick={handleDeleteCompleted}
              size="large"
              sx={{
                mx: 1,
                px: 3
              }}
              variant="contained"
            >
              {t('Delete')}
            </ButtonError> */}
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
