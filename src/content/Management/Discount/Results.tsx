import {
  FC,
  ChangeEvent,
  useState,
  ReactElement,
  Ref,
  forwardRef,
  useEffect
} from 'react';

import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
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
  DialogTitle,
  DialogContent,
  Grid,
  DialogActions
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from 'src/models/user';
import { useTranslation } from 'react-i18next';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
// import BulkActions from './BulkActions';
// import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { TableBodyCellWrapper, TableHeaderCellWrapper, TableRowWrapper } from '@/components/Table/Table';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { DisableTextWrapper, TextFieldWrapper } from '@/components/TextFields';
import { set } from 'nprogress';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';

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

const applyFilters = (users, query, filters) => {
  return users.filter((user) => {
    let matches = true;
    if (query) {
      const properties = ['name', 'Group', 'class'];
      let containsQuery = false;

      properties.forEach((property) => {
        console.log(typeof user[property] === 'object');
        if (
          (typeof user[property] === 'string' &&
            user[property]?.toLowerCase().includes(query.toLowerCase())) ||
          user[property]?.title?.toLowerCase().includes(query.toLowerCase()) ||
          user[property]?.name?.toLowerCase().includes(query.toLowerCase())
        ) {
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

const applyPagination = (users, page, limit) => {
  return users.slice(page * limit, page * limit + limit);
};

const Results = ({ setEditDiscount, discount, reFetchData }) => {
  const [selectedItems, setSelectedUsers] = useState<string[]>([]);
  const { t }: { t: any } = useTranslation();

  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    role: null
  });
  const [updateDiscount, setUpdateDiscount] = useState();

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

  const filteredClasses = applyFilters(discount, query, filters);
  const paginatedClasses = applyPagination(filteredClasses, page, limit);
  const selectedBulkActions = selectedItems.length > 0;
  const selectedSomeUsers =
    selectedItems.length > 0 && selectedItems.length < discount.length;
  const selectedAllUsers = selectedItems.length === discount.length;

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  const handleConfirmDelete = () => {
    setOpenConfirmDelete(true);
  };

  const closeConfirmDelete = () => {
    setOpenConfirmDelete(false);
  };

  const handleDeleteCompleted = () => {
    setOpenConfirmDelete(false);
  };

  return (
    <>
      <UpdateDiscount discount={updateDiscount} setDiscount={setUpdateDiscount} reFetchData={reFetchData} />

      <Card sx={{ minHeight: 'calc(100vh - 330px) !important' }}>
        <Box p={2}>
          <TablePagination
            component="div"
            count={filteredClasses.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleLimitChange}
            page={page}
            rowsPerPage={limit}
            rowsPerPageOptions={[5, 10, 15]}
          />
        </Box>

        {paginatedClasses.length === 0 ? (
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
              {t("We couldn't find any sections matching your search criteria")}
            </Typography>
          </>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableHeaderCellWrapper >{t('Title')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper >{t('Fee')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper >{t('Class')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper >{t('Amount')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper >{t('Type')}</TableHeaderCellWrapper>
                    <TableHeaderCellWrapper align="center" >{t('Action')}</TableHeaderCellWrapper>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedClasses.map((i) => {
                    const isUserSelected = selectedItems.includes(i.id);
                    return (
                      <TableRowWrapper hover key={i.discount_id} selected={isUserSelected}>
                        <TableBodyCellWrapper>
                          {i?.title}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper>
                          {i?.fees_heads}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper>
                          {i?.class_name}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper>
                          {i?.amt?.toFixed(2)} {i?.type === "percent" ? '%' : ''}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper>
                          {i?.type}
                        </TableBodyCellWrapper>
                        <TableBodyCellWrapper align="center" >
                          <Typography noWrap>

                            {/* <Tooltip title={t('Edit')} arrow>
                              <IconButton
                                color="primary"
                                onClick={() => setEditDiscount(i)}
                              >
                                <LaunchTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip> */}

                            <Tooltip title={t('update')} arrow>
                              <IconButton
                                color="primary"
                                onClick={() => setUpdateDiscount(i)}
                              >
                                <UpgradeIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t('Delete')} arrow>
                              <IconButton
                                onClick={handleConfirmDelete}
                                color="primary"
                              >
                                <DeleteTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                        </TableBodyCellWrapper>
                      </TableRowWrapper>
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
            {t('Are you sure you want to permanently delete this section')}?
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

const typeOption = [
  {
    label: 'Percent',
    value: 'percent'
  },
  {
    label: 'Flat',
    value: 'flat'
  }
];

const UpdateDiscount = ({ discount, setDiscount, reFetchData }) => {
  const [updateDiscount, setUpdateDiscount] = useState({ type: discount?.type, amt: discount?.amt });
  const { t }: { t: any } = useTranslation();
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();


  useEffect(() => {
    if (!discount) return;
    setOpen(true);
    setUpdateDiscount({ type: discount?.type, amt: discount?.amt });
  }, [discount])

  const handleUpdateDiscountClose = () => {
    setOpen(false);
    setDiscount(null);
    setUpdateDiscount({ type: null, amt: null })
    // setEditDiscount(null);
  };

  const handleSubmit = () => {

    if (!updateDiscount?.type && !updateDiscount?.amt) return showNotification('no value founds for update', 'error');

    axios.patch(`/api/discount/${discount.discount_id}`, { type: updateDiscount?.type, amt: updateDiscount?.amt })
      .then(res => {
        showNotification('successfully updated');
        reFetchData();
        handleUpdateDiscountClose();
      })
      .catch(err => {
        handleShowErrMsg(err, showNotification);
      })

  }

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={handleUpdateDiscountClose}
    >
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('Update Discount')}
        </Typography>
        <Typography variant="subtitle2">
          {t('Fill in the fields below to create and add a new Discount')}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container >

          <DisableTextWrapper
            label="Title"
            touched={undefined}
            errors={undefined}
            value={discount?.title}
          />

          <AutoCompleteWrapper
            minWidth="100%"
            label="Discount type"
            placeholder="Select Discount type..."
            value={
              typeOption.find((i) => i.value === updateDiscount.type)
            }
            options={typeOption}
            required={true}
            // @ts-ignore
            handleChange={(event, value) => {
              setUpdateDiscount(v => ({ ...v, type: value?.value }))
            }}
          />

          <TextFieldWrapper
            errors={null}
            touched={null}
            label={t(`Discount ${updateDiscount?.type === 'percent' ? 'percent (%)' : 'amount'}`)}
            name="amt"
            value={updateDiscount.amt}
            handleBlur={undefined}
            handleChange={(event, value) => {
              setUpdateDiscount(v => ({ ...v, amt: event.target.value ? parseInt(event.target.value) : null }))
            }}
            type='number'
          />

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button color="secondary" onClick={handleUpdateDiscountClose}>
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          // startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
          //@ts-ignore
          // disabled={Boolean(errors.submit) || isSubmitting || disabled}
          variant="contained"
        >
          {'Update Discount'}
        </Button>
      </DialogActions>
    </Dialog>
  )

}