import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import Head from 'next/head';
import React, { useState, MouseEvent, useEffect, useRef } from 'react';
import { Grid, Typography, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import useNotistick from '@/hooks/useNotistick';
import { PageHeaderTitleWrapper } from '@/components/PageHeaderTitle';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AutoCompleteWrapperWithoutRenderInput } from '@/components/AutoCompleteWrapper';
import { DialogActionWrapper } from '@/components/DialogWrapper';
import axios from 'axios';
import Result from './Result';
import List from '@mui/material/List';

const WebsiteMenu = () => {
  const [menuLabel, setMenuLabel] = useState('');
  const [menuItemId, setMenuItemId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const { t }: { t: any } = useTranslation();
  const [websiteMenuOpen, setWebsiteMenuOpen] = useState(false);
  const childrenRef = useRef(null);
  const [parentList, setParentList] = useState([]);
  const [dynamicPageList, setDynamicPageList] = useState([]);

  const handleCreateAddWebsiteMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setEditData(null);
    setOpen(true);
    setMenuItemId(null);
    setMenuLabel('');
  };

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <PageTitleWrapper>
        <PageHeaderTitleWrapper name="Settings" handleCreateClassOpen={handleCreateAddWebsiteMenu} disabled={false} />
      </PageTitleWrapper>

      {/* result component code start */}
      <Result />
      {/* result component code end */}
    </>
  );
};

WebsiteMenu.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_website_menu', 'show_website_menu']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);
export default WebsiteMenu;
