"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  LogOut,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Notification } from "@/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const Topbar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const getPageTitle = () => {
    const path = pathname.split("/")[1];
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const fetchNotifications = React.useCallback(async () => {
    try {
      const response = await api.get("/notifications", { params: { limit: 5 } });
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        fetchNotifications();
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
    setShowNotifications(false);
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
        {/* Notification Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all group",
              showNotifications ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "bg-surface-light text-surface-dark/60 hover:bg-brand-primary/10 hover:text-brand-primary"
            )}
          >
            <Bell className={cn("w-5 h-5", showNotifications ? "text-white" : "text-surface-dark/60 group-hover:text-brand-primary")} />
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNotifications(false)}
                  className="fixed inset-0 z-40"
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-surface-light z-50 overflow-hidden"
                >
                  <div className="p-6 border-b border-surface-light bg-surface-light/30 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-surface-dark uppercase tracking-widest">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-surface-light max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-surface-dark/40 font-bold uppercase tracking-widest text-xs">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n._id} 
                          className={cn(
                            "p-6 hover:bg-surface-light/50 transition-colors cursor-pointer group relative",
                            !n.read && "bg-brand-primary/5"
                          )}
                          onClick={() => handleNotificationClick(n)}
                        >
                          {!n.read && (
                            <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          )}
                          <p className="text-sm font-bold text-surface-dark mb-1 group-hover:text-brand-primary transition-colors">{n.title}</p>
                          <p className="text-xs text-surface-dark/60 leading-relaxed mb-2">{n.message}</p>
                          <p className="text-[10px] font-bold text-surface-dark/20 uppercase tracking-widest">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link 
                    href="/notifications" 
                    onClick={() => setShowNotifications(false)}
                    className="p-4 bg-surface-light/30 text-center flex items-center justify-center gap-2 group hover:bg-brand-primary/5 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">View All Notifications</span>
                    <ChevronRight className="w-3 h-3 text-brand-primary group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
