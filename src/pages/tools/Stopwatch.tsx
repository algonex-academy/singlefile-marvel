import { useState, useEffect, useRef } from "react";
import { Clock4, Play, Pause, RotateCcw, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [countdownTime, setCountdownTime] = useState(0);
  const [countdownInput, setCountdownInput] = useState({ minutes: 0, seconds: 0 });
  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === "stopwatch") {
          setTime(prev => prev + 10);
        } else {
          setCountdownTime(prev => {
            if (prev <= 10) {
              setIsRunning(false);
              return 0;
            }
            return prev - 10;
          });
        }
      }, 10);
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
  }, [isRunning, mode]);

  const formatTime = (milliseconds: number) => {
    const total = Math.floor(milliseconds / 10);
    const minutes = Math.floor(total / 6000);
    const seconds = Math.floor((total % 6000) / 100);
    const centiseconds = total % 100;
    
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  
  const reset = () => {
    setIsRunning(false);
    if (mode === "stopwatch") {
      setTime(0);
      setLaps([]);
    } else {
      setCountdownTime(0);
    }
  };

  const addLap = () => {
    if (isRunning && mode === "stopwatch") {
      setLaps(prev => [...prev, time]);
    }
  };

  const setCountdown = () => {
    const totalMs = (countdownInput.minutes * 60 + countdownInput.seconds) * 1000;
    setCountdownTime(totalMs);
    setIsRunning(false);
  };

  const getBestLap = () => {
    if (laps.length === 0) return null;
    return Math.min(...laps);
  };

  const getWorstLap = () => {
    if (laps.length === 0) return null;
    return Math.max(...laps);
  };

  const currentDisplay = mode === "stopwatch" ? time : countdownTime;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Clock4 className="h-8 w-8 text-primary" />
          Stopwatch & Timer
        </div>
        <p className="text-muted-foreground">Precise timing and countdown tools</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === "stopwatch" ? "default" : "outline"}
          onClick={() => setMode("stopwatch")}
        >
          Stopwatch
        </Button>
        <Button
          variant={mode === "countdown" ? "default" : "outline"}
          onClick={() => setMode("countdown")}
        >
          Countdown Timer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {mode === "stopwatch" ? "Stopwatch" : "Countdown Timer"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-primary mb-6">
              {formatTime(currentDisplay)}
            </div>
            
            {/* Controls */}
            <div className="flex gap-2 justify-center mb-6">
              {!isRunning ? (
                <Button onClick={start} size="lg" className="min-w-24">
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button onClick={pause} variant="outline" size="lg" className="min-w-24">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={reset} variant="outline" size="lg">
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
              {mode === "stopwatch" && (
                <Button 
                  onClick={addLap} 
                  variant="outline" 
                  size="lg"
                  disabled={!isRunning}
                >
                  <Flag className="h-5 w-5 mr-2" />
                  Lap
                </Button>
              )}
            </div>
          </div>

          {/* Countdown Setup */}
          {mode === "countdown" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-center">Set Countdown Time</h3>
              <div className="flex gap-2 items-center justify-center">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={countdownInput.minutes || ""}
                    onChange={(e) => setCountdownInput(prev => ({ 
                      ...prev, 
                      minutes: parseInt(e.target.value) || 0 
                    }))}
                    className="w-20 text-center"
                  />
                  <span className="text-sm">min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={countdownInput.seconds || ""}
                    onChange={(e) => setCountdownInput(prev => ({ 
                      ...prev, 
                      seconds: parseInt(e.target.value) || 0 
                    }))}
                    className="w-20 text-center"
                  />
                  <span className="text-sm">sec</span>
                </div>
                <Button onClick={setCountdown} variant="outline">
                  Set Timer
                </Button>
              </div>
            </div>
          )}

          {/* Laps */}
          {mode === "stopwatch" && laps.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Laps ({laps.length})</h3>
                <div className="flex gap-2 text-xs">
                  {getBestLap() && (
                    <Badge variant="secondary">
                      Best: {formatTime(getBestLap()!)}
                    </Badge>
                  )}
                  {getWorstLap() && (
                    <Badge variant="outline">
                      Worst: {formatTime(getWorstLap()!)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {laps.map((lap, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded text-sm">
                    <span>Lap {laps.length - index}</span>
                    <span className="font-mono">{formatTime(lap)}</span>
                    {lap === getBestLap() && (
                      <Badge variant="secondary" className="text-xs">Best</Badge>
                    )}
                    {lap === getWorstLap() && laps.length > 1 && (
                      <Badge variant="outline" className="text-xs">Worst</Badge>
                    )}
                  </div>
                )).reverse()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}