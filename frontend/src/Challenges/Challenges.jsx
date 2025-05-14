import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../Dashboard/context/AuthContext";
import Sidebar from "../Dashboard/Sidebar";

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      // Changed from user-specific route to general challenges route
      const response = await axios.get("http://localhost:3000/api/challenges");
      setChallenges(response.data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const handleRedeem = async (challengeId) => {
    try {
      await axios.post(
        `http://localhost:3000/api/challenges/redeem/${challengeId}`
      );
      // Refresh challenges after redeeming
      fetchChallenges();
    } catch (error) {
      console.error("Error redeeming challenge:", error);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="p-8 sm:ml-64 bg-[#e5e7eb] h-full">
        <h1 className="text-3xl font-bold mb-8">Challenges</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div
              key={challenge._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{challenge.title}</h2>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-yellow-500 font-bold">
                  {challenge.coins} Coins
                </span>
                <button
                  onClick={() => handleRedeem(challenge._id)}
                  disabled={challenge.isRedeemed}
                  className={`px-4 py-2 rounded-md ${
                    challenge.isRedeemed
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {challenge.isRedeemed ? "Redeemed" : "Redeem"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
