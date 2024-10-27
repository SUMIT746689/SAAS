"use client";
import React, { useContext } from 'react';
import { IoLocationSharp } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";
import Link from 'next/link';
import { handleTextChangeLangWise } from '@/utils/handleLanguage';
import { LanguageContext } from '@/app/context/language';

function Branches({ branches, serverHost }) {

  const { language } = useContext(LanguageContext);

  return (
    <div className=' min-h-screen bg-pink-200' >
      <div className=' text-3xl font-bold py-8  text-blue-950 text-center'>{ handleTextChangeLangWise(language, 'ShowIng All Branch','Showing All Branch') }</div>
      {/* <div className=" flex m-8 flex-wrap bg-sky-500 justify-center align-middle"> */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 object-center justify-center max-w-[900px] mx-auto pb-10  gap-4">
        {branches.map((branch, index) => (
          <div
            key={index}
            className="bg-indigo-50 flex flex-col gap-4 min-w-full px-6 py-2 rounded-2xl shadow-lg"
          >
              <div className="flex flex-row gap-2 justify-between">
              <h3 className="font-bold text-black text-sm">{branch.name}</h3>
              <Link href={branch?.map_location || '#'} className="text-red-500 text-3xl" >
                <IoLocationSharp />
              </Link>
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-row gap-1">
                <p className="bg-green-600 text-xs rounded-full my-auto p-1 text-white">
                  <FaPhoneAlt />
                </p>
                <p className='text-sm'>{branch?.phone}</p>
              </div>
              {branch.optional_phone && (
                <div className="flex flex-row gap-1">
                  <p className="bg-green-600 text-xs  rounded-full my-auto p-1 text-white">
                    <FaPhoneAlt />
                  </p>
                  <p className='text-sm'>{branch?.optional_phone}</p>
                </div>
              )}
              
            </div>
            <Link href={`http://${branch?.domain || '#'}`} className='flex flex-row'>
              <p className="text-red-500 mr-1 my-auto font-bold">
                <FaExternalLinkAlt />
              </p>
              <p className="text-red-500 font-semibold">
                Website
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Branches;


