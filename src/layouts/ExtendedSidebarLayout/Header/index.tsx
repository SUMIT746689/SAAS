import { useContext, useEffect, useState } from 'react';

import { Box, IconButton, Tooltip, styled, Grid, Autocomplete, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import { SidebarContext } from 'src/contexts/SidebarContext';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';

import HeaderButtons from './Buttons';
import HeaderUserbox from './Userbox';
import HeaderSearch from './Search';
import HeaderMenu from './Menu';
import { AcademicYearContext, MaxStudentId } from '@/contexts/UtilsContextUse';
import axios from 'axios';
import { getOneCookies } from '@/utils/utilitY-functions';
import { useAuth } from '@/hooks/useAuth';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { customBorder } from '@/utils/mui_style';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import menuItems from '../Sidebar/SidebarMenu/items';
import { useRouter } from 'next/router';
import useNotistick from '@/hooks/useNotistick';
import { useClientDataFetch, useClientFetch } from '@/hooks/useClientFetch';
import SearchInputWrapper from '@/components/SearchInput';
import { NavIcon } from '@/components/Icon';
import { useTranslation } from 'next-i18next';
import { ModuleContext } from '@/contexts/ModuleContext';
import { adminModulesList, branchAdminModulesList, studentModulesList, teacherModulesList } from '@/utils/moduleLists';
import Link from 'next/link';
import { HighestStudentIdContext } from '@/contexts/HighestStudentIdContext';

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
        right: 0;
        z-index: 6;
        background: ${theme.colors.primary.dark};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
`
);

const SelectWrpper = styled(Select)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
        right: 0;
        z-index: 6;
        background: ${theme.colors.primary.dark};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
`
);

function Header({ drawerOpen, handleDrawerOpen, handleDrawerClose }) {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const [academicYearList, setAcademicYearList] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const { selectModule, handleChangeModule } = useContext(ModuleContext);
  const { highestStudentId, handleFetchHighestStudentId } = useContext(HighestStudentIdContext)

  const [menulist, setMenulist] = useState([]);
  const router = useRouter();
  const { showNotification } = useNotistick();
  const { data } = useClientDataFetch(`/api/academic_years`);
  const { data: current_active_academic_year, reFetchData } = useClientFetch(`/api/academic_years/current_active`);
  // console.log({ current_active_academic_year })
  const auth: any = useAuth();
  const { user } = auth;
  const { school } = user || {};
  const { academic_years } = school || {};
  const { t } = useTranslation();

  // console.log({ academic_years })

  const handleFetchAcademicYear = () => {
    axios
      .get(`/api/academic_years`)
      .then((res) => {
        const list = res.data?.data?.map((i) => {
          return { label: i.title, id: i.id };
        });
        setAcademicYearList(list);

        // const storedAcademicYear = JSON.parse(
        //   localStorage.getItem('academicYear')
        // );
        // if (storedAcademicYear) {

        //   const temp = list.find((i) => i.id == storedAcademicYear.id);

        //   if (temp) {
        //     setSelectedAcademicYear({ label: temp.label, id: temp.id });
        //   } else {
        //     const lastIndex = list.length;
        //     setSelectedAcademicYear(
        //       academicYear.id ? academicYear : list[lastIndex - 1]
        //     );
        //   }
        // } else {
        //   const lastIndex = list.length;
        //   setSelectedAcademicYear(
        //     academicYear.id ? academicYear : list[lastIndex - 1]
        //   );
        // }

        axios.get('/api/academic_years/current_user').then(({ data }) => {
          if (data?.success)
            setSelectedAcademicYear(() => ({
              id: data.data.id,
              label: data.data.title
            }));
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    // @ts-ignore
    if (!auth?.user?.user_role?.title || auth?.user?.user_role?.title === 'SUPER_ADMIN' || auth?.user?.user_role?.title === 'ASSIST_SUPER_ADMIN') return;

    const tempMenu = [];
    for (const i of menuItems[0]?.items) {
      if (i.items) {
        for (const j of i.items) {
          j.link &&
            tempMenu.push({
              label: j.name,
              value: j.link
            });
        }
      } else {
        tempMenu.push({
          label: i.name,
          value: i.link
        });
      }
    }

    setMenulist(tempMenu);

    handleFetchAcademicYear();
    handleFetchHighestStudentId();

  }, [auth?.user]);

  useEffect(() => {
    if (selectedAcademicYear) {
      setAcademicYear(selectedAcademicYear);
    }
  }, [selectedAcademicYear]);

  const handleAcademicYearChange = async (event: any, newValue: { id: number; label: string } | null) => {
    if (!newValue?.id && !newValue?.label) return showNotification('academic year values not found', 'error');
    axios
      .patch(`/api/academic_years/${newValue.id}/current_user`)
      .then(({ data }) => {
        if (!data?.success) return;
        // localStorage.setItem('academicYear', JSON.stringify(newValue));
        setSelectedAcademicYear(newValue);
      })
      .catch((error) => {
        showNotification('failed to change academic year', 'error');
      });
  };
  // const permissionsArray = auth?.user?.permissions?.length > 0
  //   ? auth?.user?.permissions?.map((permission: any) => permission.group)
  //   : [];

  const permissionsArray_ = auth?.user?.permissions?.length > 0 ? auth?.user?.permissions?.map((permission: any) => permission.value) : [];
  return (
    <HeaderWrapper
      display="flex"
      alignItems="center"
      sx={{
        // boxShadow: "-1px 15px 48px 0px rgba(0,40,132,1)"
        boxShadow: '-2px 8px 21px -4px rgba(0,40,132,0.7)',
        ...(drawerOpen && {
          paddingLeft: (theme) => ({ xs: 1, lg: theme.sidebar.width })
        })
      }}
    >
      {
        // auth?.user?.role?.title !== 'SUPER_ADMIN' && auth?.user?.role?.title !== 'ASSIST_SUPER_ADMIN' ?
        //   selectModule &&
        //   (
        //     drawerOpen ?
        //       <Tooltip title={t('Hide Navbar')} arrow sx={{ px: 1, display: { xs: "none", lg: "block" } }} onClick={handleDrawerClose} >
        //         <Grid >
        //           <NavIcon fillColor={"white"} style={{ cursor: "pointer" }} />
        //         </Grid>
        //       </Tooltip>
        //       :
        //       <Tooltip title={t('Show Navbar')} arrow sx={{ pr: 1, display: { xs: "none", lg: "block" } }} onClick={handleDrawerOpen}  >
        //         <Grid   >
        //           <NavIcon fillColor={"white"} style={{ cursor: "pointer", rotate: '180deg' }} />
        //         </Grid>
        //       </Tooltip>
        //   )
        //   :
        drawerOpen ? (
          <Tooltip title={t('Hide Navbar')} arrow sx={{ px: 1, display: { xs: 'none', lg: 'block' } }} onClick={handleDrawerClose}>
            <Grid>
              <NavIcon fillColor={'white'} style={{ cursor: 'pointer' }} />
            </Grid>
          </Tooltip>
        ) : (
          <Tooltip title={t('Show Navbar')} arrow sx={{ pr: 1, display: { xs: 'none', lg: 'block' } }} onClick={handleDrawerOpen}>
            <Grid>
              <NavIcon fillColor={'white'} style={{ cursor: 'pointer', rotate: '180deg' }} />
            </Grid>
          </Tooltip>
        )
      }

      {/* @ts-ignore */}
      {auth?.user?.role?.title !== 'SUPER_ADMIN' && auth?.user?.role?.title !== 'ASSIST_SUPER_ADMIN' && (
        <Box
          sx={{
            display: { xs: 'none', sm: 'block' },
            minWidth: 'fit-content',
            backgroundColor: 'white',
            textAlign: 'center',
            py: 0.5,
            px: 1,
            mx: 1,
            borderRadius: 0.4,
            fontWeight: 600,
            fontSize: 12
          }}
        >
          Customer Support <br />
          <a href="tel:+8801894884114" style={{ borderBottom: '1px solid white' }}>
            +880 1894 884 114
          </a>
        </Box>
      )}

      {auth?.user?.role?.title !== 'SUPER_ADMIN' && auth?.user?.role?.title !== 'ASSIST_SUPER_ADMIN' && (
        <Grid sx={{ width: 200, p: 1 }}>
          <InputLabel sx={{ color: 'white', fontSize: 12 }}>Select Module:</InputLabel>
          <Select
            value={selectModule}
            size="small"
            onChange={(e) => {
              handleChangeModule(e.target.value);
              // router.push(`/dashboards/modules/admin`);
              if (auth?.user?.role?.title === 'ADMIN') return router.push(`/dashboards/modules/admin`);
              if (auth?.user?.role?.title === 'TEACHER') return router.push(`/dashboards/modules/teacher`);
              if (auth?.user?.role?.title === 'STUDENT') return router.push(`/dashboards/modules/student`);
            }}
            sx={{
              minWidth: '100%',
              color: 'white',
              textTransform: 'capitalize',
              '& fieldset': {
                borderRadius: '3px',
                color: 'white'
                // backgroundColor:"white",
                // color:'black'
              },
              '&  .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white'
              },
              '& .MuiSvgIcon-root': {
                color: 'white'
              },
              ':hover': {
                '&  .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white'
                },
                '& .MuiSvgIcon-root': {
                  color: 'white'
                }
              },
              ':active': {
                '&  .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white'
                },
                '& .MuiSvgIcon-root': {
                  color: 'white'
                }
              }
            }}
          >
            {auth?.user?.role?.title === 'ADMIN' &&
              adminModulesList.map((module, index) => (
                <MenuItem key={index} value={module} sx={{ textTransform: 'capitalize' }}>
                  {module.split('_').join(' ')}
                </MenuItem>
              ))}
            {auth?.user?.role?.title === 'BRANCH_ADMIN' &&
              branchAdminModulesList.map((module, index) => (
                <MenuItem key={index} value={module} sx={{ textTransform: 'capitalize' }}>
                  {module.split('_').join(' ')}
                </MenuItem>
              ))}
            {auth?.user?.role?.title === 'TEACHER' &&
              teacherModulesList.map((module, index) => (
                <MenuItem key={index} value={module}>
                  {module.split('_').join(' ')}
                </MenuItem>
              ))}
            {auth?.user?.role?.title === 'STUDENT' &&
              studentModulesList.map((module, index) => (
                <MenuItem key={index} value={module}>
                  {module.split('_').join(' ')}
                </MenuItem>
              ))}
          </Select>
        </Grid>
      )}

      {
        auth?.user?.role?.title === 'ADMIN' &&
        <Grid sx={{ width: 200, p: 1, ml: 1, border: "1px solid white" }}>
          <InputLabel sx={{ color: 'white', fontSize: 12, fontWeight: 600 }}>Last Student ID: {highestStudentId}</InputLabel>
        </Grid>
      }
      {/* @ts-ignore */}
      {/* {auth?.user?.role?.title !== 'SUPER_ADMIN' && auth?.user?.role?.title !== 'ASSIST_SUPER_ADMIN' &&
        (
          <Grid minWidth={185} sx={{ display: { sm: "block", sm: "none" } }}>
            <Grid sx={{ color: "#FFFFFF", textAlign: "center", fontSize: 12 }}>Academic Year</Grid>
            <CustomAutoCompleteWrapper
              // label="Academic Year"  
              label=""
              placeholder="select a academic year..."
              value={selectedAcademicYear}
              options={academicYearList}
              handleChange={handleAcademicYearChange}
            />
          </Grid>
        )} */}

      <Box display="flex" alignItems="center" justifyContent="right" width="100%" columnGap={2}>
        {/* @ts-ignore */}
        {/* old code  */}
        {/* {auth?.user?.role?.title !== 'SUPER_ADMIN' && auth?.user?.role?.title !== 'ASSIST_SUPER_ADMIN' && (
          <Grid
            item
            pr={2}
            color="white"
            fontSize={12}
            fontWeight={800}
            border={1}
            borderRadius={0.7}
            p={1}
            sx={{
              borderStyle: 'dashed',
              display: { xs: 'none', md: 'block' }
            }}
          >
            Current Active
            <br />
            {`Academic Year: `}
            <span style={{ color: 'white' }}>
              <i>
                {current_active_academic_year?.success ? current_active_academic_year?.data?.title : <span style={{ color: 'red' }}>not found</span>}
              </i>
            </span>
          </Grid>
        )} */}

        {/* updated code */}
        <Grid sx={{ display: { xs: 'none', md: 'block' } }}>
          {user?.role?.title !== 'SUPER_ADMIN' && user?.role?.title !== 'ASSIST_SUPER_ADMIN' && (
            <Grid sx={{ pr: 2 }}>
              {/* <Grid sx={{ color: (theme) => theme.colors.alpha.white[70], fontWeight: 700, fontSize: 12 }}>Academic Year: </Grid> */}
              <Grid sx={{ color: 'white', opacity: 0.9, fontWeight: 700, fontSize: 12 }}>Academic Year: </Grid>

              <CustomAutoCompleteWrapper
                // label="Academic Year"
                label="Academic Year"
                placeholder="select a academic year..."
                value={selectedAcademicYear}
                options={academicYearList}
                handleChange={handleAcademicYearChange}
              />
            </Grid>
          )}
        </Grid>

        {/* @ts-ignore */}
        {/* {auth?.user?.role?.title !== 'SUPER_ADMIN' &&
          auth?.user?.role?.title !== 'ASSIST_SUPER_ADMIN' && (
            <Grid
              minWidth={150}
              sx={{ pr: 2, display: { xs: 'none', md: 'block' } }}
            >
              <Grid
                sx={{ color: '#FFFFFF', textAlign: 'center', fontSize: 12 }}
              >
                Academic Year
              </Grid>
              <CustomAutoCompleteWrapper
                // label="Academic Year"
                label=""
                placeholder="select a academic year..."
                value={selectedAcademicYear}
                options={academicYearList}
                handleChange={handleAcademicYearChange}
              />
            </Grid>
          )} */}

        {permissionsArray_.includes('show_students') && <HeaderSearch />}
        {/* <HeaderButtons /> */}
        <HeaderUserbox
          selectedAcademicYear={selectedAcademicYear}
          academicYearList={academicYearList}
          handleAcademicYearChange={handleAcademicYearChange}
          current_active_academic_year={current_active_academic_year}
        />

        <Box
          component="span"
          sx={{
            // m: 2,
            display: { lg: 'none', xs: 'inline-block' }
          }}
        >
          <Tooltip arrow title="Show Menu" onClick={toggleSidebar}>
            <IconButton sx={{ color: '#FFFFFF', border: '2px solid #FFFFFF' }}>
              {!sidebarToggle ? <MenuTwoToneIcon fontSize="small" /> : <CloseTwoToneIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </HeaderWrapper>
  );
}

export default Header;

export const CustomAutoCompleteWrapper = ({ minWidth = null, required = false, options, value, handleChange, label, placeholder, ...params }) => {
  return (
    <Grid
      item
      pb={1}
      sx={
        minWidth && {
          minWidth
        }
      }
    >
      <Autocomplete
        fullWidth
        {...params}
        size="small"
        sx={{
          fontSize: '14px',
          color: '#002884',
          [`& fieldset`]: {
            color: '#002884',
            borderRadius: 0.4
            // backgroundColor: "#FFFFFF",
            // border:"2px solid #FFFFFF",
            // ":hover":  {border:"2px solid #FFFFFF"},
          }
        }}
        id="tags-outlined"
        options={options}
        value={value}
        filterSelectedOptions
        renderInput={(rnParams) => (
          <div ref={rnParams.InputProps.ref}>
            <input type="text" {...rnParams.inputProps} style={{ borderRadius: '4px', padding: '4px', maxWidth: '200px' }} />
          </div>
        )}
        onChange={handleChange}
      />
    </Grid>
  );
};
