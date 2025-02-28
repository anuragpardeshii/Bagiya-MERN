import { useState } from "react";
import "./Community.css";
import CountUp from "react-countup";
import ScrollTrigger from "react-scroll-trigger";

function Community() {
  const [counterState, setCounterState] = useState(false);
  return (
    <>
      <ScrollTrigger
        onEnter={() => setCounterState(true)}
        onExit={() => setCounterState(false)}
      >
        <div className="row  mt-4" style={{ backgroundColor: "white" }}>
          <h1
            className="mb-4 text-4xl text-center py-8 font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-black"
          >
            Our Community
          </h1>
          <div className=" absolute bg-image">
            <img
              className="p-4"
              style={{ width: "100%" }}
              src="/planting_bg.jpg"
              alt=""
            />
          </div>
          <div className="relative text-white top-50 max-w-7xl mx-auto flex items-center flex-col justify-center">
            <h2 style={{ fontWeight: "700", fontSize: "3rem" }}>
              Stay focused and plant real trees around the World.
            </h2>
            <h1>
              <h4 style={{ fontWeight: "700", fontSize: "2.5rem" }}>
                +
                {counterState && (
                  <CountUp start={0} end={1240} duration={2.75} />
                )}{" "}
                Trees Planted{" "}
              </h4>
            </h1>
            <p style={{ fontWeight: "700", fontSize: "1.5rem" }}>
              by Team Bagiya
            </p>
            <div className="max-w-6xl items-center mx-auto row flex justify-content-center align-items-center">
              <img
                className=" me-4"
                src="/logo.png"
                alt="logo"
                style={{ width: "12rem" }}
              />
              <p className="" style={{ textAlign: "justify" }}>
                Team Bagiya is a passionate community dedicated to making the
                world a greener place. By combining personal productivity with
                environmental action, Team Bagiya plants real trees through the
                efforts of its users. Every coin earned through focused tasks
                contributes to a tree planted in the real world. Together, we’re
                creating a positive environmental impact while staying committed
                to our personal growth. Join Team Bagiya today and be part of a
                movement that turns focus into forests.
              </p>
            </div>
          </div>
        </div>
      </ScrollTrigger>
    </>
  );
}

export default Community;
