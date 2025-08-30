import { useState } from "react";
import { FileText, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

export default function TextSummarizer() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryLength, setSummaryLength] = useState([3]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const summarizeText = () => {
    if (!inputText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to summarize",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simple extractive summarization algorithm
    setTimeout(() => {
      try {
        const sentences = inputText
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 10);

        if (sentences.length === 0) {
          setSummary("No valid sentences found for summarization.");
          setIsProcessing(false);
          return;
        }

        // Score sentences based on word frequency and position
        const wordFreq = new Map<string, number>();
        const words = inputText
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3);

        // Calculate word frequencies
        words.forEach(word => {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        });

        // Score sentences
        const sentenceScores = sentences.map((sentence, index) => {
          const sentenceWords = sentence
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);

          let score = 0;
          sentenceWords.forEach(word => {
            score += wordFreq.get(word) || 0;
          });

          // Boost score for sentences at the beginning
          if (index < sentences.length * 0.3) {
            score *= 1.5;
          }

          return {
            sentence: sentence.trim() + '.',
            score: score / sentenceWords.length || 0,
            index
          };
        });

        // Get top sentences
        const topSentences = sentenceScores
          .sort((a, b) => b.score - a.score)
          .slice(0, Math.min(summaryLength[0], sentences.length))
          .sort((a, b) => a.index - b.index);

        const summarizedText = topSentences
          .map(item => item.sentence)
          .join(' ');

        setSummary(summarizedText || "Could not generate summary from the provided text.");
        
        toast({
          title: "Summary Generated",
          description: `Summarized to ${topSentences.length} key sentences`,
        });
      } catch (error) {
        setSummary("Error generating summary. Please try again.");
        toast({
          title: "Error",
          description: "Failed to generate summary",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard",
      });
    });
  };

  const clearAll = () => {
    setInputText("");
    setSummary("");
  };

  const getReductionPercentage = () => {
    if (!inputText || !summary) return 0;
    return Math.round((1 - summary.length / inputText.length) * 100);
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <FileText className="h-8 w-8 text-primary" />
          Text Summarizer
        </div>
        <p className="text-muted-foreground">Summarize long text into key points</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Original Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your text here to summarize..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[300px] text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{getWordCount(inputText)} words</span>
              <span>{inputText.length} characters</span>
            </div>
            
            {/* Summary Length Control */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Summary Length</label>
                <span className="text-sm text-muted-foreground">
                  {summaryLength[0]} sentences
                </span>
              </div>
              <Slider
                value={summaryLength}
                onValueChange={setSummaryLength}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={summarizeText}
                disabled={!inputText.trim() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? "Processing..." : "Summarize Text"}
              </Button>
              <Button
                variant="outline"
                onClick={clearAll}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Summary</span>
              {summary && (
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {getReductionPercentage()}% shorter
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(summary)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary ? (
              <>
                <div className="p-4 border rounded-lg bg-muted/20 min-h-[300px] text-sm leading-relaxed">
                  {summary}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{getWordCount(summary)} words</span>
                  <span>{summary.length} characters</span>
                </div>
              </>
            ) : (
              <div className="p-4 border rounded-lg bg-muted/10 min-h-[300px] flex items-center justify-center text-muted-foreground">
                Summary will appear here after processing
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Extractive Summarization</h4>
              <p className="text-muted-foreground">
                Identifies and extracts the most important sentences based on word frequency and position.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Sentence Scoring</h4>
              <p className="text-muted-foreground">
                Scores sentences using word frequency analysis and gives higher weight to sentences at the beginning.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Customizable Length</h4>
              <p className="text-muted-foreground">
                Control the summary length by selecting the number of key sentences to include.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}