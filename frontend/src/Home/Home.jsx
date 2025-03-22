import React from "react";
import Community from "./Community";
import Navbar from "./Navbar";

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* home */}
      <div id="home" className="border-b border-gray-100">
        <div className="grid grid-cols-5 bg-white items-center h-screen jusitfy-center">
          <div className="col-span-5 md:col-span-2 mx-auto text-center">
            <img className="mx-auto px-12 w-80 mb-8" src="/logo.png" alt="" />
            <h1 className="mb-8 mx-4 max-w-lg mt-4 text-4xl md:text-2xl font-bold leading-none tracking-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-[#85ce14] to-[#366827] bg-clip-text text-transparent">
              The Greenest way to focus
            </h1>

            <button className="p-[3px] block mx-auto md:hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#85ce14] to-[#366827] rounded-lg" />
              <div className="px-8 py-2 bg-white rounded-[6px]  relative group transition duration-200 text-black [#366827] font-bold">
                Get Started
              </div>
            </button>
            <div className="flex justify-center flex-wrap gap-4">
              <a href="/dashboard" target="_blank" rel="noopener noreferrer">
                <img
                  src="data:image/png;base64,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"
                  alt="Download on the App Store"
                  className="h-16 md:h-20"
                />
              </a>

              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-16 md:h-20"
                />
              </a>
            </div>

            {/* <button className="p-[3px] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#85ce14] to-[#366827] rounded-lg" />
              <div className="px-8 py-2  bg-white rounded-[6px]  relative group transition duration-200 text-[#366827] hover:bg-transparent font-bold">
                Get Started
              </div>
            </button> */}
          </div>
          <div className="hidden md:block col-span-3 h-screen">
            <img className="h-screen absolute " src="/waveRotated.svg" alt="" />
            <img className="h-screen" src="/bagiya.jpg" alt="" />
          </div>
        </div>
      </div>

      {/* How it works */}

      <section
        id="about"
        class="bg-white dark:bg-white border-b border-gray-100 [#366827]"
      >
        <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
          <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-black">
            We invest in a greener future.
          </h1>
          <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-700">
            At Bagiya, we help you stay focused on what truly matters while
            contributing to real tree planting, creating a more sustainable and
            thriving world. 🌱
          </p>
          <div className="flex flex-wrap max-w-5xl mx-auto justify-around py-8">
            <div>
              <img
                class="rounded-full shadow-2xl mx-auto w-60 h-60"
                src="/progress/cropped-image1.png"
                alt="image description"
              />
              <p className="my-4 px-4 text-gray-500 dark:text-gray-600 max-w-xs">
                Focus better, plant a tree, and make a difference.
              </p>
            </div>
            <div>
              <img
                class="rounded-full shadow-2xl mx-auto w-60 h-60"
                src="/progress/cropped-image2.png"
                alt="image description"
              />
              <p className="my-4 px-4 text-gray-500 dark:text-gray-600 max-w-xs">
                As you focus on your work, your tree will grow.
              </p>
            </div>
            <div>
              <img
                class="rounded-full shadow-2xl mx-auto w-60 h-60"
                src="/progress/cropped-image3.png"
                alt="image description"
              />
              <p className="my-4 text-gray-500 dark:text-gray-600 px-4 max-w-xs">
                If you leave the app midway, your tree won’t survive.
              </p>
            </div>
          </div>
          <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            <button className="p-[3px] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#85ce14] to-[#366827] rounded-lg" />
              <div className="px-8 py-2 bg-white rounded-[6px]  relative group transition duration-200 text-black [#366827] font-bold">
                Get Started
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* why us */}
      <section
        id="benefits"
        class="py-20 bg-neutral-50 relative overflow-hidden"
      >
        <div class="max-w-6xl mx-auto px-4 mb-16">
          <div class="text-center">
            <h2 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-black">
              Why Choose Bagiya?
            </h2>
          </div>
          <p class="mb-8 text-lg font-normal text-gray-700 lg:text-xl sm:px-16 lg:px-48 text-center dark:text-gray-700">
            Experience the dual benefits of improved productivity and
            environmental impact with our unique approach.
          </p>
        </div>
        {/* Cards */}
        <div class="grid container max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white mx-4 sm:mx-auto rounded-xl shadow-md overflow-hidden transform">
            <div class="p-8">
              <h3 class="text-xl font-bold text-gray-800 mb-4">
                Improved Focus & Productivity
              </h3>
              <p class="text-gray-600">
                Our scientifically-backed focus timer helps you maintain
                concentration and achieve more in less time, using the proven
                Pomodoro technique.
              </p>
              <ul class="mt-6 space-y-2">
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Reduce distractions
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Reduce distractions
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Reduce distractions
                </li>
              </ul>
            </div>
          </div>

          {/* Benenfit 2 */}
          <div class="bg-white mx-4 sm:mx-auto rounded-xl shadow-md overflow-hidden transform">
            <div class="p-8">
              <h3 class="text-xl font-bold text-gray-800 mb-4">
                Real Environmental Impact
              </h3>
              <p class="text-gray-600">
                Unlike other apps, your productivity directly translates to real
                trees being planted around the world, helping combat climate
                change.
              </p>
              <ul class="mt-6 space-y-2">
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Reduce carbon footprint
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Reduce reforestation efforts
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Reduce wildlife habitats
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-white mx-4 sm:mx-auto rounded-xl shadow-md overflow-hidden transform">
            <div class="p-8">
              <h3 class="text-xl font-bold text-gray-800 mb-4">
                Join a Global Community
              </h3>
              <p class="text-gray-600">
                Connect with thousands of like-minded individuals who are
                committed to both personal productivity and environmental
                conservation.
              </p>
              <ul class="mt-6 space-y-2">
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Participate in challenges
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Share achievements
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Collective impact tracking
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-white mx-4 sm:mx-auto rounded-xl shadow-md overflow-hidden transform">
            <div class="p-8">
              <h3 class="text-xl font-bold text-gray-800 mb-4">
                Insightful Analytics
              </h3>
              <p class="text-gray-600">
                Get detailed insights into your productivity patterns and
                environmental impact through our comprehensive analytics
                dashboard.
              </p>
              <ul class="mt-6 space-y-2">
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Track focus habits
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Visualize productivity trends
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Measure carbon offset
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-white mx-4 sm:mx-auto rounded-xl shadow-md overflow-hidden transform">
            <div class="p-8">
              <h3 class="text-xl font-bold text-gray-800 mb-4">
                Meaningful Motivation
              </h3>
              <p class="text-gray-600">
                Stay motivated with our unique tree growth visualization and the
                knowledge that your focus is contributing to real-world positive
                change.
              </p>
              <ul class="mt-6 space-y-2">
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Visual growth feedback
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Achievement badges
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Purpose-driven focus
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-white mx-4 sm:mx-auto rounded-xl shadow-md overflow-hidden transform">
            <div class="p-8">
              <h3 class="text-xl font-bold text-gray-800 mb-4">
                Complete Peace of Mind
              </h3>
              <p class="text-gray-600">
                With transparent reporting and verified tree planting partners,
                you can be confident that your productivity is making a real
                difference.
              </p>
              <ul class="mt-6 space-y-2">
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Verified planting partners
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Transparent reporting
                </li>
                <li class="flex items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Data privacy protection
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonals */}
      <section id="testimonials" class="bg-white py-20">
        <div class="container mx-auto px-4">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-4xl md:text-5xl font-bold text-black mb-4">
                Trust & Testimonials
              </h2>
              <p class="text-black text-lg">Hear from our satisfied users</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div class="bg-neutral-50 shadow-xl rounded-xl p-6 hover:transform hover:scale-105 transition-all">
                <div class="flex items-center space-x-4 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span class="text-xl font-bold text-white">S</span>
                  </div>
                  <div>
                    <h3 class="text-black font-semibold">Suresh Kumar</h3>
                    <p class="text-neutral-700 text-sm">Patient</p>
                  </div>
                </div>
                <p class="text-gray-700 mb-4">
                  The AI symptom checker helped me identify my condition
                  quickly. The telemedicine consultation was seamless and very
                  professional.
                </p>
                <div class="flex text-yellow-400">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>

              <div class="bg-neutral-50 shadow-xl rounded-xl p-6 hover:transform hover:scale-105 transition-all">
                <div class="flex items-center space-x-4 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span class="text-xl font-bold text-white">S</span>
                  </div>
                  <div>
                    <h3 class="text-black font-semibold">Suresh Kumar</h3>
                    <p class="text-neutral-700 text-sm">Patient</p>
                  </div>
                </div>
                <p class="text-gray-700 mb-4">
                  The AI symptom checker helped me identify my condition
                  quickly. The telemedicine consultation was seamless and very
                  professional.
                </p>
                <div class="flex text-yellow-400">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>

              <div class="bg-neutral-50 shadow-xl rounded-xl p-6 hover:transform hover:scale-105 transition-all">
                <div class="flex items-center space-x-4 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span class="text-xl font-bold text-white">S</span>
                  </div>
                  <div>
                    <h3 class="text-black font-semibold">Suresh Kumar</h3>
                    <p class="text-neutral-700 text-sm">Patient</p>
                  </div>
                </div>
                <p class="text-gray-700 mb-4">
                  The AI symptom checker helped me identify my condition
                  quickly. The telemedicine consultation was seamless and very
                  professional.
                </p>
                <div class="flex text-yellow-400">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community */}
      <Community id="community" />

      {/* Footer */}
      <footer id="footer" className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-neutral-800">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Bagiya</h3>
              <p className="text-neutral-400 mb-6 max-w-lg">
                Nurture your plants with ease! Bagiya helps gardening
                enthusiasts track growth, manage watering schedules, and monitor
                plant health - all in one place. Whether you're a home gardener or
                a nursery owner, grow smarter with Bagiya.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/anuragpardeshii"
                  className="text-neutral-400 hover:text-[#366827] transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="www.linkedin.com/in/pardeshianurag22"
                  className="text-neutral-400 hover:text-[#366827] transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.51 8.796v1.697a3.738 3.738 0 0 1 3.288-1.684c3.455 0 4.202 2.16 4.202 4.97V19.5h-3.2v-5.072c0-1.21-.244-2.766-2.128-2.766-1.827 0-2.139 1.317-2.139 2.676V19.5h-3.19V8.796h3.168ZM7.2 6.106a1.61 1.61 0 0 1-.988 1.483 1.595 1.595 0 0 1-1.743-.348A1.607 1.607 0 0 1 5.6 4.5a1.601 1.601 0 0 1 1.6 1.606Z"
                      clipRule="evenodd"
                    />
                    <path d="M7.2 8.809H4V19.5h3.2V8.809Z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/anuragpardeshii"
                  className="text-neutral-400 hover:text-[#366827] transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { name: "Home", id: "home" },
                  { name: "About", id: "about" },
                  { name: "Benefits", id: "benefits" },
                  { name: "Testimonials", id: "testimonials" },
                  { name: "Community", id: "community" },
                ].map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById(item.id)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#366827] md:p-0 md:dark:hover:text-[#366827] dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                    >
                      {item.name}{" "}
                      {/* Fixed: Use item.name instead of item.label */}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-neutral-400 overflow-hidden truncate sm:w-auto">
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="m3.5 5.5 7.893 6.036a1 1 0 0 0 1.214 0L20.5 5.5M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
                    />
                  </svg>
                  pardeshianurag22@gmail.com
                </li>
                <li className="flex items-center gap-2 text-neutral-400">
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18.427 14.768 17.2 13.542a1.733 1.733 0 0 0-2.45 0l-.613.613a1.732 1.732 0 0 1-2.45 0l-1.838-1.84a1.735 1.735 0 0 1 0-2.452l.612-.613a1.735 1.735 0 0 0 0-2.452L9.237 5.572a1.6 1.6 0 0 0-2.45 0c-3.223 3.2-1.702 6.896 1.519 10.117 3.22 3.221 6.914 4.745 10.12 1.535a1.601 1.601 0 0 0 0-2.456Z"
                    />
                  </svg>
                  +91-8435304050
                </li>
                <li className="flex items-center gap-2 text-neutral-400">
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    />
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.8 13.938h-.011a7 7 0 1 0-11.464.144h-.016l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659l.13-.155Z"
                    />
                  </svg>
                  Indore, Madhya Pradesh
                </li>
              </ul>
            </div>
          </div>
          <div className="py-6 flex flex-col md:flex-row text-center justify-between items-center">
            <p className="text-neutral-400 text-sm mb-4 md:mb-0 mx-auto">
              {" "}
              © 2024{" "}
              <span>
                <a href="https://www.linkedin.com/in/pardeshianurag22/">
                  Anurag Pardeshi
                </a>
              </span>
              . All rights reserved.{" "}
            </p>
            {/* <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-neutral-400 hover:text-purple-500 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-purple-500 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-purple-500 transition-colors"
              >
                Cookie Policy
              </a>
            </div> */}
          </div>
        </div>
      </footer>
    </>
  );
}
