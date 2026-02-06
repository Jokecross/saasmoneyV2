"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Écris ton message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-3 p-4 bg-white border-t border-gray-100">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none",
              "text-gray-900 placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-magenta focus:border-transparent",
              "transition-all duration-200",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="md"
          disabled={!message.trim() || disabled}
          className="rounded-xl px-4"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}

