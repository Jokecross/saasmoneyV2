-- ============================================
-- CRÉER LES PROFILS POUR TOUS LES UTILISATEURS
-- ============================================
-- Ce script insère les profils manquants depuis auth.users
-- ============================================

-- 1. D'abord, vérifions ce qu'on a dans profiles
SELECT id, email, name, role FROM public.profiles;

-- 2. Vérifions ce qu'on a dans auth.users
SELECT id, email, created_at FROM auth.users;

-- 3. Insérer les profils manquants (si le trigger n'a pas fonctionné)
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  SPLIT_PART(au.email, '@', 1), -- Utilise la partie avant @ comme nom
  'user', -- Rôle par défaut
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- 4. Maintenant mettre à jour les rôles correctement
-- Closers
UPDATE public.profiles SET role = 'closer', name = 'Clément' WHERE email = 'clement@saasmoney.fr';
UPDATE public.profiles SET role = 'closer', name = 'Elias' WHERE email = 'elias@saasmoney.fr';
UPDATE public.profiles SET role = 'closer', name = 'Leni' WHERE email = 'leni@saasmoney.fr';
UPDATE public.profiles SET role = 'closer', name = 'Tino' WHERE email = 'tino@saasmoney.fr';

-- Coaches
UPDATE public.profiles SET role = 'coach', name = 'Martin' WHERE email = 'martin@saasmoney.fr';
UPDATE public.profiles SET role = 'coach', name = 'Augustin' WHERE email = 'augustin@saasmoney.fr';

-- Admins
UPDATE public.profiles SET role = 'admin', name = 'Sacha' WHERE email = 'sacha@saasmoney.fr';
UPDATE public.profiles SET role = 'admin', name = 'Quentin' WHERE email = 'quentin@saasmoney.fr';

-- 5. Vérification finale
SELECT id, email, name, role FROM public.profiles ORDER BY role, name;
