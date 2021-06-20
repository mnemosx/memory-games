import React, { useState } from "react";

import { BiMemoryCard, BiMenuAltRight } from "react-icons/bi";


export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navigation = [
    { link: '#', text: 'Games' },
    { link: '#', text: 'Link 2' },
    { link: '#', text: 'Link 3' },
  ];

  return (
    <header>
      <nav className="flex items-center justify-between flex-wrap bg-indigo-900 p-6">
        <div className="flex items-center flex-no-shrink text-white mr-6">
          <BiMemoryCard className="w-7 h-7 mr-5" />
          <span className="font-semibold text-xl tracking-tight">Memory Games</span>
        </div>
        <button className="focus:outline-none lg:invisible  cursor-pointer text-white focus:text-blue-300" onClick={toggleMobileMenu} >
          <BiMenuAltRight className="w-8 h-8" />
          <span className="sr-only">Open main menu</span>
        </button>
        <ul className={`${isMobileMenuOpen ? 'block' : 'hidden'} block w-full flex-grow lg:flex lg:items-center lg:w-auto`}>
          {navigation.map(nav => (
            <li key={nav.text}>
              <a href={nav.link} className="text-sm text-white ml-5 lg:flex-grow">
                {nav.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>

  )
}
