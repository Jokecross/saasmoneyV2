"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Phone,
  CheckCircle,
  Loader2,
  User,
} from "lucide-react";

interface Slot {
  id: string;
  date: string;
  duration: number;
  is_available: boolean;
  coach_id: string;
  coach?: { name: string };
}

interface Coach {
  id: string;
  name: string;
}

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotCoach, setNewSlotCoach] = useState("");
  const [newSlotDuration, setNewSlotDuration] = useState("60");
  const [isAdding, setIsAdding] = useState(false);
  const supabase = getSupabaseClient();

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from("one_of_one_slots")
      .select("*, coach:profiles!coach_id(name)")
      .order("date", { ascending: true });

    if (!error && data) {
      setSlots(data);
    }
  };

  const fetchCoaches = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "coach");

    if (!error && data) {
      setCoaches(data);
      if (data.length > 0 && !newSlotCoach) {
        setNewSlotCoach(data[0].id);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSlots(), fetchCoaches()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddSlot = async () => {
    if (!newSlotDate || !newSlotTime || !newSlotCoach) return;

    setIsAdding(true);
    const dateTime = new Date(`${newSlotDate}T${newSlotTime}`);
    
    const { data, error } = await supabase
      .from("one_of_one_slots")
      .insert({
        date: dateTime.toISOString(),
        duration: parseInt(newSlotDuration),
        is_available: true,
        coach_id: newSlotCoach,
      })
      .select("*, coach:profiles!coach_id(name)")
      .single();

    if (!error && data) {
      setSlots([data, ...slots].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      setShowAddModal(false);
      setNewSlotDate("");
      setNewSlotTime("");
    }
    setIsAdding(false);
  };

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await supabase
      .from("one_of_one_slots")
      .delete()
      .eq("id", slotId);

    if (!error) {
      setSlots(slots.filter((s) => s.id !== slotId));
    }
  };

  const toggleAvailability = async (slot: Slot) => {
    const { error } = await supabase
      .from("one_of_one_slots")
      .update({ is_available: !slot.is_available })
      .eq("id", slot.id);

    if (!error) {
      setSlots(slots.map((s) =>
        s.id === slot.id ? { ...s, is_available: !s.is_available } : s
      ));
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const dateKey = new Date(slot.date).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  // Filter only future slots
  const now = new Date();
  const futureSlots = Object.entries(groupedSlots)
    .filter(([dateKey]) => new Date(dateKey) >= new Date(now.toDateString()))
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-magenta animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des créneaux
          </h1>
          <p className="text-gray-500">
            One of One - Créneaux disponibles
          </p>
        </div>
        <Button variant="gradient" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un créneau
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {slots.filter((s) => s.is_available).length}
          </p>
          <p className="text-sm text-gray-500">Disponibles</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {slots.filter((s) => !s.is_available).length}
          </p>
          <p className="text-sm text-gray-500">Réservés</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{slots.length}</p>
          <p className="text-sm text-gray-500">Total</p>
        </Card>
      </div>

      {/* Slots list by date */}
      <div className="space-y-6">
        {futureSlots.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Aucun créneau à venir</p>
            <p className="text-sm text-gray-400 mt-1">
              Ajoutez des créneaux pour que les élèves puissent réserver
            </p>
          </Card>
        ) : (
          futureSlots.map(([dateKey, dateSlots]) => (
            <div key={dateKey}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {formatDate(dateKey)}
              </h3>
              <div className="space-y-2">
                {dateSlots.map((slot) => (
                  <Card key={slot.id} variant="bordered" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            slot.is_available
                              ? "bg-magenta-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <Phone
                            className={`w-5 h-5 ${
                              slot.is_available
                                ? "text-magenta"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {formatTime(slot.date)}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({slot.duration} min)
                            </span>
                          </div>
                          {slot.coach && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <User className="w-3 h-3" />
                              {slot.coach.name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={slot.is_available ? "magenta" : "default"}
                          className="cursor-pointer"
                          onClick={() => toggleAvailability(slot)}
                        >
                          {slot.is_available ? "Disponible" : "Réservé"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add slot modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un créneau"
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={newSlotDate}
            onChange={(e) => setNewSlotDate(e.target.value)}
            icon={<Calendar className="w-5 h-5" />}
          />

          <Input
            label="Heure"
            type="time"
            value={newSlotTime}
            onChange={(e) => setNewSlotTime(e.target.value)}
            icon={<Clock className="w-5 h-5" />}
          />

          <Select
            label="Coach"
            value={newSlotCoach}
            onChange={(e) => setNewSlotCoach(e.target.value)}
            options={coaches.map((c) => ({ value: c.id, label: c.name }))}
          />

          <Select
            label="Durée"
            value={newSlotDuration}
            onChange={(e) => setNewSlotDuration(e.target.value)}
            options={[
              { value: "30", label: "30 minutes" },
              { value: "45", label: "45 minutes" },
              { value: "60", label: "60 minutes" },
              { value: "90", label: "90 minutes" },
            ]}
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="gradient"
              className="flex-1"
              onClick={handleAddSlot}
              disabled={!newSlotDate || !newSlotTime || !newSlotCoach}
              loading={isAdding}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
