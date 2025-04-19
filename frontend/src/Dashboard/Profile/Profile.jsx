import React, { useEffect, useState } from "react";
import { UserPen, Upload, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Sidebar from "../Sidebar";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Profile() {
  const { user: authUser } = useAuth(); // Get user from auth context
  const userId = authUser?._id || authUser?.id; // Extract user ID, handling both _id and id formats
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [trees, setTrees] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    bio: "",
    dob: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/avatar.png");

  // Fetch user data when component mounts
  useEffect(() => {
    if (!userId) return; // Return early if no userId
    
    const getUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/users/${userId}`);
        
        if (response.status === 200 || response.status === 202) {
          const userData = response.data.user;
          console.log("Fetched user data:", userData); // Add this to debug
          setUser(userData);
          
          // Update form data with user data
          setFormData({
            name: userData.name || "",
            username: userData.username || "",
            phone: userData.phone || "",
            email: userData.email || "",
            bio: userData.bio || "",
            dob: userData.dob || "",
          });
          
          // Set preview URL if profile picture exists
          if (userData.profilePicture) {
            setPreviewUrl(userData.profilePicture);
          }
          
          // Set balance and trees
          setBalance(userData.wallet?.balance || userData.balance || 0);
          setTrees(userData.trees || 0);
        } else {
          throw new Error("Failed to fetch user data"); 
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, [userId]); // Add userId as dependency
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Send formData directly instead of creating a FormData object
      const response = await axios.put(
        `http://localhost:3000/api/users/${userId}`, // Use userId consistently
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 202) {
        // Update the user context with the new data
        toast.success("Profile updated successfully!"); // This line isn't working
        const updatedUser = response.data.user || response.data;
        
        // Update user state
        setUser({
          ...user,
          ...updatedUser
        });
        
        setIsEditing(false);
        setProfilePicture(null);

        // Update local state with new data
        setBalance(updatedUser.wallet?.balance || balance);
        
        // Update form data with new user data
        setFormData({
          name: updatedUser.name || "",
          username: updatedUser.username || "",
          phone: updatedUser.phone || "",
          email: updatedUser.email || "",
          bio: updatedUser.bio || "",
          dob: updatedUser.dob || "",
        });
        
        if (updatedUser.profilePicture) {
          setPreviewUrl(updatedUser.profilePicture);
        }
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleSubmit(e);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      phone: user?.phone || "",
      email: user?.email || "",
      bio: user?.bio || "",
      dob: user?.dob || "",
    });
    setPreviewUrl(user?.profilePicture || "/avatar.png");
    setProfilePicture(null);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Joined recently";
    const date = new Date(dateString);
    return `Joined on: ${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()} Time: ${date.getHours()}:${date.getMinutes()}`;
  };

  const formattedDate = formatDate(user?.createdAt);

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="p-4 sm:p-8 sm:ml-64 bg-[#e5e7eb] min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="p-4 sm:p-8 sm:ml-64 bg-[#e5e7eb] min-h-screen">
        <div className="rounded-lg dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-center pb-4 sm:pb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl text-gray-700 font-bold">
                My Profile
              </h1>
            </div>
            <div>
              {isEditing ? (
                <button
                  onClick={handleCancel}
                  className="text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 sm:px-5 sm:py-2.5 mr-2"
                  disabled={submitting}
                >
                  <X size={16} className="inline mr-1" /> Cancel
                </button>
              ) : null}
              <button
                onClick={handleButtonClick}
                disabled={loading || submitting}
                className={`text-white font-medium rounded-lg text-sm px-4 py-2 sm:px-5 sm:py-2.5 focus:outline-none ${
                  submitting 
                    ? "bg-blue-400 cursor-not-allowed" 
                    : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save size={16} className="inline mr-1" /> Save Changes
                  </>
                ) : (
                  <>
                    <UserPen size={16} className="inline mr-1" /> Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm flex-1 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full cursor-pointer hover:bg-blue-600">
                      <Upload size={16} className="text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePictureChange}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-medium">
                    {formData.name || user?.name || "User"}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid gap-4 mb-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing || submitting}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing || submitting}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="dob"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    id="dob"
                    value={
                      formData.dob
                        ? new Date(formData.dob).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    disabled={!isEditing || submitting}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Phone number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing || submitting}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing || submitting}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="bio"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing || submitting}
                  rows="4"
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Write something about yourself..."
                ></textarea>
              </div>
            </form>
          </div>

          {/* Statistics Section */}
          <div className="flex flex-col gap-4 sm:gap-8 w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h1 className="text-xl text-gray-700 font-semibold mb-4">
                Statistics
              </h1>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Current Streak</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">
                      15 days
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Longest Streak</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">
                      21 days
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Total Focus Time</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">
                      126 hours
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Trees Planted</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">
                      {trees || 0}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Coins</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">
                      {balance || 0}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Success Rate</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">85%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h1 className="text-xl text-gray-700 font-semibold mb-4">
                Achievements
              </h1>
              <div className="space-y-4">
                <div className="bg-gray-50 flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <img src="/trophy.png" className="w-8 h-8" alt="Trophy" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">
                      21-Day Streak
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Maintained focus for 21 consecutive days
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <img src="/trophy.png" className="w-8 h-8" alt="Trophy" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">
                      Forest Guardian
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Planted 100 trees in your forest
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <img src="/trophy.png" className="w-8 h-8" alt="Trophy" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">
                      Focus Master
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Completed 50 focus sessions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
