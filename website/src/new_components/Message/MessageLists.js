"use client"
import Image from "next/image";
import Menu from "../Menu/Menu";
import { useContext, useState } from "react";
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
import Message from './Message';

export default function MessageLists({ speechDatas }) {

  const [showAllDesc, setShowAllDesc] = useState(false);
  const { language } = useContext(LanguageContext);

  return (
    <div className="bg-[#FFF8E5] ">
      <Menu></Menu>
      <div className="grid grid-cols-1 lg:grid-cols-3 mx-auto items-center justify-center ">
        {
          speechDatas?.map((speechData, index) => (
            <Message key={index} speechData={speechData} />
          ))
        }
      </div>
    </div>
  );
}