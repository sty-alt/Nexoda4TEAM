"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import { useLocale } from "@/i18n/locale-provider";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HardDrive,
  Folder,
  File,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  FolderPlus,
  Trash2,
  Download,
  Search,
  Grid,
  List as ListIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function DrivePage() {
  const { locale } = useLocale();
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspaceId = wsData?.workspace?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["drive", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { files: [] };
      const res = await fetch(`/api/drive?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const files = data?.files || [];

  const createFolderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name: folderName.trim(),
          isFolder: true,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Folder created");
      setCreateFolderOpen(false);
      setFolderName("");
      queryClient.invalidateQueries({ queryKey: ["drive"] });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name: fileName.trim(),
          size: Math.floor(500000 + Math.random() * 4000000),
          mimeType: fileName.endsWith(".png") ? "image/png" : "application/pdf",
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("File uploaded to Drive");
      setUploadOpen(false);
      setFileName("");
      queryClient.invalidateQueries({ queryKey: ["drive"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/drive?id=${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Item removed");
      queryClient.invalidateQueries({ queryKey: ["drive"] });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "—";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filtered = files.filter((f: any) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight"><LocalizedText>Drive Storage</LocalizedText></h1>
          <p className="text-xs text-muted-foreground mt-0.5"><LocalizedText>
            Cloud file storage, shared team assets, and documentation attachments
          </LocalizedText></p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateFolderOpen(true)}
            className="text-xs gap-1.5 h-8"
          >
            <FolderPlus className="h-4 w-4" /><LocalizedText> New Folder
          </LocalizedText></Button>
          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="text-xs gap-1.5 h-8"
          >
            <UploadCloud className="h-4 w-4" /><LocalizedText> Upload File
          </LocalizedText></Button>
        </div>
      </div>

      {/* Search & View Mode Toolbar */}
      <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl border border-border/40 bg-card/50">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground ml-1" />
          <input
            type="text"
            placeholder="Search drive files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 border border-border/40 rounded-lg p-0.5 bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`h-7 w-7 p-0 ${viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground"}`}
          >
            <Grid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`h-7 w-7 p-0 ${viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground"}`}
          >
            <ListIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Files Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-border/60 p-8 space-y-2">
          <HardDrive className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <h3 className="font-semibold text-sm"><LocalizedText>Drive is Empty</LocalizedText></h3>
          <p className="text-xs text-muted-foreground"><LocalizedText>
            Create a folder or upload documents, design specs, and images.
          </LocalizedText></p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item: any) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-all flex flex-col justify-between space-y-3 group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-primary">
                  {item.isFolder ? (
                    <Folder className="h-5 w-5 fill-primary/20 text-primary" />
                  ) : item.name.endsWith(".png") || item.name.endsWith(".jpg") ? (
                    <ImageIcon className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-500" />
                  )}
                </div>

                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-opacity"
                  title="Delete file"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div>
                <h4 className="font-medium text-xs text-foreground truncate" title={item.name}>
                  {item.name}
                </h4>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-between">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{formatDate(item.createdAt, locale)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 overflow-hidden bg-card">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/40 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3"><LocalizedText>Name</LocalizedText></th>
                <th className="p-3 w-32"><LocalizedText>Size</LocalizedText></th>
                <th className="p-3 w-40"><LocalizedText>Uploaded</LocalizedText></th>
                <th className="p-3 w-16 text-right"><LocalizedText>Action</LocalizedText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((item: any) => (
                <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                  <td className="p-3 flex items-center gap-2.5 font-medium">
                    {item.isFolder ? (
                      <Folder className="h-4 w-4 text-primary" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{item.name}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatFileSize(item.size)}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(item.createdAt, locale)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="text-muted-foreground hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 ml-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Folder Modal */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createFolderMutation.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-primary" /><LocalizedText> Create Folder
              </LocalizedText></DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2 text-xs">
              <label className="font-medium text-muted-foreground"><LocalizedText>Folder Name</LocalizedText></label>
              <Input
                placeholder="e.g. Design Assets"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateFolderOpen(false)}><LocalizedText>
                Cancel
              </LocalizedText></Button>
              <Button type="submit" size="sm" disabled={createFolderMutation.isPending}><LocalizedText>
                Create
              </LocalizedText></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload File Modal */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              uploadFileMutation.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" /><LocalizedText> Upload File
              </LocalizedText></DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2 text-xs">
              <label className="font-medium text-muted-foreground"><LocalizedText>File Name with Extension</LocalizedText></label>
              <Input
                placeholder="e.g. architecture_blueprint_v3.png"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setUploadOpen(false)}><LocalizedText>
                Cancel
              </LocalizedText></Button>
              <Button type="submit" size="sm" disabled={uploadFileMutation.isPending}><LocalizedText>
                Upload
              </LocalizedText></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

