"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  Code,
  Quote,
  Type,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Bookmark,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface EditorBlock {
  id: string;
  type: "h1" | "h2" | "h3" | "p" | "checklist" | "ul" | "code" | "quote";
  text?: string;
  items?: { text: string; checked?: boolean }[];
  language?: string;
}

interface BlockEditorProps {
  documentId: string;
  initialContent: string;
  title: string;
  onTitleChange?: (newTitle: string) => void;
  onSave?: (content: string) => void;
}

export function BlockEditor({
  documentId,
  initialContent,
  title,
  onTitleChange,
  onSave,
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => {
    try {
      const parsed = JSON.parse(initialContent);
      if (Array.isArray(parsed.blocks)) {
        return parsed.blocks.map((b: any, idx: number) => ({
          ...b,
          id: b.id || `block-${idx}-${Date.now()}`,
        }));
      }
    } catch {
      // fallback
    }
    return [
      { id: "1", type: "h1", text: title || "Untitled" },
      { id: "2", type: "p", text: "Start writing or type '/' for commands..." },
    ];
  });

  const [savingStatus, setSavingStatus] = useState<"saved" | "saving">("saved");
  const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Autosave when blocks change
  const triggerAutoSave = (newBlocks: EditorBlock[]) => {
    setSavingStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      const contentString = JSON.stringify({ blocks: newBlocks });
      try {
        await fetch(`/api/docs/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: contentString }),
        });
        setSavingStatus("saved");
        if (onSave) onSave(contentString);
      } catch {
        setSavingStatus("saved");
      }
    }, 1200);
  };

  const updateBlock = (id: string, patch: Partial<EditorBlock>) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
    setBlocks(updated);
    triggerAutoSave(updated);
  };

  const addBlockAfter = (afterId: string, type: EditorBlock["type"] = "p") => {
    const idx = blocks.findIndex((b) => b.id === afterId);
    const newBlock: EditorBlock = {
      id: `block-${Date.now()}`,
      type,
      text: "",
      items: type === "checklist" ? [{ text: "", checked: false }] : undefined,
    };
    const updated = [...blocks];
    updated.splice(idx + 1, 0, newBlock);
    setBlocks(updated);
    triggerAutoSave(updated);
    setSlashMenuBlockId(null);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    triggerAutoSave(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent, block: EditorBlock) => {
    if (e.key === "/" && !block.text) {
      setSlashMenuBlockId(block.id);
    } else if (e.key === "Enter" && !e.shiftKey && block.type !== "code") {
      e.preventDefault();
      addBlockAfter(block.id, "p");
    }
  };

  const convertBlockType = (id: string, newType: EditorBlock["type"]) => {
    const target = blocks.find((b) => b.id === id);
    const updated = blocks.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          type: newType,
          text: b.text?.replace("/", "") || "",
          items:
            newType === "checklist"
              ? [{ text: b.text || "", checked: false }]
              : undefined,
        };
      }
      return b;
    });
    setBlocks(updated);
    triggerAutoSave(updated);
    setSlashMenuBlockId(null);
  };

  const slashCommands = [
    { label: "Text", type: "p", icon: Type, desc: "Plain text paragraph" },
    { label: "Heading 1", type: "h1", icon: Heading1, desc: "Large title" },
    { label: "Heading 2", type: "h2", icon: Heading2, desc: "Medium subsection" },
    { label: "Heading 3", type: "h3", icon: Heading3, desc: "Small section" },
    { label: "To-do List", type: "checklist", icon: CheckSquare, desc: "Track tasks with check items" },
    { label: "Code Block", type: "code", icon: Code, desc: "Code snippet with monospace" },
    { label: "Quote", type: "quote", icon: Quote, desc: "Highlighted callout block" },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Editor Status Bar */}
      <div className="flex items-center justify-between py-2 border-b border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {savingStatus === "saving" ? (
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Saving changes...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" /> All changes autosaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/70">
            Press <kbd className="font-mono bg-muted px-1 rounded">/</kbd> for block commands
          </span>
        </div>
      </div>

      {/* Blocks Container */}
      <div className="space-y-3 min-h-[500px] py-4">
        {blocks.map((block) => {
          const isSlashOpen = slashMenuBlockId === block.id;

          return (
            <div key={block.id} className="relative group flex items-start gap-2">
              {/* Left quick block actions */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 mt-1.5 transition-opacity">
                <button
                  onClick={() => addBlockAfter(block.id, "p")}
                  className="h-5 w-5 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                  title="Add block below"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="h-5 w-5 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-rose-500"
                  title="Delete block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Block Content by Type */}
              <div className="flex-1 min-w-0">
                {block.type === "h1" && (
                  <input
                    type="text"
                    value={block.text || ""}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    placeholder="Heading 1..."
                    className="w-full font-bold text-2xl sm:text-3xl bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/40 leading-tight"
                  />
                )}

                {block.type === "h2" && (
                  <input
                    type="text"
                    value={block.text || ""}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    placeholder="Heading 2..."
                    className="w-full font-semibold text-xl sm:text-2xl bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/40 mt-3"
                  />
                )}

                {block.type === "h3" && (
                  <input
                    type="text"
                    value={block.text || ""}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    placeholder="Heading 3..."
                    className="w-full font-semibold text-lg bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/40 mt-2"
                  />
                )}

                {block.type === "p" && (
                  <textarea
                    value={block.text || ""}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    placeholder="Type text or '/' for commands..."
                    rows={1}
                    className="w-full text-sm bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/30 resize-none leading-relaxed overflow-hidden"
                    style={{ height: "auto" }}
                  />
                )}

                {block.type === "quote" && (
                  <div className="border-l-4 border-primary pl-4 py-1.5 my-1 bg-primary/5 rounded-r-lg">
                    <input
                      type="text"
                      value={block.text || ""}
                      onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      placeholder="Quote or callout notes..."
                      className="w-full text-sm italic bg-transparent border-0 outline-none text-foreground/90"
                    />
                  </div>
                )}

                {block.type === "code" && (
                  <div className="rounded-lg bg-muted/60 border border-border/60 p-3 font-mono text-xs my-2">
                    <textarea
                      value={block.text || ""}
                      onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      placeholder="// Write code snippet..."
                      rows={3}
                      className="w-full bg-transparent border-0 outline-none text-foreground font-mono resize-none leading-relaxed"
                    />
                  </div>
                )}

                {block.type === "checklist" && (
                  <div className="space-y-1.5 my-1">
                    {block.items?.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.checked || false}
                          onChange={(e) => {
                            const newItems = [...(block.items || [])];
                            newItems[iIdx].checked = e.target.checked;
                            updateBlock(block.id, { items: newItems });
                          }}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                        />
                        <input
                          type="text"
                          value={item.text || ""}
                          onChange={(e) => {
                            const newItems = [...(block.items || [])];
                            newItems[iIdx].text = e.target.value;
                            updateBlock(block.id, { items: newItems });
                          }}
                          placeholder="To-do item..."
                          className={`w-full text-xs bg-transparent border-0 outline-none ${
                            item.checked ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Floating Slash Command Menu */}
                {isSlashOpen && (
                  <div className="absolute top-8 left-0 z-50 w-64 rounded-xl border border-border/80 bg-popover p-1.5 shadow-2xl space-y-1 animate-in fade-in-50 zoom-in-95">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
                      Basic Blocks
                    </div>
                    {slashCommands.map((cmd) => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.type}
                          onClick={() => convertBlockType(block.id, cmd.type as any)}
                          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent text-left transition-colors group text-xs"
                        >
                          <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{cmd.label}</div>
                            <div className="text-[10px] text-muted-foreground">{cmd.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Bottom add block button */}
        <button
          onClick={() => addBlockAfter(blocks[blocks.length - 1]?.id || "1", "p")}
          className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-foreground py-3 transition-colors"
        >
          <Plus className="h-4 w-4" /> Click or press Enter to add next block
        </button>
      </div>
    </div>
  );
}
