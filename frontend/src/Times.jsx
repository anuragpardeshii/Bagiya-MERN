import React, { useState, useRef } from "react";
import { CircleSlider } from "react-circle-slider";
import Countdown from "react-countdown";

export default function Times() {
  const [value, setValue] = useState(60); // Initial time in minutes
  const [timeLeft, setTimeLeft] = useState(value * 60000); // Convert to milliseconds
  const [isPaused, setIsPaused] = useState(false);
  const [startCountdown, setStartCountdown] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const countdownRef = useRef(null);

  const handleSliderChange = (newValue) => {
    setValue(newValue);
    if (!startCountdown) {
      // Only update timeLeft if the timer is not running
      setTimeLeft(newValue * 60000);
    }
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

  const handleStart = () => {
    if (!startCountdown) {
      setStartCountdown(true);
    }
  };

  const handlePause = () => {
    if (startCountdown) {
      countdownRef.current.pause();
      const remainingTime = countdownRef.current.getTime(); // Get remaining time in milliseconds
      setTimeLeft(remainingTime); // Update timeLeft with the remaining time
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (startCountdown) {
      countdownRef.current.start();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    setShowStopModal(true);
  };

  const confirmStop = () => {
    resetTimer();
    setShowStopModal(false);
  };

  const cancelStop = () => {
    setShowStopModal(false);
  };

  return (
    <>
      <div className="flex justify-end m-2 md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <a
          href="/dashboard"
          type="button"
          className="text-white bg-[#366827] hover:bg-[#366827] focus:ring-4 focus:outline-none focus:ring-[#366827] font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#366827] dark:hover:bg-[#366827] dark:focus:ring-[#366827]"
        >
          Get started
        </a>
      </div>
      <div className="flex items-center justify-center">
        <h3>Lets Start focusing</h3>
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
      <div className="max-w-4xl mx-auto my-12">
        <input
          name="link"
          type="link"
          autoComplete="link"
          required
          className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
          placeholder="Enter the link here..."
        />
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleStart}
            disabled={startCountdown}
            className="text-white m-4 bg-[#366827] hover:bg-[#366827] focus:ring-4 focus:outline-none focus:ring-[#366827] font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#366827] dark:hover:bg-[#366827] dark:focus:ring-[#366827] disabled:opacity-50"
          >
            Start
          </button>
          {!isPaused ? (
            <button
              onClick={handlePause}
              disabled={!startCountdown}
              className="text-white m-4 bg-[#366827] hover:bg-[#366827] focus:ring-4 focus:outline-none focus:ring-[#366827] font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#366827] dark:hover:bg-[#366827] dark:focus:ring-[#366827] disabled:opacity-50"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="text-white m-4 bg-[#366827] hover:bg-[#366827] focus:ring-4 focus:outline-none focus:ring-[#366827] font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#366827] dark:hover:bg-[#366827] dark:focus:ring-[#366827]"
            >
              Resume
            </button>
          )}
          <button
            onClick={handleStop}
            disabled={!startCountdown}
            className="text-white m-4 bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-500 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-500 disabled:opacity-50"
          >
            Stop
          </button>
        </div>
      </div>

      {/* Custom Stop Confirmation Modal */}
      {showStopModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">
              Are you sure you want to stop the timer?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmStop}
                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-500 font-medium rounded-lg text-sm px-4 py-2 text-center"
              >
                Yes, Stop
              </button>
              <button
                onClick={cancelStop}
                className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-sm px-4 py-2 text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}