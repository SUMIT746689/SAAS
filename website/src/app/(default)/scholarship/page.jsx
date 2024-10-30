import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';
import Scholarship from "@/components/scholarship/Scholarship";
import NotificationProvider from '@/components/NotificationProvider';

export default async function Scholar() {

    const headersList = headers();
    const domain = headersList.get('host')

    const academicYear = await prisma.academicYear.findMany({
        where: { school: { domain: domain }, deleted_at: null }
    });

    const studentAdmissionForm = await prisma.studentAdmissionForm.findFirst({
        where: {
            school: { domain }
        }
    });

    const resSchool = await prisma.school.findFirst({
        where: { domain },
        select: {
            name: true,
            address: true,
            websiteui: {
                select: {
                    form_fill_up_rules_and_regulation: true,
                    admit_card_rules_and_regulation: true,
                    header_image: true,
                    scholarshipClasses: { include: { sections: true } }
                }
            }
        }

    })

    // const serverHost = JSON.stringify(process.env.SERVER_HOST);

    return (
        <NotificationProvider>
            <Scholarship
                classes=
                {
                    resSchool?.websiteui[0]?.scholarshipClasses?.map((cls) => ({ id: cls?.id, label: cls?.name, sections: cls.sections })) || []
                }
                academicYears={academicYear || []}
                serverHost={`${process.env.SERVER_HOST}` || ''}
                studentAdmissionForm={studentAdmissionForm}
                school={resSchool}
            />
        </NotificationProvider>
    )



}
