"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Inbox,
  Mail,
  Search,
  Send,
  X,
  Clock3,
  MessageSquareText,
} from "lucide-react";
import { showToast } from "@/components/ToastProvider";

type Message = {
  id: string;
  name: string;
  email: string;
  subject?: string;
  project_type?: string;
  created_at: string;
  message: string;
};

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

function messageSubject(message: Message) {
  return message.subject || message.project_type || "Website enquiry";
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/messages")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "Could not load messages.");
        setMessages(data);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error ? reason.message : "Could not load messages.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      messages.filter((message) =>
        [
          message.name,
          message.email,
          message.subject,
          message.project_type,
          message.message,
        ].some((value) => value?.toLowerCase().includes(query.toLowerCase())),
      ),
    [messages, query],
  );

  async function sendReply(
    event: FormEvent<HTMLFormElement>,
    message: Message,
  ) {
    event.preventDefault();
    setSending(true);
    try {
      const response = await fetch(`/api/messages/${message.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Could not send reply.");
      showToast(`Reply sent to ${message.email}.`);
      setReply("");
      setReplyTo(null);
    } catch (reason) {
      showToast(
        reason instanceof Error ? reason.message : "Could not send reply.",
        "error",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="admin-content">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[#147ee8]">
            Client communication
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Messages</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Review website enquiries and reply directly to clients from your
            workspace.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#147ee8]">
            <Inbox size={19} />
          </span>
          <div>
            <p className="text-2xl font-black leading-none">
              {messages.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Total enquiries</p>
          </div>
        </div>
      </div>

      <section className="card mt-8 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-4 md:p-5">
          <div>
            <h2 className="font-black">Client inbox</h2>
            <p className="mt-1 text-xs text-slate-500">
              Newest enquiries appear first.
            </p>
          </div>
          <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 sm:max-w-sm">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              aria-label="Search messages"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-0 bg-transparent py-2.5 text-sm outline-none"
              placeholder="Search enquiries…"
            />
          </label>
        </div>
        {error && (
          <p
            role="alert"
            className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {loading ? (
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div className="h-44 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-44 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : !filtered.length ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#147ee8]">
              <MessageSquareText size={23} />
            </span>
            <h3 className="mt-4 font-black">
              {query ? "No matching enquiries" : "Your inbox is clear"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {query
                ? "Try another name, email or phrase."
                : "New messages from the website will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((message) => (
              <article
                key={message.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-black text-[#147ee8]">
                    {initials(message.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-black">{message.name}</h3>
                    <a
                      href={`mailto:${encodeURIComponent(message.email)}`}
                      className="mt-0.5 block truncate text-xs text-slate-500 hover:text-[#147ee8]"
                    >
                      {message.email}
                    </a>
                  </div>
                  <time
                    className="shrink-0 text-[11px] text-slate-400"
                    dateTime={message.created_at}
                  >
                    {new Date(message.created_at).toLocaleDateString()}
                  </time>
                </div>
                <div className="mt-5">
                  <span className="inline-flex max-w-full rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    <span className="truncate">{messageSubject(message)}</span>
                  </span>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                    {message.message}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock3 size={13} />
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    type="button"
                    aria-expanded={replyTo === message.id}
                    onClick={() => {
                      setReplyTo(replyTo === message.id ? null : message.id);
                      setReply("");
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#147ee8] transition hover:bg-blue-100"
                  >
                    <Mail size={14} />
                    {replyTo === message.id ? "Close" : "Reply"}
                  </button>
                </div>
                {replyTo === message.id && (
                  <form
                    onSubmit={(event) => sendReply(event, message)}
                    className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">
                          Reply to {message.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          To: {message.email}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          Subject: Re: {messageSubject(message)}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Close reply form"
                        onClick={() => setReplyTo(null)}
                        className="rounded-lg p-1 text-slate-500 transition hover:bg-blue-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <textarea
                      required
                      rows={5}
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder={`Write a reply to ${message.name}…`}
                      className="input mt-4 min-h-28 w-full resize-y bg-white"
                    />
                    <button
                      disabled={sending || !reply.trim()}
                      className="btn btn-primary mt-3 w-full disabled:cursor-wait disabled:opacity-60"
                    >
                      <Send size={15} />
                      {sending ? "Sending reply…" : "Send reply"}
                    </button>
                  </form>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
