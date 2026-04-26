"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface-light">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
        <p className="font-bold text-surface-dark/40 uppercase tracking-widest text-sm">Loading Workspace...</p>
      </div>
    );
  }

  if (!user) return null; // Middleware will handle redirect

  return (
    <div className="flex bg-surface-light min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
