"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, getUserPermissions, canBookOneOfOne, recordOneOfOneBooking, UserPermissions } from "@/lib/auth-context";
import { useOneOfOneSlots, useOneOfOneBookings, useAppSettings, OneOfOneSlot } from "@/hooks/use-bookings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Phone,
  Coins,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OneOfOnePage() {
  const { user, refreshProfile } = useAuth();
  const { slots, isLoading: loadingSlots, refetch: refetchSlots } = useOneOfOneSlots();
  const { createBooking } = useOneOfOneBookings(user?.id);
  const { settings } = useAppSettings();
  
  const [selectedSlot, setSelectedSlot] = useState<OneOfOneSlot | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  // États async pour permissions
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
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

      const check = await canBookOneOfOne(user.id);
      setBookingCheck(check);
      
      setLoadingPermissions(false);
    };
    loadPermissions();
  }, [user?.id]);

  const isAdmin = user?.role === "admin";
  const hasAccess = permissions?.canAccessOneOfOne || isAdmin;

  // Loading state
  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-magenta animate-spin" />
      </div>
    );
  }

  // Si l'utilisateur n'a pas accès, afficher un message
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
            Les One of One Calls ne sont pas inclus dans votre forfait actuel.
            <br />
            <span className="text-sm">
              Cette fonctionnalité est disponible avec les forfaits <strong>5000€</strong> et <strong>15000€</strong>.
            </span>
          </p>
          
          {permissions.packageName && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Votre forfait actuel</p>
              <p className="font-semibold text-gray-900">{permissions.packageName}</p>
            </div>
          )}

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

  const COIN_COST = 1000;

  // Group slots by date
  const getWeekDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + currentWeekOffset * 7);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Filtrer les slots par coach sélectionné
  const filteredSlots = selectedCoach 
    ? slots.filter((slot: any) => slot.coach_id === selectedCoach)
    : slots;

  const getSlotsByDate = (date: Date) => {
    return filteredSlots.filter((slot) => {
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

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleBookSlot = (slot: OneOfOneSlot) => {
    setSelectedSlot(slot);
    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedSlot || !bookingCheck.allowed || isBooking || !user?.id) return;

    setIsBooking(true);
    
    // Enregistrer la réservation
    const recorded = await recordOneOfOneBooking(user.id);
    
    if (!recorded) {
      setIsBooking(false);
      return;
    }

    // Créer la réservation
    const success = await createBooking(selectedSlot.id, COIN_COST);
    setIsBooking(false);

    if (success) {
      await refreshProfile();
      await refetchSlots();
      
      // Recharger les permissions
      const newCheck = await canBookOneOfOne(user.id);
      setBookingCheck(newCheck);
      const newPerms = await getUserPermissions(user.id);
      setPermissions(newPerms);
      
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">One of One Calls</h1>
        <p className="text-gray-500">
          Réserve un call 1:1 pour un accompagnement personnalisé.
        </p>
      </div>

      {/* One of One balance card */}
      <Card className="bg-gradient-primary text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Tes One of One</p>
              <p className="text-3xl font-bold">
                {permissions?.oneOfOneLimit.available || 0}
                <span className="text-lg font-normal text-white/70">
                  {" "}/ {permissions?.oneOfOneLimit.total || 0}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-xs">Débloqués</p>
            <p className="text-lg font-semibold">
              {permissions?.oneOfOneLimit.unlocked || 0} / {permissions?.oneOfOneLimit.total || 0}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <Coins className="w-4 h-4" />
              <span>
                1 One of One = <strong>{user?.package_type === "5000" ? "500" : "1000"} Coins</strong> (
                {user?.package_type === "5000" || user?.package_type === "15000" ? "1h30" : "30 min"})
              </span>
            </div>
            {permissions && permissions.oneOfOneLimit.unlocked < permissions.oneOfOneLimit.total && (
              <span className="text-white/60 text-xs">
                {permissions.oneOfOneLimit.total - permissions.oneOfOneLimit.unlocked} à débloquer
              </span>
            )}
          </div>
        </div>

        {/* Alerte si pas de coins disponibles */}
        {!bookingCheck.allowed && (
          <div className="mt-4 p-3 bg-white/10 rounded-xl">
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{bookingCheck.reason}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Calendar navigation */}
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
                  ? "border-magenta bg-magenta-50 text-magenta"
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
                  ? "border-magenta bg-magenta-50 text-magenta"
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
                  ? "border-magenta bg-magenta-50 text-magenta"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <div className="font-semibold">Augustin</div>
              <div className="text-xs opacity-70">B2C</div>
            </button>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Créneaux disponibles
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm text-gray-500 min-w-[120px] text-center">
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
              disabled={currentWeekOffset >= 4}
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
      </div>

      {/* Calendar grid */}
      {loadingSlots ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-magenta animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const daySlots = getSlotsByDate(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const today = isToday(date);

            return (
              <div key={index} className="space-y-2">
                {/* Day header */}
                <div
                  className={cn(
                    "text-center py-3 rounded-2xl",
                    today
                      ? "bg-gradient-primary text-white"
                      : isWeekend
                      ? "bg-gray-50 text-gray-400"
                      : "bg-gray-100"
                  )}
                >
                  <p className="text-xs uppercase font-medium">
                    {formatDayName(date)}
                  </p>
                  <p className="text-lg font-bold">{formatDayNumber(date)}</p>
                </div>

                {/* Slots */}
                <div className="space-y-2">
                  {isWeekend ? (
                    <p className="text-xs text-gray-400 text-center py-4">-</p>
                  ) : daySlots.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Pas de créneau
                    </p>
                  ) : (
                    daySlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.is_available && handleBookSlot(slot)}
                        disabled={!slot.is_available}
                        className={cn(
                          "w-full py-2 px-2 rounded-xl text-xs font-medium transition-all duration-200",
                          slot.is_available
                            ? "bg-white border-2 border-magenta/20 text-magenta hover:border-magenta hover:shadow-soft"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                        title={slot.coachName ? `Avec ${slot.coachName}` : undefined}
                      >
                        <div className="text-center">
                          <div>{formatTime(slot.date)}</div>
                          {slot.coachName && (
                            <div className={cn(
                              "text-[9px] mt-0.5 truncate",
                              slot.is_available ? "text-magenta/60" : "text-gray-300"
                            )}>
                              {slot.coachName.split(" ")[0]}
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-magenta/20 bg-white" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100" />
          <span>Réservé</span>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmer la réservation"
      >
        {selectedSlot && (
          <div className="space-y-6">
            {/* Slot details */}
            <Card variant="bordered" className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-magenta-100 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-magenta" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Call 1:1
                    {selectedSlot.coachName && (
                      <span className="font-normal text-gray-500"> avec {selectedSlot.coachName}</span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatFullDate(selectedSlot.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(selectedSlot.date)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Google Meet Link */}
            {selectedSlot.meeting_link && (
              <div className="p-4 bg-magenta-50 rounded-2xl border border-magenta-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-magenta-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-magenta" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Lien Google Meet</p>
                    <a 
                      href={selectedSlot.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-magenta hover:underline truncate block"
                    >
                      Rejoindre le call →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Cost */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-gray-600">Coût</span>
              <Badge variant="gradient" className="text-base px-4 py-1">
                1 One of One
              </Badge>
            </div>

            {/* Balance after */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-gray-600">One of One restants après</span>
              <span
                className={cn(
                  "font-semibold",
                  bookingCheck.allowed ? "text-gray-900" : "text-red-500"
                )}
              >
                {(permissions?.oneOfOneLimit.available || 0) - 1} / {permissions?.oneOfOneLimit.total || 0}
              </span>
            </div>

            {/* Error if cannot book */}
            {!bookingCheck.allowed && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">
                  {bookingCheck.reason}
                </p>
              </div>
            )}

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
                disabled={!bookingCheck.allowed || isBooking}
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
            Réservation confirmée !
          </h2>
          <p className="text-gray-500 mb-6">
            Tu recevras un email de confirmation avec le lien du call.
          </p>

          {/* Google Meet Button */}
          {selectedSlot?.meeting_link && (
            <div className="mb-6">
              <a
                href={selectedSlot.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-magenta hover:bg-magenta/90 text-white rounded-xl font-medium transition-colors"
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
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatFullDate(selectedSlot.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm mt-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{formatTime(selectedSlot.date)} (30 min)</span>
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
