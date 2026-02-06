"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  Phone,
  Flame,
  Calendar,
  Clock,
  ArrowRight,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

interface DashboardStats {
  totalOneOfOneSlots: number;
  bookedOneOfOne: number;
  totalHotsetSlots: number;
  bookedHotset: number;
  upcomingBookings: number;
}

interface UpcomingBooking {
  id: string;
  type: "one-of-one" | "hotset";
  date: string;
  userName: string;
  status: string;
}

export default function CoachDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOneOfOneSlots: 0,
    bookedOneOfOne: 0,
    totalHotsetSlots: 0,
    bookedHotset: 0,
    upcomingBookings: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || authLoading) {
        setDataLoading(false);
        return;
      }
      
      setDataLoading(true);
      
      const supabase = getSupabaseClient();
      
      try {
        // Fetch One of One slots stats
        const { data: oneOfOneSlots } = await supabase
          .from("one_of_one_slots")
          .select("*")
          .eq("coach_id", user.id);

        const totalOneOfOne = oneOfOneSlots?.length || 0;
        const bookedOneOfOne = oneOfOneSlots?.filter(s => !s.is_available).length || 0;

        // Fetch Hotset slots stats
        const { data: hotsetSlots } = await supabase
          .from("hotset_slots")
          .select("*")
          .eq("coach_id", user.id);

        const totalHotset = hotsetSlots?.length || 0;
        const bookedHotset = hotsetSlots?.filter(s => !s.is_available).length || 0;

        // Fetch upcoming bookings
        const { data: oneOfOneBookings } = await supabase
          .from("one_of_one_bookings")
          .select(`
            id,
            status,
            created_at,
            slot:one_of_one_slots!inner(date, coach_id),
            user:profiles!one_of_one_bookings_user_id_fkey(name)
          `)
          .eq("slot.coach_id", user.id)
          .eq("status", "confirmed")
          .gte("slot.date", new Date().toISOString())
          .order("slot(date)", { ascending: true })
          .limit(5);

        const { data: hotsetBookings } = await supabase
          .from("hotset_bookings")
          .select(`
            id,
            status,
            created_at,
            slot:hotset_slots!inner(date, coach_id),
            user:profiles!hotset_bookings_user_id_fkey(name)
          `)
          .eq("slot.coach_id", user.id)
          .eq("status", "confirmed")
          .gte("slot.date", new Date().toISOString())
          .order("slot(date)", { ascending: true })
          .limit(5);

        // Combine and format bookings
        const formattedBookings: UpcomingBooking[] = [
          ...(oneOfOneBookings || []).map((b: any) => ({
            id: b.id,
            type: "one-of-one" as const,
            date: b.slot?.date,
            userName: b.user?.name || "Utilisateur",
            status: b.status,
          })),
          ...(hotsetBookings || []).map((b: any) => ({
            id: b.id,
            type: "hotset" as const,
            date: b.slot?.date,
            userName: b.user?.name || "Utilisateur",
            status: b.status,
          })),
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
         .slice(0, 5);

        setStats({
          totalOneOfOneSlots: totalOneOfOne,
          bookedOneOfOne,
          totalHotsetSlots: totalHotset,
          bookedHotset,
          upcomingBookings: formattedBookings.length,
        });

        setUpcomingBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse-soft text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      {/* Welcome section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Salut, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500">
          Bienvenue sur ton espace Coach. Gère tes disponibilités et tes réservations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-magenta-100 flex items-center justify-center">
              <Phone className="w-6 h-6 text-magenta" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalOneOfOneSlots}
              </p>
              <p className="text-sm text-gray-500">Créneaux 1:1</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalHotsetSlots}
              </p>
              <p className="text-sm text-gray-500">Créneaux HotSet</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.bookedOneOfOne + stats.bookedHotset}
              </p>
              <p className="text-sm text-gray-500">Réservés</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.upcomingBookings}
              </p>
              <p className="text-sm text-gray-500">À venir</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/coach/one-of-one">
          <Card variant="gradient" hover className="h-full group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Gérer One of One
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Ajoute tes disponibilités pour les calls 1:1
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </Link>

        <Link href="/coach/hotset">
          <Card hover className="h-full group cursor-pointer border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Flame className="w-7 h-7 text-orange" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Gérer HotSet
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Crée des créneaux pour tes sessions HotSet
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Upcoming Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Prochaines réservations
          </h2>
          <Link
            href="/coach/bookings"
            className="text-sm text-magenta hover:underline font-medium"
          >
            Voir tout
          </Link>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} variant="bordered" className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      booking.type === "one-of-one"
                        ? "bg-magenta-100"
                        : "bg-orange-100"
                    }`}
                  >
                    {booking.type === "one-of-one" ? (
                      <Phone className="w-6 h-6 text-magenta" />
                    ) : (
                      <Flame className="w-6 h-6 text-orange" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {booking.userName}
                      </h3>
                      <Badge
                        variant={booking.type === "one-of-one" ? "magenta" : "orange"}
                        size="sm"
                      >
                        {booking.type === "one-of-one" ? "1:1" : "HotSet"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(booking.date)}
                      </span>
                    </div>
                  </div>

                  <Badge variant="default" size="sm" className="bg-green-100 text-green-700">
                    Confirmé
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="bordered" className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune réservation à venir
            </h3>
            <p className="text-gray-500 mb-4">
              Commence par ajouter des disponibilités pour recevoir des réservations.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/coach/one-of-one">
                <Button variant="gradient">
                  Ajouter des créneaux 1:1
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

