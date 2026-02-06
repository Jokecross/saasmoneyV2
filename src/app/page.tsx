"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("saasmoney_user");
    if (user) {
      router.push("/app");
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-soft bg-pattern flex items-center justify-center">
      <div className="text-center animate-pulse-soft">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary shadow-glow mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Chargement...</h1>
      </div>
    </div>
  );
}

