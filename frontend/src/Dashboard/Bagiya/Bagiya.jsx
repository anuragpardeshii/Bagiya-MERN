import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Trees } from "lucide-react";
import Sidebar from "../Sidebar";
import axios from "axios";
import Calender from "./Calendar";
import { useAuth } from "../context/AuthContext";

const generateContributions = () => {
  const contributions = [];
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    contributions.unshift({
      date,
      count: Math.floor(Math.random() * 5), // 0-4 contributions
    });
  }
  return contributions;
};

export default function Bagiya() {
  const contributions = useMemo(() => generateContributions(), []);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [trees, setTrees] = useState(null);

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

  const colors = [
    "bg-gray-100",
    "bg-green-200",
    "bg-green-300",
    "bg-green-400",
    "bg-green-500",
  ];

  return (
    <>
      <Sidebar />
      <div className="p-8 sm:ml-64 bg-[#e5e7eb] h-full">
        <div className="rounded-lg dark:border-gray-700">
          <h1 className="text-3xl text-gray-700 font-bold ms-2 mb-8">Bagiya</h1>
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <p className="text-lg text-gray-600">Total Trees planted</p>
              <h2 className="text-2xl text-gray-700 font-bold">
                {trees ? trees : 0}
              </h2>
              {/* <p className="text-[green] font-medium text-md">+3 this month</p> */}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <p className="text-lg text-gray-600">Current Streak</p>
              <h2 className="text-2xl text-gray-700 font-bold">15 days</h2>
              <p className="text-[green] font-medium text-md">Best: 21 dats</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <p className="text-lg text-gray-600">Total Focus hours</p>
              <h2 className="text-2xl text-gray-700 font-bold">126 hr</h2>
              <p className="text-[green] font-medium text-md">+12h this week</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8">
            <section className="relative">
              <Calender/>
            </section>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
            <h3 className="text-xl font-semibold mb-4 ms-2">Plant a Tree</h3>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-green-800 mb-4">
                You have <span className="font-bold">2,500 coins</span>{" "}
                available. Each tree costs 1,000 coins to plant.
              </p>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                aria-label="Plant a tree using 1,000 coins"
              >
                Plant a Tree (1,000 coins)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 mt-8">
            <h2 className="text-xl font-semibold mb-4 ms-2">
              Recent Activities
            </h2>
            <div className="gap-4">
              <div className="flex justify-between items-center bg-gray-50 mb-4 p-4 rounded-lg">
                <div className="flex items-center">
                  <Trees size={40} color="green" className="me-2" />
                  <div>
                    <h2 className="text-md text-gray-600 font-medium">
                      Oak Tree Planted
                    </h2>
                    <p className="text-sm text-gray-700">March 10, 2024</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h2>-1000 coins</h2>
                  <p className="text-[green]">Trees for the Future</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 mb-4 p-4 rounded-lg">
                <div className="flex items-center">
                  <Trees size={40} color="green" className="me-2" />
                  <div>
                    <h2 className="text-md text-gray-600 font-medium">
                      Oak Tree Planted
                    </h2>
                    <p className="text-sm text-gray-700">March 10, 2024</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h2>-1000 coins</h2>
                  <p className="text-[green]">Trees for the Future</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 mb-4 p-4 rounded-lg">
                <div className="flex items-center">
                  <Trees size={40} color="green" className="me-2" />
                  <div>
                    <h2 className="text-md text-gray-600 font-medium">
                      Oak Tree Planted
                    </h2>
                    <p className="text-sm text-gray-700">March 10, 2024</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h2>-1000 coins</h2>
                  <p className="text-[green]">Trees for the Future</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
