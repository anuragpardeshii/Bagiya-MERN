import React, { useEffect, useState } from "react";
import { UserPen, Upload, Save, X } from "lucide-react";
import Sidebar from "../Sidebar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [trees, setTrees] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    phone: user?.phone || "",
    email: user?.email || "",
    bio: user?.bio || "",
    dob: user?.dob || "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || "/avatar.png");

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [balanceResponse, userResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/users/balance/${user.id}`, {
            signal: controller.signal,
          }),
          axios.get(`http://localhost:3000/api/users/${user.id}`, {
            signal: controller.signal,
          }),
        ]);

        if (isMounted) {
          setBalance(balanceResponse.data.balance);
          setTrees(balanceResponse.data.trees);
          
          const userData = userResponse.data;
          setFormData(prevData => ({
            ...prevData,
            name: userData.name || prevData.name,
            username: userData.username || prevData.username,
            phone: userData.phone || prevData.phone,
            email: userData.email || prevData.email,
            bio: userData.bio || prevData.bio,
            dob: userData.dob || prevData.dob,
          }));
          setPreviewUrl(userData.profilePicture || "/avatar.png");
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          toast.error("Failed to fetch profile data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.username || !formData.email) {
        toast.error("Username and email are required fields");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          // For date fields, format them properly
          if (key === 'dob' && formData[key]) {
            formDataToSend.append(key, new Date(formData[key]).toISOString());
          } else {
            formDataToSend.append(key, formData[key].trim());
          }
        }
      });

      // Add profile picture if changed
      if (profilePicture) {
        formDataToSend.append("profilePicture", profilePicture);
      }

      // Log the data being sent (for debugging)
      console.log('Sending data:', Object.fromEntries(formDataToSend));

      // Make the PUT request
      const response = await axios.put(
        `http://localhost:3000/api/users/${user.id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          }
        }
      );

      if (response.data) {
        // Update the user context with new data
        setUser(response.data);
        
        // Reset states
        setIsEditing(false);
        setProfilePicture(null);
        
        // Show success message
        toast.success("Profile updated successfully!");
        
        // Refresh the page data
        const [balanceResponse, userResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/users/balance/${user.id}`),
          axios.get(`http://localhost:3000/api/users/${user.id}`),
        ]);

        setBalance(balanceResponse.data.balance);
        setTrees(balanceResponse.data.trees);
        
        const userData = userResponse.data;
        setFormData(prevData => ({
          ...prevData,
          name: userData.name || prevData.name,
          username: userData.username || prevData.username,
          phone: userData.phone || prevData.phone,
          email: userData.email || prevData.email,
          bio: userData.bio || prevData.bio,
          dob: userData.dob || prevData.dob,
        }));
        setPreviewUrl(userData.profilePicture || "/avatar.png");
      } else {
        throw new Error('No data received from server');
      }

    } catch (error) {
      console.error("Update error:", error);
      // More detailed error message
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Failed to update profile";
      toast.error(errorMessage);
      
      // Log the full error response for debugging
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    } finally {
      setLoading(false);
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
      name: user.name || "",
      username: user.username || "",
      phone: user.phone || "",
      email: user.email || "",
      bio: user.bio || "",
      dob: user.dob || "",
    });
    setPreviewUrl(user.profilePicture || "/avatar.png");
    setProfilePicture(null);
    setIsEditing(false);
  };

  const date = new Date(user?.createdAt);
  const formattedDate = `Joined on: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} Time: ${date.getHours()}:${date.getMinutes()}`;

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
                >
                  <X size={16} className="inline mr-1" /> Cancel
                </button>
              ) : null}
              <button
                onClick={handleButtonClick}
                disabled={loading}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 sm:px-5 sm:py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                {isEditing ? (
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
                    {formData.name || user?.name}
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
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
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
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
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
                    value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
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
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
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
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
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
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
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
                    <span className="text-gray-800 font-bold mr-2">15 days</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Longest Streak</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">21 days</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Total Focus Time</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">126 hours</span>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Trees Planted</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">{trees || 0}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Coins</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">{balance || 0}</span>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Success Rate</p>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-bold mr-2">85%</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
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
