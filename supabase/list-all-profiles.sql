-- ============================================
-- LISTE COMPLÈTE DE TOUS LES PROFILS
-- ============================================

SELECT 
  id,
  name,
  email,
  role,
  created_at
FROM public.profiles
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'coach' THEN 2
    WHEN 'closer' THEN 3
    WHEN 'user' THEN 4
  END,
  created_at;

-- Comptage par rôle
SELECT 
  COALESCE(role, 'AUCUN ROLE') as role,
  COUNT(*) as nombre
FROM public.profiles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'coach' THEN 2
    WHEN 'closer' THEN 3
    WHEN 'user' THEN 4
    ELSE 5
  END;
