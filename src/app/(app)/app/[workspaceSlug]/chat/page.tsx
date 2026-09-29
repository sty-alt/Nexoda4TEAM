"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import { useLocale } from "@/i18n/locale-provider";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Hash,
  Lock,
  Plus,
  Send,
  Smile,
  Paperclip,
  Users,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const QUICK_EMOJIS = ["👍", "❤️", "🚀", "🔥", "👀", "🎉"];

function ChatContent() {
  const { locale, t } = useLocale();
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceSlug = params.workspaceSlug as string;
  const initialChannelId = searchParams.get("channel");
  const queryClient = useQueryClient();

  const [activeChannelId, setActiveChannelId] = useState<string | null>(initialChannelId);
  const [messageInput, setMessageInput] = useState("");
  const [newChannelOpen, setNewChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelTopic, setNewChannelTopic] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspace = wsData?.workspace;
  const workspaceId = workspace?.id;

  const { data: channelsData } = useQuery({
    queryKey: ["channels", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { channels: [] };
      const res = await fetch(`/api/chat/channels?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const channels = channelsData?.channels || [];

  // Default to first channel if not set
  useEffect(() => {
    if (!activeChannelId && channels.length > 0) {
      setActiveChannelId(channels[0].id);
    }
  }, [activeChannelId, channels]);

  const activeChannel = channels.find((c: any) => c.id === activeChannelId) || channels[0];

  // Fetch messages for active channel
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", activeChannelId],
    queryFn: async () => {
      if (!activeChannelId) return { messages: [] };
      const res = await fetch(`/api/chat/messages?channelId=${activeChannelId}`);
      return res.json();
    },
    enabled: !!activeChannelId,
    refetchInterval: 3000, // Light polling fallback in addition to SSE
  });

  const messages = messagesData?.messages || [];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: activeChannelId,
          content,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeChannelId] });
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const res = await fetch("/api/chat/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeChannelId] });
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/chat/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name: newChannelName,
          topic: newChannelTopic,
        }),
      });
      if (!res.ok) throw new Error("Failed to create channel");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Channel #${data.channel.name} created!`);
      setNewChannelOpen(false);
      setNewChannelName("");
      setNewChannelTopic("");
      queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
      setActiveChannelId(data.channel.id);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex border border-border/40 rounded-2xl overflow-hidden bg-card/40 shadow-sm">
      {/* Left Column: Channels & Direct Messages */}
      <div className="w-64 border-r border-border/40 bg-sidebar/50 flex flex-col justify-between shrink-0">
        <div className="space-y-4 p-3 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary" /><LocalizedText> Workspace Chat
            </LocalizedText></h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setNewChannelOpen(true)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="Create Channel"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Channels List */}
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2"><LocalizedText>
              Channels
            </LocalizedText></div>
            {channels.map((chan: any) => {
              const isActive = chan.id === activeChannelId;
              return (
                <button
                  key={chan.id}
                  onClick={() => setActiveChannelId(chan.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    isActive
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {chan.isPrivate ? (
                      <Lock className="h-3 w-3 shrink-0" />
                    ) : (
                      <Hash className="h-3 w-3 shrink-0" />
                    )}
                    <span className="truncate">{chan.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Direct Messages */}
          <div className="space-y-1 pt-2 border-t border-border/30">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2"><LocalizedText>
              Team Members
            </LocalizedText></div>
            {workspace?.members?.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                onClick={() => {
                  toast.info(`Direct message thread with ${m.user.name}`);
                }}
              >
                <div className="relative">
                  <UserAvatar name={m.user.name} avatar={m.user.avatar} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="truncate">{m.user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Chat Stream & Message Input */}
      <div className="flex-1 flex flex-col justify-between min-w-0 bg-background/50">
        {/* Active Channel Header */}
        <div className="h-12 border-b border-border/40 px-4 flex items-center justify-between bg-card/30">
          <div className="flex items-center gap-2 min-w-0">
            <Hash className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-xs text-foreground truncate">
              {activeChannel?.name || "general"}
            </span>
            {activeChannel?.topic && (
              <span className="text-[11px] text-muted-foreground truncate hidden sm:inline"><LocalizedText>
                — </LocalizedText>{activeChannel.topic}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /><LocalizedText>
              Real-time
            </LocalizedText></span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messagesLoading && messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground animate-pulse"><LocalizedText>
              Loading chat history...
            </LocalizedText></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-xs text-muted-foreground space-y-1">
              <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="font-semibold text-foreground"><LocalizedText>Welcome to #</LocalizedText>{activeChannel?.name}<LocalizedText>!</LocalizedText></div>
              <div><LocalizedText>This is the start of the discussion. Say hello to the team.</LocalizedText></div>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div key={msg.id} className="flex items-start gap-3 text-xs group">
                <UserAvatar
                  name={msg.sender?.name || "User"}
                  avatar={msg.sender?.avatar}
                  size="default"
                  className="mt-0.5"
                />

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-foreground">
                      {msg.sender?.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString(locale === "ru" ? "ru-RU" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>

                  {/* Reactions Display */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {msg.reactions?.map((r: any) => (
                      <button
                        key={r.id}
                        onClick={() =>
                          toggleReactionMutation.mutate({
                            messageId: msg.id,
                            emoji: r.emoji,
                          })
                        }
                        className="px-2 py-0.5 rounded-full border border-border/60 bg-card/60 hover:bg-accent text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>{r.emoji}</span>
                      </button>
                    ))}

                    {/* Quick emoji popover buttons on hover */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2 transition-opacity">
                      {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() =>
                            toggleReactionMutation.mutate({
                              messageId: msg.id,
                              emoji,
                            })
                          }
                          className="h-5 w-5 rounded hover:bg-muted flex items-center justify-center text-[10px]"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-border/40 bg-card/30 flex items-center gap-2"
        >
          <Input
            placeholder={`${t("Message to #")}${activeChannel?.name || t("channel")}...`}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="text-xs bg-background/60"
            autoFocus
          />
          <Button type="submit" size="sm" className="h-9 px-3 gap-1" disabled={!messageInput.trim()}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>

      {/* New Channel Dialog */}
      <Dialog open={newChannelOpen} onOpenChange={setNewChannelOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createChannelMutation.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Hash className="h-4 w-4 text-primary" /><LocalizedText> Create New Channel
              </LocalizedText></DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground"><LocalizedText>Channel Name</LocalizedText></label>
                <Input
                  placeholder="e.g. frontend-rfc"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground"><LocalizedText>Topic / Purpose</LocalizedText></label>
                <Input
                  placeholder="What is this channel for?"
                  value={newChannelTopic}
                  onChange={(e) => setNewChannelTopic(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setNewChannelOpen(false)}><LocalizedText>
                Cancel
              </LocalizedText></Button>
              <Button type="submit" size="sm" disabled={createChannelMutation.isPending}><LocalizedText>
                Create Channel
              </LocalizedText></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground"><LocalizedText>Loading chat...</LocalizedText></div>}>
      <ChatContent />
    </Suspense>
  );
}

