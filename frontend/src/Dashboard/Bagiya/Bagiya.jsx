import React, { useMemo } from "react";
import { Calendar, Trees } from "lucide-react";
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

export default function Bagiya() {
  const contributions = useMemo(() => generateContributions(), []);

  const colors = [
    "bg-gray-100",
    "bg-green-200",
    "bg-green-300",
    "bg-green-400",
    "bg-green-500",
  ];

  return (
    <>
      <Sidebar />
      <div className="p-8 sm:ml-64 bg-[#e5e7eb] h-full">
        <div className="rounded-lg dark:border-gray-700">
          <h1 className="text-3xl text-gray-700 font-bold ms-2 mb-8">Bagiya</h1>
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <p className="text-lg text-gray-600">Total Trees planted</p>
              <h2 className="text-2xl text-gray-700 font-bold">24</h2>
              <p className="text-[green] font-medium text-md">+3 this month</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <p className="text-lg text-gray-600">Current Streak</p>
              <h2 className="text-2xl text-gray-700 font-bold">15 days</h2>
              <p className="text-[green] font-medium text-md">Best: 21 dats</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <p className="text-lg text-gray-600">Total Focus hours</p>
              <h2 className="text-2xl text-gray-700 font-bold">126 hr</h2>
              <p className="text-[green] font-medium text-md">+12h this week</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8">
            <section class="relative bg-stone-50">
              <div class="bg-sky-400 w-full sm:w-40 h-40 rounded-full absolute top-1 opacity-20 max-sm:right-0 sm:left-56 z-0"></div>
              <div class="bg-emerald-500 w-full sm:w-40 h-24 absolute top-0 -left-0 opacity-20 z-0"></div>
              <div class="bg-purple-600 w-full sm:w-40 h-24 absolute top-40 -left-0 opacity-20 z-0"></div>
              <div class="w-full py-24 relative z-10 backdrop-blur-3xl">
                <div class="w-full max-w-7xl mx-auto px-2 lg:px-8">
                  <div class="grid grid-cols-12 gap-8 max-w-4xl mx-auto xl:max-w-full">
                    <div class="col-span-12 xl:col-span-5">
                      <h2 class="font-manrope text-3xl leading-tight text-gray-900 mb-1.5">
                        Upcoming Events
                      </h2>
                      <p class="text-lg font-normal text-gray-600 mb-8">
                        Don’t miss schedule
                      </p>
                      <div class="flex gap-5 flex-col">
                        <div class="p-6 rounded-xl bg-white">
                          <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-2.5">
                              <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                              <p class="text-base font-medium text-gray-900">
                                Jan 10,2020 - 10:00 - 11:00
                              </p>
                            </div>
                            <div class="dropdown relative inline-flex">
                              <button
                                type="button"
                                data-target="dropdown-default"
                                class="dropdown-toggle inline-flex justify-center py-2.5 px-1 items-center gap-2 text-sm text-black rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:text-purple-600  "
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="4"
                                  viewBox="0 0 12 4"
                                  fill="none"
                                >
                                  <path
                                    d="M1.85624 2.00085H1.81458M6.0343 2.00085H5.99263M10.2124 2.00085H10.1707"
                                    stroke="currentcolor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                  ></path>
                                </svg>
                              </button>
                              <div
                                id="dropdown-default"
                                class="dropdown-menu rounded-xl shadow-lg bg-white absolute top-full -left-10 w-max mt-2 hidden"
                                aria-labelledby="dropdown-default"
                              >
                                <ul class="py-2">
                                  <li>
                                    <a
                                      class="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                      href="javascript:;"
                                    >
                                      Edit
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      class="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                      href="javascript:;"
                                    >
                                      Remove
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <h6 class="text-xl leading-8 font-semibold text-black mb-1">
                            Meeting with a friends
                          </h6>
                          <p class="text-base font-normal text-gray-600">
                            Meet-Up for Travel Destination Discussion
                          </p>
                        </div>
                        <div class="p-6 rounded-xl bg-white">
                          <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-2.5">
                              <span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                              <p class="text-base font-medium text-gray-900">
                                Jan 10,2020 - 05:40 - 13:00
                              </p>
                            </div>
                            <div class="dropdown relative inline-flex">
                              <button
                                type="button"
                                data-target="dropdown-a"
                                class="dropdown-toggle inline-flex justify-center py-2.5 px-1 items-center gap-2 text-sm text-black rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:text-sky-400  "
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="4"
                                  viewBox="0 0 12 4"
                                  fill="none"
                                >
                                  <path
                                    d="M1.85624 2.00085H1.81458M6.0343 2.00085H5.99263M10.2124 2.00085H10.1707"
                                    stroke="currentcolor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                  ></path>
                                </svg>
                              </button>
                              <div
                                id="dropdown-a"
                                class="dropdown-menu rounded-xl shadow-lg bg-white absolute -left-10 top-full w-max mt-2 hidden"
                                aria-labelledby="dropdown-a"
                              >
                                <ul class="py-2">
                                  <li>
                                    <a
                                      class="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                      href="javascript:;"
                                    >
                                      Edit
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      class="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                      href="javascript:;"
                                    >
                                      Remove
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <h6 class="text-xl leading-8 font-semibold text-black mb-1">
                            Visiting online courcse
                          </h6>
                          <p class="text-base font-normal text-gray-600">
                            Checks updates for design course
                          </p>
                        </div>
                        <div class="p-6 rounded-xl bg-white">
                          <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-2.5">
                              <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                              <p class="text-base font-medium text-gray-900">
                                Jan 14, 2020 10:00 - 11:00
                              </p>
                            </div>
                            <div class="dropdown relative inline-flex">
                              <button
                                type="button"
                                data-target="dropdown-b"
                                class="dropdown-toggle inline-flex justify-center py-2.5 px-1 items-center gap-2 text-sm text-black rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:text-emerald-600  "
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="4"
                                  viewBox="0 0 12 4"
                                  fill="none"
                                >
                                  <path
                                    d="M1.85624 2.00085H1.81458M6.0343 2.00085H5.99263M10.2124 2.00085H10.1707"
                                    stroke="currentcolor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                  ></path>
                                </svg>
                              </button>
                              <div
                                id="dropdown-b"
                                class="dropdown-menu rounded-xl shadow-lg bg-white absolute -left-10 top-full w-max mt-2 hidden"
                                aria-labelledby="dropdown-b"
                              >
                                <ul class="py-2">
                                  <li>
                                    <a
                                      class="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                      href="javascript:;"
                                    >
                                      Edit
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      class="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                      href="javascript:;"
                                    >
                                      Remove
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <h6 class="text-xl leading-8 font-semibold text-black mb-1">
                            Development meet
                          </h6>
                          <p class="text-base font-normal text-gray-600">
                            Discussion with developer for upcoming project
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="col-span-12 xl:col-span-7 px-2.5 py-5 sm:p-8 bg-gradient-to-b from-white/25 to-white xl:bg-white rounded-2xl max-xl:row-start-1">
                      <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-5">
                        <div class="flex items-center gap-4">
                          <h5 class="text-xl leading-8 font-semibold text-gray-900">
                            January 2024
                          </h5>
                          <div class="flex items-center">
                            <button class="text-indigo-600 p-1 rounded transition-all duration-300 hover:text-white hover:bg-indigo-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M10.0002 11.9999L6 7.99971L10.0025 3.99719"
                                  stroke="currentcolor"
                                  stroke-width="1.3"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                              </svg>
                            </button>
                            <button class="text-indigo-600 p-1 rounded transition-all duration-300 hover:text-white hover:bg-indigo-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M6.00236 3.99707L10.0025 7.99723L6 11.9998"
                                  stroke="currentcolor"
                                  stroke-width="1.3"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="border border-indigo-200 rounded-xl">
                        <div class="grid grid-cols-7 rounded-t-3xl border-b border-indigo-200">
                          <div class="py-3.5 border-r rounded-tl-xl border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                            Sun
                          </div>
                          <div class="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                            Mon
                          </div>
                          <div class="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                            Tue
                          </div>
                          <div class="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                            Wed
                          </div>
                          <div class="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                            Thu
                          </div>
                          <div class="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                            Fri
                          </div>
                          <div class="py-3.5 rounded-tr-xl bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                            Sat
                          </div>
                        </div>
                        <div class="grid grid-cols-7 rounded-b-xl">
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50">
                            <span class="text-xs font-semibold text-gray-400">
                              27
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              28
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              29
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              30
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              31
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              1
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              2
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 relative bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              3
                            </span>
                            <div class="absolute top-9 bottom-1 left-3.5 p-1.5 xl:px-2.5 h-max rounded bg-purple-50 ">
                              <p class="hidden xl:block text-xs font-medium text-purple-600 mb-px">
                                Meeting
                              </p>
                              <span class="hidden xl:block text-xs font-normal text-purple-600 whitespace-nowrap">
                                10:00 - 11:00
                              </span>
                              <p class="xl:hidden w-2 h-2 rounded-full bg-purple-600"></p>
                            </div>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              4
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              5
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              6
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white relative border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              7
                            </span>
                            <div class="absolute top-9 bottom-1 left-3.5 p-1.5 xl:px-2.5 h-max rounded bg-emerald-50 ">
                              <p class="hidden xl:block text-xs font-medium text-emerald-600 mb-px whitespace-nowrap">
                                Developer Meetup
                              </p>
                              <span class="hidden xl:block text-xs font-normal text-emerald-600 whitespace-nowrap">
                                10:00 - 11:00
                              </span>
                              <p class="xl:hidden w-2 h-2 rounded-full bg-emerald-600"></p>
                            </div>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              8
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-indigo-600 sm:text-white sm:w-6 sm:h-6 rounded-full sm:flex items-center justify-center sm:bg-indigo-600">
                              9
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              10
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              11
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              12
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              13
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              14
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              15
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              16
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              17
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              18
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 relative bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              19
                            </span>
                            <div class="absolute top-9 bottom-1 left-3.5 p-1.5 xl:px-2.5 h-max rounded bg-sky-50 ">
                              <p class="hidden xl:block text-xs font-medium text-sky-600 mb-px whitespace-nowrap">
                                Developer Meetup
                              </p>
                              <span class="hidden xl:block text-xs font-normal text-sky-600 whitespace-nowrap">
                                10:00 - 11:00
                              </span>
                              <p class="xl:hidden w-2 h-2 rounded-full bg-sky-600"></p>
                            </div>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              20
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              21
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              22
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              23
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              24
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              25
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              26
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              27
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              28
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              29
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              30
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-indigo-200 rounded-bl-xl transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-900">
                              31
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              1
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              2
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              3
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 relative bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              4
                            </span>
                            <div class="absolute top-9 bottom-1 left-3.5 p-1.5 xl:px-2.5 h-max rounded bg-purple-50 ">
                              <p class="hidden xl:block text-xs font-medium text-purple-600 mb-px whitespace-nowrap">
                                Friends Meet
                              </p>
                              <span class="hidden xl:block text-xs font-normal text-purple-600 whitespace-nowrap">
                                09:00 - 13:42
                              </span>
                              <p class="xl:hidden w-2 h-2 rounded-full bg-purple-600"></p>
                            </div>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              5
                            </span>
                          </div>
                          <div class="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-indigo-200 rounded-br-xl transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                            <span class="text-xs font-semibold text-gray-400">
                              6
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
            <h3 className="text-xl font-semibold mb-4 ms-2">Plant a Tree</h3>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-green-800 mb-4">
                You have <span className="font-bold">2,500 coins</span>{" "}
                available. Each tree costs 1,000 coins to plant.
              </p>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                aria-label="Plant a tree using 1,000 coins"
              >
                Plant a Tree (1,000 coins)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 mt-8">
            <h2 className="text-xl font-semibold mb-4 ms-2">
              Recent Activities
            </h2>
            <div className="gap-4">
              <div className="flex justify-between items-center bg-gray-50 mb-4 p-4 rounded-lg">
                <div className="flex items-center">
                  <Trees size={40} color="green" className="me-2" />
                  <div>
                    <h2 className="text-md text-gray-600 font-medium">
                      Oak Tree Planted
                    </h2>
                    <p className="text-sm text-gray-700">March 10, 2024</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h2>-1000 coins</h2>
                  <p className="text-[green]">Trees for the Future</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 mb-4 p-4 rounded-lg">
                <div className="flex items-center">
                  <Trees size={40} color="green" className="me-2" />
                  <div>
                    <h2 className="text-md text-gray-600 font-medium">
                      Oak Tree Planted
                    </h2>
                    <p className="text-sm text-gray-700">March 10, 2024</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h2>-1000 coins</h2>
                  <p className="text-[green]">Trees for the Future</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 mb-4 p-4 rounded-lg">
                <div className="flex items-center">
                  <Trees size={40} color="green" className="me-2" />
                  <div>
                    <h2 className="text-md text-gray-600 font-medium">
                      Oak Tree Planted
                    </h2>
                    <p className="text-sm text-gray-700">March 10, 2024</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h2>-1000 coins</h2>
                  <p className="text-[green]">Trees for the Future</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
