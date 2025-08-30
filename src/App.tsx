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
            <Route path="/todo" element={<TodoList />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/word-counter" element={<WordCounter />} />
            <Route path="/qr-code" element={<QRCode />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
