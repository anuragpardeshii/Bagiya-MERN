import React, { useState, useEffect } from "react";
import { CircleSlider } from "react-circle-slider";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./Dashboard/context/AuthContext";

const images = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
];

function Timer() {
  const { user } = useAuth();
  const [value, setValue] = useState(1);
  const [startCountdown, setStartCountdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const handleSliderChange = (newValue) => {
    setValue(newValue);
  };

  const startTimer = () => {
    setTimeLeft(value * 60 * 1000);
    setStartCountdown(true);
    setStartTime(new Date());
  };

  const endSession = async (success) => {
    if (!user || !startTime) return;

    const sessionData = {
      userId: user.id,
      sessionTime: value,
      sessionSuccess: success,
      startTime,
      endTime: new Date(),
    };

    try {
      const response = await fetch(
        "http://localhost:3000/api/sessions/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        }
      );
      const result = await response.json();
      console.log("Session saved:", result);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  useEffect(() => {
    if (startCountdown && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1000;
          if (newTime > 0 && newTime % 25000 === 0) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft <= 0 && startCountdown) {
      setStartCountdown(false);
      endSession(true);
      alert("Time's up!");
    }
  }, [startCountdown, timeLeft]);

  const confirmGiveUp = () => {
    setStartCountdown(false);
    setShowModal(false);
    endSession(false);
    setValue(1);
  };

  return (
    <div className="min-h-screen flex-col bg-gray-100 flex items-center justify-center">
      <div className="m-4">
        <Link
          to="/dashboard"
          className="mt-8 flex w-full gap-2 bg-[#22c55e] text-white py-2 px-4 rounded-lg hover:bg-[#1ea34b]"
        >
          <p className="text-xl font-semibold">Dashboard</p>
        </Link>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        {!startCountdown ? (
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
              className="mt-8 w-full bg-[#22c55e] text-white py-2 px-4 rounded-lg hover:bg-[#1ea34b]"
            >
              Start Timer
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt="Timer background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">
                  {Math.floor(timeLeft / 60000)}:
                  {((timeLeft % 60000) / 1000).toFixed(0).padStart(2, "0")}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
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