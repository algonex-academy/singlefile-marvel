import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("productivity-calendar-events");
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("productivity-calendar-events", JSON.stringify(events));
  }, [events]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter(event => event.date === dateStr);
  };

  const addEvent = () => {
    if (!newEvent.title.trim() || !selectedDate) return;

    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      title: newEvent.title.trim(),
      date: selectedDate,
      time: newEvent.time || "00:00",
      description: newEvent.description.trim()
    };

    setEvents(prev => [...prev, event].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    }));

    setNewEvent({ title: "", time: "", description: "" });
    setShowAddEvent(false);
    
    toast({
      title: "Event Added",
      description: `Event scheduled for ${new Date(selectedDate).toLocaleDateString()}`,
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const days = [];
    const today = new Date();
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border/50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const dayEvents = getEventsForDate(dateStr);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;

      days.push(
        <div
          key={day}
          className={`h-24 border border-border/50 p-1 cursor-pointer transition-colors hover:bg-muted/50 ${
            isToday ? "bg-primary/10" : ""
          } ${isSelected ? "bg-primary/20" : ""}`}
          onClick={() => {
            setSelectedDate(dateStr);
            setShowAddEvent(true);
          }}
        >
          <div className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
            {day}
          </div>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded truncate"
                title={event.title}
              >
                {event.time} {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <CalendarIcon className="h-8 w-8 text-primary" />
          Calendar
        </div>
        <p className="text-muted-foreground">Monthly calendar with event management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-0 border border-border/50">
              {dayNames.map((dayName) => (
                <div key={dayName} className="h-8 border-r border-border/50 last:border-r-0 bg-muted/50 flex items-center justify-center text-sm font-medium">
                  {dayName}
                </div>
              ))}
              {renderCalendarGrid()}
            </div>
          </CardContent>
        </Card>

        {/* Events Sidebar */}
        <div className="space-y-4">
          {/* Add Event Form */}
          {showAddEvent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5" />
                  Add Event
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate && (
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedDate).toLocaleDateString()}
                  </div>
                )}
                <Input
                  placeholder="Event title..."
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                />
                <Input
                  placeholder="Description (optional)..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button onClick={addEvent} size="sm">
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddEvent(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const today = new Date();
                const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
                const todayEvents = getEventsForDate(todayStr);
                
                if (todayEvents.length === 0) {
                  return <p className="text-muted-foreground text-sm">No events today</p>;
                }
                
                return (
                  <div className="space-y-2">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{event.time}</div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const today = new Date();
                const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
                const upcomingEvents = events
                  .filter(event => event.date > todayStr)
                  .slice(0, 5);
                
                if (upcomingEvents.length === 0) {
                  return <p className="text-muted-foreground text-sm">No upcoming events</p>;
                }
                
                return (
                  <div className="space-y-2">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}