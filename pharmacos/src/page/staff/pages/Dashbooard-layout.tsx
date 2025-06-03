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
      <div className="z-20">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      </div>

      <div
        className={cn(
          "flex flex-col flex-1 w-full"
        )}
      >
        <div className="h-screen overflow-auto">
          <main className="flex-1 p-0 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}