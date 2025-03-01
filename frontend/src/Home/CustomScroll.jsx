import React, { useEffect, useRef } from 'react';

const CustomScrollTrigger = ({
  children,
  onEnter,
  onExit,
  threshold = 0.1
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onEnter();
          } else if (onExit) {
            onExit();
          }
        });
      },
      {
        threshold,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onEnter, onExit, threshold]);

  return <div ref={ref}>{children}</div>;
};

export default CustomScrollTrigger;
