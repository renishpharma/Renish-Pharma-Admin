"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Package, 
  TrendingUp, 
  ShoppingBag,
  FileText,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface DashboardStats {
  counts: {
    products: number;
    enquiries: number;
    users: number;
    blogs: number;
  };
  recent: {
    enquiries: any[];
    products: any[];
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: "Total Users", value: stats?.counts.users || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Total Products", value: stats?.counts.products || 0, icon: Package, color: "text-cyan-600", bg: "bg-cyan-50" },
    { name: "Active Enquiries", value: stats?.counts.enquiries || 0, icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-50" },
    { name: "Total Blogs", value: stats?.counts.blogs || 0, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-brand-primary to-brand-secondary rounded-3xl p-10 text-white shadow-2xl shadow-brand-primary/20 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name || "Administrator"}!</h2>
            <p className="text-white/80 font-medium max-w-lg">
              Manage your products, users, and enquiries efficiently from this unified executive dashboard.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20" />
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-surface-light shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-7 h-7", stat.color)} />
            </div>
            <p className="text-surface-dark/40 font-bold text-xs uppercase tracking-widest mb-1">{stat.name}</p>
            <p className="text-2xl font-bold text-surface-dark">{stat.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-3xl border border-surface-light shadow-sm">
          <h3 className="text-xl font-bold text-surface-dark mb-6">Recent Enquiries</h3>
          <div className="space-y-6">
             {stats?.recent.enquiries.length === 0 ? (
                <p className="text-surface-dark/40 text-sm font-medium">No recent enquiries found.</p>
             ) : (
                stats?.recent.enquiries.map((enq: any) => (
                  <div key={enq._id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-surface-dark">Enquiry from {enq.name}</p>
                      <p className="text-xs font-medium text-surface-dark/40">{new Date(enq.createdAt).toLocaleDateString()} at {new Date(enq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
             )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-surface-light shadow-sm">
          <h3 className="text-xl font-bold text-surface-dark mb-6">System Status</h3>
          <div className="space-y-6">
             <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="font-bold text-green-700 text-sm">API Server</span>
               </div>
               <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Operational</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="font-bold text-green-700 text-sm">Database</span>
               </div>
               <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Operational</span>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
