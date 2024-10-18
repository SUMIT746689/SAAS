import { Button, Grid, Typography } from '@mui/material';
import { FiPlus } from "react-icons/fi";

export const PageHeaderTitleWrapper = ({ name, handleCreateClassOpen, actionButton = undefined, disabled = false, hideBtn = false }) => {
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom textTransform="capitalize">
          {name}
        </Typography>
        <Typography variant="subtitle2" textTransform={'initial'}>
          {`All aspects of ${name} can be managed from this page`}
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
            startIcon={<FiPlus fontSize="small" />}
          >
            {'Create ' + name}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};
