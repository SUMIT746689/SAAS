import { ReactElement, ReactNode, useState } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
import ThemeProvider from 'src/theme/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from 'src/createEmotionCache';
import { appWithTranslation } from 'next-i18next';
import { SidebarProvider } from 'src/contexts/SidebarContext';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from 'src/store';
import Loader from 'src/components/Loader';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useScrollTop from 'src/hooks/useScrollTop';
import { SnackbarProvider } from 'notistack';
import { AuthConsumer, AuthProvider } from 'src/contexts/JWTAuthContext';
import "styles/globals.css";
import { AcademicYearContext, Students } from '@/contexts/UtilsContextUse';
import '@fullcalendar/common/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'
import { ModuleProvider } from '@/contexts/ModuleContext';
// import { headers } from 'next/headers';

const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface TokyoAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

export async function getServerSideProps(context: any) {
  // console.log({ context: context })
  const { req, query, res, asPath, pathname } = context;
  if (req) {
    let host = req.headers.host // will give you localhost:3000
    console.log({ host })
  }
  // console.log({ req })
  //   console.log({ host })
  let blockCount: any = { holidays: [] };
  try {
    // const headersList = headers();
    // const domain = headersList.get('host')
  }
  catch (err) {
    console.log({ err })
  }

  const parseJson = JSON.parse(JSON.stringify(blockCount));

  return { props: { blockCount: parseJson } }
}

function TokyoApp(props: TokyoAppProps) {
  // console.log({ props })
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
  useScrollTop();

  const [academicYear, setAcademicYear] = useState({});
  const [students, setStudents] = useState({});

  Router.events.on('routeChangeStart', nProgress.start);
  Router.events.on('routeChangeError', nProgress.done);
  Router.events.on('routeChangeComplete', nProgress.done);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Home Page</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      <ReduxProvider store={store}>
        <ModuleProvider>
          <SidebarProvider>
            <ThemeProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AuthProvider>
                  <AcademicYearContext.Provider value={[academicYear, setAcademicYear]}>
                    <Students.Provider value={[students, setStudents]}>
                      <SnackbarProvider
                        maxSnack={6}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right'
                        }}
                      >
                        <CssBaseline />
                        <AuthConsumer>
                          {(auth) =>
                            !auth.isInitialized ? (
                              <Loader />
                            ) : (
                              getLayout(<Component {...pageProps} />)
                            )
                          }
                        </AuthConsumer>
                      </SnackbarProvider>
                    </Students.Provider>

                  </AcademicYearContext.Provider>
                </AuthProvider>
              </LocalizationProvider>
            </ThemeProvider>
          </SidebarProvider>
        </ModuleProvider>
      </ReduxProvider>
    </CacheProvider>
  );
}

export default appWithTranslation(TokyoApp);
