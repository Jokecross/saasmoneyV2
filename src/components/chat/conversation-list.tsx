"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConversationItem {
  id: string;
  title: string;
  mode: string;
  createdAt: Date;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  isLoading = false,
}: ConversationListProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* New conversation button */}
      <div className="p-4 border-b border-gray-100">
        <Button
          variant="gradient"
          className="w-full"
          onClick={onNew}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau chat
        </Button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-magenta animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Aucune conversation
            </p>
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-2xl transition-all duration-200",
                  activeId === conversation.id
                    ? "bg-gradient-primary text-white shadow-soft"
                    : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      activeId === conversation.id
                        ? "text-white"
                        : "text-gray-400"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        activeId !== conversation.id && "text-gray-900"
                      )}
                    >
                      {conversation.title}
                    </p>
                    <p
                      className={cn(
                        "text-xs mt-0.5",
                        activeId === conversation.id
                          ? "text-white/70"
                          : "text-gray-400"
                      )}
                    >
                      {formatDate(conversation.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
