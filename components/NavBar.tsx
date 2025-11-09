// components/NavBar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { NavItem } from '../types';

// Icons
const HomeIcon: React.FC = () => (
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
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const AnalyticsIcon: React.FC = () => (
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
      d="M3 13.125l6 6 9-9.75M13.5 16.5L12 18l-1.5-1.5m-1.5 0l3 3 6-6"
    />
  </svg>
);

const SettingsIcon: React.FC = () => (
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
      d="M10.325 4.317c.426-1.75 2.924-1.75 3.35 0a1.125 1.125 0 011.956.446c1.554 3.077 1.256 6.079-.693 7.828l-.375.375c-.279.279-.279.735 0 1.014l.375.375c1.95 1.749 2.248 4.75.694 7.827a1.125 1.125 0 01-1.956.446c-.426-1.75-2.924-1.75-3.35 0a1.125 1.125 0 01-1.956-.446c-1.554-3.077-1.256-6.079.693-7.828l.375-.375a.75.75 0 010-1.014l-.375-.375c-1.95-1.749-2.248-4.75-.694-7.827a1.125 1.125 0 011.956-.446z"
    />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const navItems: NavItem[] = [
  { name: 'Home', icon: <HomeIcon />, path: '/' },
  { name: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { name: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const NavBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-[420px] mx-auto bg-black border-t border-gray-800 py-3 px-4 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-sm font-medium transition-colors duration-200 ${
              isActive ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          {item.icon}
          {item.name}
        </NavLink>
      ))}
      <NavLink
        to="/scan"
        className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600 p-3 rounded-full shadow-lg transition-colors duration-200"
      >
        <PlusIcon />
      </NavLink>
    </nav>
  );
};

export default NavBar;
