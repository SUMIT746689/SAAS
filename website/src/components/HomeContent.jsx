'use client';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import ImgSlider from './ImageSlider';
import { useEffect, useRef, useState } from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { useClientFetch } from '../hooks/useClientFetch';
import Link from 'next/link';
const inter = Inter({ subsets: ['latin'] });

const navLink = 'px-4 py-3 hover:cursor-pointer hover:bg-blue-900 duration-150';

const primaryBgColor = 'bg-sky-700';
const primaryColor = 'text-sky-100';
const whiteColor = 'text-gray-100';
const secondaryColor = 'text-sky-700';

const SpeechesCard = ({ title, image, description }) => {
  const ref = useRef();
  useIntersectionObserver(ref, {});

  return (
    <div ref={ref}>
      <div
        className={`${primaryBgColor} ${primaryColor} px-2 py-3 mb-1 text-xl`}
      >
        {title}
      </div>
      <div className="">
      {image && image !== '*' && <img className=" w-1/3 float-left pr-2 md:pr-3" src={`${image}`} />}
        <div className="text-lg font-medium leading-9 text-justify">
          {description}
        </div>
      </div>
    </div>
  );
};

// const speechDatas = [
//   {
//     title: 'প্রতিষ্ঠানের ইতিহাস',
//     image: '/history.jpg',
//     description: `
// ১৯৭৯ সালে প্রতিষ্ঠিত মঙলকান্দি ইসলামিয়া ফাযিল (ডিগ্রি) মাদ্রাসা এর
// ধারাবাহিক সাফল্যে এলাকাবসীর দাবী ও শিক্ষার্থীদের চাহিদার
// প্রেক্ষিতে ডিজিটাল বাংলাদেশ গড়ার প্রত্যয়ে প্রতিষ্ঠিত করা হয়েছে। এই
// প্রতিষ্ঠানটি বর্তমানে কুমিল্লা জেলার অন্যতম শিক্ষা প্রতিষ্ঠানে
// পরিনত হয়েছে। এটি প্রতিষ্ঠানের পরিচালকবৃন্দ, শিক্ষকবৃন্দ,
// অভিভাবকবৃন্দ, শিক্ষার্থীদের ও সর্বোপরি এলাকাবাসীর সমন্বিত
// প্রচেষ্টার ফল। এলাকাবাসীর সেবার মনোভাব নিয়ে মান সম্পন্ন শিক্ষা
// প্রসারে এবং কৃতিত্বপূর্ণ ফল অর্জন করে এই প্রতিষ্ঠানটি ইতিমধ্যে
// একটি স্থান করে নিয়েছে। প্রতিষ্ঠানের সার্বিক ক্ষেত্রে সফলতার জন্য
// মানুষের মাঝে এক ধরনের চাহিদা সৃষ্টি হওয়ায় তাঁরা তাঁদের কোমলমতি
// ছেলে মেয়েদের এই প্রতিষ্ঠানে পড়াশুনা করাতে যথেষ্ট আগ্রহী হয়ে
// উঠেছেন। প্রতিষ্ঠানের সাফল্যে অভিভাকগণের মধ্যে ইতিবাচক প্রভাব ছাড়াও
// বিভিন্ন পর্যায়ে বেশ প্রসংশনীয় অবদান রাখছে। সবকিছুর মূলে রয়েছে
// প্রতিষ্ঠানের অটুট শৃঙ্খলা, শিক্ষকগণের একাগ্রতা, শিক্ষক-শিক্ষার্থী
// ও অভিভাবকগণের মধ্যে সমন্বয় সাধন। শিক্ষার্থীদেরকে উপযুক্তভাবে গড়ে
// তোলাই আমাদের লক্ষ্য। এই লক্ষ্য বাস্তবায়নের জন্য আমাদের রয়েছে
// বিরামহীন চেষ্টা ও পরিকল্পনা।
//     `
//   },
//   {
//     title: 'সভাপতির বাণী',
//     image: '/chairman.jpg',
//     description: `
// পড়! তোমার রবের নামে যিনি সৃষ্টি করেছেন (সূরা-আল্লাক্ব :১)। 
// ডিজিটাল বাংলাদেশ গড়ার লক্ষ্যে মাদরাসা শিক্ষা শিক্ষাব্যবস্থাকে বেগবান 
// ও আধুনিকায়ন করতে মাল্টিমিডিয়া ক্লাসসহ বিভিন্ন স্তরে তথ্য-প্রযুক্তি যে 
// অবদান রাখছে তার জন্য বর্তমান গণপ্রজাতন্ত্রী বাংলাদেশ সরকার তথা 
// মাননীয় প্রধানমন্ত্রী ও শিক্ষামন্ত্রীসহ সংশ্লিষ্ট সকলকে জানাই আন্তরিক 
// মোবারকবাদ। দেশের দ্বিমুখী শিক্ষা ব্যবস্থার প্রেক্ষাপটে ইসলামী ও আধুনিক 
// শিক্ষার বাস্তব সমন্বয় সাধন করে সঠিক ইসলামী আদর্শের বুনিয়াদে ১৩৭৯ 
// সালে মাদরাসাটির শুভ সূচনা করেন আমার পিতা মরহুম অধ্যাপকা মাওলানা 
// মুহাম্মদ ইয়াছীন। তারপর কালের বিবর্তনে মহান আল্লাহ্র মেহেরবাণীতে আজ 
// তা পত্র-পল্লবে সুশোভিত হয়ে বিরাট মহীরূহে পরিণত হয়েছে। যাদের প্রচেষ্টা, 
// অনুপ্রেরণা ও সহযোগিতায় মঙ্গলকান্দি ইসলামিয়া কামিল মাদরাসা বর্তমান 
// অবস্থানে পৌঁছেছে এবং এগিয়ে চলেছে, বিশেষ করে গভর্ণিং বডির সম্মানিত 
// সদস্যবৃন্দ, শিক্ষকম-লী, ছাত্র-ছাত্রী, অভিভাবক, এলাকাবাসী ও সর্বস্তরের জনগণ, 
// তাঁদের সকলকে কৃতজ্ঞতারসহিত আন্তরিক মুবারকবাদ জ্ঞাপন করছি । ইসলামী জীবনাদর্শ, 
// সংস্কৃতি, ঐতিহ্য, মূল্যবোধ, অর্থনীতি ও সমাজনীতি ইত্যাদি ক্ষেত্রে মসলিম সন্তানদেরকে 
// আদর্শ নাগরিক রূপে গড়ে তোলা, বিশেষ করে নৈতিক অবক্ষয় থেকে তরুন সমাজকে রক্ষা 
// ও নারীকে পরিপূর্ণ দ্বীনি শিক্ষায় শিক্ষিত করে চারিত্রিক উৎকর্ষ ও মূল্যবোধ তৈরীর বাস্তব 
// উদ্যোগই হোক এ প্রতিষ্ঠানের দায়বদ্ধতা -এ দোয়াই করছি আমিন।
//     `
//   },
//   {
//     title: 'অধ্যক্ষের বাণী',
//     image: 'principal.jpg',
//     description: `
// মানব জাতির সূচনা লগ্ন থেকে প্রাকৃতিক পরিবেশ ও বাস্তব অভিজ্ঞতা থেকে মানুষ প্রতিনিয়ত জ্ঞান 
// ও কৌশল আয়ত্ব করে চলছে। আর শত সহস্র বছরের সঞ্চিত ও অর্জিত জ্ঞান শেখানো হয় শিক্ষা 
// প্রতিষ্ঠানে। যুগের প্রয়োজনে মানবের কল্যাণে সমাজ হিতৈষী ব্যক্তিরা কখনো কখনো শিক্ষা প্রতিষ্ঠানের 
// ভূমিকায় অবতীর্ণ হন। এমনিই ভাবেই দক্ষ, অভিজ্ঞ, জ্ঞানে সু-গভীর ও বিদ্যানুরাগী এক মহাপুরুষ 
// মরহুম অধ্যাপক মাওলানা মোঃ ইয়াছীন সাহেবও ভবিষ্যৎ প্রজন্মকে দক্ষ, যোগ্য, আদর্শ ও সুনাগরিক 
// রূপে গড়ে তোলার অভিপ্রায় নিয়ে এলাকাবাসীর সহযোগিতায়, কুমিল্লা জেলার তিতাস উপজেলাধীন 
// সাতানী ইউনিয়নস্থ মঙ্গলকান্দি গ্রামে প্রাকৃতিক ও সু-নিবিড় পরিবেশে মানসম্মত ধর্মীয় ও আধুনিক 
// বিদ্যাপীঠ হিসাবে ১৯৭৯ খ্রিস্টাব্দে প্রতিষ্ঠা করেছেন মঙ্গলকান্দি ইসলামিয়া কামিল (স্নাতকোত্তর) 
// মাদ্রাসা। সঠিক ধর্মীয়, নৈতিক শিক্ষা ও যুগোপযোগী আধুনিক শিক্ষার সমন্বয়ে বর্তমানে প্রতিষ্ঠানটি 
// গুনগত ও মানসম্মত শিক্ষাদানে সক্ষম। বর্তমান সরকারের শিক্ষা বিষয়ক নির্দেশনা ও সার্বিক 
// তত্ত্বাবধানে শিক্ষকবৃন্দের ঐকান্তিক প্রচেষ্টায়, শিক্ষার্থীদের নিরলস অধ্যয়ন ও অধ্যবসায় এবং 
// অভিভাবক ও সংশ্লিষ্ট সকলের সম্মিলিত পরামর্শে প্রতিষ্ঠানটি ২০২২খ্রিস্টাব্দে কামিল (মাস্টার্স) 
// শ্রেণিতে উন্নিত হয়েছে। আল্লাহ তা’য়ালা এই প্রতিষ্ঠানটিকে সঠিক ইসলাম ও আধুনিক বিজ্ঞান 
// সম্মত শিক্ষার মারকায হিসাবে কবুল করে নিন। আমিন!!!
//     `
//   }
// ];

const serviceDatas = [
  // {
  //   title: 'ছাত্র/ছাত্রী তথ্য/রেজাল্ট',
  //   image: 'service1.png',
  //   lists: [
  //     'অনলাইন ভর্তি',
  //     'পরিক্ষা এডমিট কার্ড',
  //     'সার্টিফিকেট',
  //     'রেজাল্ট (মঙ্গলকান্দি ইসলামিয়া ফাজিল মাদ্রাসা)',
  //     'রেজাল্ট বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড'
  //   ]
  // },
  {
    title: 'ই-বুক',
    image: 'service2.png',
    lists: [
      '২০২৩ শিক্ষাবর্ষের সকল পাঠ্যপুস্তক',
      'ইসলামিক বই',
      'সিলেবাস (BMEB)',
      'সিলেবাস (IAU)'
    ]
  },
  {
    title: 'ডাউনলোড',
    image: 'service3.png',
    lists: [
      'বার্ষিক পরীক্ষা 2022 রুটিন ডাউনলোড',
      'এসএসসি পরীক্ষার রুটিন ডাউনলোড',
      'ছুটির নোটিশ ডাউনলোড',
      'ভর্তি ফরম ডাউনলোড',
      'পরীক্ষার রুটিন ডাউনলোড'
    ]
  },
  // {
  //   title: 'নোটিশ',
  //   image: 'service4.png',
  //   lists: [
  //     'নোটিশ (ইসলামি আরবি বিশ্ববিদ্যালয়)',
  //     'নোটিশ (মাদ্রাাসা শিক্ষা অধিদপ্তর)',
  //     'নোটিশ (বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড)',
  //     'নোটিশ (উপবৃত্তি)',
  //     'নোটিশ (এনটিআরসিএ)',
  //     'নোটিশ তিতাস উপজেলা'
  //   ]
  // }
];

const color = [
  'bg-green-700',
  'bg-teal-700',
  'bg-yellow-700',
  'bg-cyan-700',
  'bg-violet-700'
];

const otherSites = [
  {
    title: 'শিক্ষা মন্ত্রণালয়',
    link: 'https://www.moedu.gov.bd/'
  },
  {
    title: 'মাদ্রাসা শিক্ষা অধিদপ্তর',
    link: 'https://dme.gov.bd/'
  },
  {
    title: 'ইসলামি আরবী বিশ্ববিদ্যালয়',
    link: 'https://iau.edu.bd/'
  },
  {
    title: 'বাংলাদেশ মাদরাসা শিক্ষা বোর্ড',
    link: 'https://bmeb.gov.bd/'
  },
  {
    title: 'শিক্ষক বাতায়ন',
    link: 'https://teachers.gov.bd/'
  },
  {
    title: 'সকল অনলাইন পত্রিকা',
    link: 'http://www.bdembassyusa.org/uploads/bonp/index.html'
  },
];

const ServiceCard = ({ title, image, lists, headColor }) => {
  const ref = useRef();
  useIntersectionObserver(ref, {});

  const listData = lists?.map((list, index) => (
    <li
      className=" hover:text-sky-700 cursor-pointer text-ellipsis overflow-hidden"
      key={index}
    >
      🕸️ {list}
    </li>
  ));
  return (
    <div
      ref={ref}
      className={` bg-slate-200 border border-slate-400 h-fit sm:h-72 sm:max-h-72 `}
    >
      <div className={`${headColor} ${primaryColor} px-2 py-3 mb-1 text-xl`}>
        {title}
      </div>
      <div className="px-4 py-2 grid grid-cols-12 gap-4 sm:gap-10">
        <img
          className=" col-span-3 pr-2 md:pr-3 p-3 object-contain sm:object-cover max-h-28 lg:max-h-40 float-right"
          src={`${image}`}
        />
        <div className=" col-span-9 text-xs sm:text-sm font-medium leading-9 ">
          <ul className="list-[square] leading-9">{listData}</ul>
        </div>
      </div>
    </div>
  );
};



export default function HomeContent({ latest_news, carousel_image, speechDatas, facebook_link }) {
  console.log({ latest_news });
  // const ref = useRef(null);
  const announceref = useRef(null);
  const noticeRef = useRef(null);
  const otherSiteRef = useRef(null);

  // useIntersectionObserver(ref, {});
  useIntersectionObserver(announceref, {});
  useIntersectionObserver(noticeRef, {});
  useIntersectionObserver(otherSiteRef, {});
  // const isVisible = !!entry?.isIntersecting

  // console.log(`Render Section `, { isVisible })


  // console.log("speechDatas__",speechDatas);
  return (
    <div>
      {/* slider */}
      <div className="w-full pb-2">
        <ImgSlider carousel_image={carousel_image} />
      </div>

      {/* announcement */}
      <div ref={announceref} className="py-4 grid lg:grid-cols-12 text-lg">
        <div
          className={` ${primaryBgColor} ${primaryColor} col-span-full md:col-span-2 px-2 py-3`}
        >
          সর্বশেষ ঘোষনা
        </div>
        <div className={` ${secondaryColor} overflow-hidden md:col-span-10`}>
          <div className="relative animate-wiggle max-w-fit flex gap-6 mt-4 md:mt-3 w-full">
            {
              latest_news?.map(i => <div className="curson-pointer">🐳🦜{i?.headLine}</div>)
            }
            {/* <div className="curson-pointer">🐳🦜 পাঠ্যপুস্তক সংক্রান্ত</div>
            <div className=" cursor-pointer">🐳🦜 নতুন নেটিশ</div> */}

          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-4">
        <div className=" xl:col-span-9 ">
          {/* speeches */}
          <div className="grid xl:grid-cols-2 gap-8">
            {speechDatas.map((card, index) => (
              <div key={index} className={`${index === 0 && 'xl:col-span-2'}`}>
                <SpeechesCard
                  // key={card.index}
                  index={index}
                  title={card.title}
                  image={card.image}
                  description={card.description}
                />
              </div>
            ))}
          </div>

          {/* services */}
          <div className="grid mt-4 gap-4 mb-4 lg:grid-cols-2 ">
            {serviceDatas.map((service, index) => (
              <div key={index}>
                <ServiceCard
                  title={service.title}
                  image={service.image}
                  lists={service.lists}
                  headColor={color[index]}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3">
          {/* notice  */}
          <div ref={noticeRef} className="mb-4">
            <div className={` ${primaryBgColor} ${primaryColor} py-3 px-2 `}>
              নোটিস বোর্ড{' '}
            </div>
            <div className='bg-slate-200 overflow-hidden'>
              <div className="pb-2 px-2 h-40 flex flex-col gap-4 animate-top-to-bottom hover:pause">
                {
                  latest_news?.map(i => <div className=' cursor-pointer'>👻 {i?.title} </div>)
                }
                {/* <div className=' cursor-pointer'>👻 পাঠ্যপুস্তক সংক্রান্ত </div>
                <div className=' cursor-pointer'>👻 নতুন নেটিশ</div> */}
              </div>
            </div>
          </div>

          {/*  other sites  */}
          <div
            ref={otherSiteRef}
            className={`${whiteColor} flex flex-col gap-2`}
          >
            {otherSites.map((site, index) => (
              <div
                key={index}
                className=" bg-gradient-to-r from-red-700 to-red-300 hover:from-amber-900 hover:to-amber-500 px-8 py-3 duration-150 "
              >
                {' '}
                <Link href={site.link} rel="noopener noreferrer" target="_blank">❄️ {site.title}</Link>
              </div>
            ))}
          </div>

          {/*  facebook page */}
          <div className="my-4">
            <div className={` ${primaryBgColor} ${primaryColor} py-3 px-2`}>
              <Link href={facebook_link} rel="noopener noreferrer" target="_blank"> Our Facebook Page</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
