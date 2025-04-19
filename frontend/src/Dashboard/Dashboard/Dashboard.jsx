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

    const successfulSessions = sessions.filter(
      (session) => session.sessionSuccess
    );
    const totalTime = successfulSessions.reduce(
      (total, session) => total + (session.sessionTime || 0),
      0
    );
    setTotalFocusTime(totalTime);
    setSuccessRate(
      Math.round((successfulSessions.length / sessions.length) * 100) || 0
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
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm">
                <div className="flex justify-center mb-2">
                  <Award className="text-[#22c55e] w-8 h-8" />
                </div>
                <h4 className="text-[#22c55e] text-2xl font-bold">
                  {successRate}%
                </h4>
                <p className="text-gray-600">Success Rate</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
                <div className="flex justify-center mb-2">
                  <Target className="text-[#3b82f6] w-8 h-8" />
                </div>
                <h4 className="text-[#3b82f6] text-2xl font-bold">
                  {totalSessions}
                </h4>
                <p className="text-gray-600">Total Sessions</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm">
                <div className="flex justify-center mb-2">
                  <Clock className="text-[#a855f7] w-8 h-8" />
                </div>
                <h4 className="text-[#a855f7] text-2xl font-bold">
                  {Math.round(totalFocusTime / 60)}hr
                </h4>
                <p className="text-gray-600">Total Focus Time</p>
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
