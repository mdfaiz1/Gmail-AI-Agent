import { useState, useEffect } from "react";
import { useAuthUser } from "../hooks/useAuthUser";

export default function WelcomeDashboard() {
  const [time, setTime] = useState(new Date());
  const { authUser } = useAuthUser();
  // console.log("Authenticated User Data in Dashboard:", authUser);/

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatters
  const formatTime = date => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = date => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-10 min-h-[80vh] bg-linear-to-b from-transparent  ">
      {/* 1. Greeting Section */}
      <div className="space-y-2 text-center animate-in  zoom-in duration-700">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white dark:text-zinc-100">
          Welcome Back,
        </h2>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500 pb-2">
          {authUser?.user?.name}
        </h1>
      </div>

      {/* 2. Digital Watch Section */}
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-zinc-200  shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        {/* Time */}
        <div className="font-mono text-5xl md:text-7xl font-bold tracking-widest  text-white tabular-nums">
          {formatTime(time)}
        </div>

        {/* Date */}
        <div className="mt-2 text-lg md:text-xl font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
          {formatDate(time)}
        </div>
      </div>

      {/* 3. Footer / Status */}
      <div className="mt-4 flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
        {authUser?.user?.name}
      </div>
    </div>
  );
}
