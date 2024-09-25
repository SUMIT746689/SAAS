"use client"
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
import { useContext } from "react";
export default function VideoGallary({video_gallary}) {
    console.log({video_gallary})
    const { language } = useContext(LanguageContext);
    return (
        <div className="bg-[#2A3956]  flex flex-col justify-center items-center">
            <h1 className="text-[#3DB166] font-bold mt-8 text-xl lg:text-4xl"> {handleTextChangeLangWise(language, 'Video Gallary', 'ভিডিও গ্যালারি')} </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2  my-8 gap-8 ">
                {
                    video_gallary?.map((video, index) =>{ 
                    console.log({v_gallery:video.youtube_link});
                        return(
                        <div key={index} className="flex flex-col p-6  overflow-hidden rounded-lg shadow-md bg-[#FFFFFF]">
                            <div>
                            <iframe width="560" height="315" src={video.youtube_link}
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin" 
                            allowfullscreen>
                            </iframe>
                            </div>
                            <h1 className="text-xl text-center mt-4"> {handleTextChangeLangWise(language, video.english_title, video.bangla_title)}</h1>
                        </div>
                    )
                })
                }
            </div>
        </div>
    );
}
  