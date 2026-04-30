"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ChevronRight,
  LogOut,
  MessageSquare,
  ClipboardList,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Hero Carousel", href: "/hero", icon: ImageIcon },
  { name: "Users", href: "/users", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Enquiries", href: "/enquiries", icon: ClipboardList },
  { name: "Reviews", href: "/reviews", icon: MessageSquare },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-72 bg-white border-r border-surface-light flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-linear-to-tr from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <div>
            <h2 className="font-bold text-surface-dark leading-none">Renish</h2>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Pharma</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between p-4 rounded-2xl transition-all duration-200",
                  isActive 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                    : "text-surface-dark/50 hover:bg-surface-light hover:text-surface-dark"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-brand-primary")} />
                  <span className="font-semibold">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-surface-light">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-200 font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
