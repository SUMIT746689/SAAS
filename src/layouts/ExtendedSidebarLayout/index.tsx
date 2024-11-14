import { FC, ReactNode } from 'react';
// import { Box, alpha, lighten, useTheme } from '@mui/material';
import ThemeSettings from 'src/components/ThemeSettings';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import Header from './Header';
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { ModuleContext } from '@/contexts/ModuleContext';

const drawerWidth = 290;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  // padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.up('xs')]: {
    marginLeft: 0,
  },
  [theme.breakpoints.up('lg')]: {
    marginLeft: `-${drawerWidth}px`,
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.up('lg')]: {
      marginLeft: 0,
    },
    // marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

interface ExtendedSidebarLayoutProps {
  children?: ReactNode;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const ExtendedSidebarLayout: FC<ExtendedSidebarLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const { selectModule } = React.useContext(ModuleContext)

  const handleDrawerOpen = () => {
    setOpen(true);
    window.localStorage.setItem('drawer', String(true));
  };

  const handleDrawerClose = () => {
    setOpen(false);
    window.localStorage.setItem('drawer', String(false));
  };
  React.useEffect(() => {
    const curDrawer = window.localStorage.getItem('drawer') || '';

    if (curDrawer) setOpen(curDrawer === 'true' ? true : false)

  }, [selectModule]);


  // const handleChangeModule = (event) => {
  //   const value = event.target.value
  //   setSelectModule(value);
  //   window.localStorage.setItem('moduleName', value);
  // }


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        {/* <Toolbar>
          <NavIcon
            fillColor="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          <Typography variant="h6" noWrap component="div">
            Persistent drawer
          </Typography>
        </Toolbar> */}
        <Header drawerOpen={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
      </AppBar>
      <Drawer
        sx={{
          display: { xs: "none", lg: "block" },
          width: theme => theme.sidebar.width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: theme => theme.sidebar.width,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        {/* <Header drawerOpen={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} /> */}
        <Sidebar />
      </Drawer>
      <Main open={open}>
        <Box
          sx={{
            position: 'relative',
            zIndex: 10,
            display: 'block',
            flex: 1,
            p: 0,
            pt: `${theme.header.height}`,
            // [theme.breakpoints.up('lg')]: {
            //   ml: `${theme.sidebar.width}`
            // },
            background: theme.colors.primary.lighter
          }}
        >
          <Box display="block" >{children}</Box>
          <ThemeSettings />
        </Box>
      </Main>
    </Box >
  );
}

ExtendedSidebarLayout.propTypes = {
  children: PropTypes.node
};

export default ExtendedSidebarLayout;
