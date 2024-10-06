import { Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogTitle, styled, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import CloseIcon from '@mui/icons-material/Close';

const DialogStyleWrapper = styled(Dialog)(
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
      width: ${theme.spacing(8)};
      height: ${theme.spacing(8)};

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

export const DialogWrapper = ({ openConfirmDelete, closeConfirmDelete, handleDeleteCompleted, Transition }) => {
  const { t }: { t: any } = useTranslation();

  return (
    <DialogStyleWrapper open={openConfirmDelete} maxWidth="sm" fullWidth TransitionComponent={Transition} keepMounted onClose={closeConfirmDelete}>
      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" p={5}>
        <AvatarError>
          <CloseIcon />
        </AvatarError>

        <Typography align="center" sx={{ pt: 4, px: 6 }} variant="h3">
          {t('Do you really want to delete this project')}?
        </Typography>

        <Typography align="center" sx={{ pt: 2, pb: 4, px: 6 }} fontWeight="normal" color="text.secondary" variant="h4">
          {t("You won't be able to revert after deletion")}
        </Typography>

        <Box>
          <Button variant="text" sx={{ mx: 1 }} onClick={closeConfirmDelete}>
            {t('Cancel')}
          </Button>
          <ButtonError onClick={handleDeleteCompleted} sx={{ mx: 1, px: 3 }} variant="contained">
            {t('Delete')}
          </ButtonError>
        </Box>
      </Box>
    </DialogStyleWrapper>
  );
};

export const DialogTitleWrapper = ({ editData, name }) => {
  const { t }: { t: any } = useTranslation();
  return (
    <DialogTitle sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t(editData ? 'Edit ' : 'Add new ' + name)}
      </Typography>
      <Typography variant="subtitle2">{t(`Fill in the fields below to create or edit ${name}`)}</Typography>
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
  const { t }: { t: any } = useTranslation();

  return (
    <DialogActions
      sx={{
        p: 3
      }}
    >
      <Button color="secondary" onClick={handleCreateClassClose}>
        {t('Cancel')}
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
