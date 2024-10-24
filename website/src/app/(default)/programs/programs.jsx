"use client";
import React from 'react';
function Programs({ programs, serverHost }) {
  console.log({ programs });
  return (
    <div>
        <div>
        <div className='text-center my-8 text-4xl font-extrabold'>
        <p>
        সময়োপযোগী প্রোগ্রামসমূহ
        </p>
        </div>
        {programs?.map((program, index) => (
        <div
          key={index}
          className="bg-slate-300 flex flex-row gap-4 mx-auto px-6 py-6 rounded-2xl"
        ><div className=' bg-slate-300 flex flex-col gap-4 mx-auto  rounded-2xl'>
        {/* <img className='rounded-t-2xl ' src={program.banner_photo} alt="" /> */}
        <img className='rounded-t-2xl ' src="https://udvash.com/media/Images/UDVASH/program/2024/2/9FPC24.png" alt="" />
        <p className='px-4 font-extrabold text-lg'>{program.title}</p>
        <p className='px-4 pb-4 text-sm'>{program.body}
        </p>
        </div>  
    </div>
))}
    </div>
    </div>
  );
}
export default Programs;



