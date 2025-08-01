"use client";

import Image from "next/image";
import Link from "next/link";
import NavBarComponent from "@/components/NavBar";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { SplitText } from "gsap/SplitText";
// import { TextPlugin } from "gsap/TextPlugin";
import { VelocityScroll } from "@/components/ui/scrollbasedvelocity";
import Team2 from "@/components/mvpblocks/team-2";

gsap.registerPlugin(SplitText);

export default function Home() {
  useGSAP(() => {
    const title1 = new SplitText("#split-title-1", { type: "chars" });
    const title2 = new SplitText("#split-title-2", { type: "chars" });
    const title3 = new SplitText("#split-title-3", { type: "chars" });
    const title4 = new SplitText("#split-title-4", { type: "chars" });
    const description = new SplitText("#split-description", {
      type: "chars",
      charsClass: "split-char",
    });

    gsap.fromTo(
      title1.chars,
      { y: 40, opacity: 0, rotateX: -90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        ease: "back.out(1.7)",
        duration: 0.6,
        stagger: { each: 0.04, from: "start" },
      }
    );

    gsap.fromTo(
      title2.chars,
      { x: -20, opacity: 0, rotateY: 90 },
      {
        x: 0,
        opacity: 1,
        rotateY: 0,
        ease: "power3.out",
        duration: 0.5,
        delay: 0.3,
        stagger: { each: 0.05, from: "start" },
      }
    );

    gsap.fromTo(
      title3.chars,
      { x: 20, opacity: 0, rotateY: -90 },
      {
        x: 0,
        opacity: 1,
        rotateY: 0,
        ease: "power3.out",
        duration: 0.5,
        delay: 0.6,
        stagger: { each: 0.05, from: "start" },
      }
    );

    gsap.fromTo(
      title4.chars,
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        duration: 0.6,
        delay: 0.9,
        stagger: { each: 0.04, from: "start" },
      }
    );

    gsap.fromTo(
      description.chars,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        ease: "power2.out",
        duration: 0.6,
        delay: 1.2,
        stagger: { each: 0.02 },
      }
    );
  }, []);

  return (
    <section id="hero" className="px-4 md-px-6">
      <NavBarComponent />
      <div className="min-h-screen bg-[url('/Shapes.png')] bg-cover bg-center bg-no-repeat">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="grid min-h-[65vh] grid-cols-1 gap-8 items-center md:grid-cols-2">
            {/* Right-side image (on desktop) */}
            <div className="order-1 md:order-2 aspect-[1/1.3] bg-[url('/hero.png')] bg-no-repeat bg-contain bg-center relative z-10 w-full h-full" />

            {/* Left-side text (on desktop) */}
            <div className="order-2 md:order-1">
              <h1 className="mb-4 md:mb-8 text-[clamp(2rem,8vw,4rem)] font-bold leading-tight">
                <span
                  id="split-title-1"
                  className="block uppercase font-[poppins]"
                >
                  Welcome to
                </span>
                <span
                  id="split-title-2"
                  className="block uppercase font-[poppins]"
                >
                  Lock In!
                </span>
                <span
                  id="split-title-3"
                  className="block uppercase font-[poppins]"
                >
                  all Inclusive
                </span>
                <span
                  id="split-title-4"
                  className="block uppercase font-[poppins]"
                >
                  Student App.
                </span>
              </h1>

              <span
                id="split-description"
                className="block uppercase font-[poppins] text-sm md:text-xl font-bold tracking-wide"
              >
                A Platform that helps students around the world on track with
                their classes and grades, to maintain a high GPA
              </span>
            </div>
          </div>
          <VelocityScroll
            text="Stay Focused · Stay Ahead · Unlock Your Potential · Track. Learn. Excel. · Your Academic Journey Starts Here · Lock In Now!"
            default_velocity={4}
            className="split-char text-4xl font-bold uppercase"
          />
          <Team2 />
        </div>
      </div>
    </section>
  );
}
