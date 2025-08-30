import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  url: string;
  gradient?: string;
}

export function ToolCard({ title, description, icon: Icon, url, gradient = "from-primary to-accent" }: ToolCardProps) {
  return (
    <NavLink to={url} className="group">
      <Card className="tool-card group-hover:scale-[1.02] transition-all duration-200">
        <CardContent className="p-6">
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </NavLink>
  );
}