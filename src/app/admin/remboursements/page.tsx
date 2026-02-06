"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Send,
  MessageSquare,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
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

interface Conversation {
  id: string;
  user_id: string;
  status: "open" | "resolved" | "cancelled";
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
  unread_count?: number;
}

export default function AdminRemboursementsPage() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load all conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data, error } = await supabase
          .from("refund_conversations")
          .select(`
            *,
            user:user_id(id, name, email, avatar_url)
          `)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setConversations(data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading conversations:", err);
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      loadConversations();
    }
  }, [user?.role, supabase]);

  // Load messages for selected conversation
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

  // Select conversation
  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    await loadMessages(conv.id);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id || sending) return;

    setSending(true);

    try {
      const { data, error } = await supabase
        .from("refund_messages")
        .insert({
          conversation_id: selectedConversation.id,
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

  // Update conversation status
  const updateStatus = async (convId: string, status: "open" | "resolved" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("refund_conversations")
        .update({ status })
        .eq("id", convId);

      if (error) throw error;

      // Update local state
      setConversations(conversations.map(c =>
        c.id === convId ? { ...c, status } : c
      ));

      if (selectedConversation?.id === convId) {
        setSelectedConversation({ ...selectedConversation, status });
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-magenta animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demandes de remboursement</h1>
        <p className="text-gray-500 text-sm">Gérer les conversations avec les élèves</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[700px]">
        {/* Conversations list */}
        <Card className="col-span-4 overflow-y-auto p-4">
          <h2 className="font-semibold text-gray-900 mb-4">
            Conversations ({conversations.length})
          </h2>

          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune demande</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-colors",
                    selectedConversation?.id === conv.id
                      ? "bg-magenta-50 border-2 border-magenta"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      src={conv.user?.avatar_url}
                      name={conv.user?.name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {conv.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        conv.status === "open"
                          ? "orange"
                          : conv.status === "resolved"
                          ? "default"
                          : "default"
                      }
                      size="sm"
                      className={
                        conv.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : conv.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : ""
                      }
                    >
                      {conv.status === "open"
                        ? "En cours"
                        : conv.status === "resolved"
                        ? "Résolu"
                        : "Annulé"}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(conv.updated_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat area */}
        <Card className="col-span-8 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={selectedConversation.user?.avatar_url}
                      name={selectedConversation.user?.name}
                      size="sm"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedConversation.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selectedConversation.id, "resolved")}
                      disabled={selectedConversation.status === "resolved"}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Résolu
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selectedConversation.id, "cancelled")}
                      disabled={selectedConversation.status === "cancelled"}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Clock className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">Aucun message pour le moment</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isAdmin = message.user_id === user?.id;

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            isAdmin ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <Avatar
                            src={message.user?.avatar_url}
                            name={message.user?.name || "User"}
                            size="sm"
                          />
                          <div
                            className={cn(
                              "max-w-[70%] space-y-1",
                              isAdmin ? "items-end" : "items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "px-4 py-2 rounded-2xl",
                                isAdmin
                                  ? "bg-orange text-white"
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

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Input
                    placeholder="Répondre en tant qu'admin..."
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
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">
                Sélectionne une conversation pour commencer
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
