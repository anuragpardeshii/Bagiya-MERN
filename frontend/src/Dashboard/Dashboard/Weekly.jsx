import React, { useEffect, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import LoadingScreen from "../../components/LoadingScreen";

const Weekly = ({ userId }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(`http://localhost:3000/api/sessions/user/${userId}/weekly`)
      .then(async (response) => {
        const weeklyData = await response.json();
        console.log("Weekly data from backend:", weeklyData);

        if (!response.ok) throw new Error("Failed to fetch weekly data");

        // Process weekly data
        const weeklyChartData = weeklyData.map((item) => ({
          day: item.day.substring(0, 3).toUpperCase(), // Convert to abbreviated form (e.g., "MON")
          timeInvested: Math.round(item.timeInvested / 2) || 0,
        }));

        setWeeklyData(weeklyChartData);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Error fetching data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading)
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Weekly Progress Report</h2>
      <div>
        {weeklyData.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <LineChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: weeklyData.map((item) => item.day),
                    tickLabelStyle: {
                      angle: 45,
                      textAnchor: "start",
                      fontSize: 12,
                    },
                  },
                ]}
                series={[
                  {
                    data: weeklyData.map((item) => item.timeInvested),
                    label: "Time Invested (min)",
                    color: "#3b82f6",
                    area: true,
                    showMark: true,
                  },
                ]}
                height={300}
                width={
                  window.innerWidth < 640
                    ? 600
                    : window.innerWidth < 1024
                    ? 700
                    : 800
                }
                margin={{ left: 30, right: 30, top: 30, bottom: 50 }}
                // grid={{ vertical: true, horizontal: true }}
              />
            </div>
          </div>
        ) : (
          <p>No weekly data available.</p>
        )}
      </div>
    </div>
  );
};

export default Weekly;
