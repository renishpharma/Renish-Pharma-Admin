"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Mail, 
  Phone, 
  User, 
  Tag, 
  MessageSquare,
  Loader2,
  Trash2,
  CheckCircle2,
  Package,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  quantity?: string;
  message: string;
  product?: {
    name: string;
    sku: string;
  };
  status: "pending" | "replied";
  createdAt: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/enquiries");
      setEnquiries(response.data.data);
    } catch (error) {
      console.error("Failed to fetch enquiries", error);
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/enquiries/${id}/status`, { status });
      toast.success("Enquiry updated");
      fetchEnquiries();
    } catch (error) {
      toast.error("Failed to update enquiry");
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/enquiries/${id}`);
      toast.success("Enquiry deleted");
      fetchEnquiries();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Enquiries</h1>
          <p className="text-slate-500 font-medium">Manage B2B leads from Doctors, Hospitals, and Wholesalers.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching Leads...</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-200">
           <Package className="w-12 h-12 text-slate-200" />
           <p className="text-xl font-bold text-slate-400">No enquiries yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product / SKU</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role & Quantity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {enquiries.map((e) => (
                    <tr key={e._id} className="group hover:bg-slate-50/30 transition-colors">
                       <td className="px-6 py-6">
                          <div className="flex flex-col gap-1">
                             <span className="font-bold text-slate-900">{e.name}</span>
                             <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {e.email}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {e.phone}</span>
                             </div>
                             <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic">"{e.message}"</p>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          {e.product ? (
                             <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-700">{e.product.name}</p>
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{e.product.sku}</p>
                             </div>
                          ) : (
                             <span className="text-xs font-bold text-slate-300 italic">General Enquiry</span>
                          )}
                       </td>
                       <td className="px-6 py-6">
                          <div className="space-y-1">
                             <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                {e.role}
                             </span>
                             <p className="text-xs font-bold text-slate-400">Qty: {e.quantity || "N/A"}</p>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            e.status === "replied" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                             {e.status}
                          </span>
                       </td>
                       <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                             {e.status === "pending" && (
                               <button 
                                 onClick={() => updateStatus(e._id, "replied")}
                                 className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                 title="Mark as Replied"
                               >
                                  <CheckCircle2 className="w-4 h-4" />
                               </button>
                             )}
                             <button 
                               onClick={() => deleteEnquiry(e._id)}
                               className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
}
