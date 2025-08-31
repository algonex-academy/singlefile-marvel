import { useState, useRef } from "react";
import { Archive, Upload, Download, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CompressedImage {
  id: string;
  original: {
    file: File;
    dataUrl: string;
    size: number;
  };
  compressed: {
    dataUrl: string;
    size: number;
  };
  quality: number;
  compressionRatio: number;
}

export default function ImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [quality, setQuality] = useState([80]);
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

  const compressImage = (file: File, quality: number): Promise<{ dataUrl: string; size: number }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
          
          // Calculate approximate size
          const base64Length = compressedDataUrl.split(',')[1].length;
          const size = Math.floor((base64Length * 3) / 4);
          
          resolve({ dataUrl: compressedDataUrl, size });
        }
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please select image files only",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const newImages: CompressedImage[] = [];
      
      for (const file of imageFiles) {
        const originalDataUrl = URL.createObjectURL(file);
        const compressed = await compressImage(file, quality[0]);
        const compressionRatio = ((file.size - compressed.size) / file.size) * 100;
        
        newImages.push({
          id: crypto.randomUUID(),
          original: {
            file,
            dataUrl: originalDataUrl,
            size: file.size,
          },
          compressed,
          quality: quality[0],
          compressionRatio,
        });
      }

      setImages(prev => [...prev, ...newImages]);
      toast({
        title: "Images Compressed",
        description: `${imageFiles.length} image(s) compressed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to compress images",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (image: CompressedImage) => {
    const link = document.createElement('a');
    link.href = image.compressed.dataUrl;
    link.download = `compressed_${image.original.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const clearImages = () => {
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const recompressImage = async (id: string) => {
    const image = images.find(img => img.id === id);
    if (!image) return;

    const compressed = await compressImage(image.original.file, quality[0]);
    const compressionRatio = ((image.original.size - compressed.size) / image.original.size) * 100;

    setImages(prev => prev.map(img => 
      img.id === id 
        ? { ...img, compressed, quality: quality[0], compressionRatio }
        : img
    ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Archive className="h-8 w-8 text-primary" />
          Image Compressor
        </div>
        <p className="text-muted-foreground">Reduce image file sizes while maintaining quality</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Compression Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Quality</label>
              <span className="text-sm text-muted-foreground">{quality[0]}%</span>
            </div>
            <Slider
              value={quality}
              onValueChange={setQuality}
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher quality = larger file size. Lower quality = smaller file size.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              {isProcessing ? "Processing..." : "Select Images"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Choose image files to compress (JPG, PNG, WebP, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Compressed Images ({images.length})</span>
              <Button variant="outline" size="sm" onClick={clearImages}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Original</h4>
                      <img
                        src={image.original.dataUrl}
                        alt="Original"
                        className="w-full h-32 object-contain border rounded bg-muted"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatFileSize(image.original.size)}</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Compressed</h4>
                      <img
                        src={image.compressed.dataUrl}
                        alt="Compressed"
                        className="w-full h-32 object-contain border rounded bg-muted"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatFileSize(image.compressed.size)}</span>
                        <Badge variant="secondary">
                          -{Math.round(image.compressionRatio)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{image.original.file.name}</span>
                      <Badge variant="outline">
                        Quality: {image.quality}%
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => recompressImage(image.id)}
                      >
                        Recompress
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadImage(image)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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