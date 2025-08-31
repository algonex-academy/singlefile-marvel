import { useState, useRef } from "react";
import { Merge, Upload, Download, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from 'pdf-lib';

interface FileItem {
  id: string;
  file: File;
  name: string;
  size: string;
}

export default function FileMerger() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const pdfFiles = selectedFiles.filter(file => file.type === "application/pdf");
    
    if (pdfFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please select PDF files only",
        variant: "destructive",
      });
      return;
    }

    const newFiles: FileItem[] = pdfFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: formatFileSize(file.size),
    }));

    setFiles(prev => [...prev, ...newFiles]);
    toast({
      title: "Files Added",
      description: `${pdfFiles.length} PDF file(s) added to the merger`,
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({
        title: "Not Enough Files",
        description: "Please add at least 2 PDF files to merge",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      
      // Process each file in order
      for (const fileItem of files) {
        const pdfBytes = await fileItem.file.arrayBuffer();
        const pdf = await PDFDocument.load(pdfBytes);
        const pageCount = pdf.getPageCount();
        
        // Copy all pages from current PDF
        const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        
        // Add copied pages to merged PDF
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }
      
      // Serialize the merged PDF
      const pdfBytes = await mergedPdf.save();
      
      // Create download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged-document-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "PDFs merged and downloaded successfully",
      });
    } catch (error) {
      console.error('PDF merge error:', error);
      toast({
        title: "Error",
        description: "Failed to merge PDF files",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Merge className="h-8 w-8 text-primary" />
          PDF Merger & Splitter
        </div>
        <p className="text-muted-foreground">Merge multiple PDF files into one document</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Add PDF Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              Select PDF Files
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Choose multiple PDF files to merge together
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Files ({files.length})</span>
              <div className="flex gap-2">
                <Button
                  onClick={mergePDFs}
                  disabled={files.length < 2 || isProcessing}
                >
                  <Merge className="h-4 w-4 mr-2" />
                  {isProcessing ? "Merging..." : "Merge PDFs"}
                </Button>
                <Button variant="outline" size="sm" onClick={clearFiles}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveFile(file.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveFile(file.id, 'down')}
                      disabled={index === files.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        PDF
                      </Badge>
                      <span className="text-sm text-muted-foreground">{file.size}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}