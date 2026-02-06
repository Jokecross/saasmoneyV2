"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  Calendar,
  Coins,
  TrendingUp,
  Phone,
  Flame,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalBookings: number;
  pendingBookings: number;
  totalCoins: number;
}

interface RecentBooking {
  id: string;
  userName: string;
  type: "one-of-one" | "hotset";
  typeName?: string;
  date: Date;
  status: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalCoins: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user stats
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: totalStudents } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        // Fetch coins total
        const { data: coinsData } = await supabase
          .from("profiles")
          .select("coins_balance");
        
        const totalCoins = coinsData?.reduce((sum, p) => sum + (p.coins_balance || 0), 0) || 0;

        // Fetch one-of-one bookings
        const { data: oneOfOneBookings, count: oneOfOneCount } = await supabase
          .from("one_of_one_bookings")
          .select("*, slot:one_of_one_slots(*), user:profiles!user_id(name)", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch hotset bookings
        const { data: hotsetBookings, count: hotsetCount } = await supabase
          .from("hotset_bookings")
          .select("*, slot:hotset_slots(*, type:hotset_types(*)), user:profiles!user_id(name)", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(5);

        // Count pending bookings
        const { count: pendingOneOfOne } = await supabase
          .from("one_of_one_bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        const { count: pendingHotset } = await supabase
          .from("hotset_bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        setStats({
          totalUsers: totalUsers || 0,
          totalStudents: totalStudents || 0,
          totalBookings: (oneOfOneCount || 0) + (hotsetCount || 0),
          pendingBookings: (pendingOneOfOne || 0) + (pendingHotset || 0),
          totalCoins,
        });

        // Combine and sort recent bookings
        const allBookings: RecentBooking[] = [
          ...(oneOfOneBookings || []).map((b: any) => ({
            id: b.id,
            userName: b.user?.name || "Utilisateur",
            type: "one-of-one" as const,
            date: new Date(b.slot?.date || b.created_at),
            status: b.status,
          })),
          ...(hotsetBookings || []).map((b: any) => ({
            id: b.id,
            userName: b.user?.name || "Utilisateur",
            type: "hotset" as const,
            typeName: b.slot?.type?.name || "Hot-Seat",
            date: new Date(b.slot?.date || b.created_at),
            status: b.status,
          })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

        setRecentBookings(allBookings);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-magenta animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      {/* Stats grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-magenta-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-magenta" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-green-600">
                {stats.totalStudents} élèves
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Réservations</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBookings}
              </p>
              {stats.pendingBookings > 0 && (
                <p className="text-xs text-orange-600">
                  {stats.pendingBookings} en attente
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
              <Coins className="w-6 h-6 text-rose-light" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Coins en circulation</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCoins.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Réservations récentes
          </h2>
          {stats.totalBookings > 0 && (
            <Badge variant="gradient">
              <TrendingUp className="w-4 h-4 mr-1" />
              {stats.totalBookings} total
            </Badge>
          )}
        </div>

        <Card className="overflow-hidden">
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune réservation pour le moment</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        booking.type === "one-of-one"
                          ? "bg-magenta-100"
                          : "bg-orange-100"
                      }`}
                    >
                      {booking.type === "one-of-one" ? (
                        <Phone className="w-5 h-5 text-magenta" />
                      ) : (
                        <Flame className="w-5 h-5 text-orange" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.userName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.type === "one-of-one"
                          ? "One of One"
                          : `Hot-Seat${booking.typeName ? ` - ${booking.typeName}` : ""}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      {formatDate(booking.date)}
                    </p>
                    <Badge
                      variant={
                        booking.status === "confirmed" ? "magenta" : "orange"
                      }
                      size="sm"
                    >
                      {booking.status === "confirmed" ? "Confirmé" : "En attente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/admin/slots">
          <Card variant="bordered" hover className="p-6 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gérer les créneaux</h3>
                <p className="text-sm text-gray-500">
                  Ajouter ou supprimer des créneaux disponibles
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/coins">
          <Card variant="bordered" hover className="p-6 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Configuration Coins
                </h3>
                <p className="text-sm text-gray-500">
                  Définir le coût des calls et gérer les paramètres
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
