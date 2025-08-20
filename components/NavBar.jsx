"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InfoMenu from "@/components/navbar-components/info-menu";
import Logo from "@/components/navbar-components/logo";
import UserMenu from "@/components/navbar-components/user-menu";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ThemeToggle from "./ThemeToggle";

// Navigation links for non-authenticated users
const publicNavigationLinks = [
  { href: "#", label: "Home", active: true },
  { href: "/GradeCalculator", label: "Grade Calculator", active: false },
];

export default function NavBarComponent() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Navigation links for authenticated users - moved inside component to access user state
  // Navigation links for authenticated users
  const authenticatedNavigationLinks = [
    { href: "#", label: "Home" },
    { href: "/LockInChat", label: "Study with AI" },
    { href: "/StudySession", label: "Study Timer" },
    { href: "/Tasks", label: "Tasks" },
    { href: `/DashBoard/${user?.id}`, label: "Dashboard" }, // Fixed: DashBoard with capital B
  ];
  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch(
        "https://capstone-2-backend-seven.vercel.app/api/progress/current-user",
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.user) {
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount only
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch(
        "https://capstone-2-backend-seven.vercel.app/api/signup/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Clear user state immediately
        setUser(null);

        // Redirect to home page
        router.push("/");

        // Force a page refresh to clear any cached state
        window.location.reload();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Don't render while checking authentication
  if (isLoading) {
    return (
      <header className="border-b px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <a href="#" className="text-primary hover:text-primary/90">
              Logo
            </a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
    );
  }

  if (user) {
    // Authenticated user - show the authenticated navbar
    return (
      <header className="border-b px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group size-8 md:hidden"
                  variant="ghost"
                  size="icon"
                >
                  <svg
                    className="pointer-events-none"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12L20 12"
                      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-36 p-1 md:hidden">
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                    {authenticatedNavigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <NavigationMenuLink href={link.href} className="py-1.5">
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
            {/* Logo */}
            <Logo />

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {authenticatedNavigationLinks.map((link, index) => (
                <NavigationMenu key={index}>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        href={link.href}
                        className="text-sm font-medium transition-colors hover:text-primary"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <InfoMenu />
            <UserMenu user={user} onLogout={handleLogout} />
            <ThemeToggle />
          </div>
        </div>
      </header>
    );
  }

  // Non-authenticated user - show the public navbar
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {publicNavigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink
                        href={link.href}
                        className="py-1.5"
                        active={link.active}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>

          {/* Logo */}
          <Logo />

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {publicNavigationLinks.map((link, index) => (
              <NavigationMenu key={index}>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href={link.href}
                      className={`text-sm font-medium transition-colors ${
                        link.active ? "text-primary" : "hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <InfoMenu />
          <ThemeToggle />
          <Button asChild>
            <a href="/LogIn">Sign In</a>
          </Button>
          <Button asChild>
            <a href="/SignUp">Sign Up</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
