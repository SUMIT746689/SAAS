"use client"
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
import Image from "next/image";
import { useContext } from "react";

export default function VideoGallary() {

    const { language } = useContext(LanguageContext);
    const vedios = [1, 2, 3, 4]

    return (
        <div className="bg-[#2A3956]  flex flex-col justify-center items-center">
            <h1 className="text-[#3DB166] font-bold mt-8 text-xl lg:text-4xl"> {handleTextChangeLangWise(language, 'Video Gallary', 'ভিডিও গ্যালারি')} </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2  my-8 gap-8 ">
                {
                    vedios?.map((vedio, index) => (
                        <div key={index} className="flex flex-col p-6  overflow-hidden rounded-lg shadow-md bg-[#FFFFFF]">

                            <div>
                                {/* <iframe
                                    title='YouTube video player'
                                    // type="text/html"
                                    vnum="1"
                                    width='640'
                                    height='390'
                                    src="https://youtu.be/FMuSq6aZMkc?si=96fCkhdQn01j9036"
                                    frameborder='0'
                                    allowFullScreen
                                >
                                </iframe> */}

                                <Image src='/gallary.jpg' width={400} height={300} alt="vedio gellery" className="object-cover  mb-4  dark:bg-gray-500" />
                            </div>
                            <h1 className="text-xl text-center mt-4"> {handleTextChangeLangWise(language, 'Content Name', 'ভিডিও নাম')}</h1>
                        </div>

                    ))
                }

            </div>


        </div>
    );
}