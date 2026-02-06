-- ============================================
-- FIX RLS POLICIES POUR PROFILES
-- ============================================
-- Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- 1. D'abord, vérifions que les profils existent
SELECT id, email, name, role FROM public.profiles;

-- 2. Supprimer les anciennes policies sur profiles (elles se chevauchent)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Closers can view their students profiles" ON public.profiles;

-- 3. Créer des policies simples et fonctionnelles

-- SELECT: Tout le monde peut lire son propre profil + admins/coachs peuvent voir tous les profils
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id  -- L'utilisateur peut voir son propre profil
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'coach')
    )  -- Admin et Coach peuvent voir tous les profils
    OR
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.user_id = profiles.id 
      AND s.closer_id = auth.uid()
    )  -- Closer peut voir ses élèves
  );

-- UPDATE: L'utilisateur peut modifier son propre profil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT: Seulement via le trigger (service role)
-- Pas besoin de policy car le trigger utilise SECURITY DEFINER

-- 4. Vérifier que RLS est bien activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Test: Cette requête devrait fonctionner après connexion
-- SELECT * FROM public.profiles WHERE id = auth.uid();
