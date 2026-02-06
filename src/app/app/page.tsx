"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useOneOfOneBookings, useHotsetBookings } from "@/hooks/use-bookings";
import {
  MessageSquare,
  Phone,
  Flame,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";

const sections = [
  {
    href: "/app/saas-money",
    icon: MessageSquare,
    title: "SaaS Money",
    subtitle: "IA Coach",
    description:
      "Pose tes questions business et obtiens des réponses personnalisées de notre IA.",
    gradient: true,
  },
  {
    href: "/app/one-of-one",
    icon: Phone,
    title: "One of One Calls",
    subtitle: "Réservation",
    description:
      "Réserve un call 1:1 pour un accompagnement personnalisé en échange de Coins.",
    gradient: false,
  },
  {
    href: "/app/hotset",
    icon: Flame,
    title: "HotSet",
    subtitle: "Sessions",
    description:
      "Réserve une session HotSet pour booster ton business en un temps record.",
    gradient: false,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { bookings: oneOfOneBookings, isLoading: loadingOneOfOne } = useOneOfOneBookings(user?.id);
  const { bookings: hotsetBookings, isLoading: loadingHotset } = useHotsetBookings(user?.id);

  const isLoading = loadingOneOfOne || loadingHotset;

  // Combine and sort bookings by date
  const allBookings = [
    ...oneOfOneBookings.map((b) => ({
      id: b.id,
      type: "one-of-one" as const,
      title: "Call 1:1",
      date: new Date(b.slot?.date || b.created_at),
      status: b.status,
    })),
    ...hotsetBookings.map((b) => ({
      id: b.id,
      type: "hotset" as const,
      title: `HotSet - ${(b.slot as any)?.type?.name || "Session"}`,
      date: new Date(b.slot?.date || b.created_at),
      status: b.status,
    })),
  ]
    .filter((b) => new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      {/* Welcome section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Salut, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500">
          Bienvenue sur SaaS Money. Que veux-tu accomplir aujourd&apos;hui ?
        </p>
      </div>

      {/* Main highlight - SaaS Money IA */}
      <Card variant="gradient" hover className="group cursor-pointer">
        <Link href="/app/saas-money" className="block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Pose ta question à l&apos;IA
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Coach, Growth, Produit, Copywriting — L&apos;IA est là pour t&apos;aider
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </Card>

      {/* Sections grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <Link key={section.href} href={section.href}>
            <Card
              hover
              className={`h-full group ${
                section.gradient ? "bg-gradient-primary text-white" : ""
              } stagger-${index + 1} animate-slide-up`}
            >
              <div className="flex flex-col h-full">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                    section.gradient
                      ? "bg-white/20"
                      : "bg-gradient-primary shadow-soft"
                  }`}
                >
                  <section.icon
                    className={`w-6 h-6 ${section.gradient ? "text-white" : "text-white"}`}
                  />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3
                    className={`text-lg font-semibold ${
                      section.gradient ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {section.title}
                  </h3>
                  <Badge
                    variant={section.gradient ? "default" : "gradient"}
                    size="sm"
                    className={section.gradient ? "bg-white/20 text-white" : ""}
                  >
                    {section.subtitle}
                  </Badge>
                </div>

                <p
                  className={`text-sm flex-1 ${
                    section.gradient ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {section.description}
                </p>

                <div
                  className={`flex items-center gap-2 mt-4 text-sm font-medium ${
                    section.gradient ? "text-white" : "text-magenta"
                  }`}
                >
                  Accéder
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Prochaines réservations
          </h2>
          <Link
            href="/app/one-of-one"
            className="text-sm text-magenta hover:underline font-medium"
          >
            Voir tout
          </Link>
        </div>

        {isLoading ? (
          <Card variant="bordered" className="text-center py-8">
            <Loader2 className="w-8 h-8 text-magenta mx-auto animate-spin" />
            <p className="text-gray-500 mt-2">Chargement...</p>
          </Card>
        ) : allBookings.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {allBookings.map((booking) => (
              <Card key={booking.id} variant="bordered" className="group">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      booking.type === "one-of-one"
                        ? "bg-magenta-100"
                        : "bg-orange-100"
                    }`}
                  >
                    {booking.type === "one-of-one" ? (
                      <Phone
                        className={`w-6 h-6 ${
                          booking.type === "one-of-one"
                            ? "text-magenta"
                            : "text-orange"
                        }`}
                      />
                    ) : (
                      <Flame className="w-6 h-6 text-orange" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{booking.title}</h3>
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

                  <Badge variant="magenta" size="sm">
                    {booking.status === "confirmed" ? "Confirmé" : booking.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="bordered" className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune réservation à venir</p>
            <Link href="/app/one-of-one">
              <Button variant="outline" size="sm" className="mt-4">
                Réserver un call
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
