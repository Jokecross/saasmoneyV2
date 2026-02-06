-- ============================================
-- VÉRIFICATION DES COMPTES EXISTANTS
-- Affiche tous les comptes par rôle
-- ============================================

-- 📊 Résumé par rôle
SELECT 
  role,
  COUNT(*) as nombre_de_comptes
FROM public.profiles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'coach' THEN 2
    WHEN 'closer' THEN 3
    WHEN 'user' THEN 4
  END;

-- 👤 ADMINS
SELECT 
  '🔴 ADMINS' as type,
  id,
  name,
  email,
  created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at;

-- 👤 COACHS
SELECT 
  '🟢 COACHS' as type,
  id,
  name,
  email,
  created_at
FROM public.profiles
WHERE role = 'coach'
ORDER BY created_at;

-- 👤 CLOSERS
SELECT 
  '🟡 CLOSERS' as type,
  id,
  name,
  email,
  created_at
FROM public.profiles
WHERE role = 'closer'
ORDER BY created_at;

-- 👤 USERS (élèves)
SELECT 
  '🔵 USERS' as type,
  id,
  name,
  email,
  created_at
FROM public.profiles
WHERE role = 'user'
ORDER BY created_at;
