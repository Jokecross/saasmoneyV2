"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, getInvitationsByCloser, getStudentsByCloser, PACKAGES, getPackageInfo, InvitationCode, StudentRecord } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  Users,
  Coins,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";

export default function CloserDashboardPage() {
  const { user, isLoading } = useAuth();
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || isLoading) {
        setDataLoading(false);
        return;
      }
      
      try {
        setDataLoading(true);
        
        // Charger les invitations du closer
        const myInvitations = await getInvitationsByCloser(user.id);
        setInvitations(myInvitations);
        
        // Charger les élèves
        const myStudents = await getStudentsByCloser(user.id);
        setStudents(myStudents);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setDataLoading(false);
      }
    };
    
    if (mounted && !isLoading) {
      loadData();
    }
  }, [user?.id, isLoading, mounted]);

  if (!mounted || isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Stats
  const totalLinks = invitations.length;
  const usedLinks = invitations.filter((inv) => inv.used).length;
  const pendingLinks = totalLinks - usedLinks;
  const totalCoinsGenerated = invitations
    .filter((inv) => inv.used)
    .reduce((sum, inv) => sum + inv.coins_amount, 0);
  
  // Stats élèves
  const totalStudents = students.length;
  const studentsNeedingAction = students.filter(
    (s) => s.total_coins > 0 && s.coins_unlocked < s.total_coins
  ).length;

  // Dernières invitations
  const recentInvitations = [...invitations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Salut, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500">
          Bienvenue dans ton espace Closer. Génère des liens d&apos;invitation pour tes prospects.
        </p>
      </div>

      {/* CTAs Principaux */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <Link href="/closer/generate" className="block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Link2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Générer un lien
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Crée un lien pour ton prochain client
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white opacity-60" />
            </div>
          </Link>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <Link href="/closer/students" className="block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Mes Élèves
                    {studentsNeedingAction > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-white/30 rounded-full">
                        {studentsNeedingAction} en attente
                      </span>
                    )}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Gère les paiements et déblocages
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white opacity-60" />
            </div>
          </Link>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalLinks}</p>
              <p className="text-sm text-gray-500">Liens créés</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{usedLinks}</p>
              <p className="text-sm text-gray-500">Inscriptions</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingLinks}</p>
              <p className="text-sm text-gray-500">En attente</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Coins className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCoinsGenerated.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Coins générés</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Forfaits disponibles */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Forfaits disponibles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(PACKAGES).map(([key, pkg]) => (
            <Card key={key} className="p-5 border-2 border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-6 h-6 text-emerald-600" />
                <Badge variant="gradient" className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  {pkg.price}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {pkg.description}
              </p>
              {pkg.coins > 0 && (
                <p className="text-lg font-bold text-emerald-600 mt-2">
                  {pkg.coins.toLocaleString()} <span className="text-sm font-normal text-gray-500">coins</span>
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Dernières invitations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Dernières invitations</h2>
          <Link
            href="/closer/history"
            className="text-sm text-emerald-600 hover:underline font-medium"
          >
            Voir tout
          </Link>
        </div>

        {recentInvitations.length > 0 ? (
          <div className="space-y-3">
            {recentInvitations.map((inv) => (
              <Card key={inv.id} variant="bordered" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      inv.used ? "bg-green-100" : "bg-amber-100"
                    }`}>
                      {inv.used ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        {inv.code}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getPackageInfo(inv.package_type).name}
                        {inv.coins_amount > 0 && ` • ${inv.coins_amount.toLocaleString()} coins`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {inv.used ? (
                      <>
                        <p className="text-sm font-medium text-green-600">Utilisé</p>
                        <p className="text-xs text-gray-400">
                          par {inv.used_by_name}
                        </p>
                      </>
                    ) : (
                      <Badge variant="orange" size="sm">En attente</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="bordered" className="text-center py-12">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Aucune invitation créée
            </h3>
            <p className="text-gray-500 mb-4">
              Génère ton premier lien d&apos;invitation pour commencer
            </p>
            <Link href="/closer/generate">
              <Button variant="gradient" className="bg-gradient-to-r from-emerald-500 to-teal-600">
                Créer un lien
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

