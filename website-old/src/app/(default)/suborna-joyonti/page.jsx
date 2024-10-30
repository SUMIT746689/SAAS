import Image from 'next/image';
import React from 'react';
const মুক্তিযুদ্ধেরস্থিরচিত্র = [
    {
        url: 'war_1.jpg'
    },
    {
        url: 'war_2.jpg'
    },
    {
        url: 'war_3.jpg'
    },
    {
        url: 'war_4.jpg'
    },
    {
        url: 'war_5.jpg'
    },
    {
        url: 'war_6.jpg'
    },
    {
        url: 'war_7.jpg'
    },
    {
        url: 'war_8.jpg'
    },
    {
        url: 'war_9.jpg'
    },
    {
        url: 'war_10.jpg'
    },
    {
        url: 'war_11.jpg'
    },
    {
        url: 'war_12.jpg'
    },
    {
        url: 'war_13.jpg'
    },
    {
        url: 'war_14.jpg'
    },
]
const page = () => {
    return (
        <div>
            <br/>
            {/* <h2 className='text-3xl p-4'>suborna joyonti</h2> */}
            <p className=' text-center font-bold text-3xl'>সুবর্ণজয়ন্তী কর্ণার</p>
            <h3 className=' h-12 bg-slate-300 text-center pt-3 m-4 font-bold'>
                বঙ্গবন্ধুর ৭ই মার্চের ভাষণ
            </h3>
            <div className=' grid grid-cols-3 gap-2'>
                <div className="p-4">

                    <Image
                        height={500}
                        width={500}
                        quality={100}
                        className="w-full object-cover h-full"
                        src='/bongobondhu_1.jpg'
                        loading="lazy"
                        alt={""}
                    />

                </div>
                <div className="p-4">

                    <Image
                        height={500}
                        width={500}
                        quality={100}
                        className="w-full object-cover h-full"
                        src='/bongobondhu_2.jpg'
                        loading="lazy"
                        alt={""}
                    />

                </div>
                <div className="p-4">

                    <Image
                        height={500}
                        width={500}
                        quality={100}
                        className="w-full object-cover h-full"
                        src='/bongobondhu_3.jpg'
                        loading="lazy"
                        alt={""}
                    />

                </div>
            </div>
            <h3 className=' h-12 bg-slate-300 text-center pt-3 m-4 font-bold'>
                সাত জন বীরশ্রেষ্ঠ
            </h3>
            <div className=' flex justify-center'>
                <div className="p-4">

                    <Image
                        height={800}
                        width={800}
                        quality={100}
                        className="w-full object-cover h-full"
                        src='/Seven-Bir-Shreshtha.jpg'
                        loading="lazy"
                        alt={""}
                    />

                </div>

            </div>
            <h3 className=' h-12 bg-slate-300 text-center pt-3 m-4 font-bold'>
                ভিডিও চিত্র
            </h3>


            <div class=" grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 place-content-center p-2">

                <div className=" p-2 "> <iframe className=' w-full aspect-video' src="https://www.youtube.com/embed/XFG0i1cv2zY" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>
                <div className="p-2"><iframe className=' w-full aspect-video' src="https://www.youtube.com/embed/188hvm_fW7E" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>
                <div className="p-2"> <iframe className=' w-full aspect-video' src="https://www.youtube.com/embed/CUD9sNkt2RI" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>
                <div className="p-2"> <iframe className=' w-full aspect-video' src="https://www.youtube.com/embed/6IdCJTs4VwE" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>
                <div className="p-2"><iframe className=' w-full aspect-video' src="https://www.youtube.com/embed/PFCrooJ4CaA" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>
                <div className="p-2"> <iframe className=' w-full aspect-video' src="https://www.youtube.com/embed/8k-zVwskPHw" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>
            </div>
            <h3 className=' h-12 bg-slate-300 text-center pt-3 m-4 font-bold'>
                মুক্তিযুদ্ধের স্থিরচিত্র
            </h3>

            <div className='grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 place-content-center p-2'>
                {
                    মুক্তিযুদ্ধেরস্থিরচিত্র.map(i =>
                        <div className='p-2 shadow-md'>
                            <Image
                                height={500}
                                width={500}
                                quality={100}
                                className="w-full object-cover h-full"
                                src={`/${i.url}`}
                                loading="lazy"
                                alt={""}
                            />
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default page;