import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Edit3, Check, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
}

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const { toast } = useToast();

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("productivity-tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("productivity-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [task, ...prev]);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    
    toast({
      title: "Task Added",
      description: `"${task.title}" has been added to your todo list.`,
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: "Task Deleted",
      description: "Task has been removed from your list.",
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <CheckSquare className="h-8 w-8 text-primary" />
          To-Do List
        </div>
        <p className="text-muted-foreground">Organize your tasks and boost productivity</p>
      </div>

      {/* Add New Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Input
              placeholder="Description (optional)..."
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
              className="input-field"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              placeholder="Due date (optional)"
            />
            <Button onClick={addTask} className="w-full">
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All ({tasks.length})
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
          size="sm"
        >
          Active ({tasks.filter(t => !t.completed).length})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
          size="sm"
        >
          Completed ({tasks.filter(t => t.completed).length})
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {filter === "all" ? "No tasks yet. Add one above to get started!" :
               filter === "active" ? "No active tasks. Great job!" :
               "No completed tasks yet."}
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className={task.completed ? "opacity-75" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className={`font-medium ${task.completed ? "line-through" : ""}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-sm text-muted-foreground ${task.completed ? "line-through" : ""}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(task.priority) as any}>
                          {task.priority}
                        </Badge>
                        
                        {task.dueDate && (
                          <Badge variant={isOverdue(task.dueDate) && !task.completed ? "destructive" : "outline"}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                      {isOverdue(task.dueDate) && !task.completed && (
                        <span className="text-red-500 font-medium">• Overdue</span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}