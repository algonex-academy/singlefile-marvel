import { useState, useEffect } from "react";
import { Calendar, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  date: string;
  type: "countdown" | "countup";
}

export default function DayCounter() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [eventType, setEventType] = useState<"countdown" | "countup">("countdown");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("productivity-day-counter");
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("productivity-day-counter", JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!newTitle.trim() || !newDate) return;

    const event: Event = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      date: newDate,
      type: eventType,
    };

    setEvents(prev => [...prev, event]);
    setNewTitle("");
    setNewDate("");
    
    toast({
      title: "Event Added",
      description: `${eventType === "countdown" ? "Countdown" : "Count-up"} event created`,
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const calculateDays = (date: string, type: "countdown" | "countup") => {
    const now = new Date();
    const target = new Date(date);
    const diffTime = type === "countdown" ? target.getTime() - now.getTime() : now.getTime() - target.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (type === "countdown") {
      return diffDays > 0 ? diffDays : 0;
    } else {
      return diffDays > 0 ? diffDays : 0;
    }
  };

  const getStatusText = (date: string, type: "countdown" | "countup") => {
    const days = calculateDays(date, type);
    const now = new Date();
    const target = new Date(date);
    
    if (type === "countdown") {
      if (target < now) return "Event passed";
      if (days === 0) return "Today!";
      return `${days} days left`;
    } else {
      if (target > now) return "Future event";
      if (days === 0) return "Today!";
      return `${days} days ago`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Calendar className="h-8 w-8 text-primary" />
          Day Counter
        </div>
        <p className="text-muted-foreground">Count days to events or since important dates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Event title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={eventType === "countdown" ? "default" : "outline"}
              onClick={() => setEventType("countdown")}
              size="sm"
            >
              Countdown
            </Button>
            <Button
              variant={eventType === "countup" ? "default" : "outline"}
              onClick={() => setEventType("countup")}
              size="sm"
            >
              Count Up
            </Button>
          </div>
          <Button onClick={addEvent} className="w-full md:w-auto">
            Add Event
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No events yet. Add one above to start counting!
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <Badge variant={event.type === "countdown" ? "default" : "secondary"}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {calculateDays(event.date, event.type)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getStatusText(event.date, event.type)}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}