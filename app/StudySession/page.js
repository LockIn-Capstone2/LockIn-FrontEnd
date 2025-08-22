"use client";
import "./style.module.css";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import React from "react";
import { Alert } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext"; // 🔥 ADD THIS IMPORT

function StudyTimer() {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  //isActive lets us know if the timer is running
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeDuration, setTimeDuration] = useState(0);

  // 🔥 FIXED: Use AuthContext instead of local auth state
  const { user, loading: authLoading } = useAuth();
  const timerRef = useRef(null);

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

    const hour = (parseInt(hours) || 0) * 3600;
    const minute = (parseInt(minutes) || 0) * 60;
    const second = parseInt(seconds) || 0;

    const totalDuration = hour + minute + second;

    setTimeLeft(totalDuration);
    setTimeDuration(totalDuration);
  };

  const formatTime = (totalDuration) => {
    const HH = Math.floor(totalDuration / 3600);
    const MM = Math.floor((totalDuration % 3600) / 60);
    const SS = totalDuration % 60;
    return `${String(HH).padStart(2, "0")}:${String(MM).padStart(
      2,
      "0"
    )}:${String(SS).padStart(2, "0")}`;
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

  const formatTimeForDatabase = (totalDuration) => {
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const seconds = totalDuration % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const sendTimeData = async (totalDuration) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const duration = formatTimeForDatabase(totalDuration);
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const response = await axios.post(
        `${API_BASE}/data`,
        {
          duration: duration,
          // No need to send userId - it comes from the JWT token
        },
        {
          withCredentials: true, // This sends the JWT cookie
        }
      );
      console.log("Timer data sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending timer data:", error);
    }
  };

  const handleHoursChange = (event) => {
    const newValue = event.target.value;
    setHours(newValue);
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

  useEffect(() => {
    if (!timeLeft && isActive) {
      sendTimeData(timeDuration);
    }
  }, [timeLeft, isActive]);

  // 🔥 FIXED: Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="flex w-full max-w-sm bg-[#2D3142] border-none h-100">
          <CardHeader>
            <CardTitle className="font-[poppins] text-[white] text-center">
              Study Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="font-[poppins] text-[white] mb-4">
              Checking authentication...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔥 FIXED: Show authentication message only when auth is done and no user
  if (!authLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="flex w-full max-w-sm bg-[#2D3142] border-none h-100">
          <CardHeader>
            <CardTitle className="font-[poppins] text-[white] text-center">
              Study Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-[poppins] text-[white] mb-4">
              Please log in to use the study timer.
            </p>
            <Button
              onClick={() => (window.location.href = "/LogIn")}
              className="bg-[#0D1321] text-[white] hover:bg-green-500 transition-colors duration-300"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {user && (
              <p className="font-[poppins] text-[white] text-center text-sm">
                Welcome, {user.username}!
              </p>
            )}
          </CardHeader>
          <CardContent className=" flex w-40 h-40 rounded-full aspect-square items-center justify-center ring-4 mx-auto ring-[#EEC0C8] ">
            <div className="items-center justify-center font-[poppins] text-[white]">
              {formatTime(timeLeft)}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <button
              onClick={handleStart}
              disabled={isActive}
              type="submit"
              className="rounded-lg bg-[#0D1321] text-[white] top-[5] right-[50] font-bold font-[poppins] text-center relative w-[70px] hover:bg-green-500 transition-colors duration-300"
            >
              START
            </button>
            <button
              onClick={handlePause}
              type="submit"
              className="rounded-lg bg-[#0D1321] text-[white] bottom-[27] left-[50] font-bold font-[poppins] text-center relative w-[70px] hover:bg-red-500 transition-colors duration-300"
            >
              STOP
            </button>

            <div className="flex wrap space-x-5">
              <Input
                type="number"
                placeholder="HH"
                className={"w-12 text-center"}
                onChange={handleHoursChange}
                value={hours}
              ></Input>
              <span className="font-[poppins] text-[white] items-center">
                :
              </span>
              <Input
                type="number"
                placeholder="MM"
                className={"w-12 text-center"}
                onChange={handleMinutesChange}
                value={minutes}
              ></Input>
              <span className="text-[white]">:</span>
              <Input
                type="number"
                placeholder="SS"
                className={"w-11 text-center"}
                onChange={handleSecondsChange}
                value={seconds}
              ></Input>
              <div>
                {!isActive && !timeLeft ? (
                  <Button
                    onClick={handleSubmit}
                    className={
                      "hover:bg-[white]/200 transition-colors duration-300 hover:text-[black]/200"
                    }
                  >
                    Submit
                  </Button>
                ) : (
                  <> </>
                )}
              </div>
              {!timeLeft && isActive ? (
                <Alert severity="success">Session completed</Alert>
              ) : (
                <></>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default StudyTimer;
