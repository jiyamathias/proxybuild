"use client";

import { useState, useRef, useEffect } from "react";
import { getInitials, formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Loader2 } from "lucide-react";

interface MessageRow {
  message: {
    id: string;
    body: string;
    senderId: string;
    createdAt: Date | string;
    isDeleted: boolean;
  };
  senderFirstName: string | null;
  senderLastName: string | null;
  senderRole: string | null;
}

interface Props {
  projectId: string;
  initialMessages: MessageRow[];
  currentUserId: string;
  currentUserRole: string;
}

export function MessageThread({
  projectId,
  initialMessages,
  currentUserId,
  currentUserRole,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setBody("");
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-10 w-10 text-[var(--pb-border)] mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">
            No messages yet
          </h3>
          <p className="text-sm text-[var(--pb-text-muted)]">
            Start a conversation with the ProxyBuild team.
          </p>
        </div>
        <MessageInput
          body={body}
          sending={sending}
          onChange={setBody}
          onKeyDown={handleKeyDown}
          onSend={sendMessage}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {messages.map(({ message, senderFirstName, senderLastName, senderRole }) => {
          const isMe = message.senderId === currentUserId;
          const name =
            senderFirstName || senderLastName
              ? `${senderFirstName ?? ""} ${senderLastName ?? ""}`.trim()
              : "Team";
          const initials = getInitials(
            senderFirstName ?? "T",
            senderLastName ?? ""
          );
          const isStaff =
            senderRole && senderRole !== "CLIENT";

          return (
            <div
              key={message.id}
              className={cn("flex gap-3", isMe && "flex-row-reverse")}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  isMe
                    ? "bg-[var(--pb-green)]/20 text-[var(--pb-green)]"
                    : isStaff
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-[var(--pb-surface)] text-[var(--pb-text-muted)]"
                )}
              >
                {initials}
              </div>
              <div className={cn("flex flex-col max-w-[75%]", isMe && "items-end")}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[var(--pb-text-muted)]">
                    {isMe ? "You" : name}
                  </span>
                  {isStaff && !isMe && (
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                      ProxyBuild
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--pb-text-subtle)]">
                    {formatRelativeDate(message.createdAt)}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-sm px-4 py-2.5 rounded-2xl leading-relaxed",
                    isMe
                      ? "bg-[var(--pb-green)] text-white rounded-tr-sm"
                      : "bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)] border border-[var(--pb-border-subtle)] rounded-tl-sm"
                  )}
                >
                  {message.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <MessageInput
        body={body}
        sending={sending}
        onChange={setBody}
        onKeyDown={handleKeyDown}
        onSend={sendMessage}
      />
    </div>
  );
}

function MessageInput({
  body,
  sending,
  onChange,
  onKeyDown,
  onSend,
}: {
  body: string;
  sending: boolean;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
}) {
  return (
    <div className="flex gap-3 items-end pt-2 border-t border-[var(--pb-border-subtle)]">
      <Textarea
        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
        value={body}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={2}
        className="resize-none flex-1"
        disabled={sending}
      />
      <Button
        variant="default"
        size="sm"
        onClick={onSend}
        disabled={!body.trim() || sending}
        className="shrink-0 h-10"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
