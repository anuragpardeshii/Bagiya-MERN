import { useState } from "react";
import CountUp from "react-countup";
import CustomScrollTrigger from "./CustomScroll";
// import { Leaf } from "lucide-react";

function Community() {
  const [counterState, setCounterState] = useState(false);

  return (
    <CustomScrollTrigger
      onEnter={() => setCounterState(true)}
      onExit={() => setCounterState(false)}
    >
      <section id="community" className="relative">
        {/* Hero section with background image */}
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center text-center">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center brightness-75"
            style={{ backgroundImage: `url("/planting_bg.jpg")`, filter: "blur(2px)" }}
          ></div>

          {/* Overlay content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-white px-6 py-12 sm:py-16 lg:py-20 w-full max-w-6xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Our Community
            </h1>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold max-w-3xl leading-snug">
              Stay focused and plant real trees around the World.
            </h2>

            <div className="my-8 flex items-center justify-center space-x-2 bg-black/35 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-bold">
              {/* <Leaf className="h-6 w-6 text-green-400" /> */}
              <span>+</span>
              <span className="mx-1">
                {counterState ? <CountUp start={0} end={1240} duration={2.75} /> : "1240"} 🌱
              </span>
              <span>planted</span>
            </div>

            {/* Team Bagiya section */}
            <div className="w-full px-4 sm:px-6 lg:px-8 mt-8">
              <div className="border border-gray-300 bg-transparent shadow-xl rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center text-center md:text-left">
                <img className="w-32 sm:w-40 md:w-48 mx-auto md:mx-0 mb-4 md:mb-0 md:mr-6" src="/logo.png" alt="Team Bagiya Logo" />
                <div className="max-w-2xl">
                  <p className="text-sm sm:text-base md:text-lg text-white">
                    Team Bagiya is a passionate community dedicated to making the world a greener
                    place. By combining personal productivity with environmental action, Team Bagiya
                    plants real trees through the efforts of its users. Every coin earned through
                    focused tasks contributes to a tree planted in the real world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CustomScrollTrigger>
  );
}

export default Community;