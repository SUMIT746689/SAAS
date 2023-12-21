import prisma from '../../../../src/lib/prisma_client';
import { headers } from 'next/headers';
import OnlineAdmission from "../../components/OnlineAdmission";


export default async function Admission() {

    const headersList = headers();
    const domain = headersList.get('host')

    const classes = await prisma.class.findMany({
        where: {
            school: {
                domain: domain
            }
        },
        include: {
            sections: {
                select: {
                    id: true,
                    name: true
                }
            },
            Group: true
        }
    })

    const academicYear = await prisma.academicYear.findMany({
        where: { school: { domain: domain }, deleted_at: null }
    });

    const studentAdmissionForm = await prisma.studentAdmissionForm.findFirst({
        where: {
            school: { domain }
        },
        include: {
            school: { select: { name: true, address: true, websiteui: { select: { header_image: true } } } },
        }
    });

    // console.log({ studentAdmissionForm })
    return (
        <div>
            <OnlineAdmission
                classes={classes || []}
                academicYears={academicYear || []}
                serverHost={`${process.env.SERVER_HOST}`}
                studentAdmissionForm={studentAdmissionForm}
            />
        </div>
    )



}
