import { Zoom } from '@mui/material';
import { SnackbarProvider, useSnackbar } from 'notistack';

export default () => {
  const { enqueueSnackbar } = useSnackbar();

    const showNotification = (message, variant = 'success') => {
      enqueueSnackbar(message, {
        // @ts-ignore
        variant,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        TransitionComponent: Zoom,
        autoHideDuration:3000
      });
    };
  
  return {showNotification};
};

