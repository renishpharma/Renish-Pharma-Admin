"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Loader2,
  Power,
  PowerOff,
  Plus,
  X,
  Monitor,
  Tablet,
  Smartphone
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { HeroImage } from "@/types";

export default function HeroManagementPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [tabletFile, setTabletFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  
  const [desktopPreview, setDesktopPreview] = useState<string>("");
  const [tabletPreview, setTabletPreview] = useState<string>("");
  const [mobilePreview, setMobilePreview] = useState<string>("");

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const tabletInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "tablet" | "mobile") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === "desktop") { setDesktopFile(file); setDesktopPreview(result); }
      if (type === "tablet") { setTabletFile(file); setTabletPreview(result); }
      if (type === "mobile") { setMobileFile(file); setMobilePreview(result); }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!desktopFile) {
      alert("Desktop image is mandatory");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("desktop", desktopFile);
    if (tabletFile) formData.append("tablet", tabletFile);
    if (mobileFile) formData.append("mobile", mobileFile);

    try {
      await api.post("/hero", formData);
      await fetchImages();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to upload slide");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setDesktopFile(null);
    setTabletFile(null);
    setMobileFile(null);
    setDesktopPreview("");
    setTabletPreview("");
    setMobilePreview("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    try {
      await api.delete(`/hero/${id}`);
      await fetchImages();
    } catch (error) {
      alert("Failed to delete slide");
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
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    setImages(newImages);

    try {
      const orderedIds = newImages.map(img => img._id);
      await api.patch("/hero/reorder", { orderedIds });
    } catch (error) {
      alert("Failed to save new order");
      fetchImages();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-surface-dark mb-1">Hero Carousel</h1>
           <p className="text-sm font-medium text-surface-dark/60">Manage responsive sliding banners on the homepage.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-brand-primary text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center gap-2 hover:bg-primary-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Slide</span>
        </button>
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
             <p className="text-lg font-bold text-surface-dark">No Hero Slides</p>
             <p className="text-sm font-medium text-surface-dark/60 max-w-sm">
               Add slides to display responsive banners in the homepage carousel.
             </p>
          </div>
        ) : (
          <div className="space-y-6">
            {images.map((img, index) => (
              <motion.div 
                key={img._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-white p-6 rounded-4xl border transition-all shadow-sm",
                  img.isActive ? "border-surface-light" : "border-surface-light opacity-60"
                )}
              >
                <div className="flex flex-col xl:flex-row gap-8">
                  {/* Previews Container */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Desktop */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-surface-dark/40 uppercase tracking-widest">
                        <Monitor className="w-3 h-3" /> Desktop
                      </div>
                      <div className="aspect-[21/9] relative rounded-2xl overflow-hidden bg-surface-light border border-surface-light">
                        <Image src={img.desktop?.url || (img as any).url || ""} alt="Desktop" fill className="object-cover" />
                      </div>
                    </div>
                    {/* Tablet */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-surface-dark/40 uppercase tracking-widest">
                        <Tablet className="w-3 h-3" /> Tablet (Optional)
                      </div>
                      <div className="aspect-[4/3] md:aspect-[21/9] relative rounded-2xl overflow-hidden bg-surface-light border border-surface-light">
                        <Image src={img.tablet?.url || img.desktop?.url || (img as any).url || ""} alt="Tablet" fill className="object-cover" />
                        {!img.tablet && <div className="absolute inset-0 bg-black/5 flex items-center justify-center text-[10px] font-bold text-surface-dark/20 uppercase tracking-widest">Fallback to Desktop</div>}
                      </div>
                    </div>
                    {/* Mobile */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-surface-dark/40 uppercase tracking-widest">
                        <Smartphone className="w-3 h-3" /> Mobile (Optional)
                      </div>
                      <div className="aspect-[9/16] md:aspect-[21/9] relative rounded-2xl overflow-hidden bg-surface-light border border-surface-light">
                        <Image src={img.mobile?.url || img.desktop?.url || (img as any).url || ""} alt="Mobile" fill className="object-cover" />
                        {!img.mobile && <div className="absolute inset-0 bg-black/5 flex items-center justify-center text-[10px] font-bold text-surface-dark/20 uppercase tracking-widest">Fallback to Desktop</div>}
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="xl:w-64 flex flex-col justify-between gap-6 border-l border-surface-light xl:pl-8 pt-6 xl:pt-0">
                    <div className="flex items-center justify-between xl:justify-start xl:gap-4">
                      <span className="text-2xl font-bold text-surface-dark/20">#{index + 1}</span>
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
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleToggleStatus(img._id)}
                        className={cn(
                          "w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                          img.isActive ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                        )}
                      >
                        {img.isActive ? <><PowerOff className="w-3 h-3" /> Deactivate</> : <><Power className="w-3 h-3" /> Activate</>}
                      </button>
                      <button 
                        onClick={() => handleDelete(img._id)}
                        className="w-full h-12 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center gap-2 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Delete Slide</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Add Slide Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-surface-dark/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-4xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-surface-light flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-surface-dark">Add New Hero Slide</h2>
                  <p className="text-sm font-medium text-surface-dark/60">Upload responsive images for better mobile experience.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-12 h-12 rounded-2xl bg-surface-light flex items-center justify-center text-surface-dark/40 hover:text-surface-dark transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Desktop Slot */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-surface-dark uppercase tracking-widest">Desktop <span className="text-red-500">*</span></span>
                      <Monitor className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div 
                      onClick={() => desktopInputRef.current?.click()}
                      className={cn(
                        "aspect-[21/9] md:aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                        desktopPreview ? "border-brand-primary" : "border-surface-light hover:border-brand-primary/40 hover:bg-primary-50/10"
                      )}
                    >
                      {desktopPreview ? (
                        <Image src={desktopPreview} alt="Preview" fill className="object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-surface-dark/20" />
                          <span className="text-[10px] font-bold text-surface-dark/40 uppercase">Upload Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 transition-all" />
                    </div>
                    <input type="file" ref={desktopInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "desktop")} />
                  </div>

                  {/* Tablet Slot */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-surface-dark uppercase tracking-widest">Tablet</span>
                      <Tablet className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div 
                      onClick={() => tabletInputRef.current?.click()}
                      className={cn(
                        "aspect-[21/9] md:aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                        tabletPreview ? "border-brand-primary" : "border-surface-light hover:border-brand-primary/40 hover:bg-primary-50/10"
                      )}
                    >
                      {tabletPreview ? (
                        <Image src={tabletPreview} alt="Preview" fill className="object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center px-4">
                          <Upload className="w-6 h-6 text-surface-dark/20" />
                          <span className="text-[10px] font-bold text-surface-dark/40 uppercase">Optional</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 transition-all" />
                    </div>
                    <input type="file" ref={tabletInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "tablet")} />
                  </div>

                  {/* Mobile Slot */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-surface-dark uppercase tracking-widest">Mobile</span>
                      <Smartphone className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div 
                      onClick={() => mobileInputRef.current?.click()}
                      className={cn(
                        "aspect-[21/9] md:aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                        mobilePreview ? "border-brand-primary" : "border-surface-light hover:border-brand-primary/40 hover:bg-primary-50/10"
                      )}
                    >
                      {mobilePreview ? (
                        <Image src={mobilePreview} alt="Preview" fill className="object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center px-4">
                          <Upload className="w-6 h-6 text-surface-dark/20" />
                          <span className="text-[10px] font-bold text-surface-dark/40 uppercase">Optional</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 transition-all" />
                    </div>
                    <input type="file" ref={mobileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "mobile")} />
                  </div>
                </div>

                <div className="p-6 bg-primary-50/30 rounded-3xl border border-primary-100 flex items-start gap-4">
                   <div className="w-10 h-10 rounded-2xl bg-white border border-primary-200 flex items-center justify-center text-brand-primary shrink-0">
                      <X className="w-5 h-5 rotate-45" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-brand-primary mb-1">Upload Guide</p>
                     <p className="text-xs text-surface-dark/60 leading-relaxed font-medium">
                       Desktop version is mandatory. For the best experience, we recommend uploading all three sizes. 
                       Recommended ratios: Desktop (21:9), Tablet (4:3), Mobile (9:16).
                     </p>
                   </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-surface-light/50 flex items-center justify-end gap-4">
                <button 
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-8 py-4 rounded-2xl font-bold text-surface-dark/60 hover:text-surface-dark transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={uploading || !desktopFile}
                  className="bg-brand-primary text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-brand-primary/20 flex items-center gap-2 hover:bg-primary-600 transition-all disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span>{uploading ? "Uploading..." : "Save Slide"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
