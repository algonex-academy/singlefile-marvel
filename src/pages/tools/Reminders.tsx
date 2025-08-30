import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  title: string;
  datetime: string;
  completed: boolean;
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDatetime, setNewDatetime] = useState("");
  const { toast } = useToast();

  // Load reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("productivity-reminders");
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  }, []);

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem("productivity-reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Check for due reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((reminder) => {
        if (!reminder.completed) {
          const reminderTime = new Date(reminder.datetime);
          const timeDiff = reminderTime.getTime() - now.getTime();
          
          if (timeDiff <= 0 && timeDiff > -60000) { // Within the last minute
            toast({
              title: "🔔 Reminder",
              description: reminder.title,
            });
            
            // Mark as completed
            setReminders(prev => prev.map(r => 
              r.id === reminder.id ? { ...r, completed: true } : r
            ));
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [reminders, toast]);

  const addReminder = () => {
    if (!newTitle.trim() || !newDatetime) return;

    const reminder: Reminder = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      datetime: newDatetime,
      completed: false,
    };

    setReminders(prev => [...prev, reminder]);
    setNewTitle("");
    setNewDatetime("");
    
    toast({
      title: "Reminder Added",
      description: `Reminder set for ${new Date(newDatetime).toLocaleString()}`,
    });
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const getTimeUntil = (datetime: string) => {
    const now = new Date();
    const target = new Date(datetime);
    const diff = target.getTime() - now.getTime();

    if (diff < 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Bell className="h-8 w-8 text-primary" />
          Reminders
        </div>
        <p className="text-muted-foreground">Set reminders and get notified at the right time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Reminder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Reminder title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="md:col-span-2"
            />
            <Input
              type="datetime-local"
              value={newDatetime}
              onChange={(e) => setNewDatetime(e.target.value)}
            />
          </div>
          <Button onClick={addReminder} className="w-full md:w-auto">
            Add Reminder
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No reminders yet. Add one above to get started!
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className={reminder.completed ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <h3 className={`font-medium ${reminder.completed ? "line-through" : ""}`}>
                      {reminder.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(reminder.datetime).toLocaleString()}
                      </span>
                      <Badge variant={reminder.completed ? "secondary" : getTimeUntil(reminder.datetime) === "Overdue" ? "destructive" : "default"}>
                        {reminder.completed ? "Completed" : getTimeUntil(reminder.datetime)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReminder(reminder.id)}
                    >
                      {reminder.completed ? "Restore" : "Complete"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
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