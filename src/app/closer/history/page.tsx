"use client";

import { useState, useEffect } from "react";
import { useAuth, getInvitationsByCloser, PACKAGES, getPackageInfo, InvitationCode } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Search,
  Filter,
  Calendar,
  User,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "used" | "pending";

export default function HistoryPage() {
  const { user, isLoading } = useAuth();
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadInvitations = async () => {
      if (!user?.id || isLoading) {
        console.log("Cannot load invitations - user ID:", user?.id, "isLoading:", isLoading);
        setDataLoading(false);
        return;
      }

      try {
        console.log("Loading invitations for user:", user.id, "role:", user.role);
        setDataLoading(true);
        const myInvitations = await getInvitationsByCloser(user.id);
        console.log("Loaded invitations:", myInvitations.length);
        // Trier par date décroissante
        myInvitations.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setInvitations(myInvitations);
      } catch (error) {
        console.error("Erreur lors du chargement des invitations:", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (mounted && !isLoading) {
      loadInvitations();
    }
  }, [user?.id, isLoading, mounted]);

  if (!mounted || isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  // Filtrer les invitations
  const filteredInvitations = invitations.filter((inv) => {
    // Filtre par statut
    if (filter === "used" && !inv.used) return false;
    if (filter === "pending" && inv.used) return false;

    // Filtre par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        inv.code.toLowerCase().includes(searchLower) ||
        inv.used_by_name?.toLowerCase().includes(searchLower) ||
        getPackageInfo(inv.package_type).name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyLink = async (code: string) => {
    const url = `${window.location.origin}/auth/register?invite=${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Stats
  const totalLinks = invitations.length;
  const usedLinks = invitations.filter((inv) => inv.used).length;
  const pendingLinks = totalLinks - usedLinks;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Historique</h1>
        <p className="text-gray-500">
          Retrouve tous tes liens d&apos;invitation et leur statut.
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className={cn(
            "p-4 cursor-pointer transition-all",
            filter === "all" ? "border-2 border-emerald-500" : ""
          )}
          onClick={() => setFilter("all")}
        >
          <div className="flex items-center gap-3">
            <Link2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xl font-bold text-gray-900">{totalLinks}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </Card>

        <Card
          className={cn(
            "p-4 cursor-pointer transition-all",
            filter === "used" ? "border-2 border-emerald-500" : ""
          )}
          onClick={() => setFilter("used")}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xl font-bold text-gray-900">{usedLinks}</p>
              <p className="text-xs text-gray-500">Utilisés</p>
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
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xl font-bold text-gray-900">{pendingLinks}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par code, nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste des invitations */}
      {filteredInvitations.length > 0 ? (
        <div className="space-y-3">
          {filteredInvitations.map((inv) => (
            <Card key={inv.id} variant="bordered" className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Info principale */}
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    inv.used ? "bg-green-100" : "bg-amber-100"
                  )}>
                    {inv.used ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-amber-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-lg font-bold text-gray-900">
                        {inv.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(inv.code)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Copier le code"
                      >
                        {copiedCode === inv.code ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="text-gray-600">
                        {getPackageInfo(inv.package_type).description}
                      </span>
                      {inv.coins_amount > 0 && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Coins className="w-4 h-4" />
                          {inv.coins_amount.toLocaleString()} coins
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(inv.created_at)}
                      </span>
                    </div>

                    {inv.used && inv.used_by_name && (
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">
                          Utilisé par {inv.used_by_name}
                        </span>
                        {inv.used_at && (
                          <span className="text-gray-400">
                            • {formatDate(inv.used_at)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 lg:flex-shrink-0">
                  <Badge
                    variant={inv.package_type === "15000" ? "gradient" : "default"}
                    className={inv.package_type === "15000" ? "bg-gradient-to-r from-emerald-500 to-teal-600" : ""}
                  >
                    {getPackageInfo(inv.package_type).name}
                  </Badge>

                  {!inv.used && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(inv.code)}
                    >
                      {copiedCode === inv.code ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copié
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copier lien
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="bordered" className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {search || filter !== "all"
              ? "Aucun résultat"
              : "Aucune invitation"}
          </h3>
          <p className="text-gray-500">
            {search || filter !== "all"
              ? "Essaie de modifier tes filtres"
              : "Commence par générer un lien d'invitation"}
          </p>
        </Card>
      )}
    </div>
  );
}

