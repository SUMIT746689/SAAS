"use client"
import React, { useEffect, useState } from 'react';
import { Grid, Dialog, DialogContent, Button } from '@mui/material';
import { FaPhoneAlt } from "react-icons/fa";import { IoLocationSharp } from "react-icons/io5";
function page({classes, editData, setEditData, reFetchData , serverHost}) {
  return (
    <> 
   <div className='flex flex-row  my-8'>
   <div className=' bg-slate-300 flex flex-col gap-4 mx-auto px-6 py-6 rounded-2xl'>
      <div className='flex flex-row gap-8 justify-between ' >
        <h3 className='font-bold text-black text-xl' >বনশ্রী</h3> 
        <p className='text-red-500 text-4xl'>
        <IoLocationSharp />
        </p>
        
      </div> 
      <div className='flex flex-row  gap-8 justify-between'>
        <div className='flex flex-row gap-1'>
          <p className='bg-green-600 rounded-full my-auto p-1 text-white'>
          <FaPhoneAlt />
          </p>
          <p>01302564259</p>
        </div>

        <div className='flex flex-row gap-1'>
          <p className='bg-green-600 rounded-full my-auto p-1 text-white'>
          <FaPhoneAlt />
          </p>
          <p>01302564259</p>
        </div>
      </div>
    </div>
    <div className=' bg-slate-300 flex flex-col gap-4 mx-auto px-6 py-6 rounded-2xl'>
      <div className='flex flex-row gap-8 justify-between ' >
        <h3 className='font-bold text-black text-xl' >বনশ্রী</h3> 
        <p className='text-red-500 text-4xl'>
        <IoLocationSharp />
        </p>
        
      </div> 
      <div className='flex flex-row  gap-8 justify-between'>
        <div className='flex flex-row gap-1'>
          <p className='bg-green-600 rounded-full my-auto p-1 text-white'>
          <FaPhoneAlt />
          </p>
          <p>01302564259</p>
        </div>

        <div className='flex flex-row gap-1'>
          <p className='bg-green-600 rounded-full my-auto p-1 text-white'>
          <FaPhoneAlt />
          </p>
          <p>01302564259</p>
        </div>
      </div>
    </div>
    <div className=' bg-slate-300 flex flex-col gap-4 mx-auto px-6 py-6 rounded-2xl'>
      <div className='flex flex-row gap-8 justify-between ' >
        <h3 className='font-bold text-black text-xl' >বনশ্রী</h3> 
        <p className='text-red-500 text-4xl'>
        <IoLocationSharp />
        </p>
        
      </div> 
      <div className='flex flex-row  gap-8 justify-between'>
        <div className='flex flex-row gap-1'>
          <p className='bg-green-600 rounded-full my-auto p-1 text-white'>
          <FaPhoneAlt />
          </p>
          <p>01302564259</p>
        </div>

        <div className='flex flex-row gap-1'>
          <p className='bg-green-600 rounded-full my-auto p-1 text-white'>
          <FaPhoneAlt />
          </p>
          <p>01302564259</p>
        </div>
      </div>
    </div>
    
   </div>
    </>
  );
}
export default page;
