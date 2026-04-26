"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  MessageSquare,
  Loader2,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Review {
  _id: string;
  name: string;
  designation: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/reviews");
      setReviews(response.data.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/reviews/${id}/status`, { status });
      toast.success(`Review ${status} successfully`);
      fetchReviews();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Testimonials Management</h1>
          <p className="text-slate-500 font-medium">Review and approve customer feedback before it goes live.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Feedbacks...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-200">
           <MessageSquare className="w-12 h-12 text-slate-200" />
           <p className="text-xl font-bold text-slate-400">No reviews found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
               {/* Status Indicator */}
               <div className={cn(
                 "absolute top-0 right-0 px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl",
                 review.status === "approved" ? "bg-emerald-50 text-emerald-600" : 
                 review.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
               )}>
                 {review.status}
               </div>

               <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-2xl border border-slate-100">
                     {review.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-4">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <h3 className="text-lg font-bold text-slate-900">{review.name}</h3>
                           <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-100")} />
                              ))}
                           </div>
                        </div>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{review.designation}</p>
                     </div>

                     <p className="text-slate-600 font-medium leading-relaxed italic bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                        "{review.comment}"
                     </p>

                     <div className="flex items-center justify-between pt-2">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                           Submitted {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                           {review.status !== "approved" && (
                             <button 
                               onClick={() => updateStatus(review._id, "approved")}
                               className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                             >
                               <CheckCircle2 className="w-4 h-4" /> Approve
                             </button>
                           )}
                           {review.status !== "rejected" && (
                             <button 
                               onClick={() => updateStatus(review._id, "rejected")}
                               className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
                             >
                               <XCircle className="w-4 h-4" /> Reject
                             </button>
                           )}
                           <button 
                             onClick={() => deleteReview(review._id)}
                             className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
