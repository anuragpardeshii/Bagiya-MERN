import Sidebar from "../Sidebar";
import { BadgeEuro, TreePine, Dot } from "lucide-react";
import React, { useState, useRef } from "react";
import { CircleSlider } from "react-circle-slider";
import Countdown from "react-countdown";

export default function Dashboard() {
  const [value, setValue] = useState(60); // Initial time in minutes
  const [timeLeft, setTimeLeft] = useState(value * 60000); // Track remaining time in ms
  const [isPaused, setIsPaused] = useState(false); // Paused state
  const [startCountdown, setStartCountdown] = useState(false); // Timer start state
  const countdownRef = useRef(null); // Reference to countdown

  // Handle slider value change
  const handleSliderChange = (newValue) => {
    setValue(newValue);
    setTimeLeft(newValue * 60000); // Update the time left in milliseconds
  };

  // Renderer for countdown
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      return <span>Time is up!</span>;
    } else {
      return (
        <span>
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </span>
      );
    }
  };

  // Function to reset the countdown
  const resetTimer = () => {
    setStartCountdown(false); // Stop countdown
    setIsPaused(false); // Ensure the countdown isn't paused
    setValue(60); // Reset slider value to 60 minutes
    setTimeLeft(60 * 60000); // Reset time left to initial value
  };

  return (
    <>
      <Sidebar />
      <div className="p-8 sm:ml-64 bg-[#e5e7eb]">
        <div className=" rounded-lg dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl text-gray-700 font-bold ms-2">Dashboard</h1>
            <div className="flex">
              <button
                type="button"
                className="bg-white rounded-lg p-2 m-1 flex"
              >
                {" "}
                <BadgeEuro className="text-[#FFAA1D]" /> 1270 coins
              </button>
              <button
                type="button"
                className="bg-white rounded-lg p-2 m-1 flex"
              >
                {" "}
                <TreePine className="text-[#22c55e]" /> 12 trees planted
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8">
              <div className="flex justify-between items-center">
                <h1 className="text-xl text-gray-700 font-semibold">
                  Focus Timer
                </h1>
                <div>
                  <a
                    className="text-black bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-3 py-2 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                  >
                    Add Tags
                  </a>
                  <a
                    type="button"
                    className="focus:outline-none text-white bg-[#22c55e] hover:bg-[#16a34a] cursor-pointer focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-2 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                  >
                    Start Focus
                  </a>
                </div>
              </div>
              <div className="relative flex mt-6 justify-center items-center">
                <CircleSlider
                  style={{ zIndex: "1000" }}
                  value={value}
                  stepSize={1}
                  onChange={handleSliderChange}
                  size={250}
                  max={120} // Maximum 120 minutes
                  gradientColorFrom="#22c55e"
                  gradientColorTo="#22c55e"
                  knobRadius={10}
                  circleWidth={20}
                />

                {/* Countdown Text Overlay */}
                <div className="absolute text-center">
                  {!startCountdown ? (
                    <div>
                      <h2 className="text-[#22c55e] text-4xl font-bold">
                        {value}
                      </h2>
                      <h2 className="text-2xl">Minutes</h2>
                    </div>
                  ) : (
                    <h3 className="text-[#85ce14] text-4xl">
                      <Countdown
                        ref={countdownRef}
                        date={Date.now() + timeLeft}
                        autoStart={!isPaused}
                        renderer={renderer}
                        onComplete={resetTimer}
                      />
                    </h3>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-8">
              <h1 className="text-xl text-gray-700 font-semibold">
                Statistics
              </h1>
              <div className="grid grid-cols-3 my-4">
                <div className="text-center">
                  <h4 className="text-[#22c55e] text-2xl font-bold">85%</h4>
                  <p>Success Rate</p>
                </div>
                <div className="text-center">
                  <h4 className="text-[#3b82f6] text-2xl font-bold">42</h4>
                  <p>Total Sessions</p>
                </div>
                <div className="text-center">
                  <h4 className="text-[#a855f7] text-2xl font-bold">26hr</h4>
                  <p>Total Focus Time</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-8 mt-8">
            <h2 className="text-xl text-gray-700 font-semibold my-6 ps-4">
              Recent Activities
            </h2>
            <div className="gap-4">
              <div className="flex justify-between items-center bg-gray-50 mb-4 p-4 rounded-lg">
                <div className="flex items-center">
                  <Dot size={40} color="green" />
                  <div>
                    <h2>DSA Problem Solving</h2>
                    <p>09:00 AM to 10:00 AM</p>
                  </div>
                </div>
                <div>
                  <h2>60 Minutues</h2>
                  <p>+100 coins</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 mb-4 p-4 rounded-lg">
                <div className="flex items-center">
                  <Dot size={40} color="red" />
                  <div>
                    <h2>DSA Problem Solving</h2>
                    <p>09:00 AM to 10:00 AM</p>
                  </div>
                </div>
                <div>
                  <h2>60 Minutues</h2>
                  <p>+100 coins</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Dot size={40} color="green" />
                  <div>
                    <h2>DSA Problem Solving</h2>
                    <p>09:00 AM to 10:00 AM</p>
                  </div>
                </div>
                <div>
                  <h2>60 Minutues</h2>
                  <p>+100 coins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
