// pages/HomePage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';

// Dummy data for recently uploaded items
const recentlyUploaded = [
  {
    id: 1,
    name: 'Morning Selfie',
    time: 'Yesterday',
    image: 'https://picsum.photos/100/100?random=1',
    score: 85,
  },
  {
    id: 2,
    name: 'Evening Scan',
    time: '2 days ago',
    image: 'https://picsum.photos/100/100?random=2',
    score: 78,
  },
  {
    id: 3,
    name: 'Weekly Check',
    time: 'Last week',
    image: 'https://picsum.photos/100/100?random=3',
    score: 82,
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleScanNowClick = () => {
    navigate('/scan');
  };

  return (
    <div className="flex flex-col flex-grow p-4 pt-0 pb-20 bg-black overflow-y-auto">
      <div className="mb-6 flex justify-between items-center text-gray-400">
        <span className="text-white font-semibold">Today</span>
        <span>Yesterday</span>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-lg flex flex-col items-center text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Your Skin Health</h2>
        <ProgressBar progress={82} size={150} strokeWidth={12} label="" />
        <p className="mt-4 text-lg text-emerald-400 font-bold">82% Excellent</p>
        <p className="text-sm text-gray-400 mt-2">Maintain your routine!</p>

        <Button onClick={handleScanNowClick} className="mt-6 w-full max-w-xs" size="lg">
          Scan Your Skin Now
        </Button>
      </div>

      <h3 className="text-lg font-semibold mb-4 text-gray-200">Recently Scanned</h3>
      <div className="space-y-4">
        {recentlyUploaded.map((item) => (
          <div
            key={item.id}
            className="flex items-center bg-gray-900 rounded-lg p-3 shadow-md"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded-md object-cover mr-4"
            />
            <div className="flex-grow">
              <p className="font-semibold text-gray-200">{item.name}</p>
              <p className="text-sm text-gray-400">{item.time}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{item.score}%</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
