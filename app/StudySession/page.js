"use client"; //used for client side interactivity
import "./style.module.css";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import React from "react";

function StudyTimer() {
  const handleClick = () => {
    console.log("clicked");
  };

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  //isActive lets us know if the timer is running
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const handleHoursChange = (event) => {
    const newValue = event.target.value;
    setHours(newValue);
  };

  const handleMinutesChange = (event) => {
    const newValue = event.target.value;
    setMinutes(newValue);
  };

  const handleSecondsChange = (event) => {
    const newValue = event.target.value;
    setSeconds(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    //this might be messy code
    const totalSecondsofHours = hours * 3600;
    const totalSecondsofMinutes = minutes * 60;
    const totalSeconds = seconds;

    const totalDurationInSeconds =
      totalSeconds + totalSecondsofHours + totalSecondsofMinutes;
  };

  const handleStart = () => {
    if (timeLeft > 0) {
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isActive) {
      setIsPaused(true);
      setIsActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isPaused]);

  return (
    <>
      <div className="flex font-[poppins] bg-[#2D3142] text-[white] text-center rounded-xl h-8 items-center justify-center font-bold">
        Choose a Time
      </div>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="flex w-full max-w-sm bg-[#2D3142] border-none h-100">
          <CardHeader>
            <CardTitle className="font-[poppins] text-[white] text-center">
              Study Timer
            </CardTitle>
            <CardDescription></CardDescription>
            <CardAction></CardAction>
          </CardHeader>
          <CardContent className=" flex w-40 h-40 rounded-full aspect-square items-center justify-center ring-4 mx-auto ring-[#EEC0C8]"></CardContent>
          <CardFooter className="flex-col gap-2">
            <button
              onClick={handleStart}
              type="submit"
              className="rounded-lg bg-[#0D1321] text-[white] top-[5] right-[50] font-bold font-[poppins] text-center relative w-[65] hover:bg-green-500 transition-colors duration-300"
            >
              START
            </button>
            <button
              onClick={handlePause}
              type="submit"
              className="rounded-lg bg-[#0D1321] text-[white] bottom-[27] left-[50] font-bold font-[poppins] text-center relative w-[65] hover:bg-red-500 transition-colors duration-300"
            >
              STOP
            </button>
            <div className="flex wrap space-x-5">
              <Input
                type="number"
                placeholder="HH"
                className={"w-13 text-center"}
                onChange={handleHoursChange}
                value={hours}
              ></Input>
              <span className="font-[poppins] text-[white] items-center">
                :
              </span>
              <Input
                type="number"
                placeholder="MM"
                className={"w-14 text-center"}
                onChange={handleMinutesChange}
                value={minutes}
              ></Input>
              <span className="text-[white]">:</span>
              <Input
                type="number"
                placeholder="SS"
                className={"w-13 text-center"}
                onChange={handleSecondsChange}
                value={seconds}
              ></Input>
              <Button
                onClick={handleSubmit}
                className={
                  "hover:bg-[white]/200 transition-colors duration-300 hover:text-[black]/200"
                }
              >
                Submit
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default StudyTimer;
