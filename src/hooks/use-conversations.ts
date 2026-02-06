"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Conversation, Message } from "@/lib/supabase/types";

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }

    setConversations(data || []);
    setIsLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = async (
    mode: string = "coach"
  ): Promise<Conversation | null> => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        mode,
        title: "Nouvelle conversation",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    return data;
  };

  const updateConversationTitle = async (id: string, title: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating conversation:", error);
      return;
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting conversation:", error);
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    conversations,
    isLoading,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    refetch: fetchConversations,
  };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = getSupabaseClient();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
      return;
    }

    setMessages(data || []);
    setIsLoading(false);
  }, [conversationId, supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const addMessage = async (
    content: string,
    role: "user" | "assistant"
  ): Promise<Message | null> => {
    if (!conversationId) return null;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        content,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding message:", error);
      return null;
    }

    setMessages((prev) => [...prev, data]);

    // Update conversation's updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data;
  };

  return {
    messages,
    isLoading,
    addMessage,
    setMessages,
    refetch: fetchMessages,
  };
}

