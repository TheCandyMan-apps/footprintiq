import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, File, Image, FileText, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AssetUploaderProps {
  caseId: string;
}

export function AssetUploader({ caseId }: AssetUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [classification, setClassification] = useState("");
  const queryClient = useQueryClient();

  const { data: uploads = [] } = useQuery({
    queryKey: ["case-uploads", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uploads" as any)
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const fileName = `${caseId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("case-assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("case-assets")
        .getPublicUrl(fileName);

      // Calculate SHA256 hash (simplified)
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Save metadata
      const { error: dbError } = await supabase.from("uploads" as any).insert({
        case_id: caseId,
        uploader_id: user.id,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        sha256,
        classification: classification || "unclassified",
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("File uploaded successfully");
      setFile(null);
      setClassification("");
      queryClient.invalidateQueries({ queryKey: ["case-uploads", caseId] });
    },
    onError: (error) => {
      toast.error("Upload failed: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (uploadId: string) => {
      const { error } = await supabase
        .from("uploads" as any)
        .delete()
        .eq("id", uploadId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("File deleted");
      queryClient.invalidateQueries({ queryKey: ["case-uploads", caseId] });
    },
  });

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="h-5 w-5" />;
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Asset
          </CardTitle>
          <CardDescription>
            Upload evidence files (images, documents, reports)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">File</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <Label htmlFor="classification">Classification (optional)</Label>
            <Input
              id="classification"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              placeholder="e.g., screenshot, evidence, report"
            />
          </div>
          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={!file || uploadMutation.isPending}
          >
            Upload File
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Assets</CardTitle>
          <CardDescription>
            {uploads.length} file(s) attached to this case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {uploads.map((upload: any) => (
                <Card key={upload.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getFileIcon(upload.mime_type)}
                        <div>
                          <p className="font-medium">{upload.file_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(upload.file_size)}</span>
                            {upload.classification && (
                              <Badge variant="secondary" className="text-xs">
                                {upload.classification}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(upload.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={upload.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(upload.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {uploads.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No assets uploaded yet
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
