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
const Settings = () => {
  const { data, reFetchData } = useClientFetch('/api/front_end/settings');
  console.log('dataaaaa........', { data: data?.is_branch_wise_fees_collection }, { data: data?.branch_wise_addmission });
  const handleBanchWiseFeesCollection = async () => {
    console.log('isSmallSize...........', !data?.is_branch_wise_fees_collection);
    const res = await axios.put('/api/front_end/settings', {
      is_branch_wise_fees_collection: !data?.is_branch_wise_fees_collection
    });
    reFetchData();
  };
  const handleBranchWiseAddmission = async () => {
    console.log('isSmallSize...........', !data?.branch_wise_addmission);
    const res = await axios.put('/api/front_end/settings', {
      branch_wise_addmission: !data?.branch_wise_addmission
    });
    reFetchData();
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
              control={<Switch checked={data?.is_branch_wise_fees_collection} onChange={handleBanchWiseFeesCollection} />}
              label={`Branch Wise Fees Collection: ${data?.is_branch_wise_fees_collection ? 'On' : 'Off'}`}
              labelPlacement="start"
              sx={{ mr: 'auto' }}
            />{' '}
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={data?.branch_wise_addmission} onChange={handleBranchWiseAddmission} />}
              label={`branch_wise_addmission: ${data?.branch_wise_addmission ? 'On' : 'Off'}`}
              labelPlacement="start"
              sx={{ mr: 'auto' }}
            />{' '}
          </FormGroup>
        </Grid>
      </Grid>
    </>
  );
};
Settings.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_website_menu', 'show_website_menu']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);
export default Settings;
