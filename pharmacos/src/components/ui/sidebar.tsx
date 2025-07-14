import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  Activity,
  Tag,
  Grid3x3,
  User,
  Settings,
  X,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const location = useLocation();

  const links = [
    { href: "analytics", label: "Analytics", icon: Activity },
    { href: "inventory", label: "Inventory", icon: Package },
    { href: "batches", label: "Batch Management", icon: Grid3x3 },
    { href: "suppliers", label: "Supplier Management", icon: Users },
    { href: "orders", label: "Orders", icon: ShoppingCart },
  ];

  const handleLogout = () => {
    localStorage.clear();
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && !window.matchMedia("(min-width: 1024px)").matches && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-72 border-r bg-card transition-transform duration-300 ease-in-out lg:relative lg:z-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <NavLink to="/" className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
              <Package className="w-6 h-6" />
            </div>
            {open && <h1 className="ml-3 text-xl font-bold">PharmaStaff</h1>}
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            <div style={{ paddingBottom: "calc(100% + 55px)" }}>
              {links.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )
                  }
                >
                  <link.icon className={cn("w-5 h-5", !open && "mx-auto")} />
                  {open && <span>{link.label}</span>}
                </NavLink>
              ))}
            </div>
          </nav>
        </ScrollArea>

        <div className="px-4">
          <div className="border-t my-2" />
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
