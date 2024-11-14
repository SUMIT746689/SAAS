import { useContext } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import { Box, Drawer, alpha, styled, Divider, useTheme, lighten, darken, Grid } from '@mui/material';

import SidebarTopSection from './SidebarTopSection';
import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';
import Logo from 'src/components/LogoSign';

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 61px;
`
);

function Sidebar() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();
  return (
    <>
      {/* for desktop device */}
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          position: 'fixed',
          left: 0,
          top: 0,
          background: theme.colors.primary.dark,
          // background:"#212c6f",
          boxShadow:
            // theme.palette.mode === 'dark' ? 
            theme.sidebar.boxShadow
          //  : 'none'
        }}
      >
        <Scrollbar>
          {/* top section */}
          <Grid container mt={3}>
            <Box
              sx={{
                ml: 10,
                width: 52,
              }}
            >
              <Logo />
            </Box>
          </Grid>
          <Divider
            sx={{
              my: theme.spacing(3),
              mx: theme.spacing(2),
              background: theme.colors.alpha.trueWhite[10]
            }}
          />
          {/* <SidebarTopSection />
          <Divider
            sx={{
              my: theme.spacing(3),
              mx: theme.spacing(2),
              background: theme.colors.alpha.trueWhite[10]
            }}
          /> */}
          {/* mid section */}
          <SidebarMenu />
        </Scrollbar>
        <Divider
          sx={{
            background: theme.colors.alpha.trueWhite[10]
          }}
        />
        {/* bottom section */}
        <SidebarFooter />
      </SidebarWrapper>

      {/* for mobile device */}
      {/* <div className=' md:hidden z-[1000] drop-shadow-md bg-sky-500 blur opacity-40 absolute w-full min-h-screen h-full overflow-hidden '> </div> */}
      <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
      // elevation={1}
      >
        <SidebarWrapper
          sx={{
            background: theme.colors.primary.dark,
          }}
        >
          <Scrollbar>
            <Box mt={3}>
              <Box
                mx={2}
                sx={{
                  ml: 10,
                  width: 52
                }}
              >
                <Logo />
              </Box>
            </Box>
            <Divider
              sx={{
                my: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
            {/* <SidebarTopSection /> */}
            {/* <Divider
              sx={{
                mt: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            /> */}
            <SidebarMenu />
          </Scrollbar>
          <SidebarFooter />
        </SidebarWrapper>
      </Drawer>
    </>
  );
}

export default Sidebar;
