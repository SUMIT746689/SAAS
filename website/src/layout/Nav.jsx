'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';

const navLink = 'px-4 py-3 h-full hover:cursor-pointer hover:bg-sky-900 duration-150 ';

const primaryBgColor = 'bg-sky-700';
const primaryColor = 'text-sky-100';
const whiteColor = 'text-sky-100';
const secondaryColor = 'text-sky-700';

const classList = [
  {
    name: "EB - One",
    id: 1
  },
  {
    name: "EB Two",
    id: 2
  },
  {
    name: "EB Three",
    id: 3
  },
  {
    name: "EB Four",
    id: 4
  },
  {
    name: "EB Five",
    id: 5
  },
  {
    name: "Six",
    id: 6
  },
  {
    name: "Seven",
    id: 7
  },
  {
    name: "Eight",
    id: 8
  },
  {
    name: "Nine",
    id: 9
  },
  {
    name: "Ten",
    id: 10
  },
  {
    name: "Alim 1st",
    id: 11
  },
  {
    name: "Alim  2nd",
    id: 12
  },
  {
    name: "Fazil 1st",
    id: 13
  },
  {
    name: "Fazil 2nd",
    id: 14
  },
  {
    name: "Fazil 3rd",
    id: 15
  },
  {
    name: "Kamil 1st",
    id: 16
  },
  {
    name: "Kamil 2nd",
    id: 17
  },
  {
    name: "Play",
    id: 18
  }, {
    name: "One",
    id: 19
  },
]

const NavLinks = ({ serverhost }) => {
  return (
    <>
      <Link href="/">
        <div className={navLink}>প্রধান পাতা</div>
      </Link>
      <Link href="/teachers">
        <div className={navLink}> শিক্ষক</div>
      </Link>
      <Link href="/suborna-joyonti">
        <div className={navLink}> সুবর্ণজয়ন্তী কর্ণার</div>
      </Link>
      <Link href="/gallery">
        <div className={navLink}> গ্যালারী</div>
      </Link>

      <div className={navLink}> পরিক্ষা সংক্রান্ত</div>

      <Link href='/text-book'>
        <div className={navLink}> পাঠ্যপুস্তক</div>
      </Link>
      <Link href='/online-admission'>
        <div className={navLink}> অনলাইন ভর্তি</div>
      </Link>
      <Link href='/teachers-application'>
        <div className={navLink}> শিক্ষক আবেদন</div>
      </Link>

      {/* <div className="relative group">
        <div className={navLink} >
          <span>শিক্ষার্থীদের তথ্য</span>
        </div>
        <div className="absolute z-10 hidden bg-grey-200 group-hover:block">

          <div className={`px-2 pt-2 pb-4 ${primaryBgColor} ${primaryColor} shadow-lg rounded-b-lg`}>
            <div className={`flex flex-col h-80 w-full overflow-y-scroll  scrollbar `}>
              {
                classList.map(i =>
                  <Link className=' w-32 hover:cursor-pointer hover:bg-sky-800 duration-150' href={`/student-information/${i.id}`}><div className={navLink}>{i.name} </div></Link>
                )
              }


            </div>
          </div>
        </div>
      </div> */}
      {/* <div className={navLink}> ডিজিটাল হাজিরা </div> */}
      <Link href="/notice">
        <div className={navLink}> নোটিশ</div>
      </Link>
      <Link href={`${serverhost}`}>
        <div className={navLink}>
          লগইন
        </div>
      </Link>

    </>
  );
};

const MobileNavBar = ({ serverhost, primaryColor, primaryBgColor }) => {

  const [isHideNav, setisHideNav] = useState(true);
  const handleClick = () => {
    setisHideNav((value) => !value);
  }
  const handleHideNavbar = () => {
    setisHideNav((value) => true);
  }
  return (
    <>

      <nav className={`${isHideNav ? "hidden" : " fixed"} z-[70] top-0 left-0 w-screen overflow-y-auto h-screen backdrop-blur-sm`} onClick={handleHideNavbar}>
      </nav>

      <nav
        id="sidenav-6"
        className={` ${primaryColor} ${primaryBgColor} text-xs fixed left-0 top-0 z-[1035] h-screen w-48 duration-150 -translate-x-full overflow-hidden bg-sky-700 shadow-[0_4px_12px_0_rgba(0,0,0,0.5),_0_2px_4px_rgba(0,0,0,0.6)] data-[te-sidenav-hidden='false']:translate-x-0`}
        data-te-sidenav-init
        data-te-sidenav-hidden={isHideNav}
        data-te-sidenav-accordion={"true"}
      >

        <ul className="relative m-0 list-none px-[0.2rem]" data-te-sidenav-menu-ref>

          <Link href="/" onClick={handleHideNavbar}>
            <div className={navLink}>প্রধান পাতা</div>
          </Link>
          <Link href="/teachers" onClick={handleHideNavbar}>
            <div className={navLink}> শিক্ষক</div>
          </Link>
          <Link href="/suborna-joyonti" onClick={handleHideNavbar}>
            <div className={navLink}> সুবর্ণজয়ন্তী কর্ণার</div>
          </Link>
          <Link href="/gallery" onClick={handleHideNavbar}>
            <div className={navLink}> গ্যালারী</div>
          </Link>

          <div className={navLink}> পরিক্ষা সংক্রান্ত</div>
          <Link href='/text-book'>
            <div className={navLink} onClick={handleHideNavbar}> পাঠ্যপুস্তক</div>
          </Link>
          <Link href='/online-admission' onClick={handleHideNavbar}>
            <div className={navLink} > অনলাইন ভর্তি</div>
          </Link>
          <Link href='/teachers-application' onClick={handleHideNavbar}>
            <div className={navLink} > শিক্ষক আবেদন</div>
          </Link>
          <Link href="/notice" onClick={handleHideNavbar}>
            <div className={navLink} > নোটিশ</div>
          </Link>
          <Link href={`${serverhost}`} onClick={handleHideNavbar}>
            <div className={navLink}>
              লগইন
            </div>
          </Link>

          {/* <li class="relative">
            <a
              class="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
              data-te-sidenav-link-ref>
              <span
                class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-4 w-4">
                  <path
                    fill-rule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z"
                    clip-rule="evenodd" />
                </svg>
              </span>
              <span>Category 2</span>
              <span
                class="absolute right-0 ml-auto mr-[0.8rem] transition-transform duration-300 ease-linear motion-reduce:transition-none [&>svg]:text-gray-600 dark:[&>svg]:text-gray-300"
                data-te-sidenav-rotate-icon-ref>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="h-5 w-5">
                  <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clip-rule="evenodd" />
                </svg>
              </span>
            </a>
            <ul
              class="show !visible relative m-0 hidden list-none p-0 data-[te-collapse-show]:block "
              data-te-sidenav-collapse-ref>
              <li class="relative">
                <a
                  class="flex h-6 cursor-pointer items-center truncate rounded-[5px] py-4 pl-[3.4rem] pr-6 text-[0.78rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
                  data-te-sidenav-link-ref
                >Link 4</a
                >
              </li>
              <li class="relative">
                <a
                  class="flex h-6 cursor-pointer items-center truncate rounded-[5px] py-4 pl-[3.4rem] pr-6 text-[0.78rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
                  data-te-sidenav-link-ref
                >Link 5</a
                >
              </li>
            </ul>
          </li> */}
        </ul>

      </nav>

      <nav
        className=" sticky lg:hidden text-right top-0 shadow z-[60] shadow-sky-900 bg-sky-700 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white transition duration-150 ease-in-out hover:bg-sky-800 hover:shadow-lg focus:bg-sky-900 focus:scale-90 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-sky-800 active:shadow-lg"
      >
        <button
          onClick={handleClick}
          // className='w-full relative right-0'
          // className="sticky top-0 shadow z-[50] shadow-sky-900 bg-sky-700 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white transition duration-150 ease-in-out hover:bg-sky-800 hover:shadow-lg focus:bg-sky-900 focus:scale-90 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-sky-800 active:shadow-lg"
          data-te-sidenav-toggle-ref
          data-te-target="#sidenav-6"
          aria-controls="#sidenav-6"
          aria-haspopup="true">
          <span className="block [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd" />
            </svg>
          </span>
        </button>
      </nav>
    </>
  )
}

function Nav({ serverhost }) {

  return (
    <>
      <nav
        className={`${primaryBgColor} ${primaryColor} hidden lg:grid text-sm grid-flow-col divide-x sticky top-0.5 z-[60] shadow shadow-slate-800`}
      >
        <NavLinks serverhost={serverhost} />
      </nav>
      {/* <nav
        // className={`${primaryBgColor} ${primaryColor} lg:hidden grid lg: text-sm grid-flow-col justify-end divide-x`}
        // className={`${primaryBgColor} ${primaryColor} lg:hidden flex justify-end divide-x text-sm`}
      > */}
      <MobileNavBar serverhost={serverhost} primaryBgColor={primaryBgColor} primaryColor={primaryColor} />
      {/* </nav> */}
    </>
  );
}

export default Nav;
