import Head from 'next/head';
import '../globals.css';
// import Footer from '@/layout/Footer';
// import Header from '@/layout/Header';
// import LayoutWrapper from '@/layout/LayoutWrapper';
// import Nav from '@/layout/Nav';
import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';
import SchoolNotFound from '@/components/SchoolNotFound'
import React from 'react';
import Navbar from '@/new_components/Navbar/Navbar';
import Footer from '@/new_components/Footer/Footer';
import { LanguageContextProvider } from '../context/language';

export default async function RootLayout({ children }) {

  try {
    const headersList = headers();
    const domain = headersList.get('host')

    const school_info = await prisma.websiteUi.findFirst({
      where: {
        school: {
          domain: domain
        }
      },
      select: {
        school: {
          select: {
            name: true,
            address: true,
            email: true,
            phone: true

          }
        },
        is_scholarship_active:true,
        header_image: true,
        eiin_number: true,
        facebook_link: true,
        twitter_link: true,
        google_link: true,
        linkedin_link: true,
        youtube_link: true,
      }
    })
    console.log({school_info})
    // console.log({ domain })

    const navarDatas = {
      is_scholarship_active:school_info?.is_scholarship_active,
      name: school_info?.school?.name,
      phone: school_info?.school?.phone,
      email: school_info?.school?.email,
      address: school_info?.school?.address,
      eiin_number: school_info?.eiin_number,
      header_image: `${process.env.SERVER_HOST}/api/get_file/${school_info?.header_image?.replace(/\\/g, '/')}`,
      serverHost: `${process.env.SERVER_HOST}`
    }
    
    const resMenus = await prisma.websiteMenu.findMany({
      where: { school: { domain }, status: "publish" }, include: {
        websiteDynamicPage: {
          select: {
            id: true
          }
        }
      }
    });

    // console.log({resMenus})

    return (
      school_info ?
        <html lang="en">
          <Head>
            <title>Home</title>
          </Head>
          <body >

            <LanguageContextProvider>
              <Navbar datas={navarDatas} menus={resMenus}></Navbar>
              {children}
              <Footer />
            </LanguageContextProvider>
            {/* <LayoutWrapper> */}
            {/* <div className=' px-4'>
              <Header
                name={school_info?.school?.name}
                phone={school_info?.school?.phone}
                address={school_info?.school?.address}
                eiin_number={school_info?.eiin_number}
                header_image={`${process.env.SERVER_HOST}/api/get_file/${school_info?.header_image?.replace(/\\/g, '/')}`}
                serverhost={`${process.env.SERVER_HOST}`}
              />
              <Nav serverhost={`${process.env.SERVER_HOST}`} /> */}
            {/* <LanguageContext.Provider value={{ language, handleChangeLang }}> */}

            {/* </LanguageContext.Provider> */}

            {/* </div> */}

            {/* </LayoutWrapper> */}
            {/* <Footer
              facebook_link={school_info?.facebook_link || ''}
              twitter_link={school_info?.twitter_link || ''}
              google_link={school_info?.google_link || ''}
              linkedin_link={school_info?.linkedin_link || ''}
              youtube_link={school_info?.youtube_link || ''}
            /> */}
          </body>
        </html>
        :
        <SchoolNotFound />
    );
  }
  catch (err) {
    console.log({ "error message": err.message })
    return <>{err.message}</>
  }
}
