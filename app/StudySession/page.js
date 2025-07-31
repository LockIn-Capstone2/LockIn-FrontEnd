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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import Link from "next/link";
function StudyTimer() {
  return (
    <>
      <div className="flex font-[poppins] bg-[#2D3142] text-[white] text-center rounded-xl h-8 items-center justify-center font-bold">
        Choose a Time
      </div>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="flex w-full max-w-sm bg-[#2D3142] border-none">
          <CardHeader>
            <CardTitle className="font-[poppins] text-[white] text-center">
              Study Timer
            </CardTitle>
            <CardDescription></CardDescription>
            <CardAction></CardAction>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className="flex-col gap-2"></CardFooter>
        </Card>
      </div>
    </>
  );
}

export default StudyTimer;
