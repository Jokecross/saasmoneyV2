"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, getStudentsByCloser, PACKAGES, getPackageInfo, StudentRecord } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Coins,
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "pending" | "partial" | "complete";

export default function StudentsPage() {
  const { user, isLoading } = useAuth();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (!user?.id || isLoading) {
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        const myStudents = await getStudentsByCloser(user.id);
        // Trier par date décroissante
        myStudents.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setStudents(myStudents);
      } catch (error) {
        console.error("Erreur lors du chargement des élèves:", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (mounted && !isLoading) {
      loadStudents();
    }
  }, [user?.id, isLoading, mounted]);

  if (!mounted || isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des élèves...</p>
        </div>
      </div>
    );
  }

  // Filtrer les élèves
  const filteredStudents = students.filter((student) => {
    // Filtre par statut de paiement
    const paymentProgress = student.total_paid / student.total_price;
    
    if (filter === "pending" && paymentProgress > 0) return false;
    if (filter === "partial" && (paymentProgress === 0 || paymentProgress >= 1)) return false;
    if (filter === "complete" && paymentProgress < 1) return false;

    // Filtre par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        (student.user?.name || "").toLowerCase().includes(searchLower) ||
        (student.user?.email || "").toLowerCase().includes(searchLower) ||
        getPackageInfo(student.package_type).name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Stats
  const totalStudents = students.length;
  const pendingStudents = students.filter((s) => s.total_paid === 0).length;
  const partialStudents = students.filter((s) => s.total_paid > 0 && s.total_paid < s.total_price).length;
  const completeStudents = students.filter((s) => s.total_paid >= s.total_price).length;

  const getStatusBadge = (student: StudentRecord) => {
    const progress = student.total_paid / student.total_price;
    
    if (progress >= 1) {
      return <Badge variant="green" size="sm">Complet</Badge>;
    } else if (progress > 0) {
      return <Badge variant="orange" size="sm">En cours</Badge>;
    } else {
      return <Badge variant="default" size="sm">En attente</Badge>;
    }
  };

  const getProgressColor = (student: StudentRecord) => {
    const progress = student.total_paid / student.total_price;
    if (progress >= 1) return "bg-green-500";
    if (progress > 0) return "bg-amber-500";
    return "bg-gray-300";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Mes Élèves</h1>
        <p className="text-gray-500">
          Gère tes élèves et débloque leurs coins au fur et à mesure des paiements.
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className={cn(
            "p-4 cursor-pointer transition-all",
            filter === "all" ? "border-2 border-emerald-500" : ""
          )}
          onClick={() => setFilter("all")}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </Card>

        <Card
          className={cn(
            "p-4 cursor-pointer transition-all",
            filter === "pending" ? "border-2 border-emerald-500" : ""
          )}
          onClick={() => setFilter("pending")}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xl font-bold text-gray-900">{pendingStudents}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </Card>

        <Card
          className={cn(
            "p-4 cursor-pointer transition-all",
            filter === "partial" ? "border-2 border-emerald-500" : ""
          )}
          onClick={() => setFilter("partial")}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xl font-bold text-gray-900">{partialStudents}</p>
              <p className="text-xs text-gray-500">En cours</p>
            </div>
          </div>
        </Card>

        <Card
          className={cn(
            "p-4 cursor-pointer transition-all",
            filter === "complete" ? "border-2 border-emerald-500" : ""
          )}
          onClick={() => setFilter("complete")}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xl font-bold text-gray-900">{completeStudents}</p>
              <p className="text-xs text-gray-500">Complets</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Liste des élèves */}
      {filteredStudents.length > 0 ? (
        <div className="space-y-3">
          {filteredStudents.map((student) => {
            const pkg = getPackageInfo(student.package_type);
            const progressPercent = Math.round((student.total_paid / student.total_price) * 100);
            const coinsProgress = student.total_coins > 0 
              ? Math.round((student.coins_unlocked / student.total_coins) * 100)
              : 100;

            return (
              <Link key={student.id} href={`/closer/students/${student.id}`}>
                <Card variant="bordered" className="p-5 hover:border-emerald-200 transition-all cursor-pointer">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Info principale */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-emerald-600">
                          {(student.user?.name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {student.user?.name || "Utilisateur"}
                          </span>
                          {getStatusBadge(student)}
                        </div>

                        <p className="text-sm text-gray-500 mb-2">
                          {student.user?.email || "Email non disponible"}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <Badge variant="default">{pkg.name}</Badge>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(student.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Stats */}
                    <div className="flex items-center gap-6 lg:flex-shrink-0">
                      {/* Paiement */}
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Paiement</p>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", getProgressColor(student))}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {progressPercent}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {student.total_paid.toLocaleString()}€ / {student.total_price.toLocaleString()}€
                        </p>
                      </div>

                      {/* Coins (si applicable) */}
                      {student.total_coins > 0 && (
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Coins</p>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-emerald-600">
                              {student.coins_unlocked.toLocaleString()}
                            </span>
                            <span className="text-gray-400">
                              / {student.total_coins.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card variant="bordered" className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {search || filter !== "all"
              ? "Aucun résultat"
              : "Aucun élève"}
          </h3>
          <p className="text-gray-500 mb-4">
            {search || filter !== "all"
              ? "Essaie de modifier tes filtres"
              : "Les élèves qui s'inscrivent via tes liens apparaîtront ici"}
          </p>
          {!search && filter === "all" && (
            <Link href="/closer/generate">
              <Button variant="gradient" className="bg-gradient-to-r from-emerald-500 to-teal-600">
                Générer un lien d&apos;invitation
              </Button>
            </Link>
          )}
        </Card>
      )}
    </div>
  );
}
