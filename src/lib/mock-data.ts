import { Conversation, Message, OneOfOneSlot, HotsetType, HotsetSlot } from "@/types";

// Mock conversations
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_1",
    title: "Idée de SaaS B2B",
    mode: "coach",
    userId: "user_1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "conv_2",
    title: "Stratégie pricing",
    mode: "growth",
    userId: "user_1",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  conv_1: [
    {
      id: "msg_1",
      content: "Je cherche une idée de SaaS B2B dans le secteur RH. Tu peux m'aider ?",
      role: "user",
      conversationId: "conv_1",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "msg_2",
      content: `Excellente question ! Le secteur RH offre de nombreuses opportunités. Voici 3 idées prometteuses :

**1. Outil d'onboarding automatisé**
- Problème : L'intégration des nouveaux employés est chronophage
- Solution : Plateforme qui automatise les étapes clés (documents, formations, présentations)
- Marché : PME de 50-500 employés

**2. Assistant IA pour les entretiens annuels**
- Problème : Managers débordés, feedbacks peu structurés
- Solution : IA qui prépare les entretiens, suggère des questions, résume les points clés
- Marché : Entreprises tech et startups

**3. Plateforme de gestion des compétences**
- Problème : Difficulté à mapper les skills et anticiper les besoins
- Solution : Cartographie automatique des compétences avec suggestions de formation
- Marché : ETI et grands groupes

Quelle direction t'intéresse le plus ?`,
      role: "assistant",
      conversationId: "conv_1",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000),
    },
  ],
  conv_2: [
    {
      id: "msg_3",
      content: "Comment structurer mon pricing pour un SaaS de gestion de projet ?",
      role: "user",
      conversationId: "conv_2",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "msg_4",
      content: `Pour un SaaS de gestion de projet, voici une structure de pricing efficace :

**Freemium → Pro → Business → Enterprise**

**1. Free (0€)**
- 3 projets max
- 5 utilisateurs
- Fonctionnalités de base
→ Objectif : Acquisition et viralité

**2. Pro (29€/mois)**
- Projets illimités
- 15 utilisateurs
- Intégrations (Slack, Notion...)
- Rapports basiques
→ Cible : Startups et petites équipes

**3. Business (79€/mois)**
- Tout Pro +
- Utilisateurs illimités
- SSO
- Rapports avancés
- Support prioritaire
→ Cible : PME en croissance

**4. Enterprise (Sur devis)**
- Tout Business +
- On-premise option
- SLA garanti
- Account Manager dédié
→ Cible : Grands comptes

💡 **Conseil** : Commence avec 2-3 plans max, puis affine selon les retours clients.`,
      role: "assistant",
      conversationId: "conv_2",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45000),
    },
  ],
};

// Coachs disponibles
const COACHES = [
  { id: "coach-martin-001", name: "Martin Chevalier" },
  { id: "coach-augustin-001", name: "Augustin Coach" },
];

// Generate slots for the next 2 weeks
function generateSlots(): OneOfOneSlot[] {
  const slots: OneOfOneSlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= 14; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Add 3 slots per day
    const hours = [10, 14, 16];
    hours.forEach((hour, index) => {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      
      // Alterner entre les coachs
      const coach = COACHES[(day + index) % COACHES.length];

      slots.push({
        id: `slot_${day}_${index}`,
        date: slotDate,
        duration: 30,
        isAvailable: Math.random() > 0.3, // 70% available
        coachId: coach.id,
        coachName: coach.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  return slots;
}

export const MOCK_ONE_OF_ONE_SLOTS = generateSlots();

export const MOCK_HOTSET_TYPES: HotsetType[] = [
  {
    id: "hotset_type_1",
    name: "Audit Express",
    description: "Un audit complet de ton SaaS en 60 minutes. Identification des points faibles et recommandations concrètes.",
    duration: 60,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "hotset_type_2",
    name: "Refonte Offre",
    description: "Restructure ton offre commerciale pour maximiser les conversions. Pricing, packaging, positionnement.",
    duration: 90,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "hotset_type_3",
    name: "Positionnement",
    description: "Trouve ta niche et différencie-toi. Workshop intensif pour clarifier ton message.",
    duration: 60,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "hotset_type_4",
    name: "Go-to-Market",
    description: "Stratégie de lancement complète. Canaux, messaging, premiers clients.",
    duration: 120,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function generateHotsetSlots(): HotsetSlot[] {
  const slots: HotsetSlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  MOCK_HOTSET_TYPES.forEach((type, typeIndex) => {
    for (let day = 1; day <= 14; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // One slot per type every 2-3 days
      if ((day + typeIndex) % 3 !== 0) continue;

      const slotDate = new Date(date);
      slotDate.setHours(9 + typeIndex * 2, 0, 0, 0);

      slots.push({
        id: `hotset_slot_${type.id}_${day}`,
        typeId: type.id,
        date: slotDate,
        isAvailable: Math.random() > 0.2,
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return slots;
}

export const MOCK_HOTSET_SLOTS = generateHotsetSlots();

// AI Response generator (mock)
export function generateAIResponse(message: string, mode: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        coach: [
          `Je comprends ta question sur "${message.slice(0, 30)}..."

Voici mon analyse en tant que coach :

**Points clés à considérer :**
1. Identifie d'abord ton persona idéal
2. Valide le problème avant de construire la solution
3. Commence petit, itère vite

**Action immédiate recommandée :**
Lance 5 interviews clients cette semaine pour valider tes hypothèses.

Tu veux qu'on approfondisse un de ces points ?`,
        ],
        growth: [
          `En mode Growth, voici comment je vois les choses :

**Métriques à surveiller :**
- CAC (Coût d'Acquisition Client)
- LTV (Valeur Vie Client)
- Churn mensuel

**Leviers de croissance :**
1. SEO content → Traffic organique
2. Product-Led Growth → Viralité
3. Partenariats stratégiques

**Quick win :**
Active un programme de parrainage avec 20% de réduction.

On détaille une stratégie spécifique ?`,
        ],
        produit: [
          `D'un point de vue Produit :

**Framework de priorisation :**
Utilise le RICE score (Reach × Impact × Confidence / Effort)

**Fonctionnalités à prioriser :**
1. Celles qui réduisent le churn
2. Celles qui augmentent l'adoption
3. Les quick wins à forte visibilité

**Conseil :**
Fais des releases hebdomadaires plutôt que mensuelles.

Tu veux qu'on travaille sur ta roadmap ?`,
        ],
        copywriting: [
          `En mode Copywriting :

**Structure persuasive :**
1. Accroche (hook le problème)
2. Agitation (amplifie la douleur)
3. Solution (présente ton produit)
4. Preuve (témoignages, stats)
5. CTA (action claire)

**Formule magique :**
"[Audience cible] + [Résultat désiré] + [Sans le problème habituel]"

Exemple : "Les fondateurs SaaS qui veulent scaler sans s'épuiser"

On travaille sur ton messaging ?`,
        ],
      };

      const modeResponses = responses[mode] || responses.coach;
      resolve(modeResponses[Math.floor(Math.random() * modeResponses.length)]);
    }, 1500);
  });
}

