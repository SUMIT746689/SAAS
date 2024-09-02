"use client"
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
import Image from "next/image";
import { useContext, useState } from "react";

export default function About({ aboutSchool }) {

  const [showAllDesc, setShowAllDesc] = useState(false);
  const { language } = useContext(LanguageContext);

  return (
    <div>
      <section className="bg-[url('/about_background.png')] bg-center object-cover">
        <div className="p-6 mx-auto bg-[#2A3956] bg-opacity-80">
          <div rel="noopener noreferrer" href="#" className="block max-w-sm gap-3 mx-auto sm:max-w-full group hover:no-underline focus:no-underline lg:grid items-center lg:grid-cols-2 ">

            <Image src={aboutSchool.image} alt="about image" width={638} height={425} className=" object-cover justify-center overflow-hidden max-h-[400px]"></Image>

            <div className="px-6">
              <h3 className="text-2xl font-semibold sm:text-4xl text-[#3DB166] mb-8">{aboutSchool[`${language}_title`]}</h3>
              <p className={` ${showAllDesc ? '' : 'line-clamp-6'} text-[#FFFFFF]`}>{aboutSchool[`${language}_description`]}</p>
              <button onClick={() => setShowAllDesc(value => !value)} className="mt-5 px-5 py-2 relative rounded text-white font-medium bg-[#3DB166]">
                {showAllDesc ? handleTextChangeLangWise(language, 'Read Less', 'কম পড়ুন') : handleTextChangeLangWise(language, 'Read More', 'আরো পড়ুন')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}