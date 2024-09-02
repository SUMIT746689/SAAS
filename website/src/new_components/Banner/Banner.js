"use client"
import Image from "next/image";
import { handleGetDate, handleGetMonth } from "@/utils/handleDate"
import { useContext } from "react";
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
import Link from "next/link";
import { downloadFile, fetchAndDownloadFile } from "@/utils/handleDownload";
import { ImageSlider } from "@/components/ImageSlider";

export default function Banner({ carouselImages, serverHost, notices }) {

    const { language } = useContext(LanguageContext);

    return (
        <div className="bg-[#DDF5FA]">
            <div className="bg-[url('/group.png')] flex flex-col mx-auto pb-24">
                <div className="grid grid-cols-1 md:flex justify-center mx-8 gap-8 my-6">
                    <div className="md:w-2/3">
                        <ImageSlider carouselImages={carouselImages} />
                    </div>
                    <div className="md:w-1/3">
                        <div className="bg-[#FFFDE9]">
                            <p className="text-[#232323] font-bold	text-4xl w-full px-2 py-3 ">{handleTextChangeLangWise(language, 'Notice', 'নোটিশ')}</p>
                        </div>
                        <div className="flex bg-[#FFFFFF] gap-3 flex-col max-h-[365px] overflow-hidden overflow-y-auto">

                            {
                                notices?.map((notice, index) => (
                                    <div key={notice.id} className="odd:bg-[#192F59] even:bg-[#3DB166] text-white flex flex-row items-center px-6 py-2">
                                        <div className="flex gap-4">
                                            <div className="grid gap-1">
                                                <p>{handleGetDate(notice.created_at)}</p>
                                                <p>{handleGetMonth(notice.created_at)}</p>
                                            </div>
                                            <div className="grid gap-1 py-1">
                                                <p className="text-xs font-medium">{notice.headLine}</p>
                                                <div className="flex gap-2 flex-row font-medium text-xs items-center justify-center ">

                                                    {notice?.file_url ?
                                                        <Link href={`${serverHost}/api/downloads/${notice?.file_url}`} target="_parent" >
                                                            <button onClick={() => downloadFile(`${serverHost}/api/downloads/${notice?.file_url}`)} variant="contained" color="warning" className={index % 2 === 0 ? 'hover:text-sky-500' : 'hover:text-black'}>
                                                                Download
                                                            </button>
                                                        </Link>
                                                        :
                                                        <button disabled >Download</button>
                                                    }
                                                    {notice?.file_url ?
                                                        <Link href={`${serverHost}/api/get_file/${notice?.file_url}`} className={index % 2 === 0 ? 'hover:text-purple-500' : 'hover:text-black'}>
                                                            <button variant="contained" color="warning">
                                                                View
                                                            </button>
                                                        </Link>
                                                        :
                                                        <button disabled>View</button>
                                                    }
                                                </div>
                                            </div>

                                            {/* <div className="flex flex-row gap-8 items-center justify-center">
                                                <p className="text-base	font-medium	">01</p>
                                                <p className="text-xs 	font-medium	">{notice.headLine}</p>
                                            </div>
                                            <div className="flex gap-8  flex-row font-medium text-xs  ">
                                                <p className="text-base	font-medium	 ">Jul</p>
                                                <div className="flex  gap-2 flex-row font-medium text-xs items-center justify-center ">
                                                    <p>Download</p>
                                                    <p>View</p>
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                ))
                            }

                        </div>
                    </div>
                </div>
                <div className="px-8 font-bold text-lg text-center">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever  </div>
            </div>
        </div >
    );
}