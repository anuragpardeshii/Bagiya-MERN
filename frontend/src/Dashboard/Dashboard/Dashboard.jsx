import Sidebar from "../Sidebar";
import { BadgeEuro, TreePine, Dot } from "lucide-react";
import React, { useState, useRef } from "react";
import { CircleSlider } from "react-circle-slider";
import Countdown from "react-countdown";

export default function Dashboard() {
  const [value, setValue] = useState(60);
  const [timeLeft, setTimeLeft] = useState(value * 60000);
  const [isPaused, setIsPaused] = useState(false);
  const [startCountdown, setStartCountdown] = useState(false);
  const countdownRef = useRef(null);

  const handleSliderChange = (newValue) => {
    setValue(newValue);
    setTimeLeft(newValue * 60000);
  };

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

  const resetTimer = () => {
    setStartCountdown(false);
    setIsPaused(false);
    setValue(60);
    setTimeLeft(60 * 60000);
  };

  return (
    <>
      <Sidebar />
      <div className="p-4 sm:ml-64 bg-[#e5e7eb] min-h-screen">
        <div className="rounded-lg dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h1 className="text-3xl text-gray-700 font-bold mb-4 md:mb-0">Dashboard</h1>
            <div className="flex flex-wrap gap-2">
              <button className="bg-white rounded-lg p-2 flex items-center gap-2">
                <BadgeEuro className="text-[#FFAA1D]" /> 1270 coins
              </button>
              <button className="bg-white rounded-lg p-2 flex items-center gap-2">
                <TreePine className="text-[#22c55e]" /> 12 trees planted
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h1 className="text-xl text-gray-700 font-semibold mb-4 sm:mb-0">Focus Timer</h1>
                <div className="flex flex-wrap gap-2">
                  <button className="text-black bg-gray-200 hover:bg-gray-300 rounded-lg text-sm px-3 py-2">
                    Add Tags
                  </button>
                  <button className="text-white bg-[#22c55e] hover:bg-[#16a34a] rounded-lg text-sm px-3 py-2">
                    Start Focus
                  </button>
                </div>
              </div>

              <div className="relative flex mt-6 justify-center items-center">
                <CircleSlider
                  style={{ zIndex: "1000" }}
                  value={value}
                  stepSize={1}
                  onChange={handleSliderChange}
                  size={200}
                  max={120}
                  gradientColorFrom="#22c55e"
                  gradientColorTo="#22c55e"
                  knobRadius={10}
                  circleWidth={15}
                />
                <div className="absolute text-center">
                  {!startCountdown ? (
                    <>
                      <h2 className="text-[#22c55e] text-4xl font-bold">{value}</h2>
                      <h2 className="text-2xl">Minutes</h2>
                    </>
                  ) : (
                    <h3 className="text-[#85ce14] text-4xl">
                      <Countdown ref={countdownRef} date={Date.now() + timeLeft} autoStart={!isPaused} renderer={renderer} onComplete={resetTimer} />
                    </h3>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h1 className="text-xl text-gray-700 font-semibold">Statistics</h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-4 text-center">
                <div>
                  <h4 className="text-[#22c55e] text-2xl font-bold">85%</h4>
                  <p>Success Rate</p>
                </div>
                <div>
                  <h4 className="text-[#3b82f6] text-2xl font-bold">42</h4>
                  <p>Total Sessions</p>
                </div>
                <div>
                  <h4 className="text-[#a855f7] text-2xl font-bold">26hr</h4>
                  <p>Total Focus Time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 mt-6">
            <h2 className="text-xl text-gray-700 font-semibold my-4">Recent Activities</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item, index) => (
                <div key={index} className="flex flex-wrap justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Dot size={30} color={index % 2 === 0 ? "green" : "red"} />
                    <div>
                      <h2>DSA Problem Solving</h2>
                      <p>09:00 AM to 10:00 AM</p>
                    </div>
                  </div>
                  <div>
                    <h2>60 Minutes</h2>
                    <p>+100 coins</p>
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
