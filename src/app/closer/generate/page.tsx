"use client";

import { useState } from "react";
import { useAuth, PACKAGES, PackageType, generateInviteCode, saveInvitation, getPackageInfo, InvitationCode } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Link2,
  Target,
  Check,
  Copy,
  Share2,
  CheckCircle,
  Coins,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GenerateLinkPage() {
  const { user, isLoading } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [generatedInvitation, setGeneratedInvitation] = useState<InvitationCode | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    if (!selectedPackage || !user) return;

    setGenerating(true);
    setError(null);

    try {
      const code = generateInviteCode();
      const pkg = PACKAGES[selectedPackage];

      const invitationData = {
        code,
        closer_id: user.id,
        package_type: selectedPackage,
        coins_amount: pkg.coins,
        used: false,
      };

      const savedInvitation = await saveInvitation(invitationData);
      
      if (savedInvitation) {
        // Add display data
        const invitation: InvitationCode = {
          ...savedInvitation,
          closer: { name: user.name },
        };
        setGeneratedInvitation(invitation);
        setShowSuccessModal(true);
        setCopied(false);
      } else {
        console.error("Échec de la sauvegarde de l'invitation:", invitationData);
        setError("Erreur lors de la génération du lien. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de la génération:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setGenerating(false);
    }
  };

  const getInviteUrl = (code: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/auth/register?invite=${code}`;
    }
    return `https://saasmoney.fr/auth/register?invite=${code}`;
  };

  const handleCopyLink = async () => {
    if (!generatedInvitation) return;
    
    const url = getInviteUrl(generatedInvitation.code);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = async () => {
    if (!generatedInvitation) return;
    
    await navigator.clipboard.writeText(generatedInvitation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!generatedInvitation) return;
    
    const url = getInviteUrl(generatedInvitation.code);
    const pkg = getPackageInfo(generatedInvitation.package_type);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Inscription SaaS Money",
          text: `Rejoins SaaS Money avec le ${pkg.name} ! ${pkg.description}. Utilise ce lien :`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleNewLink = () => {
    setShowSuccessModal(false);
    setGeneratedInvitation(null);
    setSelectedPackage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Générer un lien</h1>
        <p className="text-gray-500">
          Sélectionne le forfait pour créer un lien d&apos;invitation personnalisé.
        </p>
      </div>

      {/* Package Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          1. Choisis le forfait
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(PACKAGES).map(([key, pkg]) => {
            const isSelected = selectedPackage === key;
            
            return (
              <Card
                key={key}
                onClick={() => setSelectedPackage(key as PackageType)}
                className={cn(
                  "p-6 cursor-pointer transition-all duration-200",
                  isSelected
                    ? "border-2 border-emerald-500 shadow-lg shadow-emerald-100"
                    : "border-2 border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isSelected ? "bg-emerald-500" : "bg-emerald-100"
                  )}>
                    <Target className={cn(
                      "w-6 h-6",
                      isSelected ? "text-white" : "text-emerald-600"
                    )} />
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {pkg.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 min-h-[40px]">
                  {pkg.description}
                </p>

                {pkg.coins > 0 && (
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-emerald-600">
                      {pkg.coins.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">coins</span>
                  </div>
                )}

                <Badge 
                  variant={isSelected ? "gradient" : "default"}
                  className={isSelected ? "bg-gradient-to-r from-emerald-500 to-teal-600" : ""}
                >
                  {pkg.price}
                </Badge>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          2. Génère le lien
        </h2>

        <Card className="p-6">
          {selectedPackage ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl">
                <Gift className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {PACKAGES[selectedPackage].name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {PACKAGES[selectedPackage].description}
                  </p>
                  {PACKAGES[selectedPackage].coins > 0 && (
                    <p className="text-sm text-emerald-600 font-medium mt-1">
                      {PACKAGES[selectedPackage].coins.toLocaleString()} coins inclus
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                variant="gradient"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-lg py-6"
                onClick={handleGenerateLink}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5 mr-2" />
                    Générer le lien d&apos;invitation
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Sélectionne un forfait ci-dessus pour générer ton lien
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
      >
        {generatedInvitation && (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Lien créé avec succès !
            </h2>
            <p className="text-gray-500 mb-6">
              Partage ce lien à ton prospect pour qu&apos;il s&apos;inscrive
            </p>

            {/* Code */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Code d&apos;invitation</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                  {generatedInvitation.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Package info */}
            <div className="flex flex-col items-center gap-1 mb-6">
              <span className="font-semibold text-gray-900">
                {getPackageInfo(generatedInvitation.package_type).name}
              </span>
              <span className="text-sm text-gray-600">
                {getPackageInfo(generatedInvitation.package_type).description}
              </span>
              {getPackageInfo(generatedInvitation.package_type).coins > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 mt-1">
                  <Coins className="w-4 h-4" />
                  <span className="font-medium">
                    {getPackageInfo(generatedInvitation.package_type).coins.toLocaleString()} coins
                  </span>
                </div>
              )}
            </div>

            {/* URL */}
            <div className="p-4 bg-gray-50 rounded-2xl mb-6">
              <p className="text-xs text-gray-500 mb-2">Lien d&apos;inscription</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {getInviteUrl(generatedInvitation.code)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier le lien
                  </>
                )}
              </Button>
              <Button
                variant="gradient"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>

            <button
              onClick={handleNewLink}
              className="mt-6 text-sm text-emerald-600 hover:underline"
            >
              Créer un nouveau lien
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

