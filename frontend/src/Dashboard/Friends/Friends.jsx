import React, { useState } from "react";
import { Trash2, Info } from "lucide-react";
import Sidebar from "../Sidebar";

export default function Friends() {
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const toggleDropdown = (id) => {
    setDropdownVisible(dropdownVisible === id ? null : id);
  };

  return (
    <>
      <Sidebar />
      <div className="p-4 sm:p-8 sm:ml-64 bg-[#e5e7eb] min-h-screen">
        <div className="rounded-lg">
          <div className="flex flex-wrap justify-between items-center pb-4 sm:pb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl text-gray-700 font-bold">
                Friends
              </h1>
            </div>
            <div className="sm:gap-8 w-full lg:w-1/3">
              <form className="max-w-xl gap-4 my-2 mx-auto">
                <label
                  htmlFor="default-search"
                  className="mb-2 text-sm font-medium text-gray-900 sr-only"
                >
                  Search
                </label>
                <div className="relative">
                  <input
                    type="search"
                    id="default-search"
                    className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search friends by username..."
                    required
                  />
                  <button
                    type="submit"
                    className="text-white absolute end-2.5 bottom-2.5 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm bg-gray-50 px-2 py-2"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Suggested Friends Section */}
          <div className="bg-white rounded-lg shadow-sm flex-1 p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4 ms-2">
              Suggested Friends
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((id) => (
                <div key={id} className="bg-gray-50 px-2 py-2 rounded-lg">
                  <div className="flex justify-around items-center">
                    <img
                      src="/avatar1.png"
                      className="w-16 h-16 rounded-lg"
                      alt="User Avatar"
                    />
                    <div>
                      <p>Anurag Pardeshi</p>
                      <p>156 hours focused</p>
                    </div>
                    <button
                      type="button"
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 focus:outline-none"
                    >
                      Add Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 mt-8">
          {/* Friends List Section */}
          <div className="bg-white rounded-lg shadow-sm flex-1 p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4 ms-2">Friends List</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((id) => (
                <div key={id} className="bg-gray-50 px-2 py-2 rounded-lg">
                  <div className="flex justify-around items-center">
                    <img
                      src="/avatar1.png"
                      className="w-16 h-16 rounded-lg"
                      alt="User Avatar"
                    />
                    <div>
                      <p>Anurag Pardeshi</p>
                      <p>156 hours focused</p>
                    </div>
                    <button
                      onClick={() => toggleDropdown(id)}
                      className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50"
                      type="button"
                    >
                      <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 16 3"
                      >
                        <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                      </svg>
                    </button>
                    {dropdownVisible === id && (
                      <div className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44">
                        <ul
                          className="py-2 text-sm text-gray-700"
                          aria-labelledby="dropdownMenuIconHorizontalButton"
                        >
                          <li>
                            <button
                              className="block flex px-4 font-bold py-2 text-md text-red-600 items-center hover:bg-gray-100"
                            >
                              <Trash2 className="w-5 mx-1" /> Remove Friend
                            </button>
                          </li>
                          <li>
                            <button
                              className="block flex items-center px-4 py-2 font-medium text-md text-blue-400 hover:bg-gray-100"
                            >
                              <Info className="w-5 mx-1" />
                              About
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}