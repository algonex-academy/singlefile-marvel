import { useState, useEffect, useMemo } from "react";
import { Hash, FileText, Clock, BarChart3 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    if (!text) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        mostUsedWords: [],
      };
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    
    // Words count (split by whitespace and filter empty strings)
    const words = text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
    
    // Sentences count (split by sentence endings)
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length : 0;
    
    // Paragraphs count (split by double line breaks)
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length : 0;
    
    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    // Most used words (exclude common words)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'cannot', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those']);
    
    const wordFreq = new Map<string, number>();
    if (text.trim()) {
      text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.has(word))
        .forEach(word => {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        });
    }
    
    const mostUsedWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      mostUsedWords,
    };
  }, [text]);

  // Load text from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("productivity-word-counter-text");
    if (saved) {
      setText(saved);
    }
  }, []);

  // Save text to localStorage
  useEffect(() => {
    localStorage.setItem("productivity-word-counter-text", text);
  }, [text]);

  const StatCard = ({ icon: Icon, title, value, subtitle }: { 
    icon: React.ElementType; 
    title: string; 
    value: number | string; 
    subtitle?: string; 
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Hash className="h-8 w-8 text-primary" />
          Word Counter
        </div>
        <p className="text-muted-foreground">Count words, characters, and analyze your text</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Input */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Start typing or paste your text here to analyze..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[400px] resize-none text-sm leading-relaxed"
            />
          </CardContent>
        </Card>

        {/* Statistics Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatCard
                icon={Hash}
                title="Words"
                value={stats.words.toLocaleString()}
              />
              
              <StatCard
                icon={FileText}
                title="Characters"
                value={stats.characters.toLocaleString()}
                subtitle={`${stats.charactersNoSpaces.toLocaleString()} without spaces`}
              />
              
              <StatCard
                icon={FileText}
                title="Sentences"
                value={stats.sentences.toLocaleString()}
              />
              
              <StatCard
                icon={FileText}
                title="Paragraphs"
                value={stats.paragraphs.toLocaleString()}
              />
              
              <StatCard
                icon={Clock}
                title="Reading Time"
                value={stats.readingTime}
                subtitle={stats.readingTime === 1 ? "minute" : "minutes"}
              />
            </CardContent>
          </Card>

          {/* Most Used Words */}
          {stats.mostUsedWords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Used Words</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.mostUsedWords.map(([word, count], index) => (
                  <div key={word} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{word}</span>
                    </div>
                    <Badge variant="secondary">{count}x</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Additional Metrics */}
          {text && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Text Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. words per sentence:</span>
                  <span className="font-medium">
                    {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. characters per word:</span>
                  <span className="font-medium">
                    {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longest word:</span>
                  <span className="font-medium">
                    {text ? Math.max(...text.split(/\s+/).map(word => word.replace(/[^\w]/g, '').length)) : 0} chars
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}