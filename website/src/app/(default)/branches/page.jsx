import prisma from '@/lib/prisma_client';
import Branches from '@/components/Branches';
import { headers } from 'next/headers';

export default async function Branch() {
  const headersList = headers();
  const domain = headersList.get('host');

  const schoolData = await prisma.school.findFirst({
    where: { domain },
    select: {
      name: true,
      School: {
        select: {
          name: true,
          phone: true,
          optional_phone: true,
          map_location: true,
          domain:true
        },
      },
    },
  });

  const branches = schoolData?.School || [];

  return (
    <div>
      <Branches
        branches={branches}
        serverHost={`${process.env.SERVER_HOST}` || ''}
      />
    </div>
  );
}
