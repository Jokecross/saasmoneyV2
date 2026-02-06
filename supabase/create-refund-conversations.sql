-- Migration : Système de conversation pour les demandes de remboursement
-- Date : 2026-02-06
-- Objectif : Permettre aux users de discuter avec l'admin pour les remboursements

-- ============================================
-- TABLE: refund_conversations
-- Conversations de remboursement
-- ============================================
CREATE TABLE IF NOT EXISTS public.refund_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refund_conversations_user ON public.refund_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_conversations_status ON public.refund_conversations(status);

-- ============================================
-- TABLE: refund_messages
-- Messages des conversations de remboursement
-- ============================================
CREATE TABLE IF NOT EXISTS public.refund_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.refund_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refund_messages_conversation ON public.refund_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_refund_messages_user ON public.refund_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_messages_created ON public.refund_messages(created_at);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Conversations: Les users peuvent voir leurs propres conversations
ALTER TABLE public.refund_conversations ENABLE ROW LEVEL SECURITY;

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

-- Messages: Les users et admins peuvent voir et créer des messages
ALTER TABLE public.refund_messages ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- TRIGGER: Update conversation updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_refund_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.refund_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refund_message_update_conversation
  AFTER INSERT ON public.refund_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_refund_conversation_timestamp();

-- Vérification
SELECT 
  'Refund system created successfully' as status,
  COUNT(*) as conversation_count
FROM public.refund_conversations;
