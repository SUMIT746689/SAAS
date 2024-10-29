import HomeContent from '@/components/HomeContent';
import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';
import Banner from '@/new_components/Banner/Banner';
import MessageLists from '@/new_components/Message/MessageLists';
import About from '@/new_components/About/About';
import Gallery from '@/new_components/Gallery/Gallery';
import VideoGallary from '@/new_components/VideoGallary/VideoGallary';
import ImportantLink from '@/new_components/ImportantLink/ImportantLink'

export default async function Home() {
  const headersList = headers();
  const domain = headersList.get('host');
  const school_info = await prisma.websiteUi.findFirst({
    where: {
      school: {
        domain: domain
      }
    },
    // select: {
    //   english_chairman_name: true,
    //   bangla_chairman_name: true,
    //   english_chairman_role_name: true,
    //   bangla_chairman_role_name: true,
    //   english_principal_name: true,
    //   bangla_principal_name: true,
    //   english_principal_role_name: true,
    //   bangla_principal_role_name: true,
    //   english_assist_principal_name: true,
    //   bangla_assist_principal_name: true,
    //   english_assist_principal_name: true,
    //   bangla_assist_principal_name: true,
    //   english_assist_principal_role_name: true,
    //   bangla_assist_principal_role_name: true,
    //   chairman_photo: true,
    //   principal_photo: true,
    //   assist_principal_photo: true,
    //   english_chairman_speech: true,
    //   bangla_chairman_speech: true,
    //   english_principal_speech: true,
    //   bangla_principal_speech: true,
    //   english_assist_principal_speech: true,
    //   bangla_assist_principal_speech: true
    // }
  });

  const notices = await prisma.notice.findMany({
    where: {
      school: {
        domain: domain
      }
    },
    select: {
      id: true,
      title: true,
      headLine: true,
      file_url: true,
      created_at: true,
    },
    orderBy: {
      created_at: 'desc'
    }
  });


  const speechDatas = [
    {
      english_title: school_info.english_chairman_role_name,
      bangla_title: school_info.bangla_chairman_role_name,
      english_name: school_info?.english_chairman_name,
      bangla_name: school_info?.bangla_chairman_name,
      image: school_info?.chairman_photo ?
        `${process.env.SERVER_HOST}/api/get_file/${school_info?.chairman_photo?.replace(/\\/g, '/')}`
        :
        '/dummy_man.png'
      ,
      english_description: school_info?.english_chairman_speech,
      bangla_description: school_info?.bangla_chairman_speech

    },
    {
      english_title: school_info.english_principal_role_name,
      bangla_title: school_info.bangla_principal_role_name,
      english_name: school_info?.english_principal_name,
      bangla_name: school_info?.bangla_principal_name,
      image: school_info?.principal_photo ?
        `${process.env.SERVER_HOST}/api/get_file/${school_info?.principal_photo?.replace(/\\/g, '/')}`
        :
        '/dummy_man.png'
      ,
      english_description: school_info?.english_principal_speech,
      bangla_description: school_info?.bangla_principal_speech

    },
    {
      english_title: school_info?.english_assist_principal_role_name,
      bangla_title: school_info.bangla_assist_principal_role_name,
      english_name: school_info?.english_assist_principal_name,
      bangla_name: school_info?.bangla_assist_principal_name,
      image: school_info?.assist_principal_photo ?
        `${process.env.SERVER_HOST}/api/get_file/${school_info?.assist_principal_photo?.replace(/\\/g, '/')}`
        :
        '/dummy_man.png'
      ,
      english_description: school_info?.english_assist_principal_speech,
      bangla_description: school_info?.bangla_assist_principal_speech

    }
  ];

  const aboutSchool = {
    english_title: 'About School',
    bangla_title: 'বিদ্যালয়ের সম্পর্কে',
    image: school_info?.about_school_photo ?
      `${process.env.SERVER_HOST}/api/get_file/${school_info?.about_school_photo?.replace(/\\/g, '/')}`
      :
      '/aboutImage.jpg'
    ,
    english_description: school_info?.english_about_school_desc,
    bangla_description: school_info?.bangla_about_school_desc

  };

  const carouselImages = school_info?.carousel_image?.map((i) => ({
    path: `${process.env.SERVER_HOST}/api/get_file/${i?.path?.replace(
      /\\/g,
      '/'
    )}`
  }));

  const gallaryImages = school_info?.gallery?.map((gallery) => ({
    ...gallery,
    url: `${process.env.SERVER_HOST}/api/get_file/${gallery?.url?.replace(/\\/g, '/')}`
  }));

  const serverHost = process.env.SERVER_HOST;
  return (
    <>
      <Banner carouselImages={carouselImages} serverHost={serverHost} notices={notices} />
      <MessageLists speechDatas={speechDatas} />
      <About aboutSchool={aboutSchool} />
      <Gallery images={gallaryImages} />
      <VideoGallary video_gallary={school_info?.video_gallery || []} />
      <ImportantLink school_info={school_info} />
      {/* <ImageSlider carousel_image={gallaryImages} /> */}
      {/* <div>
        <HomeContent
          latest_news={notices || []}
          carousel_image={carousel_image || []}
          speechDatas={speechDatas || []}
          facebook_link={school_info?.facebook_link || ''}
          school_info={school_info}
        />
      </div> 
      */}

    </>
  );
}
