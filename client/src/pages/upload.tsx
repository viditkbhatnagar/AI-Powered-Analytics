import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  FileText,
  File,
  Check,
  AlertCircle,
  Loader2,
  X,
  Brain,
  Edit2,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  category: string;
  isEditing?: boolean;
}

interface ExtractedData {
  industry: string;
  domains: string[];
  roles: { name: string; level: string; domain: string }[];
  salaries: { domain: string; level: string; min: number; max: number }[];
  certifications: string[];
}

const supportedFormats = [
  { ext: ".csv", icon: FileSpreadsheet, label: "CSV" },
  { ext: ".xlsx", icon: FileSpreadsheet, label: "Excel" },
  { ext: ".xls", icon: FileSpreadsheet, label: "Excel (Legacy)" },
  { ext: ".docx", icon: FileText, label: "Word" },
];

export default function UploadPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedField[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsProcessing(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      try {
        const response = await fetch("/api/upload/parse", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        clearInterval(interval);
        setProgress(100);
        return data;
      } finally {
        clearInterval(interval);
        setIsProcessing(false);
      }
    },
    onSuccess: (data) => {
      const fields: ExtractedField[] = [
        { name: "Industry", value: data.industry || "Supply Chain & Logistics", confidence: 0.95, category: "industry" },
        ...(data.domains || []).map((d: string) => ({
          name: "Domain",
          value: d,
          confidence: 0.88,
          category: "domain",
        })),
        ...(data.roles || []).map((r: any) => ({
          name: "Role",
          value: `${r.name} (${r.level})`,
          confidence: r.confidence || 0.82,
          category: "role",
        })),
        ...(data.salaries || []).map((s: any) => ({
          name: "Salary",
          value: `${s.domain}: ${s.min.toLocaleString()}-${s.max.toLocaleString()} AED`,
          confidence: s.confidence || 0.75,
          category: "salary",
        })),
      ];
      setExtractedData(fields);
      toast({
        title: "File processed",
        description: `Extracted ${fields.length} data points with AI analysis.`,
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Could not process the file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (data: ExtractedField[]) => {
      return apiRequest("POST", "/api/upload/confirm", { fields: data });
    },
    onSuccess: () => {
      toast({
        title: "Data saved",
        description: "Your data has been saved to the database.",
      });
      setFile(null);
      setExtractedData(null);
      setProgress(0);
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Could not save the data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    uploadMutation.mutate(formData);
  };

  const handleConfirm = () => {
    if (!extractedData) return;
    confirmMutation.mutate(extractedData);
  };

  const handleEditField = (index: number, newValue: string) => {
    if (!extractedData) return;
    const updated = [...extractedData];
    updated[index] = { ...updated[index], value: newValue };
    setExtractedData(updated);
  };

  const handleRemoveField = (index: number) => {
    if (!extractedData) return;
    setExtractedData(extractedData.filter((_, i) => i !== index));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const format = supportedFormats.find((f) => f.ext.includes(`.${ext}`));
    return format?.icon || File;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 dark:text-green-400";
    if (confidence >= 0.7) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Upload Data</h1>
        <p className="mt-1 text-muted-foreground">
          Upload CSV, Excel, or Word files for AI-powered data extraction
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Drag and drop or select a file to extract industry data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              data-testid="drop-zone"
            >
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
              {file ? (
                <div className="flex flex-col items-center">
                  {(() => {
                    const FileIcon = getFileIcon(file.name);
                    return <FileIcon className="mb-4 h-12 w-12 text-primary" />;
                  })()}
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setExtractedData(null);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <UploadIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-center font-medium">
                    Drop your file here or click to browse
                  </p>
                  <p className="mt-1 text-center text-sm text-muted-foreground">
                    Supports CSV, Excel, and Word documents
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {supportedFormats.map((format) => (
                <Badge key={format.ext} variant="outline" className="gap-1">
                  <format.icon className="h-3 w-3" />
                  {format.label}
                </Badge>
              ))}
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Brain className="h-4 w-4 animate-pulse text-primary" />
                    AI is analyzing your file...
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Button
              className="w-full"
              disabled={!file || isProcessing}
              onClick={handleUpload}
              data-testid="button-upload"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Extract with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Extraction</CardTitle>
            <CardDescription>
              Our AI automatically identifies industries, domains, roles, and more
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-muted-foreground">Industries</p>
                <p className="text-2xl font-bold">Auto-detect</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-muted-foreground">Domains</p>
                <p className="text-2xl font-bold">18+</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-muted-foreground">Roles</p>
                <p className="text-2xl font-bold">150+</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-muted-foreground">Certifications</p>
                <p className="text-2xl font-bold">50+</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Intelligent industry classification</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Salary range extraction (AED)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Role level detection (Entry to Executive)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Certification mapping</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {extractedData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Extracted Data Preview</CardTitle>
              <CardDescription>
                Review and edit the extracted data before saving
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setExtractedData(null);
                  setFile(null);
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={confirmMutation.isPending}
                data-testid="button-confirm"
              >
                {confirmMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Database
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Extracted Value</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractedData.map((field, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {field.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{field.name}</TableCell>
                    <TableCell>
                      <Input
                        value={field.value}
                        onChange={(e) => handleEditField(index, e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${field.confidence * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm ${getConfidenceColor(field.confidence)}`}>
                          {(field.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
