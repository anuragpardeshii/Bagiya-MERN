import * as React from "react";
import "./FocusChart.css"
import { LineChart } from "@mui/x-charts/LineChart";

export default function FocusChart({ dataset }) {
  // Extract X (Time) and Y (Focus Level) data
  const xData = dataset.map((d) => d.time);
  const yData = dataset.map((d) => d.value);

  // Find peak focus time
  const peakFocus = dataset.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), dataset[0]);

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Most Focused Period of The Day</h3>
      <p className="text-sm text-gray-600">
        Most focused at <span className="text-green-600 font-bold">{peakFocus.time}:00</span> every day in general
      </p>

      {/* Line Chart */}
      <div className="w-full overflow-x-auto">
        <LineChart
          xAxis={[{ data: xData, label: "Time (Hours)" }]}
          series={[
            {
              data: yData,
              label: "Focus Level",
              color: "green",
            },
          ]}
          height={300}
          margin={{ left: 70, right: 20 }} // Adjust margins for better mobile display
          sx={{
            width: "100%",
            minWidth: "500px", // Ensure chart doesn't shrink too much on mobile
          }}
        />
      </div>

      {/* Display Dataset */}
      <div className="mt-4">
        <h4 className="text-md font-medium text-gray-800">Focus Data:</h4>
        <div className="overflow-x-auto">
          <table className="w-full border text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Time (H)</th>
                <th className="border px-2 py-1">Focus Level</th>
              </tr>
            </thead>
            <tbody>
              {dataset.map((d, i) => (
                <tr key={i} className="border">
                  <td className="px-2 py-1">{d.time}:00</td>
                  <td className="px-2 py-1">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}