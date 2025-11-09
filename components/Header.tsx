// components/Header.tsx

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-black py-4 px-6 flex items-center justify-between shadow-md z-10">
      <h1 className="text-2xl font-bold text-white">Cal AI</h1>
      <button className="text-gray-400 hover:text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.246 24.246 0 00-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
      </button>
    </header>
  );
};

export default Header;