import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "work" | "shortBreak" | "longBreak";

export default function PomodoroTimer() {
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [currentMode, setCurrentMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getDuration = (mode: TimerMode) => {
    switch (mode) {
      case "work": return workDuration;
      case "shortBreak": return shortBreakDuration;
      case "longBreak": return longBreakDuration;
    }
  };

  const getModeLabel = (mode: TimerMode) => {
    switch (mode) {
      case "work": return "Work Time";
      case "shortBreak": return "Short Break";
      case "longBreak": return "Long Break";
    }
  };

  const getModeColor = (mode: TimerMode) => {
    switch (mode) {
      case "work": return "default";
      case "shortBreak": return "secondary";
      case "longBreak": return "destructive";
    }
  };

  useEffect(() => {
    setTimeLeft(getDuration(currentMode) * 60);
  }, [currentMode, workDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    toast({
      title: "Timer Complete!",
      description: `${getModeLabel(currentMode)} session finished`,
    });

    if (currentMode === "work") {
      setSessionsCompleted(prev => prev + 1);
      // After 4 work sessions, suggest long break
      const nextSessions = sessionsCompleted + 1;
      if (nextSessions % 4 === 0) {
        setCurrentMode("longBreak");
      } else {
        setCurrentMode("shortBreak");
      }
    } else {
      setCurrentMode("work");
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(currentMode) * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((getDuration(currentMode) * 60 - timeLeft) / (getDuration(currentMode) * 60)) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Timer className="h-8 w-8 text-primary" />
          Pomodoro Timer
        </div>
        <p className="text-muted-foreground">Focus timer with work and break cycles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getModeColor(currentMode)}>
                {getModeLabel(currentMode)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Sessions: {sessionsCompleted}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {showSettings && (
            <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
              <div>
                <label className="text-sm font-medium">Work (min)</label>
                <Input
                  type="number"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(Number(e.target.value))}
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Short Break (min)</label>
                <Input
                  type="number"
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                  min="1"
                  max="30"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Long Break (min)</label>
                <Input
                  type="number"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                  min="1"
                  max="60"
                />
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
              <div
                className="absolute inset-0 rounded-full border-8 border-primary transition-all duration-1000"
                style={{
                  clipPath: `conic-gradient(from 0deg, transparent ${100 - progress}%, currentColor ${100 - progress}%)`,
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              {!isRunning ? (
                <Button onClick={startTimer} size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button onClick={pauseTimer} variant="outline" size="lg">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={resetTimer} variant="outline" size="lg">
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={currentMode === "work" ? "default" : "outline"}
              onClick={() => setCurrentMode("work")}
              disabled={isRunning}
              size="sm"
            >
              Work
            </Button>
            <Button
              variant={currentMode === "shortBreak" ? "default" : "outline"}
              onClick={() => setCurrentMode("shortBreak")}
              disabled={isRunning}
              size="sm"
            >
              Short Break
            </Button>
            <Button
              variant={currentMode === "longBreak" ? "default" : "outline"}
              onClick={() => setCurrentMode("longBreak")}
              disabled={isRunning}
              size="sm"
            >
              Long Break
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}