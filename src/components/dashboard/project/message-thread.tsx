"use client";

import { useState, useRef, useEffect } from "react";
import { getInitials, formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  MessageSquare,
  Loader2,
  Paperclip,
  X,
  FileText,
} from "lucide-react";

export type MessageAttachment = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number | null;
  url: string | null;
};

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
  attachments?: MessageAttachment[];
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
  const [pending, setPending] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark messages from the other party as read when thread opens
  useEffect(() => {
    fetch(`/api/projects/${projectId}/messages/read`, { method: "PATCH" }).catch(() => {});
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Presign, PUT to R2, and return the stored descriptor. */
  async function uploadOne(file: File) {
    const presignRes = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        category: "message",
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSizeBytes: file.size,
      }),
    });
    if (!presignRes.ok) {
      const e = await presignRes.json().catch(() => ({}));
      throw new Error(e.error ?? `Could not upload ${file.name}`);
    }
    const { url: uploadUrl, key: storageKey } = await presignRes.json();

    const put = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!put.ok) throw new Error(`Upload failed for ${file.name}`);

    return {
      storageKey,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
    };
  }

  async function sendMessage() {
    const text = body.trim();
    if ((!text && pending.length === 0) || sending) return;

    setSending(true);
    setUploadError(null);
    try {
      const attachments =
        pending.length > 0
          ? await Promise.all(pending.map(uploadOne))
          : undefined;

      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, attachments }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setBody("");
        setPending([]);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        const e = await res.json().catch(() => ({}));
        setUploadError(e.error ?? "Could not send message.");
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not send message."
      );
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
          pending={pending}
          setPending={setPending}
          fileRef={fileRef}
          uploadError={uploadError}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {messages.map(({ message, senderFirstName, senderLastName, senderRole, attachments }) => {
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

                {attachments && attachments.length > 0 && (
                  <div className={cn("mt-1.5 space-y-1.5", isMe && "items-end")}>
                    {attachments.map((a) =>
                      a.mimeType.startsWith("image/") && a.url ? (
                        <a
                          key={a.id}
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl overflow-hidden border border-[var(--pb-border-subtle)] max-w-[260px]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={a.url}
                            alt={a.fileName}
                            loading="lazy"
                            className="w-full h-auto object-cover"
                          />
                        </a>
                      ) : (
                        <a
                          key={a.id}
                          href={a.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] hover:border-[var(--pb-green)]/40 transition-colors max-w-[260px]"
                        >
                          <FileText className="h-4 w-4 text-[var(--pb-text-muted)] shrink-0" />
                          <span className="text-xs text-white truncate">
                            {a.fileName}
                          </span>
                        </a>
                      )
                    )}
                  </div>
                )}
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
        pending={pending}
        setPending={setPending}
        fileRef={fileRef}
        uploadError={uploadError}
      />
    </div>
  );
}

const MAX_ATTACHMENTS = 5;

function MessageInput({
  body,
  sending,
  onChange,
  onKeyDown,
  onSend,
  pending,
  setPending,
  fileRef,
  uploadError,
}: {
  body: string;
  sending: boolean;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  pending: File[];
  setPending: React.Dispatch<React.SetStateAction<File[]>>;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploadError: string | null;
}) {
  const canSend = (body.trim().length > 0 || pending.length > 0) && !sending;

  function addFiles(list: FileList | null) {
    if (!list) return;
    setPending((prev) => [...prev, ...Array.from(list)].slice(0, MAX_ATTACHMENTS));
  }

  return (
    <div className="pt-2 border-t border-[var(--pb-border-subtle)] space-y-2">
      {pending.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pending.map((f, i) => (
            <span
              key={`${f.name}-${i}`}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] text-xs text-white max-w-[220px]"
            >
              <FileText className="h-3 w-3 text-[var(--pb-text-muted)] shrink-0" />
              <span className="truncate">{f.name}</span>
              <button
                onClick={() =>
                  setPending((prev) => prev.filter((_, idx) => idx !== i))
                }
                disabled={sending}
                className="text-[var(--pb-text-subtle)] hover:text-white shrink-0"
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

      <div className="flex gap-3 items-end">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={sending || pending.length >= MAX_ATTACHMENTS}
          className="shrink-0 h-10"
          title={
            pending.length >= MAX_ATTACHMENTS
              ? `Up to ${MAX_ATTACHMENTS} files per message`
              : "Attach a file"
          }
        >
          <Paperclip className="h-4 w-4" />
        </Button>
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
          disabled={!canSend}
          className="shrink-0 h-10"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
