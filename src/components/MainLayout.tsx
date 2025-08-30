import { ReactNode, useState } from "react";
import { Search, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="hidden lg:flex items-center gap-2">
                  <h1 className="text-xl font-semibold">ProductivityHub</h1>
                  <span className="text-sm text-muted-foreground">All-in-One Productivity Suite</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-[300px]"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}