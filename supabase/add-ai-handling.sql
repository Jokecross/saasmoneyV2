-- Add AI handling columns to refund_conversations
ALTER TABLE refund_conversations
ADD COLUMN IF NOT EXISTS acceptance_status TEXT DEFAULT 'pending' CHECK (acceptance_status IN ('pending', 'accepted', 'refused')),
ADD COLUMN IF NOT EXISTS ai_handled BOOLEAN DEFAULT false;

-- Update existing conversations to 'pending'
UPDATE refund_conversations
SET acceptance_status = 'pending'
WHERE acceptance_status IS NULL;
