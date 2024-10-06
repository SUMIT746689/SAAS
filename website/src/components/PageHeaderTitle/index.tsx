import { Button, Grid, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

export const PageHeaderTitleWrapper = ({ name, handleCreateClassOpen, actionButton = undefined, disabled = false, hideBtn = false }) => {
  const { t }: { t: any } = useTranslation();
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom textTransform="capitalize">
          {t(name)}
        </Typography>
        <Typography variant="subtitle2" textTransform={'initial'}>
          {t(`All aspects of ${name} can be managed from this page`)}
        </Typography>
      </Grid>
      {actionButton ? (
        actionButton
      ) : hideBtn ? (
        ''
      ) : (
        <Grid item>
          <Button
            disabled={disabled}
            sx={{ mt: { xs: 2, sm: 0 }, borderRadius: 0.6, textTransform: 'capitalize' }}
            onClick={handleCreateClassOpen}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
          >
            {t('Create ' + name)}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};
