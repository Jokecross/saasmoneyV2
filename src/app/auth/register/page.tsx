"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, getInvitationByCode, PACKAGES, getPackageInfo } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, User, Sparkles, Gift, Ticket, CheckCircle, Coins } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [manualCode, setManualCode] = useState(inviteCode || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validInvitation, setValidInvitation] = useState<{
    valid: boolean;
    coins: number;
    packageName: string;
  } | null>(null);
  
  const { register } = useAuth();
  const router = useRouter();

  // Valider le code d'invitation
  useEffect(() => {
    const validateCode = async () => {
      const codeToCheck = manualCode.trim().toUpperCase();
      if (codeToCheck) {
        const invitation = await getInvitationByCode(codeToCheck);
        if (invitation && !invitation.used) {
          const pkg = getPackageInfo(invitation.package_type);
          if (pkg) {
            setValidInvitation({
              valid: true,
              coins: invitation.coins_amount,
              packageName: pkg.name,
            });
            setError("");
          } else {
            setValidInvitation(null);
            setError("Type de forfait invalide");
          }
        } else if (invitation && invitation.used) {
          setValidInvitation(null);
          setError("Ce code d'invitation a déjà été utilisé");
        } else {
          setValidInvitation(null);
          if (codeToCheck.length >= 6) {
            setError("Code d'invitation invalide");
          }
        }
      } else {
        setValidInvitation(null);
        setError("");
      }
    };
    
    validateCode();
  }, [manualCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const codeToUse = manualCode.trim().toUpperCase() || undefined;
      const result = await register(name, email, password, codeToUse);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result.user) {
        // Redirection selon le rôle
        const redirectPath = result.user.role === "user" ? "/app" : 
                            result.user.role === "coach" ? "/coach" :
                            result.user.role === "closer" ? "/closer" :
                            result.user.role === "admin" ? "/admin" : "/app";
        router.push(redirectPath);
      }
    } catch {
      setError("Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-primary shadow-glow mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Créer un compte</h1>
        <p className="text-gray-500 mt-2">Rejoignez SaaS Money et lancez votre SaaS</p>
      </div>

      <Card className="p-8">
        {/* Bonus badge - dynamique selon le code */}
        {validInvitation ? (
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white mb-6">
            <CheckCircle className="w-6 h-6" />
            <div className="text-center">
              <p className="font-bold text-lg">{validInvitation.coins.toLocaleString()} Coins offerts !</p>
              <p className="text-sm text-white/80">{validInvitation.packageName}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-primary text-white mb-6">
            <Gift className="w-5 h-5" />
            <span className="font-medium">100 Coins offerts à l&apos;inscription !</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Code d'invitation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code d&apos;invitation (optionnel)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Ticket className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="SM-XXXXXXXX"
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value.toUpperCase());
                  setError("");
                }}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
              />
              {validInvitation && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </div>
            {validInvitation && (
              <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                <Coins className="w-4 h-4" />
                Tu recevras {validInvitation.coins.toLocaleString()} coins
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <Input
              label="Nom complet"
              type="text"
              placeholder="Marie Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-5 h-5" />}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5" />}
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            required
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            required
          />

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="gradient" 
            className={validInvitation ? "w-full bg-gradient-to-r from-emerald-500 to-teal-600" : "w-full"} 
            loading={loading}
          >
            Créer mon compte
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-magenta hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </Card>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-2xl bg-gradient-primary mx-auto mb-4 animate-pulse" />
        <p className="text-gray-500">Chargement...</p>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
