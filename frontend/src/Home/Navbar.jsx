import { useState, useEffect } from "react";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        if (window.scrollY > 50) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(true);
      }

      // Detect active section based on scroll position
      const sections = document.querySelectorAll("section[id]");
      let currentSection = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 80; // Offset for navbar height
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentSection = section.getAttribute("id");
        }
      });

      setActiveSection(currentSection);
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 70, // Adjust for navbar height
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={`fixed shadow-4xl top-0 z-50 left-0 w-full bg-[#E5E4E2] dark:bg-white shadow-md transition-transform duration-300 ${
        isVisible ? "md:translate-y-0" : "md:-translate-y-full"
      }`}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-[#366827]">
            BAGIYA
          </span>
        </a>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <a
          href="/dashboard"
            type="button"
            className="text-white bg-[#366827] hover:bg-[#366827] focus:ring-4 focus:outline-none focus:ring-[#366827] font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-[#366827] dark:hover:bg-[#366827] dark:focus:ring-[#366827]"
          >
            Get started
          </a>
        </div>
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-white md:dark:bg-white dark:border-gray-700">
            {[
              { name: "Home", id: "home" },
              { name: "About", id: "about" },
              { name: "Benefits", id: "benefits" },
              { name: "Testimonials", id: "testimonials" },
              { name: "Community", id: "community" },
            ].map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => handleSmoothScroll(e, link.id)}
                  className={`block py-2 px-3 md:p-0 rounded-sm transition-colors duration-200 ${
                    activeSection === link.id
                      ? "text-[#366827] dark:text-[#366827]"
                      : "text-gray-900 hover:text-[#366827] dark:text-black dark:hover:text-[#366827]"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
