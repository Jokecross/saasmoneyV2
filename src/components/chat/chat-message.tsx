"use client";

import { Avatar } from "@/components/ui/avatar";
import { Message } from "@/types";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  userName?: string;
}

export function ChatMessage({ message, userName }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar name={userName} size="sm" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-3xl px-5 py-3",
          isUser
            ? "bg-gradient-primary text-white rounded-tr-lg"
            : "bg-gray-100 text-gray-900 rounded-tl-lg"
        )}
      >
        <div
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap",
            "[&_strong]:font-semibold",
            "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2",
            "[&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1",
            "[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2",
            "[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-2",
            "[&_li]:my-1",
            "[&_code]:bg-black/10 [&_code]:px-1 [&_code]:rounded"
          )}
          dangerouslySetInnerHTML={{
            __html: formatMessage(message.content),
          }}
        />
      </div>
    </div>
  );
}

function formatMessage(content: string): string {
  // Convert markdown-like syntax to HTML
  return content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

