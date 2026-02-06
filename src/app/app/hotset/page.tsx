"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, getUserPermissions, canBookHotSeat, recordHotSeatBooking, getStudentByUserId, UserPermissions, StudentRecord } from "@/lib/auth-context";
import { useHotsetBookings } from "@/hooks/use-bookings";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Flame,
  Clock,
  Calendar,
  CheckCircle,
  Loader2,
  Lock,
  ArrowLeft,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HotsetSlot {
  id: string;
  coach_id: string;
  date: string;
  duration: number;
  is_available: boolean;
  meeting_link?: string | null;
  coachName?: string;
}

export default function HotSetPage() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const { createBooking } = useHotsetBookings(user?.id);
  
  const [slots, setSlots] = useState<HotsetSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<HotsetSlot | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  // États async pour permissions
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [bookingCheck, setBookingCheck] = useState<{ allowed: boolean; reason?: string }>({ allowed: false, reason: "Chargement..." });
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  // Charger les permissions
  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.id) {
        setLoadingPermissions(false);
        return;
      }

      const perms = await getUserPermissions(user.id);
      setPermissions(perms);

      const studentData = await getStudentByUserId(user.id);
      setStudent(studentData);

      const check = await canBookHotSeat(user.id);
      setBookingCheck(check);
      
      setLoadingPermissions(false);
    };
    loadPermissions();
  }, [user?.id]);

  // Charger les créneaux disponibles
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const { data, error } = await supabase
          .from("hotset_slots")
          .select(`
            id,
            coach_id,
            date,
            duration,
            is_available,
            coach:coach_id(name)
          `)
          .eq("is_available", true)
          .gte("date", new Date().toISOString())
          .order("date", { ascending: true });

        if (error) throw error;

        const slotsWithCoach = (data || []).map((slot: any) => ({
          ...slot,
          coachName: slot.coach?.name || "Coach",
        }));

        setSlots(slotsWithCoach);
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [supabase]);

  const isAdmin = user?.role === "admin";
  const hasAccess = permissions?.canAccessHotSet || isAdmin;

  // Loading state
  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-magenta animate-spin" />
      </div>
    );
  }

  // Si l'utilisateur n'a pas de forfait avec Hot-Seats
  if (permissions && !hasAccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-slide-up">
        <Card className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès non disponible
          </h1>
          <p className="text-gray-500 mb-6">
            Les Hot-Seats ne sont pas inclus dans votre forfait actuel.
          </p>
          
          <Link href="/app">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Calculer les infos de limitations
  const getHotSeatLimitInfo = () => {
    if (!permissions) return null;
    
    const { hotSeatLimit } = permissions;
    
    if (hotSeatLimit.type === "total") {
      const used = student?.hotseats_used || 0;
      const total = hotSeatLimit.total || 0;
      return {
        label: "Hot-Seat unique",
        description: `${used}/${total} utilisé`,
        remaining: total - used,
        isLimited: true,
      };
    }
    
    if (hotSeatLimit.type === "per_week") {
      const durationText = hotSeatLimit.durationMonths === null 
        ? "à vie" 
        : `pendant ${hotSeatLimit.durationMonths} mois`;
      
      return {
        label: "1 Hot-Seat par semaine",
        description: durationText,
        remaining: bookingCheck.allowed ? 1 : 0,
        isLimited: false,
      };
    }
    
    return null;
  };

  const hotSeatInfo = getHotSeatLimitInfo();

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectSlot = (slot: HotsetSlot) => {
    setSelectedSlot(slot);
    setShowConfirmModal(true);
  };

  const refetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("hotset_slots")
        .select(`
          id,
          coach_id,
          date,
          duration,
          is_available,
          coach:coach_id(name)
        `)
        .eq("is_available", true)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      if (error) throw error;

      const slotsWithCoach = (data || []).map((slot: any) => ({
        ...slot,
        coachName: slot.coach?.name || "Coach",
      }));

      setSlots(slotsWithCoach);
    } catch (err) {
      console.error("Error refetching slots:", err);
    }
  };

  const confirmBooking = async () => {
    if (!selectedSlot || isBooking || !user?.id || !bookingCheck.allowed) return;

    setIsBooking(true);
    
    // Enregistrer dans le système de permissions
    const recorded = await recordHotSeatBooking(user.id);
    
    if (!recorded) {
      setIsBooking(false);
      return;
    }

    // Créer la réservation dans le système
    const success = await createBooking(selectedSlot.id);
    setIsBooking(false);

    if (success) {
      await refetchSlots();
      
      // Recharger les permissions
      const newCheck = await canBookHotSeat(user.id);
      setBookingCheck(newCheck);
      const newPerms = await getUserPermissions(user.id);
      setPermissions(newPerms);
      const newStudent = await getStudentByUserId(user.id);
      setStudent(newStudent);
      
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Hot-Seat</h1>
        <p className="text-gray-500">
          Des sessions intensives de 15 minutes avec un expert.
        </p>
      </div>

      {/* Hero card with Hot-Seat info */}
      <Card variant="gradient" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Sessions Hot-Seat
              </h2>
              <p className="text-white/80">
                Workshops intensifs de 15 minutes avec un expert.
              </p>
            </div>
          </div>

          {/* Hot-Seat Limit Info */}
          {hotSeatInfo && (
            <div className="mt-4 p-4 bg-white/10 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-white/80" />
                  <div>
                    <p className="text-white font-medium">{hotSeatInfo.label}</p>
                    <p className="text-white/70 text-sm">{hotSeatInfo.description}</p>
                  </div>
                </div>
                {permissions?.packageName && (
                  <Badge className="bg-white/20 text-white border-0">
                    {permissions.packageName}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Alerte si ne peut pas réserver */}
          {!bookingCheck.allowed && (
            <div className="mt-4 p-3 bg-red-500/20 rounded-xl border border-red-400/30">
              <div className="flex items-center gap-2 text-white text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bookingCheck.reason}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Créneaux disponibles */}
      <div className="space-y-4">
        {/* Sélecteur de coach */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Choisis ton coach</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedCoach(null)}
              className={cn(
                "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                !selectedCoach
                  ? "border-orange bg-orange-50 text-orange"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              Tous les coachs
            </button>
            <button
              onClick={() => setSelectedCoach("e1383b4a-74f1-4f7f-a533-e92e74e21286")}
              className={cn(
                "p-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                selectedCoach === "e1383b4a-74f1-4f7f-a533-e92e74e21286"
                  ? "border-orange bg-orange-50 text-orange"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <div className="font-semibold">Martin</div>
              <div className="text-xs opacity-70">B2B</div>
            </button>
            <button
              onClick={() => setSelectedCoach("99d266c7-67d5-4a49-85d2-b26e7a73153f")}
              className={cn(
                "p-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                selectedCoach === "99d266c7-67d5-4a49-85d2-b26e7a73153f"
                  ? "border-orange bg-orange-50 text-orange"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <div className="font-semibold">Augustin</div>
              <div className="text-xs opacity-70">B2C</div>
            </button>
          </div>
        </Card>

        <h2 className="text-xl font-semibold text-gray-900">
          Créneaux disponibles
        </h2>

        {loadingSlots ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <Card variant="bordered" className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Aucun créneau disponible pour le moment
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {slots
              .filter((slot: any) => !selectedCoach || slot.coach_id === selectedCoach)
              .map((slot) => (
              <Card
                key={slot.id}
                variant="bordered"
                hover
                className="cursor-pointer"
                onClick={() => bookingCheck.allowed && handleSelectSlot(slot)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(slot.date)}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(slot.date)} • {slot.duration} min
                        {slot.coachName && (
                          <span className="text-gray-400"> • {slot.coachName}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!bookingCheck.allowed}
                  >
                    Réserver
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmer la réservation"
      >
        {selectedSlot && (
          <div className="space-y-6">
            {/* Session details */}
            <Card variant="bordered" className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Hot-Seat
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedSlot.duration} min
                    </span>
                    {selectedSlot.coachName && (
                      <span>• {selectedSlot.coachName}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Google Meet Link */}
            {selectedSlot.meeting_link && (
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Lien Google Meet</p>
                    <a 
                      href={selectedSlot.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-orange hover:underline truncate block"
                    >
                      Rejoindre le call →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Date/time */}
            <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{formatDate(selectedSlot.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>{formatTime(selectedSlot.date)}</span>
              </div>
            </div>

            {/* Warning for limited Hot-Seats */}
            {hotSeatInfo?.isLimited && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl text-amber-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">
                  Attention : vous n'avez qu'un seul Hot-Seat avec votre forfait.
                  Cette réservation utilisera votre unique Hot-Seat.
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500 text-center">
              Tu recevras un email de confirmation avec tous les détails.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={confirmBooking}
                disabled={isBooking || !bookingCheck.allowed}
                loading={isBooking}
              >
                Confirmer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSelectedSlot(null);
        }}
        title=""
      >
        <div className="text-center py-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hot-Seat réservé !
          </h2>
          <p className="text-gray-500 mb-6">
            Tu recevras un email de confirmation avec le lien de la session.
          </p>

          {/* Google Meet Button */}
          {selectedSlot?.meeting_link && (
            <div className="mb-6">
              <a
                href={selectedSlot.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-orange hover:bg-orange/90 text-white rounded-xl font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
                Rejoindre le Google Meet
              </a>
            </div>
          )}

          {selectedSlot && (
            <Card variant="bordered" className="p-4 mb-6 text-left">
              <p className="font-medium text-gray-900 mb-2">
                Hot-Seat • {selectedSlot.duration} min
                {selectedSlot.coachName && ` • ${selectedSlot.coachName}`}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(selectedSlot.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4" />
                <span>
                  {formatTime(selectedSlot.date)}
                </span>
              </div>
            </Card>
          )}

          <Button
            variant="gradient"
            className="w-full"
            onClick={() => {
              setShowSuccessModal(false);
              setSelectedSlot(null);
            }}
          >
            Parfait !
          </Button>
        </div>
      </Modal>
    </div>
  );
}
