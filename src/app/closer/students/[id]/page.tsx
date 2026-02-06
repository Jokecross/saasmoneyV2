"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  getStudentById, 
  unlockCoinsForStudent, 
  PACKAGES, 
  getPackageInfo,
  StudentRecord,
  PaymentRecord 
} from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  ArrowLeft,
  Coins,
  Calendar,
  Mail,
  User,
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  History,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockAmount, setUnlockAmount] = useState(1000);
  const [unlockNote, setUnlockNote] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadStudent = async () => {
      const studentData = await getStudentById(resolvedParams.id);
      setStudent(studentData);
    };
    loadStudent();
  }, [resolvedParams.id]);

  if (!mounted) return null;

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Élève non trouvé</h1>
        <Link href="/closer/students">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  const pkg = getPackageInfo(student.package_type);
  const paymentProgress = Math.round((student.total_paid / student.total_price) * 100);
  const coinsProgress = student.total_coins > 0 
    ? Math.round((student.coins_unlocked / student.total_coins) * 100)
    : 100;
  const remainingToUnlock = student.total_coins - student.coins_unlocked;
  const remainingToPay = student.total_price - student.total_paid;
  // Permettre le déblocage s'il reste des paiements OU des coins à débloquer
  const canUnlock = remainingToPay > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleUnlockCoins = async () => {
    if (!student || unlockAmount <= 0) return;
    
    setIsUnlocking(true);
    
    const success = await unlockCoinsForStudent(student.id, unlockAmount, unlockNote || undefined);
    
    if (success) {
      // Recharger les données de l'étudiant
      const updatedStudent = await getStudentById(student.id);
      if (updatedStudent) {
        setStudent(updatedStudent);
      }
    }
    
    setShowUnlockModal(false);
    setUnlockAmount(1000);
    setUnlockNote("");
    setIsUnlocking(false);
  };

  const getStatusBadge = () => {
    const progress = student.total_paid / student.total_price;
    
    if (progress >= 1) {
      return <Badge variant="green">Paiement complet</Badge>;
    } else if (progress > 0) {
      return <Badge variant="orange">Paiement en cours</Badge>;
    } else {
      return <Badge variant="default">En attente de paiement</Badge>;
    }
  };

  // Fonction pour obtenir les paliers de paiement suggérés
  const getPaymentInstallments = (packageType: string): number[] => {
    switch (packageType) {
      case "3000":
        return [1000, 1000, 1000]; // 3 fois
      case "5000":
        return [1000, 1000, 1000, 1000, 1000]; // 5 fois
      case "15000":
        return [3000, 5000, 7000]; // Flexible
      default:
        return [1000, 2000, 3000, 5000]; // Par défaut
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/closer/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>

      {/* Profil élève */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {(student.user?.name || "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {student.user?.name || "Utilisateur"}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Mail className="w-4 h-4" />
                <span>{student.user?.email || "Email non disponible"}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <Badge variant="default">{pkg.name}</Badge>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Inscrit le</p>
            <p className="font-medium text-gray-900">{formatShortDate(student.created_at)}</p>
          </div>
        </div>
      </Card>

      {/* Stats principales */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Progression paiement */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Paiement</h3>
              <p className="text-sm text-gray-500">{pkg.price}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progression</span>
              <span className="font-semibold text-gray-900">{paymentProgress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  paymentProgress >= 100 ? "bg-green-500" : "bg-blue-500"
                )}
                style={{ width: `${paymentProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {student.total_paid.toLocaleString()}€ payés
              </span>
              <span className="text-gray-500">
                {remainingToPay > 0 ? `${remainingToPay.toLocaleString()}€ restants` : "Complet ✓"}
              </span>
            </div>
          </div>
        </Card>

        {/* Coins débloqués OU Gestion des paiements */}
        {student.total_coins > 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Coins</h3>
                  <p className="text-sm text-gray-500">{student.oneToOneCount || pkg.oneToOneCount} One to One</p>
                </div>
              </div>
              {canUnlock && (
                <Button 
                  variant="gradient" 
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600"
                  onClick={() => setShowUnlockModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Débloquer
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Débloqués</span>
                <span className="font-semibold text-emerald-600">
                  {student.coins_unlocked.toLocaleString()} / {student.total_coins.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${coinsProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 font-medium">
                  {student.coins_available.toLocaleString()} disponibles
                </span>
                <span className="text-gray-500">
                  {remainingToUnlock > 0 ? `${remainingToUnlock.toLocaleString()} à débloquer` : "Tous débloqués ✓"}
                </span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Paiement progressif</h3>
                  <p className="text-sm text-gray-500">Paiement en {pkg.paymentInstallments || 1} fois</p>
                </div>
              </div>
              {canUnlock && (
                <Button 
                  variant="gradient" 
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-600"
                  onClick={() => setShowUnlockModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Enregistrer un paiement
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="font-semibold text-blue-600">{paymentProgress}%</span>
                </div>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {student.total_paid.toLocaleString()}€ payés
                  </span>
                  <span className="text-xs text-gray-500">
                    {remainingToPay > 0 ? `${remainingToPay.toLocaleString()}€ restants` : "Complet ✓"}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm font-medium text-purple-700 mb-1">Avantages inclus :</p>
                <p className="text-sm text-purple-600">{pkg.description}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Forfait détails */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-600" />
          Détails du forfait
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Forfait</p>
            <p className="font-semibold text-gray-900">{pkg.name}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Prix total</p>
            <p className="font-semibold text-gray-900">{pkg.price}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Avantages</p>
            <p className="font-semibold text-gray-900">{pkg.description}</p>
          </div>
        </div>
      </Card>

      {/* Historique des paiements */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-600" />
          Historique des déblocages
        </h3>

        {student.payments.length > 0 ? (
          <div className="space-y-3">
            {student.payments.map((payment, index) => (
              <div 
                key={payment.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      +{payment.coins_unlocked.toLocaleString()} coins débloqués
                    </p>
                    <p className="text-sm text-gray-500">
                      {payment.note || `Paiement de ${payment.amount}€`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">+{payment.amount}€</p>
                  <p className="text-xs text-gray-400">{formatShortDate(payment.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun paiement enregistré</p>
            {canUnlock && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowUnlockModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Enregistrer un paiement
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Modal déblocage coins / paiement */}
      <Modal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        title={student.total_coins > 0 ? "Débloquer des coins" : "Enregistrer un paiement"}
      >
        <div className="space-y-6">
          <div className={cn(
            "p-4 rounded-xl",
            student.total_coins > 0 ? "bg-emerald-50" : "bg-blue-50"
          )}>
            <p className={cn(
              "text-sm",
              student.total_coins > 0 ? "text-emerald-700" : "text-blue-700"
            )}>
              {student.total_coins > 0 ? (
                <>
                  <strong>{student.user?.name || "L'élève"}</strong> a encore <strong>{remainingToUnlock.toLocaleString()} coins</strong> à débloquer.
                  <br />
                  {student.package_type === "5000" ? (
                    <>Rappel : 500 coins = 1 One of One (offre spéciale 5000€)</>
                  ) : (
                    <>Rappel : 1000€ = 1000 coins = 1 One of One</>
                  )}
                </>
              ) : (
                <>
                  <strong>{student.user?.name || "L'élève"}</strong> a encore <strong>{remainingToPay.toLocaleString()}€</strong> à payer.
                  <br />
                  Forfait : {pkg.name} - Paiement en {pkg.paymentInstallments || 1} fois
                </>
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant du paiement (€)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {getPaymentInstallments(student.package_type).map((amount, index) => (
                <button
                  key={index}
                  onClick={() => setUnlockAmount(amount)}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-sm font-medium transition-all",
                    unlockAmount === amount
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  )}
                >
                  {amount.toLocaleString()}€
                </button>
              ))}
            </div>
            <input
              type="number"
              value={unlockAmount}
              onChange={(e) => setUnlockAmount(Number(e.target.value))}
              min={0}
              max={student.total_coins > 0 ? Math.min(remainingToUnlock, remainingToPay) : remainingToPay}
              step={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (optionnel)
            </label>
            <input
              type="text"
              value={unlockNote}
              onChange={(e) => setUnlockNote(e.target.value)}
              placeholder="Ex: Paiement mensuel janvier"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Coins à débloquer</span>
              <span className="font-bold text-emerald-600">
                +{Math.min(unlockAmount, remainingToUnlock).toLocaleString()} coins
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowUnlockModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="gradient"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
              onClick={handleUnlockCoins}
              disabled={isUnlocking || unlockAmount <= 0}
            >
              {isUnlocking ? "Déblocage..." : "Confirmer le déblocage"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
