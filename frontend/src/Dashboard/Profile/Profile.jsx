import React, { useMemo } from "react";
import { UserPen } from "lucide-react";
import Sidebar from "../Sidebar";

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

export default function Profile() {
  return (
    <>
      <Sidebar />
      <div className="p-8 sm:ml-64 bg-[#e5e7eb] h-full">
        <div className="rounded-lg dark:border-gray-700">
          <div className="flex flex-wrap justify-between pb-8">
            <div>
              <h1 className="text-3xl text-gray-700 font-bold ms-2">
                My Profile
              </h1>
            </div>
            <div>
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 flex-wrap gap-8">
          <div className="bg-white flex flex-col justify-between rounded-xl col-span-3 shadow-sm p-4">
            <div className="flex items-center p-8 justify-between">
              <div className="flex gap-4 items-center">
                <img
                  src="/avatar.png"
                  alt=""
                  className="rounded-lg"
                  style={{ width: "4rem" }}
                />
                <div>
                  <p>Anurag Pardeshi</p>
                  <p>Member since 21 January 2025</p>
                </div>
              </div>
              <div>
                <a
                  type="button"
                  className="bg-gray-50 text-gray-600 shadow-sm flex gap-2 rounded-lg p-2"
                >
                  <UserPen /> Edit
                </a>
              </div>
            </div>

            <form>
              <div className="grid gap-6 mb-4 px-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Anurag Pardeshi"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="anuragpardeshi"
                    required
                  />
                </div>
                <div className="relative">
                  <div>
                    <label
                      htmlFor="datepicker-actions"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      DOB
                    </label>
                  </div>
                  <div className="absolute pt-3 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                    </svg>
                  </div>
                  <input
                    id="datepicker-actions"
                    datepicker
                    datepicker-buttons
                    datepicker-autoselect-today
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Select date"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="123-45-678"
                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                    required
                  />
                </div>
              </div>
              <div className="mb-4 px-6">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="john.doe@company.com"
                  required
                />
              </div>
              <div className="mb-4 px-6">
                <label
                  htmlFor="bio"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows="4"
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Write your thoughts here..."
                ></textarea>
              </div>
            </form>
          </div>
          <div className="bg-white rounded-xl col-span-2 shadow-sm p-8">
            <h1>Statistics</h1>
            <div className="flex justify-between">
              <p>Current Streak</p>
              <p>15 days</p>
            </div>
            <div className="flex justify-between">
              <p>Longest Streak</p>
              <p>21 days</p>
            </div>
            <div className="flex justify-between">
              <p>Total Focus Time</p>
              <p>126 hours</p>
            </div>
            <div className="flex justify-between">
              <p>Trees Planted</p>
              <p>24 trees</p>
            </div>
            <div className="flex justify-between">
              <p>Success Rate</p>
              <p>85%</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
