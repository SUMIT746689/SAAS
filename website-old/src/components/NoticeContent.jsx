'use client';
import { Button, Grid } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';
import { HiOutlineMail } from 'react-icons/hi';
import { MdMessage } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const Item = ({ data, serverHost }) => {
  const { t } = useTranslation();
  return (
    <div className="px-12 mt-8 max-w-3xl">
      <div className="p-4 border rounded-lg flex flex-col gap-8">

        {/* <Image
          height={500}
          width={500}
          quality={100} src={`/${data.image}`} className=" object-contain" /> */}
        
        
        <Grid sx={{ mt: 1 }}>{t(`${data?.headLine}`)}</Grid>
        {/* <Button
                onClick={() => window.open(`${serverHost}/api/get_file/${data?.file_url?.replace(/\\/g, '/')}`,
                  'Popup', 'location,status,scrollbars,resizable,width=600, height=600')}
              >pppp</Button> */}
              <object data= {`/api/file/${data?.file_url?.replace(/\\/g, '/')}`} width={'100%'} height={'100vh'}></object>
        <Link
          target="_blank"
          // href={`${serverHost}/api/get_file/${data?.file_url?.replace(/\\/g, '/')}`}
          href={`file?path=${data?.file_url?.replace(/\\/g, '/')}`}

        >
          <Grid
            sx={{
              mt: 1,
              p: 1,
              border: 1,
              borderRadius: 1,
              borderColor: 'primary.main',
              color: 'primary.main'
            }}
          >
            {data?.title}

          </Grid>
        </Link>

      </div>
    </div>
  );
};

const itemData = [
  {
    image: 'top_image.jpg',
    description: `
    এতদ্বারা মংগলকান্দি ইসলামিয়া কামিল মাদরাসা সকল শিক্ষক মন্ডলির অবগতির
     জন্য জানানো যাচ্ছে যে ২০২৩ শিক্ষা বর্ষের যেসকল শ্রেনির পাঠ্যপুস্তক এখনো 
     পাওয়া যায়নি সেগুলোর পিডিএফ কপি অত্র মাদ্রাসার অয়েবসাইটের ইবুক কর্নার 
     থেকে ডাউনলোড করে পাঠ শিরোনাম ও তৎ প্রয়োজনীয় তথ্যদি হোয়াইট বোর্ডে 
     লিখে শিক্ষার্থীদের ডায়েরীতে লিখিয়ে দিয়ে পাঠদানের ব্যবস্থা গ্রহনের অনুরোধ করা গেলো
     `
  },
  {
    image: 'new-notice.jpg',
    description: `এটা একটা নতুন নোটিস`
  }
];

function Notice({ serverHost, notice }) {
  const [showBookNotice, setshowBookNotice] = useState(false);
  const [showNewNotice, setshowNewNotice] = useState(false);
  
  return (
    <div className="flex gap-4 flex-col p-8 min-h-[calc(100vh-400px)]">
      {/* <div>
        <button
          onClick={() => setshowBookNotice((value) => !value)}
          className="flex gap-4 text-center cursor-pointer"
        >
          <HiOutlineMail className=" text-4xl text-slate-100 bg-slate-600 px-2 rounded-md" />
          <span>পাঠ্যপুস্তক সংক্রান্ত</span>
        </button>

        <div className={`${showBookNotice ? ' max-h-[500px]' : 'max-h-0'} overflow-hidden ease-in-out transition-[max-height] duration-1000`}>
          <Item data={itemData[0]} />
        </div>
      </div> */}
      {
        notice?.map((i,index) => <SingleNotice key={index} serverHost={serverHost} data={i} />)
      }


    </div>
  );
};
const SingleNotice = ({ serverHost, data }) => {
  const [showNewNotice, setshowNewNotice] = useState(false);
  return (
    <div>
      <button
        onClick={() => setshowNewNotice((value) => !value)}
        className="flex gap-4 text-center cursor-pointer z-20"
      >
        <MdMessage className=" text-4xl text-slate-100 bg-slate-600 px-2 rounded-md" />
        <span>{data?.title}</span>
      </button>

      <div className={`${showNewNotice ? ' max-h-[100vh]' : 'max-h-0'} overflow-hidden ease-in-out transition-all duration-1000`}>
        <Item data={data} serverHost={serverHost} />
      </div>
    </div>)
}

export default Notice;
