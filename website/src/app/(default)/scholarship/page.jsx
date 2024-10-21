import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';
import ScholarshipMain from "@/components/scholarship/ScholarshipMain";

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
            websiteui: { select: { header_image: true,  scholarshipClasses:true} }
        }
    })
    
    // const serverHost = JSON.stringify(process.env.SERVER_HOST);
    
    return (
        <div>

            <ScholarshipMain
                classes=
                {
                    resSchool?.websiteui[0]?.scholarshipClasses?.map((cls) => ({id: cls?.id,label: cls?.name})) || []
                }
                academicYears={academicYear || []}
                serverHost={`${process.env.SERVER_HOST}` || ''}
                studentAdmissionForm={studentAdmissionForm}
                school={resSchool}
            />
        </div>
    )



}
