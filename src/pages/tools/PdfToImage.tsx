import { useState, useRef } from "react";
import { FileImage, Upload, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';

interface ExtractedImage {
  id: string;
  dataUrl: string;
  pageNumber: number;
}

export default function PdfToImage() {
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Set worker source for PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      
      const images: ExtractedImage[] = [];
      
      // Process each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 2.0; // Higher scale for better quality
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        };
        
        await page.render(renderContext).promise;
        const dataUrl = canvas.toDataURL('image/png');
        
        images.push({
          id: crypto.randomUUID(),
          dataUrl,
          pageNumber: pageNum,
        });
      }
      
      setExtractedImages(images);
      toast({
        title: "Success",
        description: `PDF converted to ${images.length} image(s) successfully`,
      });
    } catch (error) {
      console.error('PDF processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process PDF file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (image: ExtractedImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `page-${image.pageNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearImages = () => {
    setExtractedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <FileImage className="h-8 w-8 text-primary" />
          PDF to Image Converter
        </div>
        <p className="text-muted-foreground">Extract PDF pages as downloadable images</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              {isProcessing ? "Processing..." : "Select PDF File"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Choose a PDF file to extract pages as images
            </p>
          </div>
        </CardContent>
      </Card>

      {extractedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Extracted Images ({extractedImages.length})</span>
              <Button variant="outline" size="sm" onClick={clearImages}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {extractedImages.map((image) => (
                <div key={image.id} className="space-y-2">
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.dataUrl}
                      alt={`Page ${image.pageNumber}`}
                      className="w-full h-32 object-contain bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Page {image.pageNumber}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => downloadImage(image)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}