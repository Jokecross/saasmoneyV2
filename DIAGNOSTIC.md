# 🔍 Diagnostic des problèmes de chargement

## Problème actuel
Le chargement de la page `/closer` prend 2-3 secondes lors du refresh.

## Cause identifiée
La requête Supabase pour charger le profil utilisateur **timeout systématiquement**, ce qui signifie que :

### Option 1 : Variables d'environnement manquantes ❌
Le fichier `.env.local` n'existe pas ou n'est pas configuré correctement.

**Solution :**
1. Créez le fichier `.env.local` à la racine du projet
2. Ajoutez-y :
```env
NEXT_PUBLIC_SUPABASE_URL=https://kjkxdupqhesobjgoxkix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-ici
```

3. Pour trouver la clé anon :
   - Allez sur https://supabase.com/dashboard
   - Ouvrez votre projet `kjkxdupqhesobjgoxkix`
   - Allez dans **Settings** > **API**
   - Copiez la clé **anon public**

4. **Redémarrez le serveur** : `npm run dev`

### Option 2 : Profil utilisateur manquant dans Supabase 🗄️
L'utilisateur existe dans `auth.users` mais pas dans la table `profiles`.

**Solution :**
1. Allez sur https://supabase.com/dashboard
2. Ouvrez **Table Editor** > **profiles**
3. Vérifiez si les profils des closers existent
4. Si non, exécutez le script dans **SQL Editor** :
```sql
-- Créer les profils manuellement
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  au.id,
  au.email,
  INITCAP(SPLIT_PART(au.email, '@', 1)) as name,
  CASE 
    WHEN au.email LIKE '%clement%' OR au.email LIKE '%elias%' OR au.email LIKE '%leni%' OR au.email LIKE '%tino%' THEN 'closer'
    WHEN au.email LIKE '%martin%' OR au.email LIKE '%augustin%' THEN 'coach'
    WHEN au.email LIKE '%sacha%' OR au.email LIKE '%quentin%' THEN 'admin'
    ELSE 'user'
  END as role
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);
```

### Option 3 : RLS Policies bloquent l'accès 🔒
Les Row Level Security policies empêchent l'utilisateur de voir son propre profil.

**Solution :**
Exécutez dans **SQL Editor** :
```sql
-- Permettre aux utilisateurs de voir leur propre profil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Permettre aux utilisateurs de modifier leur propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

## Vérification rapide

Ouvrez la console du navigateur (F12) et regardez les logs :

- ✅ **"✓ Profil chargé depuis Supabase"** → Tout fonctionne
- ⚠️ **"⏱️ Timeout du chargement du profil (2s)"** → Variables d'env manquantes ou profil inexistant
- ❌ **"❌ Erreur Supabase: ..."** → Vérifiez le message d'erreur

## Amélioration temporaire appliquée

J'ai réduit le timeout de **10 secondes à 2 secondes** pour une meilleure UX. Le système bascule automatiquement sur un profil "fallback" basé sur l'email si Supabase ne répond pas.

**Cela signifie que l'app fonctionnera même sans Supabase configuré**, mais avec des fonctionnalités limitées (pas de données persistantes).
