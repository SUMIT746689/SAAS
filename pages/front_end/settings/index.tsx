import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import React, { useState, MouseEvent, useEffect, useRef } from 'react';
import { Grid, Typography, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import useNotistick from '@/hooks/useNotistick';
import { useTranslation } from 'react-i18next';
import { Button, Tooltip, IconButton, FormGroup, FormControlLabel, Switch } from '@mui/material';
import Paper from '@mui/material/Paper';
import Head from 'next/head';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageHeader from 'src/content/Management/Attendence/PageHeader';
import axios from 'axios';
import { useClientFetch } from '@/hooks/useClientFetch';

const WebsiteMenu = () => {
  const { data, reFetchData } = useClientFetch('/api/front_end/settings');
  console.log('dat..................a', { data });
  const { showNotification } = useNotistick();
  const { t }: { t: any } = useTranslation();
  const [isSmallSize, setIsSmallSize] = useState(false);
  const [isOn, setIsOn] = useState(false);
  // isSmallSize
  useEffect(() => {
    const storedValue = localStorage.getItem('isSmallSize');
    console.log(storedValue);
    if (storedValue !== null) {
      setIsSmallSize(JSON.parse(storedValue));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('isSmallSize', JSON.stringify(isSmallSize));
  }, [isSmallSize]);

  // isOn
  useEffect(() => {
    const storedValue = localStorage.getItem('isOn');
    console.log({ storedValue });
    if (storedValue !== null) {
      setIsOn(JSON.parse(storedValue));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('isOn', JSON.stringify(isOn));
  }, [isOn]);

  const handleBanchWiseFeesCollection = async () => {
    const res = await axios.put('/api/front_end/settings', {});
  };

  return (
    <>
      <Head>
        <title>Scholarship - Management</title>
      </Head>

      <PageTitleWrapper>
        <PageHeader title={'Settings - Management'} />
      </PageTitleWrapper>
      <Grid component={Paper} sx={{ borderRadius: 0.5 }} mx={1} mt={3}>
        <Grid sx={{ pt: 2, px: 1, pb: 2 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch checked={isSmallSize} onChange={handleBanchWiseFeesCollection} />
                // <Switch checked={isSmallSize} onChange={() => setIsSmallSize((value) => !value)} inputProps={{ 'aria-label': 'controlled' }} />
              }
              label={`Branch Wise Fees Collection: ${isSmallSize ? 'On' : 'Off'}`}
              labelPlacement="start"
              sx={{ mr: 'auto' }}
            />{' '}
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={isOn} onChange={() => setIsOn((value) => !value)} inputProps={{ 'aria-label': 'controlled' }} />}
              label={`Branch Wise Addmission: ${isOn ? 'On' : 'Off'}`}
              labelPlacement="start"
              sx={{ mr: 'auto' }}
            />{' '}
          </FormGroup>
        </Grid>
      </Grid>
    </>
  );
};

WebsiteMenu.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_website_menu', 'show_website_menu']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);
export default WebsiteMenu;
