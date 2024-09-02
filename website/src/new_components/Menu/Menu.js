"use client"
import { LanguageContext } from '@/app/context/language';
import { OnlineAddmissionIcon, FeesPaymentIcon, TeacherListIcon, OtherDocumentsIcon } from '@/new_components/Icons/Icons'
import { handleTextChangeLangWise } from '@/utils/handleLanguage';
import Link from 'next/link';
import { useContext } from 'react';

export default function Menu() {

  const { language } = useContext(LanguageContext);

  return (
    <div className="flex justify-center relative -top-20 w-fit mx-auto bg-[#FFF8E5] shadow-2xl rounded-xl ">
      <div className="p-6">
        <div className=" border border-black rounded-lg text-center ">
          <h1 className=" text-[#0A033C] font-bold my-8 text-4xl">Quick Menu</h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 my-8 mx-8 gap-8 text-xl">
            <Link href={'/online-admission'} className="bg-[#FFFFFF] max-w-[260px] flex flex-row items-center p-4 justify-center mx-auto  rounded-lg">
              <OnlineAddmissionIcon />
              <p className="text-start px-4 font-semibold">{handleTextChangeLangWise(language, 'Online Admission', 'অনলাইন এডমিশন')}</p>
            </Link>
            <Link href={'/fees-payments'} className="bg-[#FFFFFF] max-w-[260px] flex flex-row items-center p-4 justify-center mx-auto  rounded-lg">
              <FeesPaymentIcon />
              <p className="text-start px-4 font-semibold	">{handleTextChangeLangWise(language, 'Fees Payment', 'ফি প্রদান')}</p>
            </Link>
            <Link href={'/teachers'} className="bg-[#FFFFFF] max-w-[260px] flex flex-row items-center p-4 justify-center mx-auto  rounded-lg">
              <TeacherListIcon />
              <p className="text-start px-6 font-semibold"> {handleTextChangeLangWise(language, 'Teacher List', 'শিক্ষকের তালিকা')}</p>
            </Link>
            <Link href={'#'} className="bg-[#FFFFFF] max-w-[260px] flex flex-row items-center p-4 justify-center mx-auto  rounded-lg">
              <OtherDocumentsIcon />
              <p className="text-start px-4 font-semibold	">{handleTextChangeLangWise(language, 'Others Documents', 'অন্যান্য ডকুমেন্ট')} </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}