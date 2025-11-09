// pages/SettingsPage.tsx

import React from 'react';
import Button from '../components/ui/Button';

const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col flex-grow p-4 pt-0 pb-20 bg-black overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

      <div className="space-y-6">
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Profile</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Name</span>
              <span className="text-gray-400">John Doe</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email</span>
              <span className="text-gray-400">john.doe@example.com</span>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Preferences</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Privacy & Data</h3>
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full">
              Export My Data
            </Button>
            <Button variant="outline" className="w-full text-red-400 border-red-400 hover:bg-red-900">
              Delete Account
            </Button>
          </div>
        </div>

        <Button variant="secondary" className="w-full mt-6">
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
