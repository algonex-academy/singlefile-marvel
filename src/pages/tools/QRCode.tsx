import { useState, useRef, useEffect } from "react";
import { QrCode, Download, Upload, Camera, Link, Type, Mail, Phone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    QRCode: any;
  }
}

export default function QRCodeTool() {
  const [qrText, setQrText] = useState("");
  const [qrDataURL, setQrDataURL] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [isLoading, setIsLoading] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // QR Code data templates
  const [urlData, setUrlData] = useState("https://");
  const [emailData, setEmailData] = useState({ email: "", subject: "", body: "" });
  const [phoneData, setPhoneData] = useState("");
  const [wifiData, setWifiData] = useState({ ssid: "", password: "", security: "WPA" });

  // Load QR code library
  useEffect(() => {
    if (!window.QRCode) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
      script.onload = () => setQrLoaded(true);
      script.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load QR code library",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);
    } else {
      setQrLoaded(true);
    }
  }, [toast]);

  const generateQRCode = async (text: string) => {
    if (!text.trim() || !qrLoaded || !window.QRCode) return;
    
    setIsLoading(true);
    
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        await window.QRCode.toCanvas(canvas, text, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        const dataURL = canvas.toDataURL('image/png');
        setQrDataURL(dataURL);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    let textToEncode = "";
    
    switch (tab) {
      case "text":
        textToEncode = qrText;
        break;
      case "url":
        textToEncode = urlData;
        break;
      case "email":
        textToEncode = `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        break;
      case "phone":
        textToEncode = `tel:${phoneData}`;
        break;
      case "wifi":
        textToEncode = `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};;`;
        break;
    }
    
    if (textToEncode) {
      generateQRCode(textToEncode);
    }
  };

  const downloadQRCode = () => {
    if (!qrDataURL) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataURL;
    link.click();
    
    toast({
      title: "Downloaded",
      description: "QR code saved to your downloads folder",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      // This would require a QR code reader library
      // For now, just show a message
      toast({
        title: "Feature Coming Soon",
        description: "QR code scanning from images will be available soon",
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <QrCode className="h-8 w-8 text-primary" />
          QR Code Generator
        </div>
        <p className="text-muted-foreground">Generate QR codes for text, URLs, contacts, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generate QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="text" className="text-xs">
                  <Type className="h-3 w-3 mr-1" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="url" className="text-xs">
                  <Link className="h-3 w-3 mr-1" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="email" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="text-xs">
                  <Phone className="h-3 w-3 mr-1" />
                  Phone
                </TabsTrigger>
                <TabsTrigger value="wifi" className="text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  WiFi
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label htmlFor="qr-text">Enter text to encode</Label>
                  <Textarea
                    id="qr-text"
                    placeholder="Type any text here..."
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={() => generateQRCode(qrText)} 
                  className="w-full"
                  disabled={!qrText.trim() || isLoading || !qrLoaded}
                >
                  {isLoading ? "Generating..." : "Generate QR Code"}
                </Button>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div>
                  <Label htmlFor="url-input">Website URL</Label>
                  <Input
                    id="url-input"
                    placeholder="https://example.com"
                    value={urlData}
                    onChange={(e) => setUrlData(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={() => generateQRCode(urlData)} 
                  className="w-full"
                  disabled={!urlData.trim() || isLoading || !qrLoaded}
                >
                  {isLoading ? "Generating..." : "Generate QR Code"}
                </Button>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="someone@example.com"
                      value={emailData.email}
                      onChange={(e) => setEmailData(prev => ({...prev, email: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject (optional)</Label>
                    <Input
                      id="subject"
                      placeholder="Email subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({...prev, subject: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="body">Message (optional)</Label>
                    <Textarea
                      id="body"
                      placeholder="Email body text"
                      value={emailData.body}
                      onChange={(e) => setEmailData(prev => ({...prev, body: e.target.value}))}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    const emailText = `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
                    generateQRCode(emailText);
                  }}
                  className="w-full"
                  disabled={!emailData.email.trim() || isLoading || !qrLoaded}
                >
                  {isLoading ? "Generating..." : "Generate QR Code"}
                </Button>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    value={phoneData}
                    onChange={(e) => setPhoneData(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={() => generateQRCode(`tel:${phoneData}`)} 
                  className="w-full"
                  disabled={!phoneData.trim() || isLoading || !qrLoaded}
                >
                  {isLoading ? "Generating..." : "Generate QR Code"}
                </Button>
              </TabsContent>

              <TabsContent value="wifi" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="ssid">Network Name (SSID)</Label>
                    <Input
                      id="ssid"
                      placeholder="My WiFi Network"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData(prev => ({...prev, ssid: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="WiFi password"
                      value={wifiData.password}
                      onChange={(e) => setWifiData(prev => ({...prev, password: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="security">Security Type</Label>
                    <select
                      id="security"
                      value={wifiData.security}
                      onChange={(e) => setWifiData(prev => ({...prev, security: e.target.value}))}
                      className="input-field w-full"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open)</option>
                    </select>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    const wifiText = `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};;`;
                    generateQRCode(wifiText);
                  }}
                  className="w-full"
                  disabled={!wifiData.ssid.trim() || isLoading || !qrLoaded}
                >
                  {isLoading ? "Generating..." : "Generate QR Code"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated QR Code
              {qrDataURL && (
                <Button size="sm" onClick={downloadQRCode}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg min-h-[280px]">
              {qrDataURL ? (
                <div className="text-center space-y-4">
                  <canvas
                    ref={canvasRef}
                    className="border rounded-lg shadow-sm"
                    style={{ maxWidth: "256px", maxHeight: "256px" }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Right-click to save or use the download button
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter some content and generate a QR code</p>
                  {!qrLoaded && <p className="text-xs mt-2">Loading QR library...</p>}
                </div>
              )}
            </div>

            {/* QR Code Scanner (Future Feature) */}
            <div className="border-t pt-4">
              <Label htmlFor="qr-upload" className="text-sm font-medium">
                Scan QR Code from Image
              </Label>
              <div className="mt-2">
                <Input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an image containing a QR code to decode it
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}