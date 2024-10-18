import { Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogTitle, styled, Typography } from '@mui/material';
import { IoIosClose } from "react-icons/io";
const DialogStyleWrapper = styled(Dialog)(
  () => `
      .MuiDialog-paper {
        overflow: visible;
      }
`
);

// background-color: ${theme.colors.error.lighter};
// color: ${theme.colors.error.main};
const AvatarError = styled(Avatar)(
  ({ theme }) => `
      width: ${theme.spacing(8)};
      height: ${theme.spacing(8)};

      .MuiSvgIcon-root {
        font-size: ${theme.typography.pxToRem(45)};
      }
`
);

// background: ${theme.colors.error.main};
// background: ${theme.colors.error.dark};
const ButtonError = styled(Button)(
  ({ theme }) => `
     color: ${theme.palette.error.contrastText};
     
     &:hover {
     }
    `
);

export const DialogWrapper = ({ openConfirmDelete, closeConfirmDelete, handleDeleteCompleted, Transition }) => {

  return (
    <DialogStyleWrapper open={openConfirmDelete} maxWidth="sm" fullWidth TransitionComponent={Transition} keepMounted onClose={closeConfirmDelete}>
      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" p={5}>
        <AvatarError>
          <IoIosClose />
        </AvatarError>

        <Typography align="center" sx={{ pt: 4, px: 6 }} variant="h3">
          {'Do you really want to delete this project'}?
        </Typography>

        <Typography align="center" sx={{ pt: 2, pb: 4, px: 6 }} fontWeight="normal" color="text.secondary" variant="h4">
          {"You won't be able to revert after deletion"}
        </Typography>

        <Box>
          <Button variant="text" sx={{ mx: 1 }} onClick={closeConfirmDelete}>
            {'Cancel'}
          </Button>
          <ButtonError onClick={handleDeleteCompleted} sx={{ mx: 1, px: 3 }} variant="contained">
            {'Delete'}
          </ButtonError>
        </Box>
      </Box>
    </DialogStyleWrapper>
  );
};

export const DialogTitleWrapper = ({ editData, name }) => {

  return (
    <DialogTitle sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {editData ? 'Edit ' : 'Add new ' + name}
      </Typography>
      <Typography variant="subtitle2">{`Fill in the fields below to create or edit ${name}`}</Typography>
    </DialogTitle>
  );
};

export const DialogActionWrapper = ({
  handleCreateClassClose,
  errors,
  editData,
  isSubmitting,
  title,
  titleFront = null,
  customSubmitLabel = '',
  disabled = false
}) => {

  return (
    <DialogActions
      sx={{
        p: 3
      }}
    >
      <Button color="secondary" onClick={handleCreateClassClose}>
        {'Cancel'}
      </Button>
      <Button
        type="submit"
        startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
        //@ts-ignore
        disabled={Boolean(errors.submit) || isSubmitting || disabled}
        variant="contained"
      >
        {customSubmitLabel ? customSubmitLabel : `${editData ? 'Update' : titleFront || `Create`} ${title}`}
      </Button>
    </DialogActions>
  );
};
