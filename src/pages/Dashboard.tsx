import { ToolCard } from "@/components/ToolCard";
import {
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  Timer,
  Bell,
  StickyNote,
  FileImage,
  Merge,
  Archive,
  Type,
  Hash,
  Mic,
  BookOpen,
  Key,
  QrCode,
  DollarSign,
  Scale,
  Clock4,
  CloudSun,
} from "lucide-react";

const allTools = [
  // Productivity
  { title: "Reminders", description: "Set reminders with notification pop-ups", icon: Bell, url: "/reminders", gradient: "from-blue-500 to-blue-600" },
  { title: "Day Counter", description: "Count days to events or since dates", icon: Calendar, url: "/day-counter", gradient: "from-purple-500 to-purple-600" },
  { title: "To-Do List", description: "Manage tasks with priorities and deadlines", icon: CheckSquare, url: "/todo", gradient: "from-green-500 to-green-600" },
  { title: "Notes", description: "Save, edit, and organize your notes", icon: StickyNote, url: "/notes", gradient: "from-yellow-500 to-orange-500" },
  { title: "Pomodoro Timer", description: "Focus timer with work and break cycles", icon: Timer, url: "/pomodoro", gradient: "from-red-500 to-red-600" },
  { title: "Calendar", description: "Monthly calendar with event management", icon: Calendar, url: "/calendar", gradient: "from-indigo-500 to-indigo-600" },
  
  // File Tools
  { title: "Image to PDF", description: "Convert images to PDF documents", icon: FileImage, url: "/image-to-pdf", gradient: "from-teal-500 to-teal-600" },
  { title: "PDF to Image", description: "Extract PDF pages as images", icon: FileImage, url: "/pdf-to-image", gradient: "from-cyan-500 to-cyan-600" },
  { title: "File Merger", description: "Merge and split PDF files", icon: Merge, url: "/file-merger", gradient: "from-pink-500 to-pink-600" },
  { title: "Image Compressor", description: "Reduce image file sizes efficiently", icon: Archive, url: "/image-compressor", gradient: "from-violet-500 to-violet-600" },
  
  // Writing & Text
  { title: "Text Summarizer", description: "Summarize long text into key points", icon: FileText, url: "/text-summarizer", gradient: "from-emerald-500 to-emerald-600" },
  { title: "Word Counter", description: "Count words, characters, and lines", icon: Hash, url: "/word-counter", gradient: "from-lime-500 to-lime-600" },
  { title: "Voice to Text", description: "Convert speech to editable text", icon: Mic, url: "/voice-to-text", gradient: "from-rose-500 to-rose-600" },
  { title: "Dictionary", description: "Look up definitions and synonyms", icon: BookOpen, url: "/dictionary", gradient: "from-amber-500 to-amber-600" },
  { title: "Password Generator", description: "Generate and manage secure passwords", icon: Key, url: "/password-generator", gradient: "from-slate-500 to-slate-600" },
  
  // Utilities
  { title: "QR Code", description: "Generate and scan QR codes", icon: QrCode, url: "/qr-code", gradient: "from-stone-500 to-stone-600" },
  { title: "Currency Converter", description: "Convert between currencies", icon: DollarSign, url: "/currency-converter", gradient: "from-zinc-500 to-zinc-600" },
  { title: "Unit Converter", description: "Convert units of measurement", icon: Scale, url: "/unit-converter", gradient: "from-neutral-500 to-neutral-600" },
  { title: "Stopwatch", description: "Precise timing and countdown tools", icon: Clock4, url: "/stopwatch", gradient: "from-sky-500 to-sky-600" },
  { title: "Weather", description: "Check current weather conditions", icon: CloudSun, url: "/weather", gradient: "from-blue-400 to-blue-500" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          ProductivityHub
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your all-in-one productivity suite with 20 powerful tools to boost your efficiency
        </p>
      </div>

      <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allTools.map((tool) => (
          <ToolCard
            key={tool.title}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            url={tool.url}
            gradient={tool.gradient}
          />
        ))}
      </div>
    </div>
  );
}