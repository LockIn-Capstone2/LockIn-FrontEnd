"use client";

import {
  BoltIcon,
  BookOpenIcon,
  Layers2Icon,
  LogOutIcon,
  PinIcon,
  UserPenIcon,
  BarChart3Icon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function UserMenu({ user, onLogout }) {
  const router = useRouter();

  // Handle logout using the function passed from parent
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Generate avatar fallback from username
  const getAvatarFallback = (username) => {
    if (!username) return "U";
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src="./avatar.jpg" alt="Profile image" />
            <AvatarFallback>{getAvatarFallback(user?.username)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {user?.username || "User"}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {user?.email || "user@example.com"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push(`/DashBoard/${user?.id}`)}
          >
            <BarChart3Icon
              size={16}
              className="opacity-60"
              aria-hidden="true"
            />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/Tasks")}>
            <Layers2Icon size={16} className="opacity-60" aria-hidden="true" />
            <span>Tasks</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/StudySession")}>
            <BookOpenIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Study Timer</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/LockInChat")}>
            <BoltIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Study with AI</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
