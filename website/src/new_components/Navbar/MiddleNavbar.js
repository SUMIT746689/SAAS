import Image from "next/image";
export default function MiddleNavbar({ datas }) {
  const { name, eiin_number, address, email, phone, header_image } = datas;
  // name: school_info?.school?.name,
  // phone: school_info?.school?.phone,
  // address: school_info?.school?.address,
  // eiin_number: school_info?.eiin_number,
  // header_image: `${process.env.SERVER_HOST}/api/get_file/${school_info?.header_image?.replace(/\\/g, '/')}`,
  // serverHost: `${process.env.SERVER_HOST}`
  return (
    <div className="bg-[#FFFEF3]">
      <div className="flex flex-row justify-between items-center gap-6  mx-8">
        <div className="flex flex-row item-center my-4 items-center"><div className="">
          <Image src={header_image} alt="header image" width={120} height={44} />
        </div>
          <div className="flex flex-col ml-10 ">
            <div className="text-[#0A033C]  font-extrabold	text-4xl mb-2">{name}</div>
            <ul className="flex flex-col sm:flex-row gap-6 text-sm text-[#232323]">
              <li><a>EIIN NO: {eiin_number}</a></li>
              <li><a>Address: {address}</a></li>
              <li><a>Email: {email}</a></li>
              <li><a>Phone No: {phone}</a></li>
            </ul>
          </div></div>
        {/* <div className="hidden sm:block">
          <Image src="/mojib.png" alt="mujib" width={216} height={77} />
        </div> */}
      </div>
    </div>
  );
}