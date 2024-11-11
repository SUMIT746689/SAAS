"use client"
import { LanguageContext } from "@/app/context/language";
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
                        <>
                            <div>
                            </div>
                            <div> 
                                {/* <button>hi</button> */}
                                {/* {datas.pdf_url} */}
                            </div>
                        </>
                        :
                        ''
                }

            </div>

        </>
    )
}

export default DynamicPage;