import { Authenticated } from '@/components/Authenticated';
import Footer from '@/components/Footer';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageHeader from '@/content/SmsGateways/PageHeader';
import Results from '@/content/SmsGateways/Results';
import { useClientFetch } from '@/hooks/useClientFetch';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Grid } from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';

const SmsGateways = () => {

    const [editData, setEditData] = useState<any>(null);
    const { data, reFetchData } = useClientFetch('/api/sms_gateways?is_active=true');
    const { data: schools } = useClientFetch('/api/school/search_schools');
    console.log({ data, schools })
    // console.log({ data })
    return (
        <>
            <Head>
                <title>Sms Gateways - Management</title>
            </Head>
            <PageTitleWrapper>
                {/* @ts-ignore */}
                <PageHeader
                    // name="All Sms Gateways"
                    schools={schools ? schools.map(school => ({ id: school.id, label: school.name })) : []}
                    editData={editData}
                    seteditData={setEditData}
                    reFetchData={reFetchData}
                />
            </PageTitleWrapper>

            <Grid
                sx={{ px: 4 }}
                container
                direction="row"
                justifyContent="center"
                alignItems="stretch"
                spacing={3}
            >
                <Grid item xs={12}>
                    <Results sessions={data?.success ? data.data : []} setEditData={setEditData} reFetchData={reFetchData} />
                </Grid>
            </Grid>
            <Footer />
        </>
    );
};

SmsGateways.getLayout = (page) => {
    return (
        <Authenticated requiredPermissions={['add_all_sms_gateways']}>
            <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
        </Authenticated>
    );
};

export default SmsGateways;