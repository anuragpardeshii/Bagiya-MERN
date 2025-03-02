import React from "react";
import Sidebar from "../Sidebar";

export default function Rankings() {
  return (
    <>
    <Sidebar/>
      <section id="global-ranking" className="p-6 p-4 sm:p-8 sm:ml-64 bg-[#e5e7eb] min-h-screen">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Global Rankings</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-neutral-200/20">
              <span className="text-sm text-neutral-600">Your Global Rank:</span>
              <span className="ml-2 font-bold text-green-500">#156</span>
            </div>
            <select
              className="bg-white px-4 py-2 rounded-lg border border-neutral-200/20 focus:outline-none"
              fdprocessedid="ur98dm"
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>This Time</option>
            </select>
          </div>
        </header>
        {/* top 3 users */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-neutral-200/20 text-center order-2 md:order-1">
            <div className="text-3xl mb-2">🥈</div>
            <img src="https://avatar.iran.liara.run/public" alt="Second Place" className="w-20 h-20 rounded-full mx-auto mb-3"/>
            <h3 className="font-semibold">Sarah Chen</h3>
            <p className="text-neutral-600 text-sm mb-2">245 hours focused</p>
            <p className="text-sm text-green-500">21 days streak</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-neutral-200/20 text-center order-1 md:order-2">
            <div className="text-3xl mb-2">🥇</div>
            <img src="https://avatar.iran.liara.run/public" alt="Second Place" className="w-20 h-20 rounded-full mx-auto mb-3"/>
            <h3 className="font-semibold">Sarah Chen</h3>
            <p className="text-neutral-600 text-sm mb-2">298 hours focused</p>
            <p className="text-sm text-green-500">25 days streak</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-neutral-200/20 text-center order-1 md:order-3">
            <div className="text-3xl mb-2">🥇</div>
            <img src="https://avatar.iran.liara.run/public" alt="Second Place" className="w-20 h-20 rounded-full mx-auto mb-3"/>
            <h3 className="font-semibold">Mike Johnson</h3>
            <p className="text-neutral-600 text-sm mb-2">232 hours focused</p>
            <p className="text-sm text-green-500">18 days streak</p>
            </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200/20">
        <div className="p-4 border-b border-neutral-200/20">
        <h2 className="text-lg font-semibold">Global Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-neutral-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">Rank</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">User</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">Focus Hours</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">Current Streak</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">Trees Planted</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/20">
                <tr className="bg-green-50">
                    <td className="px-6 py-4 text-sm">4</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                            <img src="https://avatar.iran.liara.run/public" alt="User" className="w-8 h-8 rounded-full"/>
                            <span className="ml-2">David Lee</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm">225h</td>
                    <td className="px-6 py-4 text-sm">16 days</td>
                    <td className="px-6 py-4 text-sm">18</td>
                </tr>

                <tr className="bg-green-50">
                    <td className="px-6 py-4 text-sm">5</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                            <img src="https://avatar.iran.liara.run/public" alt="User" className="w-8 h-8 rounded-full"/>
                            <span className="ml-2">Emma Wilson</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm">218h</td>
                    <td className="px-6 py-4 text-sm">14 days</td>
                    <td className="px-6 py-4 text-sm">15</td>
                </tr>

                <tr className="bg-green-50">
                    <td className="px-6 py-4 text-sm">6</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                            <img src="https://avatar.iran.liara.run/public" alt="User" className="w-8 h-8 rounded-full"/>
                            <span className="ml-2">James Brown</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm">210h</td>
                    <td className="px-6 py-4 text-sm">12 days</td>
                    <td className="px-6 py-4 text-sm">14</td>
                </tr>

                </tbody>
            </table>
        </div>
        <div className="p-4 border-t border-neutral-200/20 flex justify-center">
        <nav className="flex space-x-2">
            <button className="px-3 py-1 rounded-lg hover:bg-neutral-100" fdprocessedid="bj4y7">Previous</button>
            <button className="px-3 py-1 rounded-lg bg-neutral-100" fdprocessedid="y7n2jm">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-neutral-100" fdprocessedid="9x2l5p">2</button>
            <button className="px-3 py-1 rounded-lg hover:bg-neutral-100" fdprocessedid="tnq9zd">3</button>
            <button className="px-3 py-1 rounded-lg hover:bg-neutral-100" fdprocessedid="rlift8">Next</button>
        </nav>
        </div>
        </div>
      </section>
    </>
  );
}
