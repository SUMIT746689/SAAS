
import React from 'react';
import Gallery from "@/components/GalleryContent";
import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';

const page = async () => {
    const headersList = headers();
    const domain = headersList.get('host')

    const school_info = await prisma.websiteUi.findFirst({
        where: {
            school: {
                domain: domain
            }
        },
        select: {
            gallery: true
        }
    })
    const gallery = school_info?.gallery?.map(i => ({
        path: `${process.env.SERVER_HOST}/api/get_file/${i?.url?.replace(/\\/g, '/')}`
    }))

    return (
        <Gallery gallery={gallery || []} />
    );
};

export default page;