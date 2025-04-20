import React, { useState, useEffect } from "react";
import { CircleSlider } from "react-circle-slider";
import { X, Clock, ArrowLeft, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./Dashboard/context/AuthContext";
import { toast } from "react-hot-toast";

// Updated images array with motivational messages
const progressContent = [
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176196/progress1_ifeprk.png",
    message: "Starting your journey! Every moment of focus builds a better you."
  },
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176196/progress2_jtq5g2.png",
    message: "Keep going! Small steps lead to big achievements."
  },
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176196/progress3_zbcsja.png",
    message: "You're making progress! Stay present and mindful."
  },
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176197/progress4_t71esn.png",
    message: "Halfway there! Your dedication is inspiring."
  },
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176197/progress6_vy9mwi.png",
    message: "Almost there! Your focus is creating lasting change."
  },
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176197/progress7_t2bts0.png",
    message: "Final stretch! Celebrate your commitment to growth."
  }
];

function Timer() {
  const { user } = useAuth();
  const [value, setValue] = useState(30); // Default to 30 minutes
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [fade, setFade] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
console.log(user);
  // Format time for display
  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Modified to ensure 5-minute intervals
  const handleSliderChange = (newValue) => {
    // Round to nearest 5 minutes
    const roundedValue = Math.round(newValue / 5) * 5;
    setValue(roundedValue === 0 ? 5 : roundedValue); // Minimum 5 minutes
  };

  const startTimer = () => {
    setTimeLeft(value * 60 * 1000);
    setStartTime(new Date());
    setSessionCompleted(false);
    setCurrentProgressIndex(0); // Start with the first image
    // toast.success(`Starting ${value} minute session. Stay focused!`);
  };

  const pauseTimer = () => {
    if (isPaused) {
      // Resume timer
      setIsPaused(false);
      toast.success("Timer resumed");
    } else {
      // Pause timer
      setIsPaused(true);
      toast.success("Timer paused");
    }
  };

  const endSession = async (success) => {
    if (!user || !startTime) return;
    try {
      const response = await fetch("http://localhost:3000/api/sessions/create", {
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
      
      if (response.ok) {
        if (success) {
          // Award coins based on session duration
          const rewardCoins = value * 100; // 5 mins = 500 coins, 10 mins = 1000 coins, etc.
          
          try {
            const rewardResponse = await fetch("http://localhost:3000/api/transactions/reward", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                amount: rewardCoins
              }),
            });
            
            if (rewardResponse.ok) {
              // toast.success(`Congratulations! You earned ${rewardCoins} coins!`);
            }
          } catch (rewardError) {
            console.error("Error awarding coins:", rewardError);
          }
          
          setSessionCompleted(true);
          toast.success("Congratulations! Session completed successfully!");
        } else {
          toast.error("Session ended early. Try again next time!");
        }
      }
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save your session");
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !isPaused) {
      const id = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(id);
            endSession(true);
            return 0;
          }

          // Calculate progress percentage
          const totalTime = value * 60 * 1000;
          const elapsedTime = totalTime - prev;
          const progressPercentage = (elapsedTime / totalTime) * 100;
          
          // Determine which image to show based on progress
          const newIndex = Math.min(
            Math.floor(progressPercentage / (100 / progressContent.length)),
            progressContent.length - 1
          );
          
          if (newIndex !== currentProgressIndex) {
            setFade(false);
            setTimeout(() => {
              setCurrentProgressIndex(newIndex);
              setFade(true);
              // Show motivational message as toast
              // toast(progressContent[newIndex].message, {
              //   icon: '🌱',
              //   duration: 4000,
              // });
            }, 300);
          }
          
          return prev - 1000;
        });
      }, 1000);

      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [timeLeft, isPaused, value, currentProgressIndex]);

  const confirmGiveUp = () => {
    clearInterval(intervalId);
    setTimeLeft(0);
    setShowModal(false);
    endSession(false);
    setValue(30);
  };

  const selectPresetTime = (minutes) => {
    setValue(minutes);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-200 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {!timeLeft ? (
          <>
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Focus Timer
            </h1>
            
            
            <div className="relative flex justify-center items-center my-8">
              <CircleSlider
                value={value}
                stepSize={5}
                onChange={handleSliderChange}
                size={220}
                max={120}
                gradientColorFrom="#22c55e"
                gradientColorTo="#16a34a"
                knobRadius={12}
                circleWidth={15}
              />
              <div className="absolute text-center">
                <h2 className="text-[#22c55e] text-5xl font-bold">{value}</h2>
                <h2 className="text-xl text-gray-600">Minutes</h2>
              </div>
            </div>
            
            <p className="text-center text-gray-500 text-sm mb-4">
              Timer set in 5-minute intervals (5-120 min)
            </p>
            
            <button
              onClick={startTimer}
              className="mt-4 w-full bg-[#22c55e] text-white py-3 px-4 rounded-xl hover:bg-[#16a34a] transition flex items-center justify-center gap-2 font-medium text-lg"
            >
              <Clock size={20} />
              Start Focus Session
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Focus Session</h2>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <div className="relative h-56 w-full rounded-4xl overflow-hidden">
              <img
                src={progressContent[currentProgressIndex].image}
                alt="Focus visualization"
                className={`absolute inset-0 mx-auto rounded-2xl h-full object-cover transition-opacity duration-500 ease-in-out ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
                style={{ borderRadius: "20rem" }}
              />
              {isPaused && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <p className="text-white text-xl font-bold">PAUSED</p>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-700 text-center italic">
                "{progressContent[currentProgressIndex].message}"
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={pauseTimer}
                className={`py-3 px-4 rounded-xl transition font-medium ${
                  isPaused 
                    ? "bg-green-500 text-white hover:bg-green-600" 
                    : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition font-medium"
              >
                End Session
              </button>
            </div>
          </div>
        )}

        {sessionCompleted && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-3">
              <Award className="text-green-500" size={24} />
              <div>
                <h3 className="font-bold text-green-800">Session Complete!</h3>
                <p className="text-green-600 text-sm">Great job staying focused for {value} minutes</p>
                <p className="text-amber-600 font-medium mt-1">You earned {value * 100} coins!</p>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">End Session?</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="mb-6 text-gray-600">
                Are you sure you want to end this session early? Your progress will be saved, but marked as incomplete.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Continue Session
                </button>
                <button
                  onClick={confirmGiveUp}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  End Session
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
