// import React, { useState, useRef } from "react";
// import { CircleSlider } from "react-circle-slider";
// import Countdown from "react-countdown";

// export default function Times() {
//   const [value, setValue] = useState(60); // Initial time in minutes
//   const [timeLeft, setTimeLeft] = useState(value * 60000); // Convert to milliseconds
//   const [isPaused, setIsPaused] = useState(false);
//   const [startCountdown, setStartCountdown] = useState(false);
//   const [showStopModal, setShowStopModal] = useState(false);
//   const countdownRef = useRef(null);

//   const handleSliderChange = (newValue) => {
//     setValue(newValue);
//     if (!startCountdown) {
//       // Only update timeLeft if the timer is not running
//       setTimeLeft(newValue * 60000);
//     }
//   };

//   const renderer = ({ hours, minutes, seconds, completed }) => {
//     if (completed) {
//       return <span>Time is up!</span>;
//     } else {
//       return (
//         <span>
//           {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
//           {String(seconds).padStart(2, "0")}
//         </span>
//       );
//     }
//   };

//   const resetTimer = () => {
//     setStartCountdown(false);
//     setIsPaused(false);
//     setValue(60);
//     setTimeLeft(60 * 60000);
//   };

//   const handleStart = () => {
//     if (!startCountdown) {
//       setStartCountdown(true);
//     }
//   };

//   const handlePause = () => {
//     if (startCountdown) {
//       countdownRef.current.pause();
//       const remainingTime = countdownRef.current.getTime(); // Get remaining time in milliseconds
//       setTimeLeft(remainingTime); // Update timeLeft with the remaining time
//       setIsPaused(true);
//     }
//   };

//   const handleResume = () => {
//     if (startCountdown) {
//       countdownRef.current.start();
//       setIsPaused(false);
//     }
//   };

//   const handleStop = () => {
//     setShowStopModal(true);
//   };

//   const confirmStop = () => {
//     resetTimer();
//     setShowStopModal(false);
//   };

//   const cancelStop = () => {
//     setShowStopModal(false);
//   };

//   return (
//     <>
//       <div className="flex justify-end m-2 md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
//         <a
//           href="/dashboard"
//           type="button"
//           className="text-white bg-[#366827] hover:bg-[#366827] focus:ring-4 focus:outline-none focus:ring-[#366827] font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#366827] dark:hover:bg-[#366827] dark:focus:ring-[#366827]"
//         >
//           Get started
//         </a>
//       </div>
//       <div className="flex items-center justify-center">
//         <h3>Lets Start focusing</h3>
//       </div>
      // <div className="relative flex mt-6 justify-center items-center">
      //   <CircleSlider
      //     style={{ zIndex: "1000" }}
      //     value={value}
      //     stepSize={1}
      //     onChange={handleSliderChange}
      //     size={200}
      //     max={120}
      //     gradientColorFrom="#22c55e"
      //     gradientColorTo="#22c55e"
      //     knobRadius={10}
      //     circleWidth={15}
      //   />
      //   <div className="absolute text-center">
      //     {!startCountdown ? (
      //       <>
      //         <h2 className="text-[#22c55e] text-4xl font-bold">{value}</h2>
      //         <h2 className="text-2xl">Minutes</h2>
      //       </>
      //     ) : (
      //       <h3 className="text-[#85ce14] text-4xl">
      //         <Countdown
      //           ref={countdownRef}
      //           date={Date.now() + timeLeft}
      //           autoStart={!isPaused}
      //           renderer={renderer}
      //           onComplete={resetTimer}
      //         />
      //       </h3>
      //     )}
      //   </div>
      // </div>
//       <div className="max-w-4xl mx-auto my-12">
//         <input
//           name="link"
//           type="link"
//           autoComplete="link"
//           required
//           className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
//           placeholder="Enter the link here..."
//         />
//         <div className="flex items-center justify-center space-x-4">
//           <button
//             onClick={handleStart}
//             disabled={startCountdown}
//             className="text-white m-4 bg-[#366827] hover:bg-[#366827] focus:ring-4 focus:outline-none focus:ring-[#366827] font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#366827] dark:hover:bg-[#366827] dark:focus:ring-[#366827] disabled:opacity-50"
//           >
//             Start
//           </button>
//           {!isPaused ? (
//             <button
//               onClick={handlePause}
//               disabled={!startCountdown}
//               className="text-white m-4 bg-[#366827] hover:bg-[#366827] focus:ring-4 focus:outline-none focus:ring-[#366827] font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#366827] dark:hover:bg-[#366827] dark:focus:ring-[#366827] disabled:opacity-50"
//             >
//               Pause
//             </button>
//           ) : (
//             <button
//               onClick={handleResume}
//               className="text-white m-4 bg-[#366827] hover:bg-[#366827] focus:ring-4 focus:outline-none focus:ring-[#366827] font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#366827] dark:hover:bg-[#366827] dark:focus:ring-[#366827]"
//             >
//               Resume
//             </button>
//           )}
//           <button
//             onClick={handleStop}
//             disabled={!startCountdown}
//             className="text-white m-4 bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-500 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-500 disabled:opacity-50"
//           >
//             Stop
//           </button>
//         </div>
//       </div>

//       {/* Custom Stop Confirmation Modal */}
//       {showStopModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg text-center">
//             <h2 className="text-xl font-bold mb-4">
//               Are you sure you want to stop the timer?
//             </h2>
//             <div className="flex justify-center space-x-4">
//               <button
//                 onClick={confirmStop}
//                 className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-500 font-medium rounded-lg text-sm px-4 py-2 text-center"
//               >
//                 Yes, Stop
//               </button>
//               <button
//                 onClick={cancelStop}
//                 className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-sm px-4 py-2 text-center"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import React, { useState, useEffect } from 'react';
import { CircleSlider } from "react-circle-slider";

const Times = () => {
  const [value, setValue] = useState(0); // Selected time in minutes (from slider)
  const [timeLeft, setTimeLeft] = useState(0); // Remaining time in milliseconds
  const [startCountdown, setStartCountdown] = useState(false); // Whether to start the countdown

  // Handle slider change
  const handleSliderChange = (newValue) => {
    setValue(newValue);
  };

  // Start the countdown
  const handleStart = () => {
    if (value <= 0) return; // Prevent starting if no time is set
    setTimeLeft(value * 60 * 1000); // Convert minutes to milliseconds
    setStartCountdown(true); // Show the countdown
  };

  // Handle "Give Up" button click
  const handleGiveUp = () => {
    const confirmGiveUp = window.confirm("Are you sure you want to give up?");
    if (confirmGiveUp) {
      resetTimer();
    }
  };

  // Reset the countdown
  const resetTimer = () => {
    setStartCountdown(false); // Hide the countdown
    setValue(0); // Reset the slider value
    setTimeLeft(0); // Reset the remaining time
  };

  // Calculate days, hours, minutes, and seconds from milliseconds
  const calculateTime = (time) => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // Update the countdown every second
  useEffect(() => {
    if (startCountdown && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1000);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timeLeft <= 0 && startCountdown) {
      setStartCountdown(false); // Stop the countdown when time is up
      alert("Time's up!");
    }
  }, [startCountdown, timeLeft]);

  const { days, hours, minutes, seconds } = calculateTime(timeLeft);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Circle Slider (hidden when countdown starts) */}
      {!startCountdown && (
        <div className="relative flex mt-6 justify-center items-center">
          <CircleSlider
            style={{ zIndex: '1000' }}
            value={value}
            stepSize={1}
            onChange={handleSliderChange}
            size={200}
            max={120} // Maximum time in minutes (2 hours)
            gradientColorFrom="#22c55e"
            gradientColorTo="#22c55e"
            knobRadius={10}
            circleWidth={15}
          />
          <div className="absolute text-center">
            <h2 className="text-[#22c55e] text-4xl font-bold">{value}</h2>
            <h2 className="text-2xl">Minutes</h2>
          </div>
        </div>
      )}

      {/* Countdown Display */}
      {startCountdown && (
        <div className="flex items-center justify-center w-full gap-6 count-down-main mt-4">
          <div className="timer">
            <div className="pr-1.5 pl-2 relative bg-indigo-50 w-max before:contents-[''] before:absolute before:h-full before:w-0.5 before:top-0 before:left-1/2 before:-translate-x-1/2 before:bg-white before:z-10">
              <h3 className="countdown-element days font-manrope font-semibold text-2xl text-indigo-600 tracking-[15.36px] max-w-[44px] text-center relative z-20">
                {String(days).padStart(2, '0')}
              </h3>
            </div>
            <p className="text-sm font-normal text-gray-900 mt-1 text-center w-full">days</p>
          </div>
          <div className="timer">
            <div className="pr-1.5 pl-2 relative bg-indigo-50 w-max before:contents-[''] before:absolute before:h-full before:w-0.5 before:top-0 before:left-1/2 before:-translate-x-1/2 before:bg-white before:z-10">
              <h3 className="countdown-element hours font-manrope font-semibold text-2xl text-indigo-600 tracking-[15.36px] max-w-[44px] text-center relative z-20">
                {String(hours).padStart(2, '0')}
              </h3>
            </div>
            <p className="text-sm font-normal text-gray-900 mt-1 text-center w-full">hours</p>
          </div>
          <div className="timer">
            <div className="pr-1.5 pl-2 relative bg-indigo-50 w-max before:contents-[''] before:absolute before:h-full before:w-0.5 before:top-0 before:left-1/2 before:-translate-x-1/2 before:bg-white before:z-10">
              <h3 className="countdown-element minutes font-manrope font-semibold text-2xl text-indigo-600 tracking-[15.36px] max-w-[44px] text-center relative z-20">
                {String(minutes).padStart(2, '0')}
              </h3>
            </div>
            <p className="text-sm font-normal text-gray-900 mt-1 text-center w-full">minutes</p>
          </div>
          <div className="timer">
            <div className="pr-1.5 pl-2 relative bg-indigo-50 w-max before:contents-[''] before:absolute before:h-full before:w-0.5 before:top-0 before:left-1/2 before:-translate-x-1/2 before:bg-white before:z-10">
              <h3 className="countdown-element seconds font-manrope font-semibold text-2xl text-indigo-600 tracking-[15.36px] max-w-[44px] text-center relative z-20">
                {String(seconds).padStart(2, '0')}
              </h3>
            </div>
            <p className="text-sm font-normal text-gray-900 mt-1 text-center w-full">seconds</p>
          </div>
        </div>
      )}

      {/* Start or Give Up Button */}
      <div className="flex justify-center mt-4 gap-4">
        {!startCountdown ? (
          <button
            onClick={handleStart}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Start Countdown
          </button>
        ) : (
          <button
            onClick={handleGiveUp}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Give Up
          </button>
        )}
      </div>
    </div>
  );
};

export default Times;