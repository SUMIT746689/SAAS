import React from 'react';
import FeesPament from '@/components/FeesPayment'

const page = () => {
    const serverHost = process.env.SERVER_HOST;

    return (
        <>
            <FeesPament serverHost={serverHost} />
        </>
    )
};

export default page;