-- ============================================
-- CORRECTION DES POLITIQUES RLS
-- Problème : Les users ne voient pas les messages de l'IA
-- ============================================

-- 1. Supprimer les anciennes politiques qui causent le problème
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.refund_messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.refund_messages;

-- 2. Créer de nouvelles politiques CORRECTES

-- Politique SELECT : Un user peut voir TOUS les messages de SES conversations
-- (y compris ceux envoyés par l'admin/IA)
CREATE POLICY "Users can view all messages in their conversations"
  ON public.refund_messages FOR SELECT
  USING (
    -- L'user peut voir les messages si la conversation lui appartient
    EXISTS (
      SELECT 1 FROM public.refund_conversations 
      WHERE refund_conversations.id = conversation_id 
      AND refund_conversations.user_id = auth.uid()
    )
    OR
    -- OU si c'est un admin/coach (ils voient tout)
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Politique INSERT : Un user peut envoyer des messages dans SES conversations
-- Les admins peuvent envoyer des messages dans N'IMPORTE QUELLE conversation
CREATE POLICY "Users and admins can send messages"
  ON public.refund_messages FOR INSERT
  WITH CHECK (
    -- L'user peut envoyer des messages dans ses propres conversations
    EXISTS (
      SELECT 1 FROM public.refund_conversations 
      WHERE refund_conversations.id = conversation_id 
      AND refund_conversations.user_id = auth.uid()
    )
    OR
    -- OU si c'est un admin/coach (ils peuvent envoyer dans n'importe quelle conversation)
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- 3. Vérification : Afficher les politiques actives
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'refund_messages'
ORDER BY policyname;

-- 4. Message de confirmation
SELECT '✅ Politiques RLS corrigées pour refund_messages' as status;
