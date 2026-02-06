"use client";

import { Card } from "@/components/ui/card";
import { Sparkles, Clock } from "lucide-react";

export default function SaasMoneyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary shadow-soft mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          SaaS Money
        </h1>
        <p className="text-lg text-gray-500">
          Votre plateforme d'accompagnement SaaS
        </p>
      </div>

      {/* Main Card */}
      <Card className="p-12 border-2 border-gray-100 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 mb-4">
            <Clock className="w-8 h-8 text-orange" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            À venir
          </h2>
          
          <p className="text-xl text-gray-600">
            Soyez patient
          </p>
          
          <div className="pt-6">
            <p className="text-sm text-gray-500">
              Cette section sera bientôt disponible avec des fonctionnalités exclusives pour vous accompagner dans votre réussite.
            </p>
          </div>

          {/* Decorative gradient line */}
          <div className="w-32 h-1 bg-gradient-primary rounded-full mx-auto mt-8" />
        </div>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Card className="p-6 text-center border border-gray-100 hover:border-magenta-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-magenta-100 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-magenta" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Contenu exclusif</h3>
          <p className="text-sm text-gray-500">
            Accédez à des ressources premium pour booster votre SaaS
          </p>
        </Card>

        <Card className="p-6 text-center border border-gray-100 hover:border-orange-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-orange" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Outils avancés</h3>
          <p className="text-sm text-gray-500">
            Des outils pour optimiser votre croissance
          </p>
        </Card>

        <Card className="p-6 text-center border border-gray-100 hover:border-purple-200 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Communauté</h3>
          <p className="text-sm text-gray-500">
            Échangez avec d'autres entrepreneurs SaaS
          </p>
        </Card>
      </div>
    </div>
  );
}
