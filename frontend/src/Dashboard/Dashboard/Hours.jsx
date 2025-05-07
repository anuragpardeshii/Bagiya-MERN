import React, { useEffect, useState, useRef } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import LoadingScreen from "../../components/LoadingScreen";
import 'flowbite';
import axios from 'axios';

const Hours = ({ userId }) => {
  const [hourlyData, setHourlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostProductiveHour, setMostProductiveHour] = useState(null);
  const [chartWidth, setChartWidth] = useState(0);
  const chartContainerRef = useRef(null);
  const [timeFilter, setTimeFilter] = useState("Last week");

  // Add resize handler and update width whenever component updates
  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth);
      }
    };

    // Call immediately
    updateWidth();
    
    // Set up a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateWidth, 100);
    
    // Add resize listener
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
      clearTimeout(timeoutId);
    };
  }, [hourlyData]); // Re-run when hourlyData changes

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    axios.get(`http://localhost:3000/api/sessions/user/${userId}/hourly`)
      .then((response) => {
        const data = response.data;
        console.log('Hourly data from backend:', data);

        // Process data for chart with time conversion
        const chartData = data.map(item => ({
          x: item.hour,
          y: Math.round(item.timeInvested / 2) // Convert the timeInvested to actual minutes
        }));

        // Find most productive hour with corrected time values
        const mostProductive = [...data].sort((a, b) => (b.timeInvested / 2) - (a.timeInvested / 2))[0];
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

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex justify-between mb-5">
        <div className="grid gap-4 grid-cols-2">
          <div>
            <h5 className="inline-flex items-center text-gray-500 leading-none font-normal mb-2">
              Focus Time
              <svg data-popover-target="focus-info" data-popover-placement="bottom" className="w-3 h-3 text-gray-400 hover:text-gray-900 cursor-pointer ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <div data-popover id="focus-info" role="tooltip" className="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 w-72">
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-gray-900">Focus Time Analysis</h3>
                  <p>This chart shows your focus time distribution across different hours of the day.</p>
                </div>
                <div data-popper-arrow></div>
              </div>
            </h5>
            <p className="text-gray-900 text-2xl leading-none font-bold">
              {hourlyData.reduce((sum, item) => sum + item.y, 0)} min
            </p>
          </div>
          <div>
            <h5 className="inline-flex items-center text-gray-500 leading-none font-normal mb-2">
              Peak Hour
              <svg data-popover-target="peak-info" data-popover-placement="bottom" className="w-3 h-3 text-gray-400 hover:text-gray-900 cursor-pointer ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <div data-popover id="peak-info" role="tooltip" className="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 w-72">
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-gray-900">Peak Productivity</h3>
                  <p>This is the hour of the day when you're most productive based on your focus sessions.</p>
                </div>
                <div data-popper-arrow></div>
              </div>
            </h5>
            <p className="text-gray-900 text-2xl leading-none font-bold">
              {mostProductiveHour || "N/A"}
            </p>
          </div>
        </div>
        <div>
          <button id="hourlyFilterDropdown"
            data-dropdown-toggle="hourlyTimeFilter"
            data-dropdown-placement="bottom" type="button" className="px-3 py-2 inline-flex items-center text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-4 focus:ring-gray-200">
            {timeFilter} <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>
          <div id="hourlyTimeFilter" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44">
            <ul className="py-2 text-sm text-gray-700" aria-labelledby="hourlyFilterDropdown">
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Yesterday</a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Last week</a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Last month</a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">All time</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

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
                  curve: "",
                  valueFormatter: (value) => `${value} min`,
                },
              ]}
              height={window.innerWidth < 640 ? 300 : 350}
              width={chartWidth || "100%"}
              margin={{ 
                left: window.innerWidth < 640 ? 40 : 50, 
                right: window.innerWidth < 640 ? 20 : 30, 
                top: 30, 
                bottom: window.innerWidth < 640 ? 60 : 50 
              }}
              grid={{ vertical: false, horizontal: false }}
              sx={{
                '.MuiLineElement-root': {
                  strokeWidth: window.innerWidth < 640 ? 1.5 : 2,
                },
                '.MuiMarkElement-root': {
                  stroke: '#22c55e',
                  scale: window.innerWidth < 640 ? '0.5' : '0.6',
                  fill: '#ffffff',
                  strokeWidth: 2,
                  r: 4,
                  '&:hover': {
                    scale: '0.8',
                    fill: '#f59e0b',
                  },
                },
                '.MuiChartsLegend-root': {
                  display: 'none',
                },
                '.MuiAreaElement-root': {
                  fill: '#22c55e',
                  // fillOpacity: 0.8,
                },
                '.MuiChartsAxis-tickLabel': {
                  fontFamily: '"Inter", sans-serif',
                },
                '.MuiChartsAxis-line': {
                  stroke: '#E5E7EB',
                },
                '.MuiChartsAxis-tick': {
                  stroke: '#E5E7EB',
                },
                '.MuiGrid-root': {
                  display: 'none', // Hide grid lines completely
                },
              }}
              slotProps={{
                svg: {
                  children: (
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  ),
                },
              }}
              tooltip={{ 
                trigger: 'axis',
                componentsProps: {
                  tooltip: {
                    sx: {
                      backgroundColor: 'white',
                      color: '#1F2937',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      borderRadius: '0.375rem',
                      padding: '0.5rem',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.875rem',
                    },
                  },
                },
                formatter: (params) => {
                  // Handle array of params when using 'axis' trigger
                  const param = Array.isArray(params) ? params[0] : params;
                  return [
                    `Time: ${param.x}:00`,
                    `Focus: ${param.y} min`,
                  ].join('<br/>');
                }
              }}
            />
          </div>
        </div>
      )}

      {hourlyData.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Complete some focus sessions to see your hourly data</p>
        </div>
      )}
    </div>
  );
};

export default Hours;