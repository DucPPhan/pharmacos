import React, { useState } from "react";
import {
  BarChart,
  Bell,
  Settings,
  Upload,
  Users as UsersIcon,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Users from "./Users";
import Overview from "./Overview";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    localStorage.clear();
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-2">
            P
          </div>
          <h1 className="text-xl font-bold">PharmaCos Admin</h1>
        </div>

        <nav className="space-y-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("overview")}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("users")}
          >
            <UsersIcon className="mr-2 h-4 w-4" />
            Users
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && <Overview />}
          {activeTab === "users" && <Users />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
