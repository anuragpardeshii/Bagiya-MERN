import React, { useEffect, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import moment from "moment";
import LoadingScreen from "../../components/LoadingScreen";

const Monthly = ({ userId }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(`http://localhost:3000/api/sessions/user/${userId}/monthly`)
      .then(async (response) => {
        const monthlyData = await response.json();
        console.log('Monthly data from backend:', monthlyData);

        if (!response.ok) throw new Error('Failed to fetch monthly data');

        // Process monthly data
        const monthlyChartData = Array.from({ length: 12 }, (_, index) => {
          const abbreviatedMonth = moment().month(index).format('MMM').toUpperCase();
          const monthData = Object.values(monthlyData).find(
            item => item.month === moment().month(index).format('MMMM')
          );
          return {
            month: abbreviatedMonth,
            timeInvested: monthData?.timeInvested || 0,
          };
        });

        setMonthlyData(monthlyChartData);
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
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Monthly Progress Report</h2>
      <div>
        {monthlyData.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <LineChart
                xAxis={[{ 
                  scaleType: 'band',
                  data: monthlyData.map(item => item.month),
                  tickLabelStyle: {
                    angle: 45,
                    textAnchor: 'start',
                    fontSize: 12,
                  }
                }]}
                series={[
                  {
                    data: monthlyData.map(item => item.timeInvested),
                    label: "Time Invested (min)",
                    color: "#f59e0b",
                    area: true,
                  },
                ]}
                height={300}
                width={window.innerWidth < 640 ? 600 : window.innerWidth < 1024 ? 700 : 800}
                margin={{ left: 30, right: 30, top: 30, bottom: 50 }}
              />
            </div>
          </div>
        ) : (
          <p>No monthly data available.</p>
        )}
      </div>
    </div>
  );
};

export default Monthly;
