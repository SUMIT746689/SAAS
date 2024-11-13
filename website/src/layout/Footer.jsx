import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import {
  AiOutlineTwitter,
  AiOutlineGooglePlus,
  AiOutlineYoutube,
  AiOutlineLinkedin,
} from "react-icons/ai";
import Link from "next/link";

const primaryBgColor = "bg-sky-700";
const primaryColor = "text-sky-100";
const whiteColor = "text-gray-100";
const secondaryColor = "text-sky-700";

const footerIconClass ="cursor-pointer p-3 text-2xl lg:text-3xl w-10 h-10 lg:w-12 lg:h-12 rounded-full shadow-sm shadow-black hover:rotate-[360deg] duration-500 scale-1.1";

function Footer({ facebook_link, twitter_link, youtube_link, google_link, linkedin_link }) {
  return (
    <>
      <footer
        className={`${primaryBgColor} ${primaryColor} py-4 px-20 grid md:grid-cols-2 justify-between`}
      >
        <div className=" relative top-4 mb-4 text-center md:text-left">
          ©Copyright© 2023 MRAM Technologies Ltd . All Rights Reserved.
        </div>
        <div className=" text-sm lg:text-2xl flex gap-2 pt-3 md:pt-0 justify-center md:justify-end">
          <Link href={facebook_link} target='_blank'><FaFacebookF className={footerIconClass} /></Link>
          <Link href={twitter_link}  target='_blank'><AiOutlineTwitter className={footerIconClass} /></Link>
          <Link href={google_link} target='_blank'><AiOutlineGooglePlus className={footerIconClass} /></Link>
          <Link href={youtube_link} target='_blank'>  <AiOutlineYoutube className={footerIconClass} /></Link>
          <Link href={linkedin_link} target='_blank'><FaLinkedinIn className={footerIconClass} /></Link>         
        </div>
      </footer>
    </>
  );
}

export default Footer;
