-- Script de diagnostic pour le système de remboursement
-- Vérifier que toutes les colonnes et tables existent

-- 1. Vérifier que la table refund_conversations existe
SELECT 
  'Table refund_conversations' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'refund_conversations')
    THEN '✅ Existe'
    ELSE '❌ MANQUANTE'
  END as status;

-- 2. Vérifier que la table refund_messages existe
SELECT 
  'Table refund_messages' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'refund_messages')
    THEN '✅ Existe'
    ELSE '❌ MANQUANTE'
  END as status;

-- 3. Vérifier les colonnes de refund_conversations
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'refund_conversations'
ORDER BY ordinal_position;

-- 4. Vérifier spécifiquement les colonnes AI
SELECT 
  'Colonne acceptance_status' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'refund_conversations' 
      AND column_name = 'acceptance_status'
    )
    THEN '✅ Existe'
    ELSE '❌ MANQUANTE - Exécutez add-ai-handling.sql'
  END as status;

SELECT 
  'Colonne ai_handled' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'refund_conversations' 
      AND column_name = 'ai_handled'
    )
    THEN '✅ Existe'
    ELSE '❌ MANQUANTE - Exécutez add-ai-handling.sql'
  END as status;

-- 5. Vérifier le nombre de conversations
SELECT 
  'Nombre de conversations' as metric,
  COUNT(*) as value
FROM refund_conversations;

-- 6. Vérifier le nombre de messages
SELECT 
  'Nombre de messages' as metric,
  COUNT(*) as value
FROM refund_messages;

-- 7. Vérifier les conversations par statut
SELECT 
  status,
  COUNT(*) as count
FROM refund_conversations
GROUP BY status;

-- 8. Vérifier si la colonne acceptance_status existe et ses valeurs
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'refund_conversations' 
    AND column_name = 'acceptance_status'
  ) THEN
    RAISE NOTICE '✅ acceptance_status existe - Voici les valeurs :';
    PERFORM * FROM (
      SELECT 
        acceptance_status,
        COUNT(*) as count
      FROM refund_conversations
      GROUP BY acceptance_status
    ) as subquery;
  ELSE
    RAISE NOTICE '❌ acceptance_status MANQUANTE - Exécutez add-ai-handling.sql';
  END IF;
END $$;
