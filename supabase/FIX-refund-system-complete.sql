-- ============================================
-- SCRIPT DE CORRECTION COMPLET
-- Système de remboursement avec IA
-- ============================================
-- Ce script corrige TOUS les problèmes potentiels du système de remboursement
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE refund_conversations
ADD COLUMN IF NOT EXISTS acceptance_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ai_handled BOOLEAN DEFAULT false;

-- 2. Ajouter la contrainte CHECK sur acceptance_status (supprimer l'ancienne si elle existe)
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'refund_conversations' 
    AND constraint_name LIKE '%acceptance_status%'
  ) THEN
    ALTER TABLE refund_conversations DROP CONSTRAINT IF EXISTS refund_conversations_acceptance_status_check;
  END IF;
  
  -- Ajouter la nouvelle contrainte
  ALTER TABLE refund_conversations 
  ADD CONSTRAINT refund_conversations_acceptance_status_check 
  CHECK (acceptance_status IN ('pending', 'accepted', 'refused'));
END $$;

-- 3. Mettre à jour les valeurs NULL existantes
UPDATE refund_conversations
SET acceptance_status = 'pending'
WHERE acceptance_status IS NULL;

UPDATE refund_conversations
SET ai_handled = false
WHERE ai_handled IS NULL;

-- 4. Vérifier que les politiques RLS sont bien en place
-- (Ces politiques devraient déjà exister, mais on les recrée au cas où)

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own refund conversations" ON public.refund_conversations;
DROP POLICY IF EXISTS "Users can create their own refund conversations" ON public.refund_conversations;
DROP POLICY IF EXISTS "Admins can update refund conversations" ON public.refund_conversations;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.refund_messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.refund_messages;

-- Recréer les politiques RLS
CREATE POLICY "Users can view their own refund conversations"
  ON public.refund_conversations FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'coach')
  ));

CREATE POLICY "Users can create their own refund conversations"
  ON public.refund_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update refund conversations"
  ON public.refund_conversations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can view messages from their conversations"
  ON public.refund_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.refund_conversations 
      WHERE refund_conversations.id = conversation_id 
      AND (refund_conversations.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'coach')
      ))
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.refund_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.refund_conversations 
      WHERE refund_conversations.id = conversation_id 
      AND (refund_conversations.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'coach')
      ))
    )
  );

-- 5. Vérification finale - Afficher l'état du système
SELECT 
  '✅ Système de remboursement corrigé' as status,
  COUNT(*) as total_conversations,
  COUNT(CASE WHEN acceptance_status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN acceptance_status = 'accepted' THEN 1 END) as accepted,
  COUNT(CASE WHEN acceptance_status = 'refused' THEN 1 END) as refused,
  COUNT(CASE WHEN ai_handled = true THEN 1 END) as ai_handled_count
FROM refund_conversations;

-- 6. Afficher la structure finale de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'refund_conversations'
ORDER BY ordinal_position;
