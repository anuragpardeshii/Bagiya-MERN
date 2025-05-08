import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Add these helper functions at the top of the file
const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

export default function Calendar() {
  // State to track current displayed date and user join date
  const { user } = useAuth();
  const userId = user?.id;
  if (!userId) {
    return null;
  }

  const [sessions, setSessions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [joinDate] = useState(new Date("2024-01-01")); // Replace with actual user join date

  // Function to check if navigation should be disabled

  // Navigation handlers
  const handlePreviousMonth = () => {
    if (canNavigatePrevious()) {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    }
  };

  const handleNextMonth = () => {
    if (canNavigateNext()) {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    }
  };

  const canNavigatePrevious = () => {
    const currentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const joinMonth = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1);
    return currentMonth > joinMonth;
  };

  const canNavigateNext = () => {
    const currentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentMonth < thisMonth;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getSessionStatusForDate = (date) => {
    if (!date || !sessions.length) return null;

    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });

    if (daySessions.length === 0) return null;

    const successCount = daySessions.filter(session => session.sessionSuccess).length;
    const failureCount = daySessions.length - successCount;

    return successCount >= failureCount ? 'S' : 'F';
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/sessions/user/${userId}`
        );
        if (response.status === 200) {
          console.log(response.data.sessions);
          setSessions(response.data.sessions);
        } else {
          console.log("Error fetching sessions");
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [userId]);

  return (
    <div className="w-full relative z-10 bg-gradient-to-br from-green-50/30 to-white/80 py-8">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-12 gap-8 max-w-4xl mx-auto xl:max-w-full">
          <div className="col-span-12 xl:col-span-4">
            <div className="sticky top-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                Recent Sessions
              </h2>
              <div className="space-y-4">
                {Array.isArray(sessions) &&
                  sessions.slice(0, 5).map((session, index) => {
                    const sessionStartDate = new Date(session.startTime);
                    const sessionEndDate = new Date(session.endTime);
                    const isStartValid = !isNaN(sessionStartDate.getTime());
                    const isEndValid = !isNaN(sessionEndDate.getTime());

                    return (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-gray-600">
                                  {isStartValid 
                                    ? sessionStartDate.toLocaleString("en-US", { 
                                        timeStyle: "short",
                                        dateStyle: "medium"
                                      }) 
                                    : "Invalid Date"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-600">
                                  {isEndValid 
                                    ? sessionEndDate.toLocaleString("en-US", { 
                                        timeStyle: "short",
                                        dateStyle: "medium"
                                      }) 
                                    : "Invalid Date"}
                                </span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              session.sessionSuccess 
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                session.sessionSuccess ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              {session.sessionSuccess ? "Success" : "Failure"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          
          <div className="col-span-12 xl:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {currentDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    className={`p-2.5 rounded-lg transition-all duration-300 ${
                      canNavigatePrevious()
                        ? 'text-green-600 hover:bg-green-50 hover:shadow-sm border border-green-200'
                        : 'text-gray-300 cursor-not-allowed border border-gray-100'
                    }`}
                    onClick={handlePreviousMonth}
                    disabled={!canNavigatePrevious()}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className={`p-2.5 rounded-lg transition-all duration-300 ${
                      canNavigateNext()
                        ? 'text-green-600 hover:bg-green-50 hover:shadow-sm border border-green-200'
                        : 'text-gray-300 cursor-not-allowed border border-gray-100'
                    }`}
                    onClick={handleNextMonth}
                    disabled={!canNavigateNext()}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-200">
                <div className="grid grid-cols-7 bg-gray-50">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, index) => (
                      <div
                        key={day}
                        className="py-3 text-center text-sm font-medium text-gray-800 border-b border-gray-200"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7">
                  {generateCalendarDays().map((day, index) => {
                    const sessionStatus = day.isCurrentMonth ? getSessionStatusForDate(day.date) : null;
                    return (
                      <div
                        key={index}
                        className={`aspect-square p-4 flex font-bold items-center justify-center ${
                          day.isCurrentMonth 
                            ? 'bg-white hover:bg-green-50' 
                            : 'bg-gray-50'
                        } border-r border-b border-gray-200 transition-all duration-300`}
                      >
                        <div className="flex flex-col items-center gap-1 relative w-full h-full">
                          <span
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                              day.isCurrentMonth 
                                ? 'text-gray-700 hover:bg-green-100 opacity-60 z-50 hover:text-green-700 cursor-pointer' 
                                : 'text-gray-400'
                            }`}
                          >
                            {day.day}
                          </span>
                          {sessionStatus && (
                            <div
                              className={`absolute inset-0 bg-contain bg-center rounded-4xl bg-no-repeat opacity-40 ${
                                sessionStatus === 'S'
                                  ? 'bg-[url("https://res.cloudinary.com/doaaq5amo/image/upload/v1746599839/p5_rn62yg.png")]'
                                  : 'bg-[url("https://res.cloudinary.com/doaaq5amo/image/upload/v1746599839/p6_trrmmn.png")]'
                              }`}
                            ></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
