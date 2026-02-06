"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Phone,
  Flame,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";

type BookingType = "all" | "one-of-one" | "hotset";
type BookingStatus = "all" | "confirmed" | "completed" | "cancelled";

interface Booking {
  id: string;
  type: "one-of-one" | "hotset";
  date: string;
  status: string;
  userName: string;
  userEmail?: string;
  typeName?: string;
  duration?: number;
  coinsSpent?: number;
  createdAt: string;
}

export default function CoachBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<BookingType>("all");
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState("");

  const supabase = getSupabaseClient();

  // Fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || authLoading) {
        setDataLoading(false);
        return;
      }

      setDataLoading(true);

      try {
        // Fetch One of One bookings
        const { data: oneOfOneData } = await supabase
          .from("one_of_one_bookings")
          .select(`
            id,
            status,
            coins_spent,
            created_at,
            slot:one_of_one_slots!inner(id, date, duration, coach_id),
            user:profiles!one_of_one_bookings_user_id_fkey(name, email)
          `)
          .eq("slot.coach_id", user.id)
          .order("created_at", { ascending: false });

        // Fetch HotSet bookings
        const { data: hotsetData } = await supabase
          .from("hotset_bookings")
          .select(`
            id,
            status,
            created_at,
            slot:hotset_slots!inner(id, date, coach_id, type:hotset_types(name, duration)),
            user:profiles!hotset_bookings_user_id_fkey(name, email)
          `)
          .eq("slot.coach_id", user.id)
          .order("created_at", { ascending: false });

        // Format bookings
        const formattedBookings: Booking[] = [
          ...(oneOfOneData || []).map((b: any) => ({
            id: b.id,
            type: "one-of-one" as const,
            date: b.slot?.date,
            status: b.status,
            userName: b.user?.name || "Utilisateur",
            userEmail: b.user?.email,
            duration: b.slot?.duration,
            coinsSpent: b.coins_spent,
            createdAt: b.created_at,
          })),
          ...(hotsetData || []).map((b: any) => ({
            id: b.id,
            type: "hotset" as const,
            date: b.slot?.date,
            status: b.status,
            userName: b.user?.name || "Utilisateur",
            userEmail: b.user?.email,
            typeName: b.slot?.type?.name,
            duration: b.slot?.type?.duration,
            createdAt: b.created_at,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setBookings(formattedBookings);
        setFilteredBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      fetchBookings();
    }
  }, [user, authLoading, supabase]);

  // Apply filters
  useEffect(() => {
    let filtered = [...bookings];

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((b) => b.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.userName.toLowerCase().includes(query) ||
          b.userEmail?.toLowerCase().includes(query) ||
          b.typeName?.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, typeFilter, statusFilter, searchQuery]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-700">
            Confirmé
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-700">
            Terminé
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="default" className="bg-red-100 text-red-700">
            Annulé
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string, type: "one-of-one" | "hotset") => {
    setIsUpdating(true);

    try {
      const table = type === "one-of-one" ? "one_of_one_bookings" : "hotset_bookings";
      
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );

      setShowDetailModal(false);
      setSelectedBooking(null);
      setSuccess(`Réservation ${newStatus === "completed" ? "marquée comme terminée" : "annulée"} !`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    upcoming: bookings.filter((b) => b.status === "confirmed" && !isPast(b.date)).length,
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
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
        <p className="text-gray-500">
          Consulte et gère toutes les réservations de tes élèves.
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-orange">{stats.upcoming}</p>
          <p className="text-xs text-gray-500">À venir</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="text-xs text-gray-500">Confirmées</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
          <p className="text-xs text-gray-500">Terminées</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.cancelled}</p>
          <p className="text-xs text-gray-500">Annulées</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-magenta focus:ring-2 focus:ring-magenta/20 outline-none transition-all"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-2">
            <Button
              variant={typeFilter === "all" ? "gradient" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}
            >
              Tous
            </Button>
            <Button
              variant={typeFilter === "one-of-one" ? "gradient" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("one-of-one")}
              className="flex items-center gap-1"
            >
              <Phone className="w-4 h-4" />
              1:1
            </Button>
            <Button
              variant={typeFilter === "hotset" ? "gradient" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("hotset")}
              className="flex items-center gap-1"
            >
              <Flame className="w-4 h-4" />
              HotSet
            </Button>
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Tous
            </Button>
            <Button
              variant={statusFilter === "confirmed" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter("confirmed")}
            >
              Confirmé
            </Button>
            <Button
              variant={statusFilter === "completed" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter("completed")}
            >
              Terminé
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookings list */}
      {filteredBookings.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune réservation
          </h3>
          <p className="text-gray-500">
            {bookings.length === 0
              ? "Tu n'as pas encore de réservations."
              : "Aucune réservation ne correspond à tes filtres."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              variant="bordered"
              hover
              className="cursor-pointer"
              onClick={() => {
                setSelectedBooking(booking);
                setShowDetailModal(true);
              }}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    booking.type === "one-of-one"
                      ? "bg-magenta-100"
                      : "bg-orange-100"
                  )}
                >
                  {booking.type === "one-of-one" ? (
                    <Phone className="w-6 h-6 text-magenta" />
                  ) : (
                    <Flame className="w-6 h-6 text-orange" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {booking.userName}
                    </h3>
                    <Badge
                      variant={booking.type === "one-of-one" ? "magenta" : "orange"}
                      size="sm"
                    >
                      {booking.type === "one-of-one"
                        ? "1:1"
                        : booking.typeName || "HotSet"}
                    </Badge>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(booking.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(booking.date)}
                    </span>
                    {booking.duration && (
                      <span className="text-gray-400">
                        {booking.duration} min
                      </span>
                    )}
                  </div>
                </div>

                {/* Past indicator */}
                {isPast(booking.date) && booking.status === "confirmed" && (
                  <Badge variant="default" className="bg-yellow-100 text-yellow-700">
                    Passé
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBooking(null);
        }}
        title="Détails de la réservation"
      >
        {selectedBooking && (
          <div className="space-y-4">
            {/* User info */}
            <Card variant="bordered" className="p-4">
              <div className="flex items-center gap-4">
                <Avatar name={selectedBooking.userName} size="lg" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedBooking.userName}
                  </h3>
                  {selectedBooking.userEmail && (
                    <p className="text-sm text-gray-500">
                      {selectedBooking.userEmail}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Booking details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Type</span>
                <Badge
                  variant={selectedBooking.type === "one-of-one" ? "magenta" : "orange"}
                >
                  {selectedBooking.type === "one-of-one"
                    ? "Call 1:1"
                    : selectedBooking.typeName || "HotSet"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Date</span>
                <span className="font-medium text-gray-900">
                  {formatDate(selectedBooking.date)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Heure</span>
                <span className="font-medium text-gray-900">
                  {formatTime(selectedBooking.date)}
                </span>
              </div>

              {selectedBooking.duration && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Durée</span>
                  <span className="font-medium text-gray-900">
                    {selectedBooking.duration} minutes
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Statut</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {selectedBooking.coinsSpent && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Coins dépensés</span>
                  <span className="font-medium text-gray-900">
                    {selectedBooking.coinsSpent} coins
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedBooking.status === "confirmed" && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    updateBookingStatus(
                      selectedBooking.id,
                      "cancelled",
                      selectedBooking.type
                    )
                  }
                  loading={isUpdating}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={() =>
                    updateBookingStatus(
                      selectedBooking.id,
                      "completed",
                      selectedBooking.type
                    )
                  }
                  loading={isUpdating}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer terminé
                </Button>
              </div>
            )}

            {selectedBooking.status !== "confirmed" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBooking(null);
                }}
              >
                Fermer
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

