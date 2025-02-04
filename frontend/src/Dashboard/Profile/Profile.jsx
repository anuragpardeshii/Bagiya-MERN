import React from "react";
import { UserPen } from "lucide-react";
import Sidebar from "../Sidebar";

export default function Profile() {
  return (
    <>
      <Sidebar />
      <div className="p-4 sm:p-8 sm:ml-64 bg-[#e5e7eb] min-h-screen">
        <div className="rounded-lg dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-center pb-4 sm:pb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl text-gray-700 font-bold">
                My Profile
              </h1>
            </div>
            <div>
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 sm:px-5 sm:py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm flex-1 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <img
                  src="/avatar.png"
                  alt="Profile"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg"
                />
                <div>
                  <p className="text-lg sm:text-xl font-medium">Anurag Pardeshi</p>
                  <p className="text-sm sm:text-base text-gray-600">
                    Member since 21 January 2025
                  </p>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  className="bg-gray-50 text-gray-600 shadow-sm flex items-center gap-2 rounded-lg px-3 py-2"
                >
                  <UserPen size={16} /> Edit
                </button>
              </div>
            </div>

            <form className="mt-4">
              <div className="grid gap-4 mb-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Anurag Pardeshi"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="anuragpardeshi"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="datepicker-actions"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    DOB
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-500"
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
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                      placeholder="Select date"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="123-45-678"
                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="john.doe@company.com"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="bio"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows="4"
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your thoughts here..."
                ></textarea>
              </div>
            </form>
          </div>

          {/* Statistics Section */}
          <div className="flex flex-col gap-4 sm:gap-8 w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h1 className="text-xl text-gray-700 font-semibold mb-4">
                Statistics
              </h1>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-gray-600">Current Streak</p>
                  <p className="text-gray-800 font-bold">15 days</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Longest Streak</p>
                  <p className="text-gray-800 font-bold">21 days</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Total Focus Time</p>
                  <p className="text-gray-800 font-bold">126 hours</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Trees Planted</p>
                  <p className="text-gray-800 font-bold">24 trees</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Success Rate</p>
                  <p className="text-gray-800 font-bold">85%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h1 className="text-xl text-gray-700 font-semibold mb-4">
                Achievements
              </h1>
              <div className="space-y-4">
                <div className="bg-gray-50 flex items-center gap-4 p-4 rounded-lg">
                  <img src="/trophy.png" className="w-8 h-8" alt="Trophy" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">
                      21-Day Streak
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Maintained focus for 21 consecutive days
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 flex items-center gap-4 p-4 rounded-lg">
                  <img src="/trophy.png" className="w-8 h-8" alt="Trophy" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">
                      Forest Guardian
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Maintained focus for 21 consecutive days
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 flex items-center gap-4 p-4 rounded-lg">
                  <img src="/trophy.png" className="w-8 h-8" alt="Trophy" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">
                      21-Day Streak
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Maintained focus for 21 consecutive days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}