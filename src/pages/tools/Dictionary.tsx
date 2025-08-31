import { useState } from "react";
import { BookOpen, Search, Volume2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Definition {
  definition: string;
  example?: string;
  partOfSpeech: string;
}

interface WordData {
  word: string;
  phonetic: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
  audioUrl?: string;
}

export default function Dictionary() {
  const [searchWord, setSearchWord] = useState("");
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { toast } = useToast();

  const searchDictionary = async () => {
    if (!searchWord.trim()) return;

    setIsLoading(true);
    try {
      // Using Free Dictionary API
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord.trim()}`
      );

      if (!response.ok) {
        throw new Error("Word not found");
      }

      const data = await response.json();
      const entry = data[0];

      // Extract definitions grouped by part of speech
      const definitions: Definition[] = [];
      const synonyms = new Set<string>();
      const antonyms = new Set<string>();

      entry.meanings.forEach((meaning: any) => {
        meaning.definitions.forEach((def: any) => {
          definitions.push({
            definition: def.definition,
            example: def.example,
            partOfSpeech: meaning.partOfSpeech,
          });

          // Collect synonyms and antonyms
          def.synonyms?.forEach((syn: string) => synonyms.add(syn));
          def.antonyms?.forEach((ant: string) => antonyms.add(ant));
        });
      });

      // Find audio pronunciation
      const audioUrl = entry.phonetics?.find((p: any) => p.audio)?.audio;

      const wordData: WordData = {
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics?.[0]?.text || "",
        definitions,
        synonyms: Array.from(synonyms),
        antonyms: Array.from(antonyms),
        audioUrl,
      };

      setWordData(wordData);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [searchWord.trim(), ...prev.filter(w => w !== searchWord.trim())];
        return updated.slice(0, 10); // Keep only last 10 searches
      });

      toast({
        title: "Definition Found",
        description: `Found definition for "${searchWord}"`,
      });
    } catch (error) {
      toast({
        title: "Word Not Found",
        description: "Could not find definition for the searched word",
        variant: "destructive",
      });
      setWordData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const playPronunciation = () => {
    if (wordData?.audioUrl) {
      const audio = new Audio(wordData.audioUrl);
      audio.play().catch(() => {
        toast({
          title: "Audio Unavailable",
          description: "Could not play pronunciation audio",
          variant: "destructive",
        });
      });
    }
  };

  const searchRecentWord = (word: string) => {
    setSearchWord(word);
    // Auto-search when clicking recent word
    setTimeout(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      searchDictionary();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchDictionary();
    }
  };

  // Group definitions by part of speech
  const groupedDefinitions = wordData?.definitions.reduce((acc, def) => {
    if (!acc[def.partOfSpeech]) {
      acc[def.partOfSpeech] = [];
    }
    acc[def.partOfSpeech].push(def);
    return acc;
  }, {} as Record<string, Definition[]>) || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <BookOpen className="h-8 w-8 text-primary" />
          Dictionary & Thesaurus
        </div>
        <p className="text-muted-foreground">Look up definitions, synonyms, and pronunciations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Dictionary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a word to search..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchDictionary} disabled={isLoading || !searchWord.trim()}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Recent Searches</h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((word, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => searchRecentWord(word)}
                  >
                    {word}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {wordData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold capitalize">{wordData.word}</h2>
                  {wordData.audioUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playPronunciation}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {wordData.phonetic && (
                  <p className="text-muted-foreground font-mono">{wordData.phonetic}</p>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="definitions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="definitions">Definitions</TabsTrigger>
                <TabsTrigger value="synonyms">Synonyms</TabsTrigger>
                <TabsTrigger value="antonyms">Antonyms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="definitions" className="space-y-4">
                {Object.entries(groupedDefinitions).map(([partOfSpeech, definitions]) => (
                  <div key={partOfSpeech} className="space-y-3">
                    <Badge variant="secondary" className="capitalize">
                      {partOfSpeech}
                    </Badge>
                    <div className="space-y-2 ml-4">
                      {definitions.map((def, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-sm leading-relaxed">{def.definition}</p>
                          {def.example && (
                            <p className="text-xs text-muted-foreground italic">
                              Example: "{def.example}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="synonyms" className="space-y-4">
                {wordData.synonyms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {wordData.synonyms.map((synonym, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => searchRecentWord(synonym)}
                        className="h-auto py-1 px-2"
                      >
                        {synonym}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No synonyms found for this word.</p>
                )}
              </TabsContent>
              
              <TabsContent value="antonyms" className="space-y-4">
                {wordData.antonyms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {wordData.antonyms.map((antonym, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => searchRecentWord(antonym)}
                        className="h-auto py-1 px-2"
                      >
                        {antonym}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No antonyms found for this word.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}