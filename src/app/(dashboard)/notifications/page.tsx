"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Search, 
  Trash2, 
  CheckCircle2, 
  MessageSquare, 
  BookOpen, 
  Settings,
  Loader2,
  Inbox
} from "lucide-react";
import api from "@/lib/api";
import { Notification } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications", { params: { limit: 100 } });
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "enquiry": return MessageSquare;
      case "blog": return BookOpen;
      default: return Bell;
    }
  };

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-surface-dark">Notification Center</h2>
          <p className="text-sm font-medium text-surface-dark/40 mt-1 uppercase tracking-widest">Manage your system alerts and activities</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-dark/40 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search alerts..." 
              className="bg-white border border-surface-light rounded-2xl py-3 pl-12 pr-4 w-64 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="bg-white rounded-[2.5rem] border border-surface-light shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
            <p className="text-xs font-bold text-surface-dark/20 uppercase tracking-widest">Synchronizing Alerts...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
            <div className="w-20 h-20 rounded-4xl bg-surface-light flex items-center justify-center text-surface-dark/20">
              <Inbox className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xl font-bold text-surface-dark mb-1">All clear!</p>
              <p className="text-surface-dark/40 font-medium">No new notifications to show.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-surface-light">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((n, idx) => {
                const Icon = getIcon(n.type);
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={n._id}
                    className={cn(
                      "p-8 flex items-start gap-6 hover:bg-surface-light/30 transition-all group relative",
                      !n.read && "bg-brand-primary/5"
                    )}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />
                    )}
                    
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      n.type === "enquiry" ? "bg-blue-50 text-blue-600" : 
                      n.type === "blog" ? "bg-green-50 text-green-600" : 
                      "bg-brand-primary/10 text-brand-primary"
                    )}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className={cn("text-lg font-bold transition-colors", n.read ? "text-surface-dark" : "text-brand-primary")}>
                          {n.title}
                        </h3>
                        <span className="text-xs font-bold text-surface-dark/20 uppercase tracking-widest">
                          {format(new Date(n.createdAt), "MMM dd, yyyy • hh:mm a")}
                        </span>
                      </div>
                      <p className="text-surface-dark/60 font-medium leading-relaxed max-w-3xl">
                        {n.message}
                      </p>
                      
                      <div className="flex items-center gap-6 pt-4">
                        {!n.read && (
                          <button 
                            onClick={() => handleMarkAsRead(n._id)}
                            className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest hover:underline"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark as read
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(n._id)}
                          className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
