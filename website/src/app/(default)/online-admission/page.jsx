import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';
import OnlineAdmission from "@/components/OnlineAdmission";
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
        }
    });

    const resSchool = await prisma.school.findFirst({
        where: { domain },
        select: {
            name: true,
            address: true,
            websiteui: { select: { header_image: true } }
        }
    })


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
    console.log("resSchoolAndBranches............/",JSON.stringify(resSchoolAndBranches, null,3))
    const schoolInfo = await prisma.websiteUi.findFirst({
        where: {
          school: {
            domain: domain
          }
        },
        select: {
          school: {
            select: {
              name: true,
              address: true,
              email: true,
              phone: true
  
            }
          },
          is_branch_wise_fees_collection: true,
          branch_wise_addmission: true,
        }
    })
      
    const allBranches = [{ label: resSchoolAndBranches.name, id: resSchoolAndBranches.id, isAdmin: true, }]
    !schoolInfo?.branch_wise_addmission && resSchoolAndBranches.School?.forEach(branch_school => {
        allBranches.push({
            label: branch_school.name,
            id: branch_school.id,
            isAdmin: false
        }) 
    });


    const feesPamentDatas = {
        is_branch_wise_fees_collection: schoolInfo?.is_branch_wise_fees_collection,
        branch_wise_addmission: schoolInfo?.branch_wise_addmission,

      }
    const serverHost = JSON.stringify(process.env.SERVER_HOST);
    return (
        <div>
            <OnlineAdmission
                classes={classes || []}
                academicYears={academicYear || []}
                serverHost={`${process.env.SERVER_HOST}` || ''}
                studentAdmissionForm={studentAdmissionForm}
                school={resSchool}
                feesPamentDatas={feesPamentDatas}
                allBranches={allBranches}
            />
        </div>
    )



}
