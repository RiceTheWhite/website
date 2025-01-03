"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const size = 20;
  const damping = 0.75;
  const [direction, setDirection] = useState(0)

  const requestRef = useRef (0);
  const previousVelocity = useRef({ x:0, y:0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      setSmoothPosition(
        function(prev) {
          const velocity = {
            x: (previousVelocity.current.x + (position.x - prev.x) * 0.1) * damping,
            y: (previousVelocity.current.y + (position.y - prev.y) * 0.1) * damping,
          }

          setDirection(Math.atan2(velocity.y, velocity.x)/ Math.PI*180)
          console.log(direction)

          previousVelocity.current = velocity
          return {
            x: prev.x + velocity.x, // 0.1 is the easing factor
            y: prev.y + velocity.y,
          }
        }
      );
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [position, direction]);

  return (
    <div
      className={`fixed bg-primary pointer-events-none rounded-full cursor-none z-[100000] mix-blend-exclusion`}
      style={{
        left: smoothPosition.x - size / 2,
        top: smoothPosition.y - size / 2,
        height: size,
        width: size,
        transform: `
        rotate(${direction}deg)
        scaleX(${1 + (Math.sqrt(Math.pow(previousVelocity.current.x, 2) + Math.pow(previousVelocity.current.y, 2)))/16})
        scaleY(${Math.pow(1/(1+(Math.sqrt(Math.pow(previousVelocity.current.x, 2) + Math.pow(previousVelocity.current.y, 2)))), 1/6)})
        `,
      }}
    ></div>
  );
}
