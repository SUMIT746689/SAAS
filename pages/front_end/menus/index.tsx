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

// updated code start
// Recursive Menu Component
const CustomMenu = ({ items, handleItemClick, menuLabel, setWebsiteMenuOpen }) => {
  return (
    <List>
      {items.map((item) => {
        return (
          <li key={item.id} style={{ cursor: 'pointer' }}>
            <Typography
              variant="body1"
              onClick={(event) => {
                handleItemClick(item.label, item.id);
                setWebsiteMenuOpen(false);
              }}
              style={{
                paddingLeft: menuLabel.toLowerCase() === item?.label.toLowerCase() ? '4px' : '',
                backgroundColor: menuLabel.toLowerCase() === item?.label.toLowerCase() ? '#32c5d2' : ''
              }}
            >
              {item?.label?.charAt(0).toUpperCase() + item?.label?.slice(1)}
            </Typography>
            {item.sub_menu && item.sub_menu.length > 0 && (
              <CustomMenu items={item.sub_menu} handleItemClick={handleItemClick} menuLabel={menuLabel} setWebsiteMenuOpen={setWebsiteMenuOpen} />
            )}
          </li>
        );
      })}
    </List>
  );
};

// updated code end

const WebsiteMenu = () => {
  const [menuLabel, setMenuLabel] = useState('');
  const [menuItemId, setMenuItemId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [open, setOpen] = useState(false);
  const { showNotification } = useNotistick();
  const { t }: { t: any } = useTranslation();
  const [websiteMenuOpen, setWebsiteMenuOpen] = useState(false);
  const childrenRef = useRef(null);
  // const [parentList, setParentList] = useState([
  //   {
  //     label: 'Root',
  //     id: 1
  //   },
  //   {
  //     label: 'Institution',
  //     id: 2,
  //     sub_menu: [
  //       {
  //         label: 'History',
  //         id: 3,
  //         sub_menu: [
  //           {
  //             label: 'Nested sub 1',
  //             id: 5,
  //             sub_menu: [
  //               {
  //                 label: 'Nested sub 2',
  //                 id: 6
  //               }
  //             ]
  //           }
  //         ]
  //       },
  //       {
  //         label: 'Lab',
  //         id: 4
  //       }
  //     ]
  //   },
  //   {
  //     label: 'Academy',
  //     id: 8
  //   }
  // ]);
  const [parentList, setParentList] = useState([]);
  const [linkTypeList, setLinkTypeList] = useState([
    {
      label: 'No Link',
      id: 1
    },
    // {
    //   label: 'Custom Link',
    //   id: 2
    // },
    {
      label: 'External Link',
      id: 3
    },
    {
      label: 'Page Link',
      id: 4
    },
    {
      label: 'Dynamic Page Link',
      id: 4
    }
  ]);
  const [linkTypeValue, setLinkTypeValue] = useState('');
  const [pageList, setPageList] = useState([
    {
      label: 'Fees Payments',
      link: '/fees-payments',
      id: 1
    },
    {
      label: 'Gallery',
      link: '/gallery',
      id: 2
    },
    {
      label: 'Notice',
      link: '/notice',
      id: 3
    },
    {
      label: 'Online Admission',
      link: '/online-admission',
      id: 4
    },
    {
      label: 'Student Information',
      link: '/student-information',
      id: 5
    },
    {
      label: 'Suborna Joyonti',
      link: '/suborna-joyonti',
      id: 6
    },
    {
      label: 'Teachers',
      link: '/teachers',
      id: 7
    },
    {
      label: 'Teacher Application',
      link: '/teacher-application',
      id: 8
    },
    {
      label: 'Text Book',
      link: '/text-book',
      id: 9
    },
    {
      label: 'Branches',
      link: '/branches',
      id: 9
    }
  ]);
  const [statusList, setStatusList] = useState([
    {
      label: 'Publish',
      id: 1
    },
    {
      label: 'Unpublish',
      id: 2
    }
  ]);
  const [menuInfo, setMenuInfo] = useState([]);

  const [dynamicPageList, setDynamicPageList] = useState([]);

  const handleCreateAddWebsiteMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setEditData(null);
    setOpen(true);
    setMenuItemId(null);
    setMenuLabel('');
  };
  const handleCreateWebsiteMenuFormClose = (event: MouseEvent<HTMLButtonElement>) => {
    setOpen(false);
  };
  const handleCreateUserSuccess = () => {
    setOpen(false);
  };

  const flattenMenu = (items, level = 0) => {
    let result = [];
    items.forEach((item) => {
      result.push({ ...item, level });
      if (item.sub_menu) {
        result = result.concat(flattenMenu(item.sub_menu, level + 1));
      }
    });
    return result;
  };

  let shape = {};
  let tempShape = {
    english_title: Yup.string().required(t('The english title field is required')),
    link_type: Yup.string().required(t('The link type field is required')),
    status: Yup.string().required(t('The status field is required'))
  };

  if (linkTypeValue === 'Custom Link' || linkTypeValue === 'External Link') {
    shape = {
      ...tempShape,
      website_link: Yup.string().required(t('The website link field is required'))
    };
  } else if (linkTypeValue === 'Page Link') {
    shape = {
      ...tempShape,
      website_label: Yup.string().required(t('The website link field is required')),
      website_link_id: Yup.number().required(t('The website link field is required'))
    };
  } else {
    shape = {
      ...tempShape
    };
  }

  const websiteDynamicPageList = () => {
    axios
      .get('/api/front_end/website_dynamic_pages')
      .then((res) => {
        console.log({ dynamicPages: res.data.data });
        setDynamicPageList(res.data?.data?.map((page) => ({ label: `${page.english_title} ( ${page.bangla_title} )`, id: page.id })));
      })
      .catch((error) => {});
  };

  useEffect(() => {
    websiteDynamicPageList();
  }, []);
  useEffect(() => {}, [websiteDynamicPageList]);

  const websiteMenuList = () => {
    axios
      .get('/api/website/menu')
      .then((res) => {
        setMenuInfo(res?.data?.result);
        setParentList(res?.data?.menus);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    websiteMenuList();
  }, []);
  useEffect(() => {}, [websiteMenuList]);

  // Debounce function
  const debounce = (func, delay) => {
    let timerId;
    return function (...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const handleDeleteMenu = debounce((item) => {
    axios
      .delete(`/api/website/menu/${item.id}`)
      .then((response) => {
        if (response.status === 204) {
          showNotification('website menu deleted successfull!!');
          websiteMenuList();
        }
      })
      .catch((err) => {
        showNotification(err?.response?.data?.message, 'error');
      });
  }, 1000);
  const handleItemClick = (label, id) => {
    setMenuItemId(id);
    setMenuLabel(label);
  };

  const handleClickOutside = (event) => {
    if (childrenRef.current && !childrenRef.current.contains(event.target)) {
      setWebsiteMenuOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Website Menu</title>
      </Head>
      <PageTitleWrapper>
        <PageHeaderTitleWrapper name="Add/Edit Website Menu" handleCreateClassOpen={handleCreateAddWebsiteMenu} disabled={false} />
      </PageTitleWrapper>

      {/* class routine form start */}
      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleCreateWebsiteMenuFormClose}>
        <DialogTitle
          sx={{
            p: 3
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('Add new website menu')}
          </Typography>
          <Typography variant="subtitle2">{t('Fill in the fields below to create and add a website menu')}</Typography>
        </DialogTitle>
        <Formik
          initialValues={{
            parent_id: editData?.parent_id ? editData?.parent_id : undefined,
            english_title: editData?.english_title ? editData?.english_title : '',
            bangla_title: editData?.bangla_title ? editData?.bangla_title : '',
            link_type: linkTypeList.filter((item) => item.label?.toLowerCase() === editData?.link_type?.toLowerCase())[0]?.label || undefined,
            website_link: editData?.website_link ? editData?.website_link : '',
            website_label: pageList.filter((item) => item.link?.toLowerCase() === editData?.website_link?.toLowerCase())[0]?.label || undefined,
            website_link_id: editData?.website_link_id ? editData?.website_link_id : undefined,
            dynamic_page_link: null,
            dynamic_page_link_id: undefined,
            status: statusList.filter((item) => item.label?.toLowerCase() === editData?.status?.toLowerCase())[0]?.label || '',
            submit: null
          }}
          validationSchema={Yup.object().shape(shape)}
          onSubmit={async (_values, { resetForm, setErrors, setStatus, setSubmitting }) => {
            try {
              const values = {
                parent_id: menuItemId ? menuItemId : 0,
                english_title: _values?.english_title ? _values?.english_title : '',
                bangla_title: _values?.bangla_title ? _values?.bangla_title : '',
                link_type: _values?.link_type ? _values?.link_type : '',
                website_link: _values?.website_link ? _values?.website_link : '',
                status: _values?.status ? _values?.status : '',
                dynamic_page_link_id: _values?.dynamic_page_link_id
              };

              let response;
              if (editData) {
                response = await axios.patch(`/api/website/menu/${editData.id}`, values);
              } else {
                response = await axios.post(`/api/website/menu`, values);
              }

              if (response.status === 200) {
                setMenuItemId(null);
                setMenuLabel('');
                resetForm();
                setSubmitting(false);
                showNotification(response.data.message);
                setStatus({ success: true });
                handleCreateUserSuccess();
                websiteMenuList();
                setLinkTypeValue('');
              }
            } catch (err) {
              setStatus({ success: false });
              //@ts-ignore
              setErrors({ submit: err.message });
              setSubmitting(false);
              showNotification(err?.response?.data?.message, 'error');
            }
          }}
        >
          {({ setFieldValue, errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => {
            const handleSelectChange = (event) => {
              setFieldValue('days', event.target.value);
            };

            return (
              <form onSubmit={handleSubmit}>
                <DialogContent
                  dividers
                  sx={{
                    p: 3
                  }}
                >
                  <Grid container spacing={3} sx={{ paddingTop: '27px', paddingLeft: '27px', paddingBottom: '9px' }}>
                    {/* updated code start */}
                    {/* <Menu items={parentList} /> */}
                    <Grid sx={{ width: '100%', position: 'relative' }} className="children" ref={childrenRef}>
                      <TextField
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        size="small"
                        fullWidth
                        placeholder={'Root...'}
                        onClick={() => {
                          setWebsiteMenuOpen(true);
                        }}
                        value={menuLabel?.charAt(0).toUpperCase() + menuLabel?.slice(1) || 'Root'}
                        variant="outlined"
                      />
                      {websiteMenuOpen && (
                        <Grid
                          sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            backgroundColor: '#fff',
                            width: '100%',
                            height: 'fit-content',
                            overflowY: 'auto',
                            zIndex: 10,
                            border: '1px solid #0000001f'
                          }}
                        >
                          <CustomMenu
                            items={parentList}
                            handleItemClick={handleItemClick}
                            menuLabel={menuLabel}
                            // editData={editData}
                            setWebsiteMenuOpen={setWebsiteMenuOpen}
                          />
                        </Grid>
                      )}
                    </Grid>

                    {/* updated code end */}
                  </Grid>
                  <Grid container spacing={3} sx={{ paddingTop: '27px', paddingLeft: '27px', paddingBottom: '9px' }}>
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      error={Boolean(touched.english_title && errors.english_title)}
                      fullWidth
                      helperText={touched.english_title && errors.english_title}
                      name="english_title"
                      placeholder={t('english title here...')}
                      onBlur={handleBlur}
                      onBlurCapture={async (v) => {}}
                      onChange={handleChange}
                      value={values.english_title}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid container spacing={3} sx={{ paddingTop: '27px', paddingLeft: '27px', paddingBottom: '9px' }}>
                    <TextField
                      sx={{
                        '& fieldset': {
                          borderRadius: '3px'
                        }
                      }}
                      size="small"
                      error={Boolean(touched.bangla_title && errors.bangla_title)}
                      fullWidth
                      helperText={touched.bangla_title && errors.bangla_title}
                      name="bangla_title"
                      placeholder={t('bangla title here...')}
                      onBlur={handleBlur}
                      onBlurCapture={async (v) => {}}
                      onChange={handleChange}
                      value={values.bangla_title}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid container spacing={3}>
                    <AutoCompleteWrapperWithoutRenderInput
                      minWidth="100%"
                      label="Select Link Type"
                      placeholder="Select Link Type..."
                      value={values.link_type}
                      options={linkTypeList}
                      name="link_type"
                      error={errors?.link_type}
                      touched={touched?.link_type}
                      // @ts-ignore
                      handleChange={(e, value: any) => {
                        if (value) {
                          setFieldValue('link_type', value.label);
                          setLinkTypeValue(value.label);
                        } else {
                          setFieldValue('link_type', '');
                        }
                      }}
                    />
                  </Grid>

                  {values?.link_type?.toLowerCase() === 'custom link' || values?.link_type?.toLowerCase() === 'external link' ? (
                    <Grid container spacing={3} sx={{ paddingTop: '27px', paddingLeft: '27px', paddingBottom: '9px' }}>
                      <TextField
                        sx={{
                          '& fieldset': {
                            borderRadius: '3px'
                          }
                        }}
                        size="small"
                        error={Boolean(touched.website_link && errors.website_link)}
                        fullWidth
                        helperText={touched.website_link && errors.website_link}
                        name="website_link"
                        placeholder={t('website link here...')}
                        onBlur={handleBlur}
                        onBlurCapture={async (v) => {}}
                        onChange={handleChange}
                        value={editData?.link_type === 'custom link' || editData?.link_type === 'external link' ? values.website_link : undefined}
                        variant="outlined"
                      />
                    </Grid>
                  ) : (
                    ''
                  )}

                  {values?.link_type?.toLowerCase() === 'page link' ? (
                    <Grid container spacing={3}>
                      <AutoCompleteWrapperWithoutRenderInput
                        minWidth="100%"
                        label="Select Page"
                        placeholder="Select Page..."
                        value={values.website_label}
                        options={pageList}
                        name="website_link_id"
                        error={errors?.website_link_id}
                        touched={touched?.website_link_id}
                        // @ts-ignore
                        handleChange={(e, value: any) => {
                          if (value) {
                            setFieldValue('website_link_id', value.id);
                            setFieldValue('website_link', value.link);
                            setFieldValue('website_label', value.label);
                          } else {
                            setFieldValue('website_link_id', null);
                            setFieldValue('website_link', '');
                            setFieldValue('website_label', '');
                          }
                        }}
                      />
                    </Grid>
                  ) : (
                    ''
                  )}

                  {values?.link_type?.toLowerCase() === 'dynamic page link' ? (
                    <Grid container spacing={3}>
                      <AutoCompleteWrapperWithoutRenderInput
                        minWidth="100%"
                        label="Select Page"
                        placeholder="Select a Dynamic Page..."
                        value={values.dynamic_page_link}
                        options={dynamicPageList}
                        name="dynamic_page_link_id"
                        error={errors?.dynamic_page_link_id}
                        touched={touched?.dynamic_page_link_id}
                        // @ts-ignore
                        handleChange={(e, value: any) => {
                          if (!value) {
                            setFieldValue('dynamic_page_link', null);
                            setFieldValue('dynamic_page_link_id', null);
                            return;
                          }
                          setFieldValue('dynamic_page_link', value);
                          setFieldValue('dynamic_page_link_id', value.id);
                        }}
                      />
                    </Grid>
                  ) : (
                    ''
                  )}

                  <Grid container spacing={3}>
                    <AutoCompleteWrapperWithoutRenderInput
                      minWidth="100%"
                      label="Select Status"
                      placeholder="Select Status..."
                      value={values.status}
                      options={statusList}
                      name="status"
                      error={errors?.status}
                      touched={touched?.status}
                      // @ts-ignore
                      handleChange={(e, value: any) => {
                        if (value) {
                          setFieldValue('status', value.label);
                        } else {
                          setFieldValue('status', '');
                        }
                      }}
                    />
                  </Grid>
                </DialogContent>

                <DialogActionWrapper
                  title="Website Menu"
                  errors={errors}
                  editData={editData || undefined}
                  handleCreateClassClose={handleCreateWebsiteMenuFormClose}
                  isSubmitting={isSubmitting}
                />
              </form>
            );
          }}
        </Formik>
      </Dialog>

      {/* result component code start */}
      <Result
        menuInfo={menuInfo}
        setEditData={setEditData}
        setOpen={setOpen}
        handleDeleteMenu={handleDeleteMenu}
        setMenuItemId={setMenuItemId}
        setMenuLabel={setMenuLabel}
      />
      {/* result component code end */}
    </>
  );
};

WebsiteMenu.getLayout = (page) => (
  <Authenticated requiredPermissions={['create_website_menu', 'show_website_menu']}>
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
  // <Authenticated requiredPermissions={['create_class_routine', 'show_class_routine']}>
  //   <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  // </Authenticated>
);

export default WebsiteMenu;
