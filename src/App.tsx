import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Reminders from "./pages/tools/Reminders";
import TodoList from "./pages/tools/TodoList";
import Notes from "./pages/tools/Notes";
import WordCounter from "./pages/tools/WordCounter";
import QRCode from "./pages/tools/QRCode";
import DayCounter from "./pages/tools/DayCounter";
import PomodoroTimer from "./pages/tools/PomodoroTimer";
import Calendar from "./pages/tools/Calendar";
import ImageToPdf from "./pages/tools/ImageToPdf";
import PdfToImage from "./pages/tools/PdfToImage";
import FileMerger from "./pages/tools/FileMerger";
import ImageCompressor from "./pages/tools/ImageCompressor";
import Dictionary from "./pages/tools/Dictionary";
import Stopwatch from "./pages/tools/Stopwatch";
import PasswordGenerator from "./pages/tools/PasswordGenerator";
import TextSummarizer from "./pages/tools/TextSummarizer";
import VoiceToText from "./pages/tools/VoiceToText";
import CurrencyConverter from "./pages/tools/CurrencyConverter";
import UnitConverter from "./pages/tools/UnitConverter";
import Weather from "./pages/tools/Weather";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/day-counter" element={<DayCounter />} />
            <Route path="/todo" element={<TodoList />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/pomodoro" element={<PomodoroTimer />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/image-to-pdf" element={<ImageToPdf />} />
            <Route path="/pdf-to-image" element={<PdfToImage />} />
            <Route path="/file-merger" element={<FileMerger />} />
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/text-summarizer" element={<TextSummarizer />} />
            <Route path="/voice-to-text" element={<VoiceToText />} />
            <Route path="/word-counter" element={<WordCounter />} />
            <Route path="/password-generator" element={<PasswordGenerator />} />
            <Route path="/qr-code" element={<QRCode />} />
            <Route path="/currency-converter" element={<CurrencyConverter />} />
            <Route path="/unit-converter" element={<UnitConverter />} />
            <Route path="/stopwatch" element={<Stopwatch />} />
            <Route path="/weather" element={<Weather />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
