import { useState, useRef } from "react";
import { FileImage, Upload, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from 'jspdf';

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
      // Create new PDF document
      const pdf = new jsPDF();
      let isFirstPage = true;

      for (const imageData of images) {
        // Add new page for each image (except the first one)
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Load image to get dimensions
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Get PDF page dimensions (A4: 210 x 297 mm)
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate image dimensions to fit the page with margin
            const margin = 10;
            const maxWidth = pageWidth - (margin * 2);
            const maxHeight = pageHeight - (margin * 2);
            
            let { width, height } = img;
            const aspectRatio = width / height;
            
            // Scale image to fit page
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
            const x = (pageWidth - width) / 2;
            const y = (pageHeight - height) / 2;
            
            // Add image to PDF
            pdf.addImage(imageData.url, 'JPEG', x, y, width, height);
            resolve();
          };
          img.onerror = reject;
          img.src = imageData.url;
        });
      }

      // Save and download PDF
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `images-to-pdf-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Generated",
        description: "Your PDF has been created and downloaded",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
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