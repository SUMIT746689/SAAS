"use client"
import Link from "next/link";
// import { IoChevronForwardOutline } from "react-icons/io5";
// import { IoChevronForwardSharp } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import React, { useContext, useState } from 'react';
import { LanguageContext } from "@/app/context/language";
import { handleTextChangeLangWise } from "@/utils/handleLanguage";

const LinkBtn = ({ website_link, children }) => <Link href={website_link ? website_link : '#'} className="text-black bg-white hover:text-white py-2 px-3 w-full font-medium whitespace-nowrap grid hover:bg-[#3DB166] text-xs border-b">{children}</Link>

const ShowChildNav = ({ title, children }) => {
  const [isChildMenuOpen, setIsChildMenuOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className={`${isChildMenuOpen ? 'bg-[#3DB166] text-white' : 'bg-slate-50'} w-full px-3 py-2 text-xs font-medium text-left flex items-center gap-1 border-b`}
        onClick={() => setIsChildMenuOpen(v => !v)}
      >
        {title} <IoIosArrowForward className={` duration-200 ${isChildMenuOpen ? ' rotate-90' : 'rotate-0'}`} />
      </button>
      {
        isChildMenuOpen && children}
    </div>
  )
}

const Menus = ({ navBar }) => {

  const [isChildMenuOpen, setIsChildMenuOpen] = useState(false);

  return navBar?.children.length === 0 ?
    <Link href={navBar.website_link ? navBar.website_link : '#'} className="text-white px-3 py-3 font-medium hover:bg-[#3DB166] text-sm">{navBar.title}</Link>
    :
    <div className="relative group">
      <button
        className={`${isChildMenuOpen ? 'bg-[#3DB166] text-white' : ' bg-transparent '} hover:bg-[#3DB166] w-full px-3 py-3 text-sm font-medium flex items-center gap-1`}
        onClick={() => setIsChildMenuOpen(v => !v)}
      > 
        {navBar.title} <IoChevronForwardOutline className={` duration-200 ${isChildMenuOpen ? ' rotate-90' : 'rotate-0'}`} />
      </button>
      {
        isChildMenuOpen && <FirstChildMenus navBar={navBar.children} />
      }
    </div>
}

const FirstChildMenus = ({ navBar }) => {

  return (
    <div className="absolute grid bg-white w-full text-gray-800 shadow whitespace-nowrap mt-[2px] rounded-sm z-50">
      {navBar.map((navBar, index) =>
        navBar?.children.length === 0 ?
          <LinkBtn website_link={navBar.website_link} key={index}>{navBar.title}</LinkBtn>
          :
          <div key={index} className="relative group ">
            <ShowChildNav title={navBar.title}>
              <MoreChildMenus navBar={navBar.children} />
            </ShowChildNav>
          </div>
      )}
    </div>
  )
}

const MoreChildMenus = ({ navBar }) => {
  return (
    <div className="absolute grid bg-white w-full text-gray-800 shadow whitespace-nowrap ml-[2px] left-full rounded-sm ">
      {navBar.map((navBar, index) =>
        navBar?.children.length === 0 ?
          <LinkBtn website_link={navBar.website_link} key={index}>{navBar.title}</LinkBtn>
          :
          <div key={index} className="relative group">
            <ShowChildNav title={navBar.title}>
              <MoreChildMenus navBar={navBar.children} />
            </ShowChildNav>
          </div>
      )}
    </div>
  )
}

export default function BottomNavbar({ menus: menuItems }) {

  const { language } = useContext(LanguageContext);

  function buildNestedNavbar(menuItems) {
    const menuMap = {};
    const nestedMenu = [];
console.log({menuItems})
    // First, map all menu items by their id
    menuItems.forEach(item => {
      console.log({item})
      let website_link = '';
      if (item.link_type === 'page link' || item.link_type === 'external link') website_link = item.website_link;
      else if (item.link_type === "dynamic page link") website_link = `/dynamic-pages/${item.websiteDynamicPage?.id}`;
      menuMap[item.id] = { ...item, website_link, title: item[`${language}_title`], children: [] };
    });

    // Then, construct the nested structure
    menuItems.forEach(item => {
      if (item.parent_id === null) {
        nestedMenu.push(menuMap[item.id]);
      } else {
        if (menuMap[item.parent_id]) {
          menuMap[item.parent_id].children.push(menuMap[item.id]);
        }
      }
    });

    return nestedMenu;
  }

  const nestedNavbar = buildNestedNavbar(menuItems);
  return (
    <>
      <div className="bg-gradient-to-r from-[#4D609B] to-[#8FD4F6] text-white">
        <ul className="flex flex-row duration-300 gap-[2px] ">
          <div className="grid space-x-4">
            <Menus navBar={{ title: handleTextChangeLangWise(language, 'Home', 'হোম'), website_link: "/", children: [] }} />
          </div>
          {
            nestedNavbar.map((navBar) => {
              return (
                <nav key={navBar.id}>
                  <div className="grid space-x-4">
                    <Menus navBar={navBar} />
                  </div>
                </nav>
              )
            })
          }
        </ul>
      </div>
    </>
  );
}
