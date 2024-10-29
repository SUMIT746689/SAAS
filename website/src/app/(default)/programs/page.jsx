import prisma from '@/lib/prisma_client';
import Programs from './programs';
import { headers } from 'next/headers';

export default async function Program() {
  const headersList = headers();
  const domain = headersList.get('host');

  const programsData = await prisma.program.findMany({
    where: { 
        school: {
            domain
        } 
    },
    select: {
      title:true,
      body: true,
      banner_photo: true
    },
  });

  const programs = programsData || [];

  return (
    <div>
      <Programs
        programs={programs}
        serverHost={`${process.env.SERVER_HOST}` || ''}
      />
    </div>
  );
}
