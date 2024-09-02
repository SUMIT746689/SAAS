import Image from "next/image";
import Link from "next/link";
import { FaRegAddressCard } from 'react-icons/fa';
import { FiPhoneCall } from 'react-icons/fi';
import { IoLocation } from 'react-icons/io5';
import { AiOutlineLogin } from 'react-icons/ai';

function Header({ name, address, phone, eiin_number, header_image, serverhost }) {

  return (
    <div className=" relative">

      {/* Top Nav bar */}
      <div className=" w-full bg-sky-800 text-sky-50 hidden lg:flex justify-between text-xs xl:text-base font-medium font-a">
        <div className="flex">
          <div className=" px-8 py-3 border-r border-sky-300 flex gap-1"><FaRegAddressCard className=" mt-1" /> EIIN: {eiin_number}</div>
          <div className=" px-8 py-3 flex gap-1"> <IoLocation className="mt-1" /> {address}</div>
        </div>

        <div className=" flex">
          <div className=" px-10 py-3 border-r border-sky-300 flex gap-2 "> <FiPhoneCall className=" mt-1" /> Hotline: <a href={`tel:${phone}`} className=" underline">{phone} </a></div>
          <Link href={`${serverhost}`} className=" px-10 py-3 border-r hover:bg-sky-900 duration-300 cursor-pointer flex gap-2"> <AiOutlineLogin className=" mt-1" /> Login</Link>
          <Link href="/online-admission" className=" px-10 py-3 bg-red-600 hover:bg-red-800 duration-300 cursor-pointer"> Apply Now</Link>
        </div>

      </div>

      <div className=" grid w-full justify-center lg:flex lg:justify-between py-8 " >
        <div className=" lg:w-40 mx-auto">
          <img className="mx-auto lg:mx-0 h-12 lg:h-auto my-auto object-contain object-center" width={200} height={20} src={header_image} />
        </div>

        <div className=" w-full text-2xl lg:text-4xl uppercase font-medium text-center text-sky-500"> {name} </div>

        <div className=" w-80 h-full hidden lg:block">
          <img className=" my-auto bg-sky-300 object-contain object-center " width={200} height={20} src={"slogan.png"} />
        </div>
      </div>
      {/* <div className=" absolute top-2 right-2 text-lg font-bold text-white bg-sky-700 rounded p-2">
        EIIN Number : {eiin_number}
      </div> */}

      {/* <img className=" max-h-80 object-cover w-screen" width={1500} height={200}
        src={header_image}
      /> */}
    </div>
  )
}

export default Header;
