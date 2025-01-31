import React from "react";
import Sidebar from "../Sidebar";
import { BadgeEuro, TreePine } from "lucide-react";

export default function Dashboard() {
  return (
    <>
      <Sidebar />
      <div className="p-4 sm:ml-64 bg-[#e5e7eb]">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex">
              <button type="button" className="bg-white rounded-lg p-2 m-1 flex">
                {" "}
                <BadgeEuro /> 1270 coins
              </button>
              <button type="button" className="bg-white rounded-lg p-2 m-1 flex">
                {" "}
                <TreePine /> 12 trees planted
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h1>Focus Timer</h1>
                <div>
                  <a type="button">Add Tag</a>
                  <a type="button" className="p-1 text-white rounded-lg bg-[green]">Start Focus</a>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">Statistics</div>
          </div>
        </div>
      </div>
    </>
  );
}
