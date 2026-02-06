"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { HotsetSlot } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import {
  Flame,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

export default function CoachHotsetPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [slots, setSlots] = useState<HotsetSlot[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<HotsetSlot | null>(null);
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("10:00");
  const [newSlotMeetingLink, setNewSlotMeetingLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = getSupabaseClient();

  // Fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!user || authLoading) {
        setDataLoading(false);
        return;
      }

      setDataLoading(true);

      try {
        const { data, error } = await supabase
          .from("hotset_slots")
          .select("*")
          .eq("coach_id", user.id)
          .order("date", { ascending: true });

        if (error) throw error;
        setSlots(data || []);
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      fetchSlots();
    }
  }, [user, authLoading, supabase]);

  // Get week dates
  const getWeekDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + currentWeekOffset * 7);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getSlotsByDate = (date: Date) => {
    return slots.filter((slot) => {
      const slotDate = new Date(slot.date);
      return (
        slotDate.getDate() === date.getDate() &&
        slotDate.getMonth() === date.getMonth() &&
        slotDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Add new slot
  const handleAddSlot = async () => {
    if (!user || !newSlotDate || !newSlotTime) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const dateTime = new Date(`${newSlotDate}T${newSlotTime}:00`);
      
      const { data, error } = await supabase
        .from("hotset_slots")
        .insert({
          coach_id: user.id,
          date: dateTime.toISOString(),
          duration: 15, // Hot-Seats are always 15 minutes
          meeting_link: newSlotMeetingLink || null,
          is_available: true,
        })
        .select()
        .single();

      if (error) throw error;

      setSlots([...slots, data]);
      setShowAddModal(false);
      setNewSlotDate("");
      setNewSlotTime("10:00");
      setNewSlotMeetingLink("");
      setSuccess("Créneau ajouté avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error adding slot:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete slot
  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setError("");

    try {
      const { error } = await supabase
        .from("hotset_slots")
        .delete()
        .eq("id", selectedSlot.id);

      if (error) throw error;

      setSlots(slots.filter((s) => s.id !== selectedSlot.id));
      setShowDeleteModal(false);
      setSelectedSlot(null);
      setSuccess("Créneau supprimé avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error deleting slot:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick add slot for a specific date
  const handleQuickAdd = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setNewSlotDate(formattedDate);
    setShowAddModal(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hot-Seats</h1>
          <p className="text-gray-500">
            Gère tes disponibilités pour les Hot-Seats (15 min).
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter un créneau
        </Button>
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{slots.length}</p>
          <p className="text-sm text-gray-500">Total créneaux</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {slots.filter((s) => s.is_available).length}
          </p>
          <p className="text-sm text-gray-500">Disponibles</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-orange">
            {slots.filter((s) => !s.is_available).length}
          </p>
          <p className="text-sm text-gray-500">Réservés</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-orange">
            {slots.filter((s) => new Date(s.date) > new Date()).length}
          </p>
          <p className="text-sm text-gray-500">À venir</p>
        </Card>
      </div>

      {/* Calendar navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Calendrier des disponibilités
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm text-gray-500 min-w-[150px] text-center">
            {weekDates[0].toLocaleDateString("fr-FR", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {weekDates[6].toLocaleDateString("fr-FR", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          {currentWeekOffset !== 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(0)}
            >
              Aujourd'hui
            </Button>
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <Card className="p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[700px]">
          {weekDates.map((date, index) => {
            const daySlots = getSlotsByDate(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const today = isToday(date);
            const past = isPast(date);

            return (
              <div key={index} className="space-y-2">
                {/* Day header */}
                <div
                  className={cn(
                    "text-center py-3 rounded-2xl",
                    today
                      ? "bg-gradient-primary text-white"
                      : past
                      ? "bg-gray-100 text-gray-400"
                      : isWeekend
                      ? "bg-gray-50 text-gray-500"
                      : "bg-gray-100"
                  )}
                >
                  <p className="text-xs uppercase font-medium">
                    {formatDayName(date)}
                  </p>
                  <p className="text-lg font-bold">{formatDayNumber(date)}</p>
                </div>

                {/* Slots */}
                <div className="space-y-2 min-h-[200px]">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setShowDeleteModal(true);
                      }}
                      className={cn(
                        "p-2 rounded-xl text-xs cursor-pointer transition-all duration-200",
                        slot.is_available
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-orange-100 text-orange hover:bg-orange-200"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{formatTime(slot.date)}</span>
                      </div>
                      <p className="text-[10px] mt-0.5 opacity-75">
                        15 min
                      </p>
                      {!slot.is_available && (
                        <Badge size="sm" variant="orange" className="mt-1 text-[9px]">
                          Réservé
                        </Badge>
                      )}
                    </div>
                  ))}

                  {/* Add button for non-past days */}
                  {!past && (
                    <button
                      onClick={() => handleQuickAdd(date)}
                      className="w-full p-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-orange hover:text-orange transition-colors text-xs flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100" />
          <span>Réservé</span>
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setError("");
        }}
        title="Ajouter un créneau Hot-Seat"
      >
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 rounded-xl">
            <p className="text-sm text-orange-700">
              ℹ️ Les Hot-Seats ont une durée fixe de <strong>15 minutes</strong>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <Input
              type="date"
              value={newSlotDate}
              onChange={(e) => setNewSlotDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure
            </label>
            <Select
              options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lien Google Meet (optionnel)
            </label>
            <Input
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={newSlotMeetingLink}
              onChange={(e) => setNewSlotMeetingLink(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Les élèves recevront ce lien après réservation
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowAddModal(false);
                setError("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="gradient"
              className="flex-1"
              onClick={handleAddSlot}
              loading={isSubmitting}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Slot Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSlot(null);
          setError("");
        }}
        title="Gérer le créneau"
      >
        {selectedSlot && (
          <div className="space-y-4">
            <Card variant="bordered" className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedSlot.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(selectedSlot.date)} - 15 minutes
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Badge
                variant={selectedSlot.is_available ? "default" : "orange"}
                className={selectedSlot.is_available ? "bg-green-100 text-green-700" : ""}
              >
                {selectedSlot.is_available ? "Disponible" : "Réservé"}
              </Badge>
              <span className="text-sm text-gray-500">
                {selectedSlot.is_available
                  ? "Ce créneau peut être supprimé"
                  : "Ce créneau est réservé par un élève"}
              </span>
            </div>

            {!selectedSlot.is_available && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl text-orange-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Attention : supprimer ce créneau annulera la réservation de l'élève.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSlot(null);
                  setError("");
                }}
              >
                Fermer
              </Button>
              <Button
                variant="secondary"
                className="flex-1 bg-red-100 text-red-600 hover:bg-red-200"
                onClick={handleDeleteSlot}
                loading={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

