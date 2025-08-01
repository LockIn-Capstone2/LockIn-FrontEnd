"use client";

import Image from "next/image";
import Link from "next/link";
import NavBarComponent from "@/components/NavBar";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { SplitText } from "gsap/SplitText";
// import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(SplitText);

export default function Home() {
  useGSAP(() => {
    const split = new SplitText("#split", { type: "chars" });
    const chars = split.chars;

    gsap.fromTo(
      chars,
      {
        x: -30,
        opacity: 0,
        rotate: -5,
      },
      {
        x: 0,
        opacity: 1,
        rotate: 0,
        ease: "power3.out",
        duration: 0.4,
        transformOrigin: "center center",
        delay: 0.1,
        stagger: {
          each: 0.05,
          from: "start",
        },
      }
    );
  }, []);

  return (
    <section id="hero" className="px-4 md-px-6">
      <NavBarComponent />
      <div className="min-h-screen bg-[url('/Shapes.png')] bg-cover bg-center bg-no-repeat">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid min-h-[65vh] grid-cols-1 items-center md:grid-cols-2">
            <div className="bg-[url('/hero.png')] bg-no-repeat relative z-10 row-span-1 row-start-1 -my-10 aspect-[1/1.3] overflow-hidden md:col-span-1 md:col-start-2 md:mt-0"></div>

            <div className="col-start-1 md:row-start-1">
              <h1 className="mb-2 md:mb-8 text-[clamp(3rem,20vmin,4rem)] font-bold leading-tight ">
                <span id="split" className="block uppercase font-[poppins]">
                  Welcome to Lock In!, All Inclusive
                </span>
                <span id="split" className="block  uppercase font-[poppins]">
                  Student App.
                </span>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

{
  /* Your page content goes here */
}
{
  /* <div className="p-8 text-white">
  <h1 className="text-4xl font-bold">
  Welcome to LockIn!, all Inclusive Student App.
  </h1>
  <p className="mt-4">
  A Platform that helps students around the world stay on track with
  there classes and grades, to maintain a high GPA.
  </p>
  </div> */
}
