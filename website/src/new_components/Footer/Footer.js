
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
export default function Footer({school_info,datas ,resQuickDatas}) {
	console.log("datas............datas" , {resQuickDatas})
	const {
		header_image,
	  } = datas;
	const { google_map_link,facebook_link,youtube_link,twitter_link } = school_info;
	const { english_title,bangla_title,link_type,website_link } = resQuickDatas;
	return (
		<div>
			<footer className=" bg-sky-400 border-t">
				<div className="grid grid-cols-2 lg:grid-cols-4 py-8 text-sm ">
					<div className="mx-auto flex flex-col justify-between">
					{/* <div> */}
						<Image src={header_image} alt="header image" width={80} height={32} />
					{/* </div> */}
						<div className=" text-sm  ">
							{/* <p className="text-black">©2024 Edu360 </p> */}
							<p>Powered by: 
						<Image src="/edu.png" alt="edu image" width={80} height={32} />
							</p>

							<p>MRAM Technologies Ltd.</p>
							</div>
					</div>


					{resQuickDatas.forEach(item => {
					<div>
						<div>{item.english_title}</div>
					<div>{item.bangla_title}</div>
					<div>{item.link_type}</div>
					<div>{item.website_link}</div>
					</div>
					})}


					<div className="lg:space-y-2 space-y-0  mx-auto">
						<h3 className=" text-[#1F1C14] font-semibold text-2xl">Quick links</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a rel="text-base font-normal" href="#">{english_title}</a>
							</li>
							<li>
								<a rel="text-base font-normal" href="#">About</a>
							</li>
							<li>
								<a rel="text-base font-normal" href="#">Histroy</a>
							</li>
							<li>
								<a rel="text-base font-normal" href="#">Admissions</a>
							</li>
							<li>
								<a rel="text-base font-normal" href="#">Notice</a>
							</li>
							<li>
								<a rel="text-base font-normal" href="#">Contact</a>
							</li>
						</ul>
					</div>




					
					<div className="lg:space-y-2 space-y-0  mx-auto">
						<h3 className=" text-[#1F1C14] font-semibold text-2xl">Contact</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a rel="text-base font-normal" href="#">Address : Gulshan, Link Road</a>
							</li>
							<li>
								<a rel="text-base font-normal" href="#">Contact No : 0130</a>
							</li>
							<li>
								<a rel="text-base font-normal" href="#">Email : mukta@gmail.com</a>
							</li>
							
						</ul>
					</div>
					{/* <div className="mx-auto ">
						<div className="flex justify-start flex-col">
							<p className="font-bold">Address : Gulshan Link Road</p>
							<p className="font-bold ">Contact No : <span>01302564259</span></p>
							<p className="font-bold">Email : mukta@gmail.com</p>
						</div>
					</div> */}
					<div className="mx-auto flex flex-col gap-4">
						<div className="flex justify-start lg:space-x-3 space-y-1">
							<Link href={facebook_link || '#'} className="text-3xl  text-fuchsia-950">
							<FaFacebook />
							</Link>
						    {/* <Link href={youtube_link || '#'} className="text-2xl text-red-800">
							<FaYoutube />
							</Link> */}
						</div>
						
						<div  className="flex justify-start lg:space-x-3 space-y-1">	
							<Link href={google_map_link || '#'} className="text-3xl text-blue-700">
							<FaMapMarkerAlt />
							</Link>
							{/* <Link href={twitter_link || '#'} className="text-2xl  text-pink-700">
							<FaTwitter />
							</Link> */}
 						</div>
						<div className="flex justify-start lg:space-x-3 space-y-1">
							{/* <Link href={facebook_link || '#'} className="text-2xl  text-green-600">
							<FaFacebook />
							</Link> */}
						    <Link href={youtube_link || '#'} className="text-3xl text-red-800">
							<FaYoutube />
							</Link>
						</div>
						
						<div  className="flex justify-start lg:space-x-3 space-y-1">	
							{/* <Link href={google_map_link || '#'} className="text-2xl text-blue-800">
							<FaMapMarkerAlt />
							</Link> */}
							<Link href={twitter_link || '#'} className="text-3xl  text-pink-700">
							<FaTwitter />
							</Link>
 						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}