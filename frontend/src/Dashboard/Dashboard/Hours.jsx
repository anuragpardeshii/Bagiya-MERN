import React, { useEffect, useState, useRef } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import LoadingScreen from "../../components/LoadingScreen";

const Hours = ({ userId }) => {
  const [hourlyData, setHourlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostProductiveHour, setMostProductiveHour] = useState(null);
  const [chartWidth, setChartWidth] = useState(0);
  const chartContainerRef = useRef(null);

  // Add resize handler
  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(`http://localhost:3000/api/sessions/user/${userId}/hourly`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch hourly data');
        }
        const data = await response.json();
        console.log('Hourly data from backend:', data);

        // Process data for chart
        const chartData = data.map(item => ({
          x: item.hour,
          y: item.timeInvested
        }));

        // Find most productive hour
        const mostProductive = [...data].sort((a, b) => b.timeInvested - a.timeInvested)[0];
        setMostProductiveHour(mostProductive?.hour !== undefined ? `${mostProductive.hour}:00` : null);

        setHourlyData(chartData);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Error fetching data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full flex-1 px-2 sm:px-0 h-full">
      <div className="relative w-full flex-1 flex flex-col w-full h-full">
        <h2 className="text-xl text-gray-700 font-bold mb-4">
          24-Hour Focus Analysis
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Your focus pattern shows you're most productive at{" "}
          <span className="font-bold text-green-600">
            {mostProductiveHour || "N/A"}
          </span>
          . Try to schedule your important tasks during this peak
          productivity time.
        </p>

        {hourlyData.length > 0 && (
          <div 
            ref={chartContainerRef}
            className="w-full overflow-x-auto sm:overflow-hidden"
          >
            <div className="min-w-[320px] w-full h-[350px] sm:h-[400px]">
              <LineChart
                dataset={hourlyData}
                xAxis={[{
                  dataKey: 'x',
                  valueFormatter: (value) => `${value}:00`,
                  tickLabelStyle: { 
                    fontSize: window.innerWidth < 640 ? 10 : 12,
                    fill: "#4B5563",
                    angle: 45,
                    textAnchor: 'start',
                  },
                  scaleType: 'band',
                }]}
                series={[
                  {
                    dataKey: 'y',
                    label: "Focus Minutes",
                    color: "#22c55e",
                    area: true,
                    showMark: true,
                    curve: "natural",
                    valueFormatter: (value) => `${value} min`,
                  },
                ]}
                height={window.innerWidth < 640 ? 300 : 350}
                width={chartWidth || (window.innerWidth < 640 ? 320 : 600)}
                margin={{ 
                  left: window.innerWidth < 640 ? 40 : 50, 
                  right: window.innerWidth < 640 ? 20 : 30, 
                  top: 30, 
                  bottom: window.innerWidth < 640 ? 60 : 50 
                }}
                grid={{ vertical: true, horizontal: true }}
                sx={{
                  '.MuiLineElement-root': {
                    strokeWidth: window.innerWidth < 640 ? 1.5 : 2,
                  },
                  '.MuiMarkElement-root': {
                    stroke: '#22c55e',
                    scale: window.innerWidth < 640 ? '0.5' : '0.6',
                    fill: '#ffffff',
                  },
                  '.MuiChartsLegend-root': {
                    display: 'none',
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hours;