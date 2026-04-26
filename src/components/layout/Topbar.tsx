"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  Search, 
  LogOut,
  User as UserIcon
} from "lucide-react";

export const Topbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const path = pathname.split("/")[1];
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-surface-light px-10 flex items-center justify-between sticky top-0 z-40">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-1">
          <span>Admin</span>
          <span className="w-1 h-1 rounded-full bg-surface-dark/20" />
          <span className="text-brand-primary">{getPageTitle()}</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-dark">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-dark/40" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-surface-light border-none rounded-2xl py-3 pl-11 pr-4 w-64 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium text-sm"
          />
        </div>

        <button className="relative w-12 h-12 rounded-2xl bg-surface-light flex items-center justify-center hover:bg-brand-primary/10 transition-colors group">
          <Bell className="w-5 h-5 text-surface-dark/60 group-hover:text-brand-primary" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-10 w-px bg-surface-light" />

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-surface-dark">{user?.name || "Administrator"}</p>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest leading-none mt-1">ID: {user?.userId}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center border border-brand-primary/10 overflow-hidden shadow-inner">
             <UserIcon className="w-6 h-6 text-brand-primary" />
          </div>
        </div>
      </div>
    </header>
  );
};
