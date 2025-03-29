import React, { useState, useEffect } from "react";
import { CircleSlider } from "react-circle-slider";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./Dashboard/context/AuthContext";

const images = [
  "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176196/progress1_ifeprk.png",
  "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176196/progress2_jtq5g2.png",
  "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176196/progress3_zbcsja.png",
  "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176197/progress4_t71esn.png",
  "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176197/progress6_vy9mwi.png",
  "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176197/progress7_t2bts0.png",
];

function Timer() {
  const { user } = useAuth();
  const [value, setValue] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [fade, setFade] = useState(true);

  const handleSliderChange = (newValue) => setValue(newValue);

  const startTimer = () => {
    setTimeLeft(value * 60 * 1000);
    setStartTime(new Date());
  };

  const endSession = async (success) => {
    if (!user || !startTime) return;
    try {
      await fetch("http://localhost:3000/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          sessionTime: value,
          sessionSuccess: success,
          startTime,
          endTime: new Date(),
        }),
      });
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const id = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(id);
            endSession(true);
            return 0;
          }

          if ((prev / 1000) % 25 === 0) {
            setFade(false);
            setTimeout(() => {
              setCurrentImageIndex(
                (prevIndex) => (prevIndex + 1) % images.length
              );
              setFade(true);
            }, 300);
          }
          return prev - 1000;
        });
      }, 1000);

      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [timeLeft]);

  const confirmGiveUp = () => {
    clearInterval(intervalId);
    setTimeLeft(0);
    setShowModal(false);
    endSession(false);
    setValue(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 items-center justify-center">
      <div className="m-4">
        {timeLeft === 0 && (
          <Link
            to="/dashboard"
            className="mt-8 flex w-full gap-2 bg-[#22c55e] text-white py-2 px-4 rounded-lg hover:bg-[#1ea34b] transition"
          >
            <p className="text-xl font-semibold">Dashboard</p>
          </Link>
        )}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        {!timeLeft ? (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">
              Set Your Timer
            </h1>
            <div className="relative flex justify-center items-center">
              <CircleSlider
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
                <h2 className="text-[#22c55e] text-4xl font-bold">{value}</h2>
                <h2 className="text-2xl">Minutes</h2>
              </div>
            </div>
            <button
              onClick={startTimer}
              className="mt-8 w-full bg-[#22c55e] text-white py-2 px-4 rounded-lg hover:bg-[#1ea34b] transition"
            >
              Start Timer
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="z-[100] mb-4 bg-opacity-40 flex items-center justify-center">
              <span className="text-black hover:opacity-100 text-2xl font-semibold">
                {/* Time Left: &nbsp; */}
                {Math.floor(timeLeft / 60000)}:
                {String(((timeLeft % 60000) / 1000).toFixed(0)).padStart(
                  2,
                  "0"
                )}
              </span>
            </div>
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt="Timer background"
                className={`absolute inset-0 pb-2 mx-auto h-full object-cover transition-opacity duration-500 ease-in-out ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
                style={{ borderRadius: "25rem" }}
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
            >
              Give Up
            </button>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Warning</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="mb-6">
                Are you sure you want to give up? All progress will be lost.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmGiveUp}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg"
                >
                  Yes, give up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timer;
