import Sidebar from "../Sidebar";
import * as React from "react";
import { LineChart, BarChart } from "@mui/x-charts";
import {
  BadgeEuro,
  TreePine,
  Clock,
  Calendar,
  Award,
  Target,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CircleSlider } from "react-circle-slider";
import Countdown from "react-countdown";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import FocusChart from "./FoucsChart";
import {
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  startOfMonth,
  getDay,
  getHours,
  getWeek,
  getMonth,
  differenceInDays,
  isSameDay,
  isSameWeek,
  isSameMonth,
  addDays,
  subDays,
  subWeeks,
  subMonths,
  isWithinInterval,
} from "date-fns";

export default function Dashboard() {
  const [value, setValue] = useState(60);
  const [timeLeft, setTimeLeft] = useState(value * 60000);
  const [isPaused, setIsPaused] = useState(false);
  const [startCountdown, setStartCountdown] = useState(false);
  const countdownRef = useRef(null);
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [trees, setTrees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState([]);
  const [hourlyFocusData, setHourlyFocusData] = useState([]);
  const [weekdayFocusData, setWeekdayFocusData] = useState([]);
  const [weeklyMonthFocusData, setWeeklyMonthFocusData] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [averageSessionLength, setAverageSessionLength] = useState(0);
  const [mostProductiveHour, setMostProductiveHour] = useState(null);
  const [mostProductiveDay, setMostProductiveDay] = useState(null);

  // Days of the week for labels
  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleSliderChange = (newValue) => {
    setValue(newValue);
    setTimeLeft(newValue * 60000);
  };

  const dataset = [
    { day: "Monday", hours: 3 },
    { day: "Tuesday", hours: 4.5 },
    { day: "Wednesday", hours: 2 },
    { day: "Thursday", hours: 5 },
    { day: "Friday", hours: 6 },
    { day: "Saturday", hours: 4 },
    { day: "Sunday", hours: 3.5 },
  ];

  const focusData = [
    { time: 0, value: 5 },
    { time: 3, value: 10 },
    { time: 6, value: 15 },
    { time: 9, value: 20 },
    { time: 12, value: 30 },
    { time: 15, value: 25 },
    { time: 18, value: 35 }, // Peak Focus
    { time: 21, value: 18 },
    { time: 23, value: 12 },
  ];

  const xData = focusData.map((d) => d.time);
  const yData = focusData.map((d) => d.value);

  // Find peak focus time
  const peakFocus = focusData.reduce(
    (prev, curr) => (curr.value > prev.value ? curr : prev),
    focusData[0]
  );

  const renderer = ({ hours, minutes, seconds, completed }) => {
    return completed ? (
      <span>Time is up!</span>
    ) : (
      <span>
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    );
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true; // ✅ Track if the component is still mounted

    const fetchBalance = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/balance/${user.id}`,
          { signal: controller.signal }
        );

        if (isMounted) {
          setBalance(response.data.balance);
          setTrees(response.data.trees);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          // console.log("✅ Request was canceled by cleanup.");
        } else {
          // console.error("❌ Failed to fetch balance:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchSessionData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/sessions/user/${user.id}`,
          { signal: controller.signal }
        );

        if (isMounted && response.data.sessions) {
          const sessions = response.data.sessions;
          setSessionData(sessions);

          // Calculate statistics
          setTotalSessions(sessions.length);

          const totalTime = sessions
            .filter((session) => session.sessionSuccess) // Filter sessions with sessionSuccess true
            .reduce((total, session) => total + session.sessionTime, 0);

          setTotalFocusTime(totalTime);

          const successfulSessions = sessions.filter(
            (session) => session.sessionSuccess
          ).length;
          const rate =
            sessions.length > 0
              ? (successfulSessions / sessions.length) * 100
              : 0;
          setSuccessRate(Math.round(rate));

          // Process data for charts
          processSessionData(sessions);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          // console.log("✅ Request was canceled by cleanup.");
        } else {
          console.error("❌ Failed to fetch session data:", err);
        }
      }
    };

    fetchBalance();
    fetchSessionData();

    return () => {
      isMounted = false; // ✅ Prevent state update after unmount
      controller.abort(); // ✅ Cleanup
    };
  }, [user?.id]);

  // Process session data for different time periods
  const processSessionData = (sessions) => {
    const now = new Date();

    // Hourly data - 24 hours of the day
    const hourlyData = Array(24)
      .fill(0)
      .map((_, hour) => ({
        hour: `${hour}:00`,
        minutes: 0,
        count: 0,
      }));

    // Weekday data - Monday to Sunday
    const weekdayData = weekdays.map((day) => ({
      day,
      minutes: 0,
      count: 0,
    }));

    // Weekly data for the current month - Week 1 to Week 4/5
    const currentMonth = getMonth(now);
    const weeksInMonth = 5; // Max possible weeks in a month
    const weeklyMonthData = Array(weeksInMonth)
      .fill(0)
      .map((_, week) => ({
        week: `Week ${week + 1}`,
        minutes: 0,
        count: 0,
      }));

    // Process each session
    sessions.forEach((session) => {
      const sessionDate = new Date(session.startTime);
      const sessionHour = getHours(sessionDate);
      const sessionWeekday = getDay(sessionDate) || 7; // 0 is Sunday, 1-6 is Monday-Saturday, convert to 1-7 where 1 is Monday
      const sessionWeekInMonth = Math.ceil(sessionDate.getDate() / 7); // Simple calculation for week of month

      // Only process sessions from the last 30 days for hourly and weekday data
      const isRecent = isWithinInterval(sessionDate, {
        start: subDays(now, 30),
        end: now,
      });

      // Only process sessions from the current month for weekly month data
      const isCurrentMonth = isSameMonth(sessionDate, now);

      // Add to hourly data
      if (isRecent) {
        hourlyData[sessionHour].minutes += session.sessionTime;
        hourlyData[sessionHour].count += 1;
      }

      // Add to weekday data (adjust index to match weekdays array)
      if (isRecent) {
        const weekdayIndex = sessionWeekday === 0 ? 6 : sessionWeekday - 1; // Convert to 0-6 where 0 is Monday
        weekdayData[weekdayIndex].minutes += session.sessionTime;
        weekdayData[weekdayIndex].count += 1;
      }

      // Add to weekly month data
      if (isCurrentMonth && sessionWeekInMonth <= weeksInMonth) {
        weeklyMonthData[sessionWeekInMonth - 1].minutes += session.sessionTime;
        weeklyMonthData[sessionWeekInMonth - 1].count += 1;
      }
    });

    // Find most productive hour and day
    const mostProductiveHourData = [...hourlyData].sort(
      (a, b) => b.minutes - a.minutes
    )[0];
    const mostProductiveHour = mostProductiveHourData
      ? parseInt(mostProductiveHourData.hour)
      : null;
    setMostProductiveHour(mostProductiveHour);

    const mostProductiveDayData = [...weekdayData].sort(
      (a, b) => b.minutes - a.minutes
    )[0];
    setMostProductiveDay(mostProductiveDayData?.day || null);

    // Calculate average session length
    if (sessions.length > 0) {
      const avgLength = totalFocusTime / sessions.length;
      setAverageSessionLength(avgLength);
    }

    // Set state with processed data
    setHourlyFocusData(hourlyData);
    setWeekdayFocusData(weekdayData);
    setWeeklyMonthFocusData(weeklyMonthData.filter((w) => w.minutes > 0)); // Only include weeks with data
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

          <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hourly Focus Distribution
              </h3>
              <p className="text-sm text-gray-600">
                Focus time by hour of day (last 30 days)
              </p>

              {/* Hourly Bar Chart */}
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    dataKey: "hour",
                    tickLabelStyle: { fontSize: 10, fill: "black" },
                    label: "Hour of Day",
                  },
                ]}
                series={[
                  {
                    dataKey: "minutes",
                    label: "Minutes",
                    color: "#22c55e",
                    valueFormatter: (value) => `${Math.round(value)} min`,
                  },
                ]}
                dataset={hourlyFocusData.filter((_, i) => i % 2 === 0)} // Show every other hour to fit better
                height={300}
                margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                tooltip={{ trigger: "item" }}
              />
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Weekly Focus Pattern
              </h3>
              <p className="text-sm text-gray-600">
                Focus time by day of week (last 30 days)
              </p>

              {/* Weekday Bar Chart */}
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    dataKey: "day",
                    tickLabelStyle: { fontSize: 12, fill: "black" },
                    label: "Day of Week",
                  },
                ]}
                series={[
                  {
                    dataKey: "minutes",
                    label: "Minutes",
                    color: "#3b82f6",
                    valueFormatter: (value) => `${Math.round(value)} min`,
                  },
                ]}
                dataset={weekdayFocusData}
                height={300}
                margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                tooltip={{ trigger: "item" }}
              />
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Monthly Progress
              </h3>
              <p className="text-sm text-gray-600">
                Focus time by week of current month
              </p>

              {/* Weekly Month Bar Chart */}
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    dataKey: "week",
                    tickLabelStyle: { fontSize: 12, fill: "black" },
                    label: "Week of Month",
                  },
                ]}
                series={[
                  {
                    dataKey: "minutes",
                    label: "Minutes",
                    color: "#a855f7",
                    valueFormatter: (value) => `${Math.round(value)} min`,
                  },
                ]}
                dataset={
                  weeklyMonthFocusData.length > 0
                    ? weeklyMonthFocusData
                    : [{ week: "No Data", minutes: 0 }]
                }
                height={300}
                margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                tooltip={{ trigger: "item" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="relative flex flex-col">
                <h2 className="text-xl text-gray-700 font-bold mb-4">
                  Focus Trend Analysis
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Your focus pattern shows you're most productive at{" "}
                  <span className="font-bold text-green-600">
                    {mostProductiveHour !== null
                      ? `${mostProductiveHour}:00`
                      : "N/A"}
                  </span>{" "}
                  on{" "}
                  <span className="font-bold text-green-600">
                    {mostProductiveDay || "N/A"}
                  </span>
                  . Try to schedule your most important tasks during these peak
                  productivity times.
                </p>

                <LineChart
                  dataset={hourlyFocusData}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "hour",
                      tickLabelStyle: { fontSize: 12, fill: "black" },
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Minutes",
                      tickLabelStyle: { fontSize: 12, fill: "black" },
                    },
                  ]}
                  series={[
                    {
                      dataKey: "minutes",
                      label: "Focus Minutes",
                      curve: "natural",
                      showMark: false,
                      area: true,
                      color: "#22c55e",
                    },
                  ]}
                  height={300}
                  margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                  sx={{
                    "& .MuiChartsAxis-tickLabel": {
                      strokeWidth: 0.5,
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="relative flex flex-col">
                <h2 className="text-xl text-gray-700 font-bold mb-4">
                  Weekly Productivity
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Your average session length is{" "}
                  <span className="font-bold text-blue-600">
                    {Math.round(averageSessionLength)} minutes
                  </span>
                  .
                  {averageSessionLength > 30
                    ? " Great job maintaining focus for extended periods!"
                    : " Consider gradually increasing your session duration for better results."}
                </p>

                <BarChart
                  dataset={weekdayFocusData}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "day",
                      tickLabelStyle: { fontSize: 12, fill: "black" },
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Minutes",
                      tickLabelStyle: { fontSize: 12, fill: "black" },
                    },
                  ]}
                  series={[
                    {
                      dataKey: "minutes",
                      label: "Focus Minutes",
                      valueFormatter: (value) => `${Math.round(value)} min`,
                    },
                  ]}
                  colors={["#3b82f6"]}
                  height={300}
                  margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
