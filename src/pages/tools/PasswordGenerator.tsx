import { useState, useEffect } from "react";
import { Key, Copy, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface SavedPassword {
  id: string;
  label: string;
  password: string;
  createdAt: string;
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([12]);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeSimilar: false,
  });
  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([]);
  const [newPasswordLabel, setNewPasswordLabel] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const characters = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz", 
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    similar: "il1Lo0O"
  };

  useEffect(() => {
    const saved = localStorage.getItem("productivity-saved-passwords");
    if (saved) {
      setSavedPasswords(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("productivity-saved-passwords", JSON.stringify(savedPasswords));
  }, [savedPasswords]);

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  const generatePassword = () => {
    let charset = "";
    
    if (options.uppercase) charset += characters.uppercase;
    if (options.lowercase) charset += characters.lowercase;
    if (options.numbers) charset += characters.numbers;
    if (options.symbols) charset += characters.symbols;
    
    if (!charset) {
      setPassword("");
      return;
    }

    if (options.excludeSimilar) {
      charset = charset.split('').filter(char => !characters.similar.includes(char)).join('');
    }

    let result = "";
    const array = new Uint8Array(length[0]);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length[0]; i++) {
      result += charset[array[i] % charset.length];
    }
    
    setPassword(result);
  };

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score < 3) return { level: "Weak", color: "destructive" };
    if (score < 5) return { level: "Medium", color: "secondary" };
    return { level: "Strong", color: "default" };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
    });
  };

  const savePassword = () => {
    if (!password || !newPasswordLabel.trim()) {
      toast({
        title: "Error",
        description: "Please enter a label for the password",
        variant: "destructive",
      });
      return;
    }

    const savedPassword: SavedPassword = {
      id: crypto.randomUUID(),
      label: newPasswordLabel.trim(),
      password,
      createdAt: new Date().toISOString(),
    };

    setSavedPasswords(prev => [...prev, savedPassword]);
    setNewPasswordLabel("");
    
    toast({
      title: "Password Saved",
      description: "Password saved securely in local storage",
    });
  };

  const deletePassword = (id: string) => {
    setSavedPasswords(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Password Deleted",
      description: "Password removed from storage",
    });
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Key className="h-8 w-8 text-primary" />
          Password Generator
        </div>
        <p className="text-muted-foreground">Generate and manage secure passwords</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Generated Password */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={password}
                  readOnly
                  className="font-mono text-sm"
                  placeholder="Generated password will appear here"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePassword}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(password)}
                  disabled={!password}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {password && (
                <div className="flex items-center gap-2">
                  <Badge variant={strength.color as any}>
                    {strength.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {password.length} characters
                  </span>
                </div>
              )}
            </div>

            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Length</label>
                <span className="text-sm text-muted-foreground">{length[0]} characters</span>
              </div>
              <Slider
                value={length}
                onValueChange={setLength}
                min={4}
                max={50}
                step={1}
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Character Types</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={options.uppercase}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, uppercase: checked as boolean }))
                    }
                  />
                  <label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={options.lowercase}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, lowercase: checked as boolean }))
                    }
                  />
                  <label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={options.numbers}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, numbers: checked as boolean }))
                    }
                  />
                  <label htmlFor="numbers" className="text-sm">Numbers (0-9)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={options.symbols}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, symbols: checked as boolean }))
                    }
                  />
                  <label htmlFor="symbols" className="text-sm">Symbols (!@#$%^&*)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeSimilar"
                    checked={options.excludeSimilar}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, excludeSimilar: checked as boolean }))
                    }
                  />
                  <label htmlFor="excludeSimilar" className="text-sm">Exclude similar characters (il1Lo0O)</label>
                </div>
              </div>
            </div>

            {/* Save Password */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium">Save Password</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Label (e.g., Gmail, Facebook)"
                  value={newPasswordLabel}
                  onChange={(e) => setNewPasswordLabel(e.target.value)}
                />
                <Button onClick={savePassword} disabled={!password}>
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Passwords */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Passwords ({savedPasswords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {savedPasswords.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No saved passwords yet
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {savedPasswords.map((saved) => (
                  <div key={saved.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{saved.label}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePasswordVisibility(saved.id)}
                        >
                          {visiblePasswords.has(saved.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(saved.password)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePassword(saved.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm font-mono">
                      {visiblePasswords.has(saved.id) 
                        ? saved.password 
                        : "•".repeat(saved.password.length)
                      }
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant={getPasswordStrength(saved.password).color as any} className="text-xs">
                        {getPasswordStrength(saved.password).level}
                      </Badge>
                      <span>
                        {new Date(saved.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}