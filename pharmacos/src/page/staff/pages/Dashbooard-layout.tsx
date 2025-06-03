import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className={cn("flex flex-col flex-1 w-full")}>
        <ScrollArea className="flex-1 p-0 md:p-6">
          <main className="flex-1 h-full">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}