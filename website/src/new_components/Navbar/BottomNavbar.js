"use client"
import Link from "next/link";
import { IoChevronForwardOutline } from "react-icons/io5";
import React, { useContext, useState } from 'react';
import { LanguageContext } from "@/app/context/language";

// const menuItems = [
//   { id: 1, name: 'Home', parentId: null },
//   { id: 2, name: 'About', parentId: null },
//   { id: 3, name: 'Team', parentId: 2 },
//   { id: 4, name: 'History', parentId: 2 },
//   { id: 5, name: 'Services', parentId: null },
//   { id: 6, name: 'Web Development', parentId: 5 },
//   { id: 7, name: 'App Development', parentId: 5 },
//   { id: 8, name: 'Contact', parentId: null },
//   { id: 9, name: 'Frontend', parentId: 6 },
//   { id: 10, name: 'Backend', parentId: 6 },
//   { id: 11, name: 'React', parentId: 9 },
//   { id: 12, name: 'Angular', parentId: 9 },
//   { id: 13, name: 'Node.js', parentId: 10 },
//   { id: 14, name: 'Express', parentId: 10 },
//   { id: 15, name: 'React Native', parentId: 7 },
//   { id: 16, name: 'Tailwind Css', parentId: 11 },

// ];

const LinkBtn = ({ website_link, children }) => <Link href={website_link ? website_link : '#'} className="text-black bg-white hover:text-white py-2 px-3 w-full font-medium whitespace-nowrap grid hover:bg-[#3DB166] text-xs border-b">{children}</Link>

const ShowChildNav = ({ title, children }) => {
  const [isChildMenuOpen, setIsChildMenuOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className={`${isChildMenuOpen ? 'bg-[#3DB166] text-white' : 'bg-slate-50'} w-full px-3 py-2 text-xs font-medium text-left flex items-center gap-1 border-b`}
        onClick={() => setIsChildMenuOpen(v => !v)}
      >
        {title} <IoChevronForwardOutline className={` duration-200 ${isChildMenuOpen ? ' rotate-90' : 'rotate-0'}`} />
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

  console.log({ menuItems })

  function buildNestedNavbar(menuItems) {
    const menuMap = {};
    const nestedMenu = [];

    // First, map all menu items by their id
    menuItems.forEach(item => {
      let website_link = '';
      if (item.link_type === 'page link' || item.link_type === 'external link') website_link = item.website_link;
      else if(item.link_type === "dynamic page link") website_link = `/dynamic-pages/${item.websiteDynamicPage.id}`;
      // item.link_type !== "dynamic page link" ? item.link_type : `${item.websiteDynamicPage?.id ? `/dynamic-pages/${item.websiteDynamicPage.id}` : '#'}`
      menuMap[item.id] = { ...item, website_link, title: item[`${language}_title`], children: [] };
    });
    console.log(menuMap)

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
  console.log(JSON.stringify(nestedNavbar, null, 2));

  return (
    <>
      <div className="bg-gradient-to-r from-[#4D609B] to-[#8FD4F6] text-white">
        <ul className="flex flex-row duration-300 gap-[2px] ">
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
