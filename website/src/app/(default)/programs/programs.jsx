"use client";
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
import Image from "next/image";
import React, { useContext } from 'react';

function Programs({ programs, serverHost, datas }) {

  const { language } = useContext(LanguageContext)

  return (
    <div>
      <div>
        <div className='text-center my-8 text-4xl font-extrabold'>
          <p>
            {handleTextChangeLangWise(language, 'Programs', 'সময়োপযোগী প্রোগ্রামসমূহ')}
          </p>
        </div>
        <div className="flex justify-center flex-wrap my-8 gap-8 ">
          {programs?.map((program, index) => (
            <div
              key={index}
              className="shadow-lg shadow-black flex flex-col rounded-xl overflow-hidden max-w-[350px]"
            >
              <div key={index} className=' bg-white flex flex-col gap-4 mx-auto rounded-2xl'>
                {/* <img className='rounded-t-2xl rounded-b-none' src="https://udvash.com/media/Images/UDVASH/program/2024/2/9FPC24.png" alt="" /> */}
                <Image
                  className=' h-52 object-center object-cover'
                  src={program?.banner_photo ? `${serverHost}/api/get_file/${program?.banner_photo?.replace(/\\/g, '/')}` : ''}
                  width={350}
                  height={208}
                  alt="banner image"
                />
                <p className='px-4 font-extrabold text-lg'>{program.title}</p>
                <div className='px-4 pb-4 text-sm' dangerouslySetInnerHTML={{ __html: program.body }} /> </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Programs;



