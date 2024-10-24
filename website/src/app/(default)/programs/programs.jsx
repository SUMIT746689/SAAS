"use client";
import { LanguageContext } from "@/app/context/language";
import React, { useContext } from 'react';
function Programs({ programs, serverHost , datas}) {
  console.log({ programs });
  
  const { language } = useContext(LanguageContext)
  return (
    <div>
        <div>
        <div className='text-center my-8  text-4xl font-extrabold'>
        <p>
        সময়োপযোগী প্রোগ্রামসমূহ
        </p>
        </div>
        <div className="grid grid-cols-3 my-8 gap-4 ">

        {programs?.map((program, index) => (
        <div
          key={index}
          className="shadow-lg shadow-black flex flex-col  gap-4 mx-10  rounded-2xl"
        >
                <div    key={index} className=' bg-white flex flex-col gap-4 mx-auto   rounded-2xl'>
        {/* <img className='rounded-t-2xl ' src={program.banner_photo} alt="" /> */}
        <img className='rounded-t-2xl rounded-b-none' src="https://udvash.com/media/Images/UDVASH/program/2024/2/9FPC24.png" alt="" />
        <p className='px-4 font-extrabold text-lg'>{program.title}</p>
        {/* <p className='px-4 pb-4 text-sm'>{program.body}</p> */}
        <div  className='px-4 pb-4 text-sm' dangerouslySetInnerHTML={{ __html: program.body }} /> </div>  
    </div>
))}
        </div>
    </div>
    </div>
  );
}
export default Programs;



