import { useTranslation } from 'react-i18next';
import 'react-quill/dist/quill.snow.css';

import { Grid, Typography } from '@mui/material';

function PageHeader({ title }): any {
  const { t }: { t: any } = useTranslation();
  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            {t(`${title}`)}
          </Typography>
          <Typography variant="subtitle2">{t(`These page is for ${title}`)}</Typography>
        </Grid>
      </Grid>
    </>
  );
}

export default PageHeader;
