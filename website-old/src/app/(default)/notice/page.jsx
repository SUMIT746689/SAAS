import Notice from "@/components/NoticeContent";

import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';
import { redirect } from "next/navigation";


export default async function Home(props) {

  const headersList = headers();
  const domain = headersList.get('host')



  // const school_info = await prisma.school.findFirst({
  //   where: {
  //     domain:  domain
  //   },
  //   select: {

  //   }
  // })
  const notice = await prisma.notice.findMany({
    where: {
      school: {
        domain: domain
      }
    },
    select: {
      title: true,
      headLine: true,
      file_url: true
    }
  })

  return (
    <div>
      <Notice serverHost={`${process.env.SERVER_HOST}`} notice={notice || []} />
    </div>
  )



}
