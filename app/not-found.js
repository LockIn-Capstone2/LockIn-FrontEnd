"use client";

import React, { useEffect } from "react";
import { Rubik_Glitch_Pop } from "next/font/google";
import { gsap } from "gsap";
import "./globals.css";
import Link from "next/link";

const rubikGlitch = Rubik_Glitch_Pop({
  subsets: ["latin"],
  weight: "400",
});

const NotFound = () => {
  useEffect(() => {
    gsap.fromTo(
      ".error-title",
      { opacity: 0, y: -100, scale: 0.5, rotate: -15 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)",
      }
    );

    gsap.fromTo(
      ".error-subtitle",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.8,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(".error-subtitle", {
            opacity: 0.3,
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            repeatDelay: 0.1,
          });
        },
      }
    );

    gsap.to(".error-title", {
      keyframes: [
        { x: -2, duration: 0.02 },
        { x: 2, duration: 0.02 },
        { x: -1, duration: 0.02 },
        { x: 1, duration: 0.02 },
        { x: 0, duration: 0.02 },
      ],
      repeat: -1,
      repeatDelay: 3,
      delay: 1.5,
    });

    gsap.to(".error-title", {
      y: "+=40",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".error-subtitle", {
      x: "+=5",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <main
      suppressHydrationWarning
      className="relative h-screen flex flex-col items-center justify-center bg-black"
    >
      <h1
        className={`${rubikGlitch.className} text-9xl error-title text-white`}
      >
        404
      </h1>
      <span
        className={`${rubikGlitch.className} text-xl mt-4 error-subtitle text-white`}
      >
        Are you lost?
      </span>
      <Link
        href="/"
        suppressHydrationWarning
        className={`${rubikGlitch.className} text-xl mt-4 error-subtitle text-gray-400`}
      >
        Back Home
      </Link>
    </main>
  );
};

export default NotFound;
