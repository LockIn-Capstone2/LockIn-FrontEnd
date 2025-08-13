"use client";

import React, { useEffect } from "react";
import { Rubik_Glitch_Pop } from "next/font/google";
import { gsap } from "gsap";
import "./globals.css";
import Link from "next/link";
import FuzzyText from "@/components/ui/FuzzyText";

const rubikGlitch = Rubik_Glitch_Pop({
  subsets: ["latin"],
  weight: "400",
});

const NotFound = () => {
  useEffect(() => {
    gsap.fromTo(
      ".error-subtitle",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 1.2,
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

    gsap.to(".error-subtitle", {
      x: "+=5",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  const hoverIntensity = 0.5;
  const enableHover = 0.5;

  return (
    <main
      suppressHydrationWarning
      className="relative h-screen flex flex-col items-center justify-center bg-black"
    >
      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={hoverIntensity}
        enableHover={enableHover}
        className="error-title-main"
      >
        404
      </FuzzyText>
      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={hoverIntensity}
        enableHover={enableHover}
        className="error-title-secondary"
      >
        Are you lost?
      </FuzzyText>
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
