import Sidebar from "../Sidebar";
import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { BadgeEuro, TreePine, Dot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CircleSlider } from "react-circle-slider";
import Countdown from "react-countdown";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import FocusChart from "./FoucsChart";

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

    fetchBalance();

    return () => {
      isMounted = false; // ✅ Prevent state update after unmount
      controller.abort(); // ✅ Cleanup
    };
  }, [user?.id]);

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
            <h1 className="text-xl text-gray-700 font-semibold">Statistics</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4 text-center">
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

          <div className="grid grid-cols-1 md:grid-cols-2 mb-4 gap-4">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Most Focused Period of The Day
              </h3>
              <p className="text-sm text-gray-600">
                Most focused at{" "}
                <span className="text-green-600 font-bold">
                  {peakFocus.time}:00
                </span>{" "}
                every day in general
              </p>

              {/* Line Chart */}
              <LineChart
                xAxis={[{ data: xData, label: "Time (Hours)" }]}
                series={[
                  {
                    data: yData,
                    label: "Focus Level",
                    color: "green",
                    curve: "linear",
                  },
                ]}
                // width={300}
                height={300}
              />
            </div>
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Most Focused Day of The Week
              </h3>
              <p className="text-sm text-gray-600">
                Most focused at{" "}
                <span className="text-green-600 font-bold">
                  {peakFocus.time}:00
                </span>{" "}
                every day in general
              </p>

              {/* Line Chart */}
              <LineChart
                xAxis={[{ data: xData, label: "Time (Hours)" }]}
                series={[
                  {
                    data: yData,
                    label: "Focus Level",
                    color: "green",
                    curve: "linear",
                  },
                ]}
                // width={300}
                height={300}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="relative flex flex-col mt-6">
              <h2 className="text-2xl text-gray-700 font-bold">Focus Hours</h2>
              <LineChart
                dataset={dataset}
                xAxis={[
                  {
                    scaleType: "band",
                    dataKey: "day",
                    bandPosition: 1,
                    tickLabelStyle: { fontSize: 12, fill: "black" }, // Customize tick labels
                  },
                ]}
                yAxis={[
                  {
                    tickLabelStyle: { fontSize: 12, fill: "black" }, // Customize y-axis labels
                    tickNumber: 15,
                    tickMinStep: 0.5,
                    nice: false,
                  },
                ]}
                series={[
                  { dataKey: "hours", label: "Focus Hours", curve: "linear" },
                ]}
                height={400}
                margin={{ left: 50, right: 50, top: 30, bottom: 30 }}
                grid={{ vertical: true, horizontal: true }}
                sx={{
                  "& .MuiChartsGrid-root": {
                    stroke: "rgba(0, 0, 0, 0.1)", // Customize grid line color
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
