// pages/AnalyticsPage.tsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import ProgressBar from '../components/ui/ProgressBar';

const data = [
  { name: 'Mon', score: 70, acne: 10, wrinkles: 5, hyperpigmentation: 3 },
  { name: 'Tue', score: 72, acne: 9, wrinkles: 4, hyperpigmentation: 2 },
  { name: 'Wed', score: 75, acne: 8, wrinkles: 4, hyperpigmentation: 2 },
  { name: 'Thu', score: 78, acne: 7, wrinkles: 3, hyperpigmentation: 1 },
  { name: 'Fri', score: 80, acne: 6, wrinkles: 3, hyperpigmentation: 1 },
  { name: 'Sat', score: 82, acne: 5, wrinkles: 2, hyperpigmentation: 1 },
  { name: 'Sun', score: 85, acne: 4, wrinkles: 2, hyperpigmentation: 0 },
];

const AnalyticsPage: React.FC = () => {
  return (
    <div className="flex flex-col flex-grow p-4 pt-0 pb-20 bg-black overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Your Progress</h2>

      <div className="flex justify-around bg-gray-900 rounded-xl p-2 mb-6 shadow-md text-sm text-gray-400">
        <span className="px-3 py-1 bg-emerald-700 rounded-lg text-white font-semibold">90 Days</span>
        <span className="px-3 py-1">6 Months</span>
        <span className="px-3 py-1">1 Year</span>
        <span className="px-3 py-1">All time</span>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 mb-6 shadow-lg text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Overall Score Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-400 mt-4">Your skin health has improved by 5% this week!</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 mb-6 shadow-lg text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Key Issue Tracking</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="acne" fill="#ef4444" name="Acne" />
            <Bar dataKey="wrinkles" fill="#f97316" name="Wrinkles" />
            <Bar dataKey="hyperpigmentation" fill="#eab308" name="Hyperpigmentation" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-400 mt-4">Acne severity has decreased significantly.</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 mb-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Current Goals</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ProgressBar progress={70} size={60} strokeWidth={8} label="" color="text-sky-400" />
            <div className="flex-grow">
              <p className="font-semibold text-gray-200">Reduce Redness</p>
              <p className="text-sm text-gray-400">Target: 20% reduction</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProgressBar progress={55} size={60} strokeWidth={8} label="" color="text-fuchsia-400" />
            <div className="flex-grow">
              <p className="font-semibold text-gray-200">Improve Hydration</p>
              <p className="text-sm text-gray-400">Target: 15% increase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
