import React, { useState, useEffect } from "react";
import { CircleSlider } from "react-circle-slider";
import { X, Clock, ArrowLeft, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./Dashboard/context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";

// Updated images array with motivational messages
const progressContent = [
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1746599839/p1_zncepc.png",
    message: "Starting your journey! Every moment of focus builds a better you."
  },
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1746599839/p2_nuuw1d.png",
    message: "Keep going! Small steps lead to big achievements."
  },
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1746599840/p3_sr9w7h.png",
    message: "You're making progress! Stay present and mindful."
  },
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1746599839/p4_sdbxlb.png",
    message: "Halfway there! Your dedication is inspiring."
  },
  {
    image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1746599839/p5_rn62yg.png",
    message: "Almost there! Your focus is creating lasting change."
  },
  // {
  //   image: "https://res.cloudinary.com/doaaq5amo/image/upload/v1743176197/progress7_t2bts0.png",
  //   message: "Final stretch! Celebrate your commitment to growth."
  // }
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
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (newValue) => {
    const roundedValue = Math.round(newValue / 5) * 5;
    setValue(roundedValue === 0 ? 5 : roundedValue);
  };

  const startTimer = () => {
    if (!user?.id) {
      toast.error("Please log in to start a session");
      return;
    }
    setTimeLeft(value * 60 * 1000);
    setStartTime(new Date());
    setSessionCompleted(false);
    setCurrentProgressIndex(0);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
    toast.success(isPaused ? "Timer resumed" : "Timer paused");
  };

  const endSession = async (success) => {
    // Prevent multiple executions
    if (!user?.id || !startTime || isLoading) return;
    
    // Clear interval first
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setIsLoading(true);
    
    try {
      // Create session object once to ensure consistency
      const sessionData = {
        userId: user.id,
        sessionTime: value,
        sessionSuccess: success,
        startTime,
        endTime: new Date(),
      };

      // Save the session
      const response = await axios.post("http://localhost:3000/api/sessions/create", sessionData);
      
      // Only proceed with rewarding coins if session was successful
      if (success && response.status === 200) {
        const rewardCoins = value * 100;
        
        const rewardResponse = await axios.post("http://localhost:3000/api/transactions/reward", {
          userId: user.id,
          amount: rewardCoins
        });
        
        if (rewardResponse.status === 200) {
          setSessionCompleted(true);
          toast.success(`Congratulations! Session completed successfully! You earned ${rewardCoins} coins!`);
          
          // Set a timeout to hide the completion message after 3 seconds
          setTimeout(() => {
            setSessionCompleted(false);
            setValue(30); // Reset to default value
          }, 3000);
        }
      } else if (!success) {
        // For unsuccessful sessions
        setSessionCompleted(false);
        toast.error("Session ended early. No coins awarded.");
      }
    } catch (error) {
      console.error("Error in session management:", error);
      toast.error(success ? "Failed to complete session" : "Failed to end session");
      setSessionCompleted(false);
    } finally {
      setIsLoading(false);
      setTimeLeft(0);
      setStartTime(null);
    }
};

  useEffect(() => {
    if (timeLeft > 0 && !isPaused) {
      const id = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(id);
            // Remove the endSession call from here
            return 0;
          }

          const totalTime = value * 60 * 1000;
          const elapsedTime = totalTime - prev;
          const progressPercentage = (elapsedTime / totalTime) * 100;
          
          const newIndex = Math.min(
            Math.floor(progressPercentage / (100 / progressContent.length)),
            progressContent.length - 1
          );
          
          if (newIndex !== currentProgressIndex) {
            setFade(false);
            setTimeout(() => {
              setCurrentProgressIndex(newIndex);
              setFade(true);
            }, 300);
          }
          
          return prev - 1000;
        });
      }, 1000);

      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [timeLeft, isPaused, value, currentProgressIndex]);

  // Add a new useEffect to handle session completion
  useEffect(() => {
    if (timeLeft === 0 && startTime) {
      endSession(true);
    }
  }, [timeLeft]);

  const confirmGiveUp = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    endSession(false); // Add this line to properly end the session as unsuccessful
    setTimeLeft(0);
    setShowModal(false);
    setValue(30);
  };

  const selectPresetTime = (minutes) => {
    setValue(minutes);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-200 items-center justify-center p-4">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
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
            
            <div className="flex justify-center gap-2 mb-4">
              {[15, 30, 45, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => selectPresetTime(min)}
                  className={`px-4 py-2 rounded-lg border ${
                    value === min ? "bg-green-500 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
            
            <div className="relative flex justify-center items-center my-8">
              <CircleSlider
                value={value}
                stepSize={5}
                onChange={handleSliderChange}
                size={220}
                max={120}
                min={5}
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
              <p className="text-gray-600">
                Are you sure you want to end this session early? Your progress will be saved, but marked as incomplete.
              </p>
              <img
                src="https://res.cloudinary.com/doaaq5amo/image/upload/v1746599839/p6_trrmmn.png"
                alt="Focus visualization"
                className={`mx-auto rounded-2xl h-full w-50 py-8 object-cover transition-opacity duration-500 ease-in-out ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
                style={{ borderRadius: "20rem" }}
              />
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
