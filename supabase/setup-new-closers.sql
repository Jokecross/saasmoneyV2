-- ============================================
-- CONFIGURATION DES NOUVEAUX CLOSERS
-- Charly et Hugo
-- ============================================

-- 1️⃣ Mettre à jour le rôle de Charly
UPDATE public.profiles
SET role = 'closer'
WHERE email = 'charly@saasmoney.fr';

-- 2️⃣ Mettre à jour le rôle de Hugo
UPDATE public.profiles
SET role = 'closer'
WHERE email = 'hugo@saasmoney.fr';

-- 3️⃣ Vérification des closers
SELECT 
  '🟡 CLOSERS CONFIGURÉS' as status,
  name,
  email,
  role,
  created_at
FROM public.profiles
WHERE role = 'closer'
ORDER BY created_at;

-- 4️⃣ Résumé total
SELECT 
  role,
  COUNT(*) as nombre
FROM public.profiles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'coach' THEN 2
    WHEN 'closer' THEN 3
    WHEN 'user' THEN 4
  END;

-- ✅ Les deux closers ont maintenant accès à l'espace closer !
