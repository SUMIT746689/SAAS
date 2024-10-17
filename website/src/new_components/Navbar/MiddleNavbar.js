"use client";
import Image from "next/image";
import Link from "next/link";
export default function MiddleNavbar({ datas }) {
  const { 
    name, 
    eiin_number, 
    address, 
    email, 
    phone, 
    header_image, 
    is_scholarship_active 
  } = datas;
  console.log({ is_scholarship_active }); 
  return (
    <div className="bg-[#FFFEF3]">
      <div className="flex flex-row justify-between items-center gap-6 mx-8">
        <div className="flex flex-row items-center my-4">
          <div>
            <Image src={header_image} alt="header image" width={120} height={44} />
          </div>
          <div className="flex flex-col ml-10">
            <div className="text-[#0A033C] font-extrabold text-4xl mb-2">
              {name}
            </div>
            <ul className="flex flex-col sm:flex-row gap-6 text-sm text-[#232323]">
              <li><a>EIIN NO: {eiin_number}</a></li>
              <li><a>Address: {address}</a></li>
              <li><a>Email: {email}</a></li>
              <li><a>Phone No: {phone}</a></li>
              {is_scholarship_active && (
                <Link
                  href={`/scholarship`}
                  className="ml-40 rounded bg-[#FFFEF3] text-[#192F59] flex items-center gap-1 font-bold"
                >
                  <button className="bg-orange-800 text-[#FFFFFF] rounded capitalize px-2 py-1">
                    Scholarship
                  </button>
                </Link>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
