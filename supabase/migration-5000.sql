-- Migration: Passage de l'offre 7000€ à 5000€
-- Date: 2026-02-06
-- Description: Mise à jour du package type et des contraintes

-- 1. Mettre à jour tous les enregistrements existants avec package_type = '7000' vers '5000'
UPDATE public.invitation_codes 
SET package_type = '5000', coins_amount = 4000
WHERE package_type = '7000';

UPDATE public.students 
SET package_type = '5000', total_price = 5000, total_coins = 4000
WHERE package_type = '7000';

-- 2. Supprimer les anciennes contraintes CHECK
ALTER TABLE public.invitation_codes 
DROP CONSTRAINT IF EXISTS invitation_codes_package_type_check;

ALTER TABLE public.students 
DROP CONSTRAINT IF EXISTS students_package_type_check;

-- 3. Recréer les contraintes avec les nouvelles valeurs
ALTER TABLE public.invitation_codes 
ADD CONSTRAINT invitation_codes_package_type_check 
CHECK (package_type IN ('700', '3000', '5000', '15000'));

ALTER TABLE public.students 
ADD CONSTRAINT students_package_type_check 
CHECK (package_type IN ('700', '3000', '5000', '15000'));

-- 4. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration réussie: Offre 7000€ remplacée par 5000€';
  RAISE NOTICE 'Nouveaux paramètres de l''offre 5000€:';
  RAISE NOTICE '  - 8 One of One (500 coins chacun = 4000 coins total)';
  RAISE NOTICE '  - 1 Hot-Seat/semaine pendant 6 mois';
  RAISE NOTICE '  - Paiement en 5 fois';
END $$;
