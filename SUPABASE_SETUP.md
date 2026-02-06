# 🚀 Configuration Supabase pour SaaS Money

## 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez un nom et un mot de passe pour la base de données
5. Sélectionnez la région la plus proche de vous (Europe pour la France)
6. Cliquez sur "Create new project"

## 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

Pour trouver ces valeurs :
1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copiez **anon public** (sous Project API keys) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Créer les tables

1. Dans Supabase, allez dans **SQL Editor**
2. Cliquez sur "New query"
3. Copiez et collez le contenu de `supabase/schema.sql`
4. Cliquez sur "Run" pour exécuter

## 4. (Optionnel) Ajouter des données de test

1. Toujours dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez et collez le contenu de `supabase/seed.sql`
4. Cliquez sur "Run"

## 5. Configurer l'authentification

### Email Authentication (par défaut)

L'authentification par email est activée par défaut. Pour modifier les paramètres :

1. Allez dans **Authentication** > **Settings**
2. Vous pouvez :
   - Désactiver la confirmation par email (pour le dev)
   - Personnaliser les templates d'email

### (Optionnel) OAuth Providers

Pour ajouter Google, GitHub, etc. :

1. Allez dans **Authentication** > **Providers**
2. Activez le provider souhaité
3. Configurez les credentials OAuth

## 6. Créer un compte admin

1. Inscrivez-vous via l'interface de l'app
2. Dans Supabase, allez dans **Table Editor** > **profiles**
3. Trouvez votre utilisateur et changez `role` en `admin`

## 7. Lancer l'application

```bash
npm run dev
```

L'app sera disponible sur [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure des fichiers Supabase

```
supabase/
├── schema.sql       # Tables, RLS, fonctions
└── seed.sql         # Données de test

src/lib/supabase/
├── client.ts        # Client pour le navigateur
├── server.ts        # Client pour le serveur
└── types.ts         # Types TypeScript

src/hooks/
├── use-conversations.ts  # Hook pour le chat IA
└── use-bookings.ts       # Hooks pour les réservations
```

## 🔐 Row Level Security (RLS)

Toutes les tables ont RLS activé. Les utilisateurs ne peuvent :
- Voir/modifier que leurs propres données
- Les admins ont accès à toutes les données

## 💰 Système de Coins

Deux fonctions SQL gèrent les coins :
- `debit_coins(user_id, amount, reason)` - Retire des coins
- `credit_coins(user_id, amount, reason)` - Ajoute des coins

Ces fonctions sont appelées automatiquement lors des réservations.

---

## ❓ Problèmes courants

### "Invalid API key"
→ Vérifiez que les variables d'environnement sont correctement configurées

### "Row level security violation"
→ Vérifiez que l'utilisateur est bien connecté et que les policies RLS sont correctes

### Les tables n'existent pas
→ Exécutez le script `schema.sql` dans l'éditeur SQL

---

Besoin d'aide ? Consultez la [documentation Supabase](https://supabase.com/docs).

