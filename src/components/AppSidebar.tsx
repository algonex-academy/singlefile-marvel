import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  Clock,
  FileText,
  Settings,
  Search,
  CheckSquare,
  Timer,
  Bell,
  StickyNote,
  FileImage,
  Merge,
  Scissors,
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
  FolderOpen,
  Zap,
  PenTool,
  Wrench,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const toolCategories = [
  {
    title: "Productivity",
    icon: Zap,
    tools: [
      { title: "Reminders", url: "/reminders", icon: Bell },
      { title: "Day Counter", url: "/day-counter", icon: Calendar },
      { title: "To-Do List", url: "/todo", icon: CheckSquare },
      { title: "Notes", url: "/notes", icon: StickyNote },
      { title: "Pomodoro Timer", url: "/pomodoro", icon: Timer },
      { title: "Calendar", url: "/calendar", icon: Calendar },
    ],
  },
  {
    title: "File Tools",
    icon: FolderOpen,
    tools: [
      { title: "Image to PDF", url: "/image-to-pdf", icon: FileImage },
      { title: "PDF to Image", url: "/pdf-to-image", icon: FileImage },
      { title: "File Merger", url: "/file-merger", icon: Merge },
      { title: "Image Compressor", url: "/image-compressor", icon: Archive },
    ],
  },
  {
    title: "Writing & Text",
    icon: PenTool,
    tools: [
      { title: "Text Summarizer", url: "/text-summarizer", icon: FileText },
      { title: "Word Counter", url: "/word-counter", icon: Hash },
      { title: "Voice to Text", url: "/voice-to-text", icon: Mic },
      { title: "Dictionary", url: "/dictionary", icon: BookOpen },
      { title: "Password Generator", url: "/password-generator", icon: Key },
    ],
  },
  {
    title: "Utilities",
    icon: Wrench,
    tools: [
      { title: "QR Code", url: "/qr-code", icon: QrCode },
      { title: "Currency Converter", url: "/currency-converter", icon: DollarSign },
      { title: "Unit Converter", url: "/unit-converter", icon: Scale },
      { title: "Stopwatch", url: "/stopwatch", icon: Clock4 },
      { title: "Weather", url: "/weather", icon: CloudSun },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Productivity: true,
    "File Tools": false,
    "Writing & Text": false,
    Utilities: false,
  });

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-semibold">ProductivityHub</h2>
            <p className="text-xs text-muted-foreground">20 Tools in One</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {toolCategories.map((category) => (
          <Collapsible
            key={category.title}
            open={openGroups[category.title]}
            onOpenChange={() => toggleGroup(category.title)}
          >
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <category.icon className="mr-2 h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">{category.title}</span>
                  <span className="group-data-[collapsible=icon]:hidden ml-auto">
                    {openGroups[category.title] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.tools.map((tool) => (
                      <SidebarMenuItem key={tool.title}>
                        <SidebarMenuButton 
                          asChild
                          className={isActive(tool.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                        >
                          <NavLink to={tool.url} className="flex items-center gap-2">
                            <tool.icon className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden">{tool.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}