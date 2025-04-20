import Sidebar from "../Sidebar";
import React, { useState, useRef, useEffect } from "react";
import { TreePine, Clock, Award, Target } from "lucide-react";
import { CircleSlider } from "react-circle-slider";
import Countdown from "react-countdown";
import { useAuth } from "../context/AuthContext";
import Hours from "./Hours";
import Monthly from "./Monthly";
import Weekly from "./Weekly";
import axios from "axios";
import LoadingScreen from "../../components/LoadingScreen";
import { Gauge } from '@mui/x-charts/Gauge';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

export default function Dashboard() {
  // Core states
  const [value, setValue] = useState(60);
  const [timeLeft, setTimeLeft] = useState(value * 60000);
  const [isPaused, setIsPaused] = useState(false);
  const [startCountdown, setStartCountdown] = useState(false);
  const countdownRef = useRef(null);
  const { user } = useAuth();

  // User stats states
  const [balance, setBalance] = useState(0);
  const [trees, setTrees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [successfulSessions, setSuccessfulSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [mostProductiveHour, setMostProductiveHour] = useState(null);
  const [mostProductiveDay, setMostProductiveDay] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setTimeout(() => {
        setLoading(false);
      }, 2500); 
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const [balanceResponse, sessionsResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/users/balance/${user.id}`),
          axios.get(`http://localhost:3000/api/sessions/user/${user.id}`),
        ]);

        if (!isMounted) return;

        // Process balance data
        setBalance(balanceResponse.data.balance);
        setTrees(balanceResponse.data.trees);

        // Process session data
        const sessions = sessionsResponse.data.sessions || [];
        processSessionData(sessions);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Failed to fetch user data:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user?.id]);

  const processSessionData = (sessions) => {
    // Calculate basic stats
    setTotalSessions(sessions.length);

    const successful = sessions.filter(
      (session) => session.sessionSuccess
    );
    setSuccessfulSessions(successful.length);
    
    const totalTime = successful.reduce(
      (total, session) => total + (session.sessionTime || 0),
      0
    );
    setTotalFocusTime(totalTime);
    setSuccessRate(
      Math.round((successful.length / sessions.length) * 100) || 0
    );

    // Process productivity patterns
    const hourlyStats = new Array(24).fill(0);
    const dailyStats = new Array(7).fill(0);

    sessions.forEach((session) => {
      if (session.sessionSuccess && session.endTime) {
        const date = new Date(session.endTime);
        hourlyStats[date.getHours()] += session.sessionTime || 0;
        dailyStats[date.getDay()] += session.sessionTime || 0;
      }
    });

    // Find most productive hour and day
    const maxHourIndex = hourlyStats.indexOf(Math.max(...hourlyStats));
    setMostProductiveHour(maxHourIndex);

    const maxDayIndex = dailyStats.indexOf(Math.max(...dailyStats));
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    setMostProductiveDay(days[maxDayIndex]);
  };

  if (loading) {
    return (
      <div className="p-4 sm:ml-64">
        <LoadingScreen/>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="p-4 sm:ml-64 bg-[#e5e7eb] min-h-screen">
        <div className="rounded-lg dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl text-gray-700 font-bold">
              Dashboard
            </h1>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <button className="bg-white rounded-lg p-2 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                {balance ?? 0} Coins
              </button>
              <button className="bg-white rounded-lg p-2 flex items-center gap-2">
                <TreePine className="text-[#22c55e]" /> {trees ?? 0} trees
                planted
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 mb-4">
            <h1 className="text-xl text-gray-700 font-semibold">
              Focus Statistics
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4 text-center">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
                <div className="w-full" style={{ height: 180 }}>
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="10" 
                        />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="#22c55e" 
                          strokeWidth="10" 
                          strokeDasharray="283" 
                          strokeDashoffset={283 - (283 * successRate / 100)} 
                          transform="rotate(-90 50 50)" 
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[#22c55e] text-3xl font-bold">
                          {successRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">Success Rate</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
                <div className="w-full" style={{ height: 130 }}>
                  <Gauge
                    value={successfulSessions}
                    min={0}
                    max={totalSessions || 1}
                    valueFormat={{ style: 'decimal' }}
                    startAngle={-110}
                    endAngle={110}
                    sx={{
                      width: '100%',
                      height: '100%',
                      '& .MuiGauge-valueText': {
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        fill: '#3b82f6',
                        transform: 'translateY(5px)',
                      },
                      '& .MuiGauge-track': {
                        stroke: '#e6e8eb',
                      },
                      '& .MuiGauge-progress': {
                        stroke: '#3b82f6',
                      },
                    }}
                    text={() => `${successfulSessions} / ${totalSessions}`}
                  />
                </div>
                <p className="text-gray-600 mt-2">Total Sessions</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
                <div className="w-full" style={{ height: 180 }}>
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="#e9d5ff" 
                          strokeWidth="10" 
                        />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="#a855f7" 
                          strokeWidth="10" 
                          strokeDasharray="283" 
                          strokeDashoffset={283 - (283 * Math.min(Math.round(totalFocusTime / 60), 24) / 24)} 
                          transform="rotate(-90 50 50)" 
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[#a855f7] text-3xl font-bold">
                          {Math.round(totalFocusTime / 60)}
                        </span>
                        <span className="text-gray-600 text-sm">hours</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {Math.round(totalFocusTime / 60) > 0 ? 
                        `${Math.round((totalFocusTime / 60) / 24 * 100)}% of daily goal` : 
                        "Start focusing!"}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">Total Focus Time</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-center">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg shadow-sm">
                <h4 className="text-amber-600 text-xl font-bold">
                  {mostProductiveHour !== null
                    ? `${mostProductiveHour}:00`
                    : "N/A"}
                </h4>
                <p className="text-gray-600">Most Productive Hour</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg shadow-sm">
                <h4 className="text-teal-600 text-xl font-bold">
                  {mostProductiveDay || "N/A"}
                </h4>
                <p className="text-gray-600">Most Productive Day</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 mb-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Monthly userId={user.id} />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Weekly userId={user.id} />
            </div>
          </div>

          <div className="gap-4">
            <div className="bg-white flex-1 w-full rounded-lg p-6 shadow-sm">
              <Hours className="flex-1 w-full" userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
