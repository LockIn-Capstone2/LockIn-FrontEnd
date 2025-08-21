"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useParams } from "next/navigation";
import {
  IconClock,
  IconUser,
  IconEdit,
  IconTrophy,
  IconTarget,
  IconTrendingUp,
  IconBrain,
  IconStar,
  IconFlame,
  IconCheck,
  IconX,
  IconMenu,
  IconSearch,
  IconSettings,
  IconHome,
  IconBook,
  IconChartPie,
  IconUsers,
  IconLogout,
  IconAward,
} from "@tabler/icons-react";

import { ProgressAreaChart } from "@/components/UserAreaChart/AreaChart";
import { WeeklyActivityBarChart } from "@/components/UserBarChart/BarChart";
import { StreakProgressRadialChart } from "@/components/UserRadialChart/RadialChart";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// ---------- Utilities ----------
const isNonEmptyArray = (arr) => Array.isArray(arr) && arr.length > 0;

// Format date strings to short labels like "Aug 12"
const fmtLabel = (d) => {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return String(d);
  }
};

/**
 * Normalize various possible backend shapes into a flat array for the Area/Bar charts.
 * Expected shape for charts here: [{ label: string, accuracy: number, minutes: number }]
 */
const normalizeChartData = (raw) => {
  if (!raw) return [];

  // { chartData: [...] } ← backend shape
  if (isNonEmptyArray(raw.chartData)) {
    return raw.chartData.map((d) => ({
      label: fmtLabel(d.date ?? d.day ?? d.name),
      accuracy: Number(d.flashcardAccuracy ?? d.accuracy ?? d.rate ?? 0),
      minutes: Math.round(
        Number(d.duration_ms ?? d.minutes ?? d.study_minutes ?? 0) / 60000
      ),
    }));
  }

  // { daily: [...] }
  if (isNonEmptyArray(raw.daily)) {
    return raw.daily.map((d) => ({
      label: fmtLabel(d.date ?? d.day ?? d.name),
      accuracy: Number(d.flash_accuracy ?? d.accuracy ?? d.rate ?? 0),
      minutes: Number(d.minutes ?? d.study_minutes ?? d.value ?? 0),
    }));
  }

  // flat array
  if (isNonEmptyArray(raw) && typeof raw[0] === "object") {
    return raw.map((d) => ({
      label: fmtLabel(d.date ?? d.day ?? d.name),
      accuracy: Number(
        d.flashcardAccuracy ?? d.flash_accuracy ?? d.accuracy ?? d.rate ?? 0
      ),
      minutes: Math.round(
        Number(d.duration_ms ?? d.minutes ?? d.study_minutes ?? d.value ?? 0) /
          60000
      ),
    }));
  }

  // { data: [...] }
  if (isNonEmptyArray(raw.data)) {
    return raw.data.map((d) => ({
      label: fmtLabel(d.date ?? d.day ?? d.name),
      accuracy: Number(
        d.flashcardAccuracy ?? d.flash_accuracy ?? d.accuracy ?? d.rate ?? 0
      ),
      minutes: Math.round(
        Number(d.duration_ms ?? d.minutes ?? d.study_minutes ?? d.value ?? 0) /
          60000
      ),
    }));
  }

  return [];
};

/**
 * Normalize streak payload for the radial chart.
 * Expected minimal shape: { current: number, goal: number }
 *
 * If your StreakProgressRadialChart expects a percentage, compute it here.
 */
const normalizeStreak = (raw) => {
  if (!raw) return { current: 0, goal: 1, percent: 0 };

  const current = Number(raw.currentStreak ?? raw.current ?? 0);
  const goal = Math.max(
    1,
    Number(raw.nextMilestone ?? raw.goal ?? raw.target ?? 30)
  );
  const percent = Math.max(
    0,
    Math.min(100, Math.round((current / goal) * 100))
  );
  return { current, goal, percent };
};

// Friendly placeholder when a chart has no data
const EmptyChart = ({
  title = "No data yet",
  hint = "Come back after a study session.",
}) => (
  <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
    <div className="text-center">
      <p className="text-sm font-medium text-foreground/80">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, loading: authLoading, logout, updateUser } = useAuth(); // Add updateUser back
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // raw payloads
  const [dashboardData, setDashboardData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [badgeData, setBadgeData] = useState(null);

  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    studyGoal: 30,
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const { userId } = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // Debug logging - after userId is defined
  console.log(
    "Dashboard render - user:",
    user,
    "authLoading:",
    authLoading,
    "userId:",
    userId
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/LogIn");
    }
  }, [user, authLoading, router]);

  // Check if URL userId matches authenticated user
  useEffect(() => {
    console.log("User ID check - user:", user, "userId:", userId);
    if (user && userId && user.id.toString() !== userId) {
      console.log("User ID mismatch, redirecting to correct dashboard");
      // URL userId doesn't match authenticated user, redirect to their dashboard
      router.push(`/DashBoard/${user.id}`);
    }
  }, [user, userId, router]);

  // Redirect to login if no user after auth loading is complete
  useEffect(() => {
    console.log(
      "Redirect useEffect - authLoading:",
      authLoading,
      "user:",
      user
    );
    if (!authLoading && !user) {
      console.log("Redirecting to login - no user found");
      router.push("/LogIn");
    }
  }, [authLoading, user, router]);

  // Initialize profile form when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        email: user.email || "",
        studyGoal: user.studyGoal || 30,
      });
    }
  }, [user]);

  // Derived values with safe access
  const currentStats = dashboardData || {};
  const badgeProgress = badgeData?.badgeProgress || [];
  const totalEarned = Number(badgeData?.totalEarned || 0);
  const totalBadges = Number(badgeData?.totalBadges || 0);

  const earnedBadges = badgeProgress.filter((b) => b.earned);
  const unearnedBadges = badgeProgress.filter((b) => !b.earned);

  const currentStreak = Number(streakData?.current ?? 0);
  const totalSessions = Number(currentStats.all_time?.totalSessions || 0);
  const totalPoints = Number(currentStats.all_time?.totalPoints || 0);
  const totalStudyTime = currentStats.all_time?.totalStudyTime || "0m";
  const accuracyRate = Number(currentStats.all_time?.flashAccuracy || 0);

  // nav items
  const navigationItems = [
    {
      icon: IconHome,
      label: "Dashboard",
      href: `/DashBoard/${user?.id}`,
      active: pathname === `/DashBoard/${user?.id}`,
    },
    {
      icon: IconBook,
      label: "Study Timer",
      href: "/StudySession",
      active: pathname === "/StudySession",
    },
    {
      icon: IconChartPie,
      label: "Grade Calculator",
      href: "/GradeCalculator",
      active: pathname === "/GradeCalculator",
    },
    {
      icon: IconUsers,
      label: "Tasks",
      href: "/Tasks",
      active: pathname === "/Tasks",
    },
    {
      icon: IconSettings,
      label: "Study with AI",
      href: "/LockInChat",
      active: pathname === "/LockInChat",
    },
  ];

  // -------------- Fetch --------------
  // In your useEffect for fetching data, add better error handling:
  // In your useEffect for fetching data, add better error handling:
  useEffect(() => {
    if (!user || !user.id) return; // Don't fetch data until user is loaded and has an ID

    let alive = true;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching dashboard data for user:", user.id);
        console.log("API Base:", API_BASE);

        // First, verify authentication is still valid
        const authCheck = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });

        if (!authCheck.ok) {
          console.error("Authentication check failed:", authCheck.status);
          router.push("/LogIn");
          return;
        }

        const [dashRes, streakRes, chartRes, badgeRes] = await Promise.all([
          fetch(`${API_BASE}/progress/summary`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`${API_BASE}/sessions/streak`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`${API_BASE}/progress/daily-chart`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`${API_BASE}/badges/progress`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        // Check each response
        if (!dashRes.ok) {
          throw new Error(`Dashboard data failed: ${dashRes.status}`);
        }
        if (!streakRes.ok) {
          throw new Error(`Streak data failed: ${streakRes.status}`);
        }
        if (!chartRes.ok) {
          throw new Error(`Chart data failed: ${chartRes.status}`);
        }
        if (!badgeRes.ok) {
          throw new Error(`Badge data failed: ${badgeRes.status}`);
        }

        const [dashJson, streakJson, chartJson, badgeJson] = await Promise.all([
          dashRes.json(),
          streakRes.json(),
          chartRes.json(),
          badgeRes.json(),
        ]);

        if (!alive) return;

        setDashboardData(dashJson);
        setBadgeData(badgeJson);
        setStreakData(normalizeStreak(streakJson));
        setChartData(normalizeChartData(chartJson));
      } catch (e) {
        console.error("Dashboard fetch error:", e);
        setError(e.message || "Failed to load dashboard data.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      alive = false;
    };
  }, [user, router]);

  const markBadgeAsViewed = async (badgeId) => {
    try {
      const res = await fetch(`${API_BASE}/badges/view/${badgeId}`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        const br = await fetch(`${API_BASE}/badges/progress`, {
          credentials: "include",
        });
        if (br.ok) {
          const contentType = br.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            setBadgeData(await br.json());
          }
        }
      }
    } catch (e) {
      console.error("markBadgeAsViewed error", e);
    }
  };

  // Handle profile form submission using auth context
  // Replace your handleProfileSubmit function with this:
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      // Use the auth context's updateUser function
      const result = await updateUser(profileForm);

      if (result.success) {
        setProfileSuccess("Profile updated successfully!");
        // Clear success message after 3 seconds
        setTimeout(() => setProfileSuccess(""), 3000);
      } else {
        setProfileError(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setProfileError(error.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle profile form input changes
  const handleProfileInputChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogout = async () => {
    try {
      await logout(); // Use the logout function from auth context

      // Redirect to login page
      router.push("/LogIn");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still redirect even if logout fails
      router.push("/LogIn");
    }
  };

  // Don't render anything while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <IconX className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>

          {/* Debug information */}
          <div className="bg-muted/50 p-4 rounded-lg mb-4 text-left">
            <h3 className="text-sm font-medium mb-2">Debug Information:</h3>
            <p className="text-xs text-muted-foreground mb-1">
              API Base URL: {API_BASE}
            </p>
            <p className="text-xs text-muted-foreground mb-1">
              Current User ID: {userId}
            </p>
            <p className="text-xs text-muted-foreground">
              Make sure your backend server is running at{" "}
              {API_BASE.replace("/api", "")}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/LogIn")}
              className="w-full px-4 py-2 border border-border text-foreground rounded-lg"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out flex-shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-gray-800 dark:to-black rounded-lg flex items-center justify-center">
                <IconBrain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-400 dark:to-white bg-clip-text text-transparent">
                LockIn
              </span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`${
                  item.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                } flex items-center space-x-3 px-3 py-2 rounded-lg transition-all`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-gray-800 dark:to-black rounded-full flex items-center justify-center">
                <IconUser className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  ID: {user.id}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
            >
              <IconLogout className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border w-full">
          <div className="flex items-center justify-between px-6 py-4 w-full">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-accent"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <IconMenu className="w-5 h-5" />
            </button>

            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search dashboard..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted border-0 rounded-lg focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggleButton />
              <button
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent"
                onClick={() => setProfileSheetOpen(true)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-gray-800 dark:to-black rounded-full flex items-center justify-center">
                  <IconUser className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:inline font-medium text-foreground">
                  {user.username}
                </span>
                <IconEdit className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-x-auto">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-muted to-card border border-border rounded-lg p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <h3 className="text-sm font-medium text-blue-700 dark:text-gray-300 mb-2">
                Current Streak
              </h3>
              <div className="flex items-center space-x-2">
                <IconFlame className="w-6 h-6 text-orange-500" />
                <span className="text-2xl font-bold text-blue-900 dark:text-white">
                  {currentStreak}
                </span>
                <span className="text-sm text-blue-600 dark:text-gray-400">
                  days
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-muted to-card border border-border rounded-lg p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                Study Time
              </h3>
              <div className="flex items-center space-x-2">
                <IconClock className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {totalStudyTime}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-muted to-card border border-border rounded-lg p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                Earned Badges
              </h3>
              <div className="flex items-center space-x-2">
                <IconTrophy className="w-6 h-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {totalEarned}
                </span>
                <span className="text-sm text-purple-600 dark:text-purple-400">
                  / {totalBadges}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-muted to-card border border-border rounded-lg p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <h3 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                Accuracy Rate
              </h3>
              <div className="flex items-center space-x-2">
                <IconTarget className="w-6 h-6 text-orange-600" />
                <span className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {accuracyRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-6">
            <div className="grid w-full grid-cols-4 bg-muted p-1 rounded-lg">
              {[
                { key: "overview", label: "Overview" },
                { key: "analytics", label: "Analytics" },
                { key: "performance", label: "Performance" },
                { key: "achievements", label: "Achievements" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === t.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="mb-4">
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      <IconFlame className="w-5 h-5 text-orange-500" />
                      <span>Streak Progress</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your current streak and progress towards milestones
                    </p>
                  </div>
                  {streakData ? (
                    <StreakProgressRadialChart data={streakData} />
                  ) : (
                    <EmptyChart
                      title="No streak yet"
                      hint="Start a session to begin your streak."
                    />
                  )}
                </div>

                <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="mb-4">
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      <IconTrendingUp className="w-5 h-5" />
                      <span>Daily Progress Trends</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Flashcard accuracy and study minutes over time
                    </p>
                  </div>
                  {isNonEmptyArray(chartData) ? (
                    <ProgressAreaChart data={chartData} />
                  ) : (
                    <EmptyChart />
                  )}
                </div>
              </div>
            )}

            {/* Analytics */}
            {activeTab === "analytics" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="mb-4">
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      <IconTrendingUp className="w-5 h-5" />
                      <span>Performance Trends</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Long-term performance analysis
                    </p>
                  </div>
                  {isNonEmptyArray(chartData) ? (
                    <ProgressAreaChart data={chartData} />
                  ) : (
                    <EmptyChart />
                  )}
                </div>

                <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="mb-4">
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      <IconClock className="w-5 h-5" />
                      <span>Study Time Analysis</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Time spent studying each day
                    </p>
                  </div>
                  {isNonEmptyArray(chartData) ? (
                    <WeeklyActivityBarChart data={chartData} />
                  ) : (
                    <EmptyChart />
                  )}
                </div>
              </div>
            )}

            {/* Performance */}
            {activeTab === "performance" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="mb-4">
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground">
                      <IconTarget className="w-5 h-5" />
                      <span>Performance Breakdown</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Detailed performance metrics
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Flashcards
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {accuracyRate}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 dark:bg-gray-400 h-2 rounded-full"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, accuracyRate)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Study Time
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {totalStudyTime}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `100%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements */}
            {activeTab === "achievements" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-card rounded-lg border border-border p-6">
                    <div className="mb-4">
                      <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground">
                        <IconAward className="w-5 h-5 text-purple-500" />
                        <span>Badge Collection</span>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Earned and available badges
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {badgeProgress.slice(0, 6).map((badgeItem, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer ${
                            badgeItem.earned
                              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50"
                              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                          } ${
                            badgeItem.is_new ? "ring-2 ring-yellow-400" : ""
                          }`}
                          onClick={() => {
                            if (
                              badgeItem.earned &&
                              badgeItem.is_new &&
                              badgeItem.badge?.id
                            ) {
                              markBadgeAsViewed(badgeItem.badge.id);
                            }
                          }}
                        >
                          <div className="text-2xl mb-1">
                            {badgeItem.badge?.icon || "🏆"}
                          </div>
                          <div className="text-xs font-medium text-foreground">
                            {badgeItem.badge?.name || "Badge"}
                          </div>
                          {badgeItem.earned && (
                            <IconCheck className="w-4 h-4 text-green-600 mx-auto mt-1" />
                          )}
                          {badgeItem.is_new && (
                            <div className="text-xs text-yellow-600 mt-1 font-bold">
                              NEW!
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <div className="mb-4">
                      <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground">
                        <IconTrophy className="w-5 h-5 text-yellow-500" />
                        <span>Achievement Stats</span>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your progress and accomplishments
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Total Badges
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {totalBadges}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Earned</span>
                        <span className="text-lg font-bold text-green-600">
                          {totalEarned}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Completion Rate
                        </span>
                        <span className="text-lg font-bold text-purple-600">
                          {totalBadges > 0
                            ? Math.round((totalEarned / totalBadges) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="mb-4">
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground">
                      <IconStar className="w-5 h-5 text-yellow-500" />
                      <span>Recent Achievements</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your latest accomplishments
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {earnedBadges.slice(0, 3).map((badgeItem, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50"
                      >
                        <div className="text-3xl mb-2">
                          {badgeItem.badge?.icon || "🏆"}
                        </div>
                        <div className="font-medium text-sm">
                          {badgeItem.badge?.name || "Badge"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {badgeItem.badge?.description ||
                            "Achievement unlocked!"}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          ✓ Earned
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="mb-4">
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-foreground">
                      <IconTarget className="w-5 h-5 text-blue-500" />
                      <span>Badge Progress</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Work towards earning more badges
                    </p>
                  </div>
                  <div className="space-y-4">
                    {unearnedBadges.slice(0, 3).map((badgeItem, i) => {
                      const pct = Math.min(
                        100,
                        Math.round(
                          ((badgeItem.current_value ?? 0) /
                            Math.max(
                              1,
                              badgeItem.badge?.requirement_value ?? 1
                            )) *
                            100
                        )
                      );
                      return (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {badgeItem.badge?.name || "Badge"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {badgeItem.current_value || 0}/
                              {badgeItem.badge?.requirement_value || 1}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Modal */}
      {profileSheetOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Edit Profile & Stats
                </h2>
                <button
                  onClick={() => setProfileSheetOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-gray-800 dark:to-black rounded-full flex items-center justify-center">
                  <IconUser className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {user.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Active Learner
                  </p>
                </div>
              </div>

              {/* Editable Profile Fields */}
              <form onSubmit={handleProfileSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) =>
                      handleProfileInputChange("username", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="Enter your display name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      handleProfileInputChange("email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Study Goal (minutes/day)
                  </label>
                  <input
                    type="number"
                    value={profileForm.studyGoal}
                    onChange={(e) =>
                      handleProfileInputChange(
                        "studyGoal",
                        parseInt(e.target.value) || 30
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="Enter daily study goal"
                    min="1"
                    max="480"
                    required
                  />
                </div>

                {/* Error and Success Messages */}
                {profileError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{profileError}</p>
                  </div>
                )}

                {profileSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">{profileSuccess}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setProfileSheetOpen(false)}
                    className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>

              {/* Stats Display */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium text-foreground border-b border-border pb-2">
                  Current Statistics (Read-only)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Current Streak",
                      value: `${currentStreak} days`,
                      icon: IconFlame,
                      color: "text-orange-500",
                    },
                    {
                      label: "Total Study Time",
                      value: totalStudyTime,
                      icon: IconClock,
                      color: "text-green-500",
                    },
                    {
                      label: "Total Sessions",
                      value: totalSessions,
                      icon: IconBook,
                      color: "text-blue-500",
                    },
                    {
                      label: "Accuracy Rate",
                      value: `${accuracyRate}%`,
                      icon: IconTarget,
                      color: "text-purple-500",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <row.icon className={`w-5 h-5 ${row.color}`} />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {row.label}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {row.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
