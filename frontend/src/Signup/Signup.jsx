import React from "react";
import { useState } from "react";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must contain at least 8 characters, including uppercase, lowercase, number, and symbol.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Form submitted successfully", formData);
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
            Join us with a smooth and effortless signup experience. Create your account in just a few steps and unlock exclusive access.
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
              {/* Username */}
              <div>
                <input
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
                  placeholder="Username"
                />
              </div>

              {/* Email */}
              <div>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
                  placeholder="Email address"
                />
              </div>

              {/* Phone Number */}
              <div>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
                  placeholder="Phone Number"
                />
              </div>

              {/* Password */}
              <div>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm text-gray-800"
                  >
                    Remember me
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="!mt-8">
              <button
                type="submit"
                className="w-full shadow-xl py-2.5 px-4 text-sm font-semibold rounded text-white bg-[#366827] focus:outline-none"
              >
                Sign Up
              </button>
            </div>

            {/* Social Login */}
            <div className="my-4 flex items-center gap-4">
              <hr className="w-full border-gray-300" />
              <p className="text-sm text-gray-800 text-center">or</p>
              <hr className="w-full border-gray-300" />
            </div>

            <div className="space-x-6 flex justify-center">
              <button type="button" className="border-none outline-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32px"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="#1877f2"
                    d="M512 256c0 127.78-93.62 233.69-216 252.89V330h59.65L367 256h-71v-48.02c0-20.25 9.92-39.98 41.72-39.98H370v-63s-29.3-5-57.31-5c-58.47 0-96.69 35.44-96.69 99.6V256h-65v74h65v178.89C93.62 489.69 0 383.78 0 256 0 114.62 114.62 0 256 0s256 114.62 256 256z"
                  />
                  <path
                    fill="#fff"
                    d="M355.65 330 367 256h-71v-48.021c0-20.245 9.918-39.979 41.719-39.979H370v-63s-29.296-5-57.305-5C254.219 100 216 135.44 216 199.6V256h-65v74h65v178.889c13.034 2.045 26.392 3.111 40 3.111s26.966-1.066 40-3.111V330z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
