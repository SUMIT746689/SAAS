"use client"
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
import Image from "next/image";
import { useContext } from "react";

export default function ImportantLink() {

  const { language } = useContext(LanguageContext);

  return (
    <div className="bg-[#FFF8E5]">
      <div className=" flex flex-col justify-center items-center">
        <h1 className="text-[#0A033C]  font-bold mt-8 text-2xl lg:text-4xl"> {handleTextChangeLangWise(language, 'Important Link', 'গুরুত্বপূর্ণ লিংক')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8 ">
          <div className="flex flex-col p-8  overflow-hidden rounded-lg shadow-lg bg-[#FFFFFF]">
            <div className=" mx-auto">
              <Image src="/fb.png" width={70} height={70} alt="facebook" className="object-cover  mb-4" />
            </div>
            <h1 className="text-xl	font-bold	 text-center mt-2">Facebook Link</h1>
          </div>

          <div className="flex flex-col p-8 overflow-hidden rounded-lg shadow-lg bg-[#FFFFFF]">
            <div className=" mx-auto">
              <Image src="/youtube.png" width={70} height={70} alt="youtube" className="object-cover  mb-4 " />
            </div>
            <h1 className="text-xl	font-bold	text-center mt-2">Youtube Link </h1>
          </div>
        </div>
      </div>
    </div>
  );
}