import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import Sidebar from '../Sidebar';

const generateContributions = () => {
  const contributions = [];
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    contributions.unshift({
      date,
      count: Math.floor(Math.random() * 5), // 0-4 contributions
    });
  }
  return contributions;
};

export default function Bagiya() {
  const contributions = useMemo(() => generateContributions(), []);

  const colors = ['bg-gray-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500'];

  return (
    <>
      <Sidebar />
      <div className="p-8 sm:ml-64 bg-[#e5e7eb] h-full">
        <div className=" rounded-lg dark:border-gray-700"></div>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold">Focus Streak</h2>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1">
                {contributions.map((day, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-sm ${colors[day.count]}`}
                    title={`${day.date.toDateString()}: ${day.count} contributions`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Plant a Tree</h3>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-green-800 mb-4">
                You have <span className="font-bold">2,500 coins</span> available.
                Each tree costs 1,000 coins to plant.
              </p>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                aria-label="Plant a tree using 1,000 coins"
              >
                Plant a Tree (1,000 coins)
              </button>
            </div>
          </div>
        </div>
        </div>
    </>
  );
}
