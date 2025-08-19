"use client";

import { Facebook, Link, Linkedin, Twitter } from "lucide-react";
import ShareButton from "@/components/ui/share-button";

// Example usage
export function ShareButtonDemo() {
  const shareLinks = [
    {
      icon: Twitter,
      onClick: () => window.open("https://twitter.com/share"),
      label: "Share on Twitter",
    },
    {
      icon: Facebook,
      onClick: () => window.open("https://facebook.com/share"),
      label: "Share on Facebook",
    },
    {
      icon: Linkedin,
      onClick: () => window.open("https://linkedin.com/share"),
      label: "Share on LinkedIn",
    },
    {
      icon: Link,
      onClick: () => navigator.clipboard.writeText(window.location.href),
      label: "Copy link",
    },
  ];

  return (
    <div>
      <ShareButton links={shareLinks} className=" text-lg font-medium  ">
        <Link size={15} />
        Share
      </ShareButton>
    </div>
  );
}
