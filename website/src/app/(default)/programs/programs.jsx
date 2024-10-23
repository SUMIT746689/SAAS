"use client";
import React from 'react';
import { IoLocationSharp } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";import { FaExternalLinkAlt } from "react-icons/fa";
import Link from 'next/link';
function Branches({ branches, serverHost }) {
  console.log({ branches });
  return (
    <div className="grid grid-cols-3 my-8 gap-4">
      {branches.map((branch, index) => (
        <div
          key={index}
          className="bg-slate-300 flex flex-col gap-4 mx-auto px-6 py-6 rounded-2xl"
        >
            <div className="flex flex-row gap-8 justify-between">
            <h3 className="font-bold text-black text-xl">{branch.name}</h3>
            <Link href={branch.map_location} className="text-red-500 text-4xl">
              <IoLocationSharp />
            </Link>
          </div>
          <div className="flex flex-row gap-4">
            <div className="flex flex-row gap-1">
              <p className="bg-green-600 rounded-full my-auto p-1 text-white">
                <FaPhoneAlt />
              </p>
              <p>{branch.phone}</p>
            </div>
            {branch.optional_phone && (
              <div className="flex flex-row gap-1">
                <p className="bg-green-600 rounded-full my-auto p-1 text-white">
                  <FaPhoneAlt />
                </p>
                <p>{branch.optional_phone}</p>
              </div>
            )}
            
          </div>
          <Link href={`http://${branch.domain}`} className='flex flex-row'>
          <p className="text-red-500 mr-1 my-auto font-bold">
          <FaExternalLinkAlt />

            </p>
          <p className="text-red-500 font-semibold">Website
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Branches;




