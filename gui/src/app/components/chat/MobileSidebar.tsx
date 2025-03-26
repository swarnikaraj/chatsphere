'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MdCloseFullscreen } from "react-icons/md";
import { CiMenuKebab } from "react-icons/ci";
const MobileMenu: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <>
      {/* Hamburger Icon */}
      <button
      title="menu"
        onClick={toggleSidebar}
        className="lg:hidden fixed px-2 top-2 right-1 z-50 bg-transparent  text-gray-800 p-2 rounded-md"
      >
        <CiMenuKebab size={24} />
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
        {isSidebarOpen? <div
          
          className=" bg-[rgba(255,255,255,0.1)] backdrop-blur-md  shadow-lg border border-gray-700 text-white p-2 rounded-md"
        >
          <button title="close" onClick={toggleSidebar}><MdCloseFullscreen/></button>
        </div>:<></>}
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full  overflow-y-auto bg-gradient-to-b from-[#0e1011] to-[#09090a] text-white w-64 transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        <Sidebar />
        
      </div>
    </>
  );
};

export default MobileMenu;
