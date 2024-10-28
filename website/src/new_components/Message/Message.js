"use client"
import Image from "next/image";
import Menu from "../Menu/Menu";
import { useContext, useState } from "react";
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
export default function Message({ speechData }) {

  const [showAllDesc, setShowAllDesc] = useState(false);
  const { language } = useContext(LanguageContext);

  return (
    <div className="flex flex-col pb-8 mb-auto">
      <div>
        <h1 className="my-8 text-center text-2xl	font-bold	">{speechData[`${language}_title`]}</h1>
        <div className=" flex justify-center">
          <div className="relative  flex justify-center">
            <Image src={speechData?.image} alt="image" width={210.26} height={193.87} className=" z-10 w-[210.26px] h-[193.87px] bg-white object-center " />
            <div className="bg-[#2A3956] absolute -right-4 -bottom-4 w-[210.26px] h-[193.87px]"></div>
            <div className="absolute bottom-4 bg-transparent -left-4 w-[210.26px] h-[193.87px]  border-[#2A3956] border-8"></div>
          </div>
        </div>
        <div className="mt-8 mb-4">
          <h2 className="text-xl font-semibold tracking-wide text-center">{handleTextChangeLangWise(language, 'Name:', 'নাম:')} {speechData[`${language}_name`]}</h2>
        </div>
        <p className={`${showAllDesc ? '' : 'line-clamp-6'} text-base px-8 min-h-[140px] overflow-hidden`}>{speechData[`${language}_description`]}</p></div>
      <button className="mt-2 text-[#CA3214] text-base text-right ml-8 mr-auto" onClick={() => setShowAllDesc((value) => !value)} >
        {showAllDesc ? handleTextChangeLangWise(language, 'Read Less', 'কম পড়ুন') : handleTextChangeLangWise(language, 'Read More', 'আরো পড়ুন')}
      </button>
    </div>
  );
}