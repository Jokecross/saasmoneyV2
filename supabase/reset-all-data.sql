-- ============================================
-- SCRIPT DE RÉINITIALISATION COMPLÈTE
-- Supprime TOUTES les données de test
-- Supprime TOUS les comptes USERS
-- Conserve uniquement : Closers, Coachs, Admins
-- ============================================

-- ⚠️ ATTENTION : Ce script supprime :
-- - TOUS les comptes users (élèves)
-- - Toutes les données de test
-- ⚠️ Conserve : Closers, Coachs, Admins (sans leurs données)

-- 1️⃣ Supprimer tous les messages de remboursement
DELETE FROM public.refund_messages;

-- 2️⃣ Supprimer toutes les conversations de remboursement
DELETE FROM public.refund_conversations;

-- 3️⃣ Supprimer toutes les réservations de One-on-One
DELETE FROM public.one_of_one_bookings;

-- 4️⃣ Supprimer tous les créneaux One-on-One des coachs
DELETE FROM public.one_of_one_slots;

-- 5️⃣ Supprimer toutes les réservations de Hot-Seat
DELETE FROM public.hotset_bookings;

-- 6️⃣ Supprimer tous les créneaux Hot-Seat des coachs
DELETE FROM public.hotset_slots;

-- 7️⃣ Supprimer tous les paiements des élèves
DELETE FROM public.student_payments;

-- 8️⃣ Supprimer tous les élèves
DELETE FROM public.students;

-- 9️⃣ Supprimer tous les codes d'invitation (générés + acceptés)
DELETE FROM public.invitation_codes;

-- 🔟 SUPPRIMER TOUS LES COMPTES USERS (élèves)
DELETE FROM public.profiles 
WHERE role = 'user';

-- 1️⃣1️⃣ Réinitialiser les coins_balance des closers/coachs/admins (au cas où)
UPDATE public.profiles 
SET coins_balance = 0 
WHERE role IN ('closer', 'coach', 'admin');

-- 🎯 RÉSUMÉ FINAL
SELECT 
  '✅ Réinitialisation terminée !' as status,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'closer') as closers_restants,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'coach') as coachs_restants,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admins_restants,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'user') as users_restants,
  (SELECT COUNT(*) FROM public.invitation_codes) as invitations_restantes,
  (SELECT COUNT(*) FROM public.students) as eleves_restants,
  (SELECT COUNT(*) FROM public.one_of_one_slots) as creneaux_one_of_one_restants,
  (SELECT COUNT(*) FROM public.hotset_slots) as creneaux_hotset_restants,
  (SELECT COUNT(*) FROM public.refund_conversations) as conversations_remboursement;

-- ✅ Script exécuté avec succès
-- Votre application est maintenant PRÊTE pour la production !
-- 
-- 📋 Résultat attendu :
-- - closers_restants: 2+ (Charly, Hugo, etc.)
-- - coachs_restants: 2+ (Martin, Augustin, etc.)
-- - admins_restants: 2
-- - users_restants: 0 (TOUS SUPPRIMÉS)
-- - invitations_restantes: 0
-- - eleves_restants: 0
-- - creneaux_one_of_one_restants: 0
-- - creneaux_hotset_restants: 0
-- - conversations_remboursement: 0
