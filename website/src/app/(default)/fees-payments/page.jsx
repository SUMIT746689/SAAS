import React from 'react';
import FeesPament from '@/components/FeesPayment'
import { headers } from 'next/headers';
import prisma from '@/lib/prisma_client';

const page = async () => {
    const headersList = headers();
    const domain = headersList.get('host');

    const school_info = await prisma.payment_gateway_credential.findMany({
        where: {
            school: {
                domain: domain
            }
        },
        select: {
            title: true,
            is_active: true
        }
    });

    const bkashActivationInfo = school_info.find(school => school?.title === "bkash");
    const serverHost = process.env.SERVER_HOST;
    
    return (
        <>
            <FeesPament bkashActivationInfo={bkashActivationInfo} serverHost={serverHost} />
        </>
    )
};

export default page;