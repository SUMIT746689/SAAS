"use client"
import { LanguageContext } from "@/app/context/language";
import Link from "next/link";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
const DynamicPage = ({ datas, serverHost }) => {
    console.log({datas})
    const { t } = useTranslation();
    const { language } = useContext(LanguageContext)
    return (
        <>
            <div className=" px-6 max-w-[90rem] mx-auto py-8">
                <div className=" text-4xl font-semibold">
                    {t(datas[`${language}_title`])}
                </div>
                <div className=" w-full h-1 bg-sky-600 mt-3"></div>
                <div className="my-8">
                    <div dangerouslySetInnerHTML={{ __html: datas[`${language}_description`] }} />
                </div>
                {
                    datas?.feature_photo ?
                        <>
                            <div>
                            </div>
                            <div>
                                <img src={`${serverHost}/api/get_file/${datas?.feature_photo}`} />
                            </div>
                        </>
                        :
                        ''
                }
                {
                        datas?.pdf_url ?
                        <button className="bg-orange-500 text-slate-100 font-bold py-2 px-4 mt-4">
                        <Link href={`${serverHost}/api/get_file/${datas?.pdf_url}`} >
                        {/* <embed src={`${serverHost}/api/get_file/${datas?.pdf_url}`}  width="800px" height="2100px" /> */}
                        Show File
                        </Link>
                        </button>
                    :
                    ''
                 }
        </div>

        </>
    )
}

export default DynamicPage;