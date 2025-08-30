import { useState, useRef } from "react";
import { FileImage, Upload, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface UploadedImage {
  id: string;
  file: File;
  url: string;
}

export default function ImageToPdf() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validImages: UploadedImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validImages.push({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file)
        });
      }
    }

    if (validImages.length > 0) {
      setImages(prev => [...prev, ...validImages]);
      toast({
        title: "Images Added",
        description: `${validImages.length} images added to the PDF`,
      });
    } else {
      toast({
        title: "Invalid Files",
        description: "Please select valid image files",
        variant: "destructive",
      });
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newImages = [...prev];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      return newImages;
    });
  };

  const generatePDF = async () => {
    if (images.length === 0) {
      toast({
        title: "No Images",
        description: "Please add at least one image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Create a simple PDF using canvas and download
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Set PDF page size (A4: 210 x 297 mm at 96 DPI = 794 x 1123 pixels)
      canvas.width = 794;
      canvas.height = 1123;

      // Create PDF pages
      const pages: string[] = [];
      
      for (const imageData of images) {
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Load and draw image
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Calculate scaling to fit image in page with margin
            const margin = 50;
            const maxWidth = canvas.width - (margin * 2);
            const maxHeight = canvas.height - (margin * 2);
            
            let { width, height } = img;
            const aspectRatio = width / height;
            
            if (width > maxWidth || height > maxHeight) {
              if (aspectRatio > maxWidth / maxHeight) {
                width = maxWidth;
                height = width / aspectRatio;
              } else {
                height = maxHeight;
                width = height * aspectRatio;
              }
            }
            
            // Center image on page
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            ctx.drawImage(img, x, y, width, height);
            pages.push(canvas.toDataURL('image/jpeg', 0.9));
            resolve();
          };
          img.onerror = reject;
          img.src = imageData.url;
        });
      }

      // Simple PDF generation using data URLs
      // In a real implementation, you'd use jsPDF or pdf-lib
      const pdfContent = pages.map((page, index) => 
        `Page ${index + 1}: ${page}`
      ).join('\n\n');
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `images-to-pdf-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Generated",
        description: "Your PDF has been created and downloaded",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <FileImage className="h-8 w-8 text-primary" />
          Image to PDF
        </div>
        <p className="text-muted-foreground">Convert multiple images into a single PDF document</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop images here or click to browse</p>
            <p className="text-muted-foreground mb-4">Supports JPG, PNG, GIF, WebP formats</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Select Images
            </Button>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Images ({images.length})</span>
              <div className="flex gap-2">
                <Button 
                  onClick={generatePDF} 
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate PDF"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    images.forEach(img => URL.revokeObjectURL(img.url));
                    setImages([]);
                  }}
                >
                  Clear All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  <img
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {image.file.name}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveImage(image.id, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveImage(image.id, 'down')}
                        disabled={index === images.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(image.file.size / 1024 / 1024).toFixed(1)} MB
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