import HomeContent from '@/components/HomeContent';

import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const headersList = headers();
  const domain = headersList.get('host');

  const school_info = await prisma.websiteUi.findFirst({
    where: {
      school: {
        domain: domain
      }
    }
  });
  const notice = await prisma.notice.findMany({
    where: {
      school: {
        domain: domain
      }
    },
    select: {
      title: true,
      headLine: true
    },
    orderBy: {
      created_at: 'desc'
    }
  });
  const speechDatas = [
    {
      title: 'প্রতিষ্ঠানের ইতিহাস',
      image: `${
        process.env.SERVER_HOST
      }/api/get_file/${school_info?.history_photo?.replace(/\\/g, '/')}`,
      description: school_info?.school_history
    },
    {
      title: 'সভাপতির বাণী',
      image: `${
        process.env.SERVER_HOST
      }/api/get_file/${school_info?.chairman_photo?.replace(/\\/g, '/')}`,
      description: school_info?.chairman_speech
    },
    {
      title: 'অধ্যক্ষের বাণী',
      image: `${
        process.env.SERVER_HOST
      }/api/get_file/${school_info?.principal_photo?.replace(/\\/g, '/')}`,
      description: school_info?.principal_speech
    }
  ];

  const carousel_image = school_info?.carousel_image?.map((i) => ({
    path: `${process.env.SERVER_HOST}/api/get_file/${i?.path?.replace(
      /\\/g,
      '/'
    )}`
  }));

  return (
    <div>
      <HomeContent
        latest_news={notice || []}
        carousel_image={carousel_image || []}
        speechDatas={speechDatas || []}
        facebook_link={school_info?.facebook_link || ''}
        school_info={school_info}
      />
    </div>
  );
}
