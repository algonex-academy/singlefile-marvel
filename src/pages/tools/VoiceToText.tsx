import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Copy, Download, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function VoiceToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscribedText(prev => {
          const lines = prev.split('\n');
          const lastLine = lines[lines.length - 1];
          
          if (finalTranscript) {
            return prev + finalTranscript;
          } else if (interimTranscript) {
            lines[lines.length - 1] = lastLine.replace(/\s*\[.*?\]\s*$/, '') + ' [' + interimTranscript + ']';
            return lines.join('\n');
          }
          return prev;
        });
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [language, toast]);

  const startRecording = () => {
    if (!isSupported || !recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }
    
    try {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak into your microphone",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Clean up interim results
      setTranscribedText(prev => prev.replace(/\s*\[.*?\]\s*/g, ''));
      toast({
        title: "Recording Stopped",
        description: "Speech recognition ended",
      });
    }
  };

  const copyToClipboard = () => {
    const cleanText = transcribedText.replace(/\s*\[.*?\]\s*/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    });
  };

  const downloadAsFile = () => {
    const cleanText = transcribedText.replace(/\s*\[.*?\]\s*/g, '');
    const blob = new Blob([cleanText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-to-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Text file saved to your device",
    });
  };

  const clearText = () => {
    setTranscribedText("");
  };

  const speakText = () => {
    if ('speechSynthesis' in window) {
      const cleanText = transcribedText.replace(/\s*\[.*?\]\s*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language;
      speechSynthesis.speak(utterance);
    }
  };

  const getWordCount = () => {
    const cleanText = transcribedText.replace(/\s*\[.*?\]\s*/g, '');
    return cleanText.trim() ? cleanText.trim().split(/\s+/).length : 0;
  };

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "pt-PT", name: "Portuguese" },
    { code: "zh-CN", name: "Chinese (Mandarin)" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
    { code: "ar-SA", name: "Arabic" },
    { code: "hi-IN", name: "Hindi" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Mic className="h-8 w-8 text-primary" />
          Voice to Text
        </div>
        <p className="text-muted-foreground">Convert speech to editable text using your microphone</p>
      </div>

      {!isSupported && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium mb-2">
              Speech Recognition Not Supported
            </p>
            <p className="text-sm text-muted-foreground">
              Your browser doesn't support Web Speech API. Please use Chrome, Edge, or Safari for the best experience.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Recording Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
                disabled={isRecording}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recording Button */}
            <div className="text-center space-y-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isSupported}
                size="lg"
                className={`w-full h-16 ${isRecording ? 'bg-destructive hover:bg-destructive/90' : ''}`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-6 w-6 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-6 w-6 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              {isRecording && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Recording...</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                disabled={!transcribedText}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </Button>
              <Button
                variant="outline"
                onClick={downloadAsFile}
                disabled={!transcribedText}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={speakText}
                disabled={!transcribedText || !('speechSynthesis' in window)}
                className="w-full"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Read Aloud
              </Button>
              <Button
                variant="destructive"
                onClick={clearText}
                disabled={!transcribedText}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transcribed Text */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transcribed Text</span>
              {transcribedText && (
                <Badge variant="secondary">
                  {getWordCount()} words
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              placeholder="Your spoken words will appear here... Click the microphone button to start recording."
              className="min-h-[400px] text-sm leading-relaxed"
            />
            
            {isRecording && (
              <div className="mt-4 p-3 bg-muted/50 rounded border text-sm text-muted-foreground">
                <strong>Tips for better accuracy:</strong>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Minimize background noise</li>
                  <li>Use punctuation commands like "period", "comma", "question mark"</li>
                  <li>Say "new line" or "new paragraph" for breaks</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Browser Compatibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Browser Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-600 mb-2">✅ Fully Supported</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Chrome (Desktop & Mobile)</li>
                <li>• Microsoft Edge</li>
                <li>• Safari (iOS 14.5+)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-orange-600 mb-2">⚠️ Limited or No Support</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Firefox (Limited support)</li>
                <li>• Internet Explorer (Not supported)</li>
                <li>• Older browser versions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}