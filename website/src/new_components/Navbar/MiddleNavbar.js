"use client";
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
export default function MiddleNavbar({ datas }) {
  console.log({ datas })
  const {
    name,
    eiin_number,
    address,
    email,
    phone,
    header_image,
    english_scholarship_name,
    bangla_scholarship_name,
    is_scholarship_active
  } = datas;
  console.log({ is_scholarship_active });

  const { language } = useContext(LanguageContext);

  return (
    <div className="bg-[#FFFEF3]">
      <div className="flex flex-row justify-between items-center gap-6 mx-8">
        <div className="flex flex-row items-center my-4">
          <div>
            <Image src={header_image} alt="header image" width={120} height={44} />
          </div>
          <div className="flex flex-col ml-10">
            <div className="text-[#0A033C] font-extrabold text-4xl mb-2">
              {name}
            </div>
            <ul className="flex flex-col sm:flex-row gap-6 text-sm text-[#232323]">
              <li><a>EIIN NO: {eiin_number}</a></li>
              <li><a>Address: {address}</a></li>
              <li><a>Email: {email}</a></li>
              <li><a>Phone No: {phone}</a></li>
            </ul>
          </div>
        </div>
        {is_scholarship_active && (
          <Link
            href={`/scholarship`}
            className="ml-40 rounded bg-[#FFFEF3] text-[#192F59] flex items-center gap-1 font-bold"
          >
            <button className="bg-orange-800 hover:bg-orange-700 active:bg-orange-900 duration-150 text-[#FFFFFF] rounded capitalize px-2 py-1">
              {handleTextChangeLangWise(language, english_scholarship_name, bangla_scholarship_name)}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
