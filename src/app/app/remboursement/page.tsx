"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export default function RemboursementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load or create conversation
  useEffect(() => {
    const loadConversation = async () => {
      if (!user?.id) return;

      try {
        // Check if user already has a refund conversation
        const { data: existingConv, error: convError } = await supabase
          .from("refund_conversations")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle "no rows" case

        if (convError) {
          console.error("Error loading conversation:", convError);
          setLoading(false);
          return;
        }

        if (existingConv) {
          // Conversation exists, load it
          setConversationId(existingConv.id);
          await loadMessages(existingConv.id);
        } else {
          // Create new conversation
          const { data: newConv, error: createError } = await supabase
            .from("refund_conversations")
            .insert({
              user_id: user.id,
              status: "open",
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating conversation:", createError);
            setLoading(false);
            return;
          }

          setConversationId(newConv.id);
        }

        setLoading(false);
      } catch (err) {
        console.error("Exception:", err);
        setLoading(false);
      }
    };

    loadConversation();
  }, [user?.id, supabase]);

  // Load messages
  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from("refund_messages")
        .select(`
          *,
          user:user_id(id, name, avatar_url)
        `)
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user?.id || sending) return;

    setSending(true);

    try {
      const { data, error } = await supabase
        .from("refund_messages")
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          message: newMessage.trim(),
        })
        .select(`
          *,
          user:user_id(id, name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setMessages([...messages, data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-magenta animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/app/settings")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demande de remboursement</h1>
          <p className="text-gray-500 text-sm">Conversation avec SaaS Money Admin</p>
        </div>
      </div>

      {/* Chat container */}
      <Card className="h-[600px] flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun message
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Commence la conversation en envoyant un message. L'équipe SaaS Money te répondra dans les plus brefs délais.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isCurrentUser = message.user_id === user?.id;
                const isAdmin = message.user_id !== user?.id;

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      isCurrentUser ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar
                      src={message.user?.avatar_url}
                      name={message.user?.name || "Admin"}
                      size="sm"
                    />
                    <div
                      className={cn(
                        "max-w-[70%] space-y-1",
                        isCurrentUser ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl",
                          isCurrentUser
                            ? "bg-magenta text-white"
                            : isAdmin
                            ? "bg-orange-100 text-orange-900"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <p className="text-sm">{message.message}</p>
                      </div>
                      <p className="text-xs text-gray-400 px-2">
                        {new Date(message.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-3">
            <Input
              placeholder="Écris ton message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              variant="gradient"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              loading={sending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Un membre de l'équipe SaaS Money te répondra dans les plus brefs délais.
          </p>
        </div>
      </Card>
    </div>
  );
}
