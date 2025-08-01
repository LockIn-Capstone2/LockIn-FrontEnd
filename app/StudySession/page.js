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
import React from "react";
import Link from "next/link";

function StudyTimer() {
  const handleClick = () => {
    console.log("clicked");
  };

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
              onClick={handleClick}
              type="submit"
              className="rounded-lg bg-[#0D1321] text-[white] top-[5] right-[50] font-bold font-[poppins] text-center relative w-[65]"
            >
              START
            </button>
            <button
              onClick={handleClick}
              type="submit"
              className="rounded-lg bg-[#0D1321] text-[white] bottom-[27] left-[50] font-bold font-[poppins] text-center relative w-[65]"
            >
              STOP
            </button>
            <div className="flex wrap space-x-5">
              <Input
                type="number"
                placeholder="Hours"
                className={"w-25 "}
              ></Input>
              <span className="text-white font-[poppins]">:</span>
              <Input
                type="number"
                placeholder="Minutes"
                className={"w-28"}
              ></Input>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default StudyTimer;
