import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/check-auth", {
          withCredentials: true
        });
        
        if (response.status === 200) {
          navigate("/timer");
        }
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    
    checkAuthStatus();
  }, [navigate]);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for empty fields
    for (const key in formData) {
      if (formData[key].trim() === "") {
        setErrors({ ...errors, [key]: "This field is required" });
        return;
      }
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/auth/signup", {
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      console.log("Signup success:", res.data);
      toast.success("Signup successful!");
    } catch (error) {
      console.error("Signup error", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="font-[sans-serif]">
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl max-md:max-w-md w-full">
          <div>
            <h2 className="lg:text-5xl text-3xl font-extrabold lg:leading-[55px] text-gray-800">
              Seamless Signup for Exclusive Access
            </h2>
            <p className="text-sm mt-6 text-gray-800">
              Join us with a smooth and effortless signup experience. Create
              your account in just a few steps and unlock exclusive access.
            </p>
            <p className="text-sm mt-12 text-gray-800">
              Already have an account ?{" "}
              <a
                href="/login"
                className="font-semibold hover:underline ml-1 bg-gradient-to-r from-[#85ce14] to-[#366827] bg-clip-text text-transparent"
              >
                Login here
              </a>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md md:ml-auto w-full">
            <h3 className="text-gray-800 text-3xl font-extrabold mb-8">
              Sign Up
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="bg-gray-100 w-full text-sm px-4 py-3.5 rounded-md"
              />

              {/* Username */}
              <input
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="bg-gray-100 w-full text-sm px-4 py-3.5 rounded-md"
              />

              {/* Phone */}
              <input
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="bg-gray-100 w-full text-sm px-4 py-3.5 rounded-md"
              />

              {/* Email */}
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="bg-gray-100 w-full text-sm px-4 py-3.5 rounded-md"
              />

              {/* Password */}
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="bg-gray-100 w-full text-sm px-4 py-3.5 rounded-md"
              />

              {/* Confirm Password */}
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="bg-gray-100 w-full text-sm px-4 py-3.5 rounded-md"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 text-white bg-blue-600 rounded"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
