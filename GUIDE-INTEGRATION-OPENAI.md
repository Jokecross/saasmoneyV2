# 🤖 Guide d'intégration OpenAI pour le système de remboursement

## 📋 Vue d'ensemble

Le système de remboursement avec IA est maintenant en place. Les admins peuvent :
- ✅ **Accepter** une demande → Admin parle directement avec le user
- ❌ **Refuser** une demande → IA prend le relais et répond selon les termes du contrat

---

## 🔧 Comment intégrer OpenAI

### **1️⃣ Ajouter la variable d'environnement**

Dans votre fichier `.env.local` (et sur Vercel/Netlify) :

```bash
OPENAI_API_KEY=sk-votre-clé-api-openai
```

### **2️⃣ Installer le package OpenAI**

```bash
npm install openai
```

### **3️⃣ Modifier le fichier `/src/app/api/refund-ai/route.ts`**

Remplacez le contenu actuel par :

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { conversationId, userMessage } = await request.json();

    if (!conversationId || !userMessage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if conversation is AI-handled
    const { data: conversation, error: convError } = await supabase
      .from("refund_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("ai_handled", true)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found or not AI-handled" },
        { status: 404 }
      );
    }

    // Load conversation history
    const { data: messagesHistory, error: historyError } = await supabase
      .from("refund_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20); // Last 20 messages for context

    if (historyError) {
      console.error("Error loading history:", historyError);
    }

    // Build OpenAI messages array
    const openaiMessages = [
      {
        role: "system",
        content: `Tu es un assistant IA pour SaaS Money, spécialisé dans les demandes de remboursement.

IMPORTANT : Tu dois TOUJOURS répondre en Français.

Ton rôle est de :
1. Analyser les demandes de remboursement selon les termes du contrat
2. Répondre de manière professionnelle et empathique
3. Expliquer clairement les conditions de remboursement
4. Orienter les users vers les solutions appropriées

TERMES DU CONTRAT (à adapter selon votre contrat réel) :
- Les remboursements sont possibles sous 14 jours après l'achat
- Les remboursements partiels peuvent être accordés dans certains cas
- Aucun remboursement après utilisation de plus de 50% des crédits
- Les remboursements sont traités sous 7-10 jours ouvrés

Si une situation nécessite l'intervention d'un humain, informe le user qu'un administrateur sera notifié.

Sois toujours courtois, professionnel et compréhensif.`,
      },
    ];

    // Add conversation history
    if (messagesHistory && messagesHistory.length > 0) {
      for (const msg of messagesHistory) {
        openaiMessages.push({
          role: msg.user_id === conversation.user_id ? "user" : "assistant",
          content: msg.message,
        });
      }
    }

    // Add current user message
    openaiMessages.push({
      role: "user",
      content: userMessage,
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // ou "gpt-3.5-turbo" pour moins cher
      messages: openaiMessages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || 
      "Désolé, je n'ai pas pu générer une réponse. Un administrateur sera notifié.";

    // Get admin user ID
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (!adminProfile) {
      return NextResponse.json(
        { error: "No admin found" },
        { status: 500 }
      );
    }

    // Insert AI response
    const { data: message, error: messageError } = await supabase
      .from("refund_messages")
      .insert({
        conversation_id: conversationId,
        user_id: adminProfile.id,
        message: aiResponse,
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error inserting AI message:", messageError);
      return NextResponse.json(
        { error: "Failed to send AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error in refund-ai route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Personnalisation du prompt

Dans le `system` message, vous pouvez personnaliser :

1. **Les termes du contrat** → Adaptez selon vos conditions réelles
2. **Le ton de l'IA** → Plus formel, plus amical, etc.
3. **Les cas d'escalade** → Quand demander l'intervention humaine
4. **Les informations complémentaires** → Délais, procédures, etc.

---

## 🧪 Tester l'intégration

1. **Créer une demande de remboursement** (en tant que user)
2. **Refuser la demande** (en tant qu'admin) → L'IA prend le relais
3. **Envoyer un message** en tant que user
4. **Vérifier la réponse de l'IA**

---

## 💰 Coût OpenAI

- **GPT-4 Turbo** : ~$0.01 par conversation (haute qualité)
- **GPT-3.5 Turbo** : ~$0.002 par conversation (économique)

**Recommandation :** Commencez avec GPT-3.5 Turbo pour tester, puis passez à GPT-4 si besoin.

---

## 📊 État actuel

✅ Structure de la base de données créée
✅ Interface admin avec Accept/Refuse
✅ Interface user avec indicateur IA
✅ API route préparée
⏳ **À FAIRE : Intégrer OpenAI avec ce guide**

---

## 📝 Notes importantes

1. Le système fonctionne **déjà** avec une réponse placeholder
2. OpenAI peut être ajouté **à tout moment** sans casser le système existant
3. Les conversations sont **sauvegardées** même si OpenAI n'est pas configuré
4. Vous pouvez **tester manuellement** avant d'activer l'IA

---

## 🔗 Ressources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [OpenAI Pricing](https://openai.com/pricing)
- [GPT-4 vs GPT-3.5 Comparison](https://platform.openai.com/docs/models)
