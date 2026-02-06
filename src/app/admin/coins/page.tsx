"use client";

// Admin Coins Management - Fixed TypeScript errors
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Phone,
  Save,
  TrendingUp,
  Users,
  Loader2,
  CheckCircle,
  Settings,
} from "lucide-react";

interface CoinStats {
  totalCoins: number;
  totalUsers: number;
  avgCoinsPerUser: number;
}

interface UserWithCoins {
  id: string;
  name: string;
  email: string;
  coins_balance: number;
  role: string;
}

interface AppSettings {
  id: string;
  one_of_one_cost: number;
}

export default function AdminCoinsPage() {
  const [stats, setStats] = useState<CoinStats>({
    totalCoins: 0,
    totalUsers: 0,
    avgCoinsPerUser: 0,
  });
  const [usersWithCoins, setUsersWithCoins] = useState<UserWithCoins[]>([]);
  const [callCost, setCallCost] = useState(1000);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all profiles with coins
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email, coins_balance, role")
          .order("coins_balance", { ascending: false });

        if (profiles) {
          const usersWithBalance = (profiles as UserWithCoins[]).filter(p => p.coins_balance > 0);
          setUsersWithCoins(usersWithBalance);

          const totalCoins = (profiles as UserWithCoins[]).reduce((sum, p) => sum + (p.coins_balance || 0), 0);
          const totalUsers = profiles.length;
          
          setStats({
            totalCoins,
            totalUsers,
            avgCoinsPerUser: totalUsers > 0 ? Math.round(totalCoins / totalUsers) : 0,
          });
        }

        // Fetch call cost setting
        const { data: settings } = await supabase
          .from("app_settings")
          .select("id, one_of_one_cost")
          .limit(1)
          .single();

        if (settings && (settings as AppSettings).one_of_one_cost) {
          setCallCost((settings as AppSettings).one_of_one_cost);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      // Get existing settings row
      const { data: existing } = await supabase
        .from("app_settings")
        .select("id")
        .limit(1)
        .single();

      if (existing) {
        // Update existing row
        const { error } = await supabase
          .from("app_settings")
          .update({ one_of_one_cost: callCost })
          .eq("id", existing.id);

        if (!error) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } else {
        // Create new row
        const { error } = await supabase
          .from("app_settings")
          .insert({ one_of_one_cost: callCost });

        if (!error) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-magenta animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuration Coins</h1>
        <p className="text-gray-500">Gérer le système de crédits</p>
      </div>

      {/* Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Paramètres
          </h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                label="Coût d'un One of One (en Coins)"
                type="number"
                value={callCost}
                onChange={(e) => setCallCost(parseInt(e.target.value) || 0)}
                icon={<Phone className="w-5 h-5" />}
              />
            </div>
            <Button 
              variant="gradient" 
              onClick={handleSave} 
              loading={saving}
              className="min-w-[140px]"
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enregistré !
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-600">
              <strong>Rappel :</strong> 1000 coins = 1 One of One. 
              Les forfaits 5000€ et 15000€ donnent respectivement 4000 et 15000 coins 
              (débloqués progressivement).
            </p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="w-5 h-5 text-magenta" />
            <span className="text-sm text-gray-500">Total en circulation</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalCoins.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Utilisateurs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalUsers}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">Moyenne / user</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.avgCoinsPerUser.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Users with coins */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Utilisateurs avec des coins
        </h2>

        <Card className="overflow-hidden">
          {usersWithCoins.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun utilisateur avec des coins</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {usersWithCoins.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-magenta-100 flex items-center justify-center">
                      <span className="text-magenta font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="default" size="sm">
                      {user.role}
                    </Badge>
                    <Badge variant="magenta" className="min-w-[100px] justify-center">
                      {user.coins_balance.toLocaleString()} Coins
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
