"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Loader2,
  Power,
  PowerOff
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { HeroImage } from "@/types";

export default function HeroManagementPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hero");
      setImages(res.data.data);
    } catch (error) {
      console.error("Failed to fetch hero images", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => {
      formData.append("media", file);
    });

    try {
      await api.post("/hero", formData);
      await fetchImages();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero image?")) return;
    try {
      await api.delete(`/hero/${id}`);
      await fetchImages();
    } catch (error) {
      alert("Failed to delete image");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/hero/${id}/status`);
      await fetchImages();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const moveImage = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === images.length - 1) return;

    const newImages = [...images];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap elements
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    
    // Optimistic UI update
    setImages(newImages);

    // Save order to backend
    try {
      const orderedIds = newImages.map(img => img._id);
      await api.patch("/hero/reorder", { orderedIds });
    } catch (error) {
      alert("Failed to save new order");
      fetchImages(); // revert on fail
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-surface-dark mb-1">Hero Carousel</h1>
           <p className="text-sm font-medium text-surface-dark/60">Manage the sliding banners on the homepage.</p>
        </div>

        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-brand-primary text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center gap-2 hover:bg-primary-600 transition-all disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <span>Upload Images</span>
          </button>
        </div>
      </section>

      {/* Image Grid */}
      <section>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-4xl border border-surface-light">
             <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
             <p className="text-[10px] font-bold uppercase tracking-widest text-surface-dark/40">Loading Carousel...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-4xl border border-surface-light text-center px-6">
             <div className="w-16 h-16 rounded-3xl bg-surface-light flex items-center justify-center text-surface-dark/20 mb-2">
               <ImageIcon className="w-8 h-8" />
             </div>
             <p className="text-lg font-bold text-surface-dark">No Hero Images</p>
             <p className="text-sm font-medium text-surface-dark/60 max-w-sm">
               Upload images to display them in the homepage carousel. The website will fallback to the default static image until you upload here.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {images.map((img, index) => (
              <motion.div 
                key={img._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "bg-white p-4 rounded-4xl border transition-all shadow-sm group",
                  img.isActive ? "border-surface-light" : "border-surface-light opacity-60"
                )}
              >
                <div className="aspect-[21/9] relative rounded-3xl overflow-hidden bg-surface-light mb-4">
                  <Image 
                    src={img.url} 
                    alt={`Hero ${index + 1}`} 
                    fill 
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {!img.isActive && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-surface-dark uppercase tracking-widest shadow-sm">
                        Hidden
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {index + 1}
                  </div>
                </div>

                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-2">
                     <button
                       onClick={() => moveImage(index, "up")}
                       disabled={index === 0}
                       className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-surface-dark/40 hover:text-surface-dark hover:bg-surface-light/80 disabled:opacity-30 transition-all"
                     >
                       <ArrowUp className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => moveImage(index, "down")}
                       disabled={index === images.length - 1}
                       className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-surface-dark/40 hover:text-surface-dark hover:bg-surface-light/80 disabled:opacity-30 transition-all"
                     >
                       <ArrowDown className="w-4 h-4" />
                     </button>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleStatus(img._id)}
                        className={cn(
                          "px-4 h-10 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                          img.isActive ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                        )}
                      >
                        {img.isActive ? <><PowerOff className="w-3 h-3" /> Hide</> : <><Power className="w-3 h-3" /> Show</>}
                      </button>
                      <button 
                        onClick={() => handleDelete(img._id)}
                        className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
