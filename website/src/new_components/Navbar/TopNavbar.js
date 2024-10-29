"use client"
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";
import Link from "next/link";
import { useContext, useEffect, useState } from "react"
export default function TopNavbar({ serverHost }) {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '',
    time: '',
    day: ''
  });
  const { language, handleChangeLang } = useContext(LanguageContext);

  const updateDateTime = () => {
    const now = new Date();

    const days = {
      english: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      bangla: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
    }

    const months = {
      english: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      bangla: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
    }

    String.prototype.toBanglaDigits = function () {
      // var id= ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const banglaNum = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
      return this.replace(/[0-9]/g, function (w) {
        return banglaNum[+w]
      });
    }

    String.prototype.toBanglaAmPmTime = function () {
      const banglaTran = { AM: 'পূর্বাহ্ণ', PM: 'অপরাহ্ণ' }
      return this.replace(/AM|PM/i, function (w) {
        return banglaTran[w]
      });
    }

    const day = days[language][now.getDay()];
    const date = now.getDate();
    const month = months[language][now.getMonth()];
    const year = now.getFullYear();
    const formattedDate = `${date} ${month} ${year}`;
    const time = now.toLocaleTimeString(); // Customize format if needed

    setCurrentDateTime({
      date: language === "bangla" ? formattedDate.toBanglaDigits() : formattedDate,
      time: language === "bangla" ? time.toBanglaDigits().toBanglaAmPmTime() : time,
      day
    });
  };

  useEffect(() => {
    // Set initial date and time
    updateDateTime();
    // Update date and time every second
    const intervalId = setInterval(updateDateTime, 1000);
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [language]);

  return (
    <div className=" bg-[#192F59] font-myFont">
      <div className="bg-blue-950 text-white flex flex-row justify-end sm:justify-between">
        <div className=" hidden sm:flex flex-row items-center px-8 gap-8  ">
          <div>{currentDateTime.day}</div>
          <div>{currentDateTime.date}</div>
          <div>{currentDateTime.time}</div>
        </div>
        <div className="flex flex-row py-4 px-8 gap-3">
          <Link href={serverHost} className="px-2 py-0 rounded bg-[#FFFEF3] text-[#192F59] flex items-center gap-1 font-bold">
            <p> {handleTextChangeLangWise(language, 'Login', 'লগইন')}</p>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </Link>
          <button onClick={handleChangeLang} className="px-3 py-1 bg-[#3DB166] text-[#FFFFFF] rounded capitalize w-20"> {language === "english" ? "বাংলা": "English"} </button>
        </div>
      </div>
    </div>
  );
}




