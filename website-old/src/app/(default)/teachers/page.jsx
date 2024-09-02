import Image from 'next/image'
import React from 'react'
import prisma from '@/lib/prisma_client';
import { headers } from 'next/headers';


async function getData() {

  try {
    const headersList = headers();
    const domain = headersList.get('host')

    const data = await prisma.teacher.findMany({
      where: {
        school: {
          domain: domain
        },
        deleted_at: null,
        department: {
          deleted_at: null
        }
      },
      select: {
        first_name: true,
        photo: true,
        department: {
          select: {
            title: true
          }
        }
      }
    })
    return data;

  } catch (err) {
    console.log(err);
    return []
  }
}
async function page() {
  const data = await getData();
  console.log("data__", data);
  return (
    <div className=' container mx-auto'>

      <div className="grid grid-cols-1 gap-3 justify-center pt-6 sm:grid-cols-2 md:grid-cols-3  lg:grid-cols-4 ">

        {
          data?.map(i => (
            <div key={i.id} className="shadow-md p-4 flex justify-between flex-col">

              <img
                height={500}
                width={500}
                quality={100}
                className="w-full object-cover h-full"
                src={i.photo ? `${process.env.SERVER_HOST}/api/get_file/${i?.photo?.replace(/\\/g, '/')}` : '/dummy.jpg'}
                loading="lazy"
                alt={""}
              />

              <div className='grid place-content-center text-center bg-violet-200 p-2'>
                <h2 className='font-bold'>{i?.first_name}
                </h2>
                <h3>From {i?.department?.title} department</h3>
              </div>
            </div>
          ))
        }


      </div>


    </div>
  )
}

export default page