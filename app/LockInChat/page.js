import React from "react";
import AnimatedAIChat from "@/components/AiComponent/animated-ai-chat";
// import ThemeToggle from "@/components/ThemeToggle";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

const AiInput = () => {
  return (
    <div>
      <div className="flex justify-end items-center ">
        <ThemeToggleButton
          variant="gif"
          url="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3anlqbjBxMTI2MmpnbTRhemY4bnpnNXJzbHZsdW94M3NoaWhia3h6aSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/2zdm9fxPtdYhoBdkip/giphy.gif"
        />
      </div>
      <AnimatedAIChat />
    </div>
  );
};

export default AiInput;
