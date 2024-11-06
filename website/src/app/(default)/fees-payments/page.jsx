import React from 'react';
import FeesPament from '@/components/FeesPayment'
import { headers } from 'next/headers';
import prisma from '@/lib/prisma_client';
import NotificationProvider from '@/components/NotificationProvider';

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
            is_active: true,
        }
    });

    const resSchoolAndBranches = await prisma.school.findFirst({
        where: {
            domain: domain
        },
        select: {
            id: true,
            name: true,
            School: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    const allBranches = [{ label: resSchoolAndBranches.name, id: resSchoolAndBranches.id, isAdmin: true, }]
    resSchoolAndBranches.School?.forEach(branch_school => {
        allBranches.push({
            label: branch_school.name,
            id: branch_school.id,
            isAdmin: false
        }) 
    });

    const bkashActivationInfo = school_info.find(school => school?.title === "bkash");
    const serverHost = process.env.SERVER_HOST;

    return (
        <>
            <NotificationProvider>
                <FeesPament allBranches={allBranches} bkashActivationInfo={bkashActivationInfo} serverHost={serverHost} />
            </NotificationProvider>
        </>
    )
};

export default page;