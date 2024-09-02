import React from 'react';
import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';
import DynamicPage from '@/new_components/DynamicPage/DynamicPage'

const page = async ({ params }) => {
    const headersList = headers();
    const domain = headersList.get('host');
    const dynamicPageId = parseInt(params.id);

    if (Number.isNaN(dynamicPageId)) return <> Invalid value </>

    const resDynamicPageDatas = await prisma.websiteDynamicPage.findFirst({ where: { id: dynamicPageId, school: { domain }, status: "publish" } });
    const serverHost = process.env.SERVER_HOST;
    return (
        <>
            {resDynamicPageDatas ?
                <DynamicPage datas={resDynamicPageDatas} serverHost={serverHost} />
                : ''
            }
        </>
    )
};

export default page;