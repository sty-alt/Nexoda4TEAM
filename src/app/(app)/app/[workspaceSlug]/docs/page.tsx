"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import { useLocale } from "@/i18n/locale-provider";
import React, { useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Star,
  Clock,
  Share2,
  Trash2,
  BookOpen,
  Search,
  CheckCircle2,
  History,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlockEditor } from "@/components/editor/block-editor";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

function DocsContent() {
  const { locale } = useLocale();
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceSlug = params.workspaceSlug as string;
  const directDocId = searchParams.get("doc");
  const queryClient = useQueryClient();

  const [activeDocId, setActiveDocId] = useState<string | null>(directDocId);
  const [searchFilter, setSearchFilter] = useState("");

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspaceId = wsData?.workspace?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["docs", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { documents: [] };
      const res = await fetch(`/api/docs?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const documents = data?.documents || [];

  // Automatically select first document if none selected
  React.useEffect(() => {
    if (!activeDocId && documents.length > 0) {
      setActiveDocId(documents[0].id);
    }
  }, [activeDocId, documents]);

  const activeDoc = documents.find((d: any) => d.id === activeDocId) || documents[0];

  const createDocMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: "New Product Spec",
        }),
      });
      if (!res.ok) throw new Error("Failed to create document");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Document created");
      queryClient.invalidateQueries({ queryKey: ["docs"] });
      setActiveDocId(data.document.id);
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ docId, isFavorite }: { docId: string; isFavorite: boolean }) => {
      const res = await fetch(`/api/docs/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs"] });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await fetch(`/api/docs/${docId}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Document deleted");
      setActiveDocId(null);
      queryClient.invalidateQueries({ queryKey: ["docs"] });
    },
  });

  const filteredDocs = documents.filter((d: any) =>
    d.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const favoriteDocs = filteredDocs.filter((d: any) => d.isFavorite);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex gap-6">
      {/* Left Sidebar: Knowledge Base Tree */}
      <div className="w-72 border-r border-border/40 pr-4 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm tracking-tight flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /><LocalizedText> Knowledge Base
            </LocalizedText></h2>
            <Button
              size="sm"
              onClick={() => createDocMutation.mutate()}
              className="h-7 px-2 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" /><LocalizedText> New Doc
            </LocalizedText></Button>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-border/40 bg-card/60 text-xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter documents..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
            {/* Favorites section */}
            {favoriteDocs.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2"><LocalizedText>
                  Favorites
                </LocalizedText></div>
                {favoriteDocs.map((doc: any) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left group ${
                      activeDocId === doc.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* All Documents */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2"><LocalizedText>
                All Documents (</LocalizedText>{documents.length}<LocalizedText>)
              </LocalizedText></div>
              {filteredDocs.map((doc: any) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left group ${
                    activeDocId === doc.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteMutation.mutate({
                        docId: doc.id,
                        isFavorite: !doc.isFavorite,
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-amber-400 transition-opacity"
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        doc.isFavorite ? "text-amber-400 fill-amber-400" : ""
                      }`}
                    />
                  </button>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Canvas: Notion-style Block Editor */}
      <div className="flex-1 min-w-0 overflow-y-auto px-4">
        {activeDoc ? (
          <div className="space-y-4">
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    toggleFavoriteMutation.mutate({
                      docId: activeDoc.id,
                      isFavorite: !activeDoc.isFavorite,
                    })
                  }
                  className="text-muted-foreground hover:text-amber-400 transition-colors"
                  title="Favorite doc"
                >
                  <Star
                    className={`h-4 w-4 ${
                      activeDoc.isFavorite ? "text-amber-400 fill-amber-400" : ""
                    }`}
                  />
                </button>
                <span className="text-xs text-muted-foreground"><LocalizedText>
                  Updated </LocalizedText>{formatDate(activeDoc.updatedAt, locale)}<LocalizedText> by </LocalizedText>{activeDoc.author?.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Document link copied to clipboard");
                  }}
                  className="h-7 text-xs gap-1"
                >
                  <Share2 className="h-3 w-3" /><LocalizedText> Share
                </LocalizedText></Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this document?")) {
                      deleteDocMutation.mutate(activeDoc.id);
                    }
                  }}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Block Editor */}
            <BlockEditor
              key={activeDoc.id}
              documentId={activeDoc.id}
              initialContent={activeDoc.content}
              title={activeDoc.title}
              onSave={() => queryClient.invalidateQueries({ queryKey: ["docs"] })}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center p-12 text-muted-foreground text-xs"><LocalizedText>
            Select or create a document to start writing.
          </LocalizedText></div>
        )}
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground"><LocalizedText>Loading documents...</LocalizedText></div>}>
      <DocsContent />
    </Suspense>
  );
}

