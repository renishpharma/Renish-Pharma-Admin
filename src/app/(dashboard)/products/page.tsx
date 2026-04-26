"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Eye,
  Edit2,
  Trash2,
  X,
  Loader2,
  Power,
  PowerOff,
  Upload,
  ImagePlus,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Product } from "@/types";

const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  packaging: z.string().optional(),
  dimensions: z.string().optional(),
  sizes: z.string().optional(),
  additionalInfo: z.string().optional(),
  specialCare: z.string().optional(),
  dosage: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "view">("create");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      status: "active"
    }
  });

  const currentStatus = watch("status");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/product", {
        params: { search: searchTerm }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (type: "create" | "edit" | "view", product: Product | null = null) => {
    setModalType(type);
    setSelectedProduct(product);
    setSelectedFiles([]);
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description,
        shortDescription: product.shortDescription,
        packaging: product.packaging,
        dimensions: product.dimensions,
        sizes: product.sizes,
        additionalInfo: product.additionalInfo,
        specialCare: product.specialCare,
        dosage: product.dosage,
        status: product.status,
      });
    } else {
      reset({
        name: "",
        sku: "",
        category: "",
        description: "",
        shortDescription: "",
        packaging: "",
        dimensions: "",
        sizes: "",
        additionalInfo: "",
        specialCare: "",
        dosage: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        alert("Maximum 5 files allowed");
        return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingMedia = async (publicId: string) => {
    if (!selectedProduct) return;
    if (!confirm("Are you sure you want to permanently delete this image from the gallery?")) return;

    try {
      const response = await api.delete(`/product/${selectedProduct._id}/media/${publicId}`);
      setSelectedProduct(response.data.data);
      fetchProducts();
    } catch {
      alert("Failed to remove image");
    }
  };

  const handleFormSubmit = async (data: ProductFormValues) => {
    if (modalType === "create" && selectedFiles.length === 0) {
      alert("At least one image is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });

      selectedFiles.forEach(file => {
        formData.append("media", file);
      });

      if (modalType === "create") {
        await api.post("/product", formData);
      } else if (modalType === "edit" && selectedProduct) {
        await api.patch(`/product/${selectedProduct._id}`, formData);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/product/${id}`);
      fetchProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await api.patch(`/product/${product._id}`, { status: product.status === "active" ? "inactive" : "active" });
      fetchProducts();
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Products", value: products.length, icon: Package, color: "text-brand-primary", bg: "bg-brand-primary/10" },
          { label: "Active", value: products.filter(p => p.status === "active").length, icon: Power, color: "text-green-600", bg: "bg-green-50" },
          { label: "Inactive", value: products.filter(p => p.status === "inactive").length, icon: PowerOff, color: "text-red-600", bg: "bg-red-50" },
          { label: "Categories", value: new Set(products.map(p => p.category)).size, icon: Filter, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-surface-light shadow-sm">
            <div className="flex items-center gap-4">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", kpi.bg)}>
                  <kpi.icon className={cn("w-6 h-6", kpi.color)} />
               </div>
               <div>
                 <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-1">{kpi.label}</p>
                 <p className="text-2xl font-bold text-surface-dark">{kpi.value}</p>
               </div>
            </div>
          </div>
        ))}
      </section>

      {/* Header Actions */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-4">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-dark/40 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-white border border-surface-light rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <button 
          onClick={() => handleOpenModal("create")}
          className="bg-brand-primary text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center gap-2 hover:bg-primary-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Product</span>
        </button>
      </section>

      {/* Products List */}
      <section className="bg-white rounded-4xl border border-surface-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-light bg-surface-light/30">
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest">Product Info</th>
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-light">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                       <span className="font-bold text-surface-dark/40 uppercase tracking-widest text-xs">Loading Inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-surface-dark/40 font-medium">
                    No products found in the database.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-light/30 transition-colors group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-surface-light flex items-center justify-center overflow-hidden border border-surface-light relative">
                             {p.media && p.media.length > 0 ? (
                               <Image 
                                 src={p.media[0].url} 
                                 alt={p.name} 
                                 fill 
                                 sizes="48px"
                                 className="object-cover" 
                               />
                             ) : (
                               <Package className="w-6 h-6 text-surface-dark/20" />
                             )}
                          </div>
                          <div>
                            <p className="font-bold text-surface-dark group-hover:text-brand-primary transition-colors">{p.name}</p>
                            <p className="text-xs font-medium text-surface-dark/40">{p.dosage}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-surface-light text-surface-dark/60 border border-surface-light">
                         {p.category}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <span className={cn(
                         "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit",
                         p.status === "active" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                       )}>
                         <div className={cn("w-1 h-1 rounded-full", p.status === "active" ? "bg-green-600" : "bg-red-600")} />
                         {p.status}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal("view", p)}
                            className="w-10 h-10 rounded-xl hover:bg-brand-primary/10 flex items-center justify-center text-surface-dark/40 hover:text-brand-primary transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenModal("edit", p)}
                            className="w-10 h-10 rounded-xl hover:bg-brand-primary/10 flex items-center justify-center text-surface-dark/40 hover:text-brand-primary transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(p)}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                              p.status === "active" ? "text-orange-500 hover:bg-orange-50" : "text-green-500 hover:bg-green-50"
                            )}
                          >
                            {p.status === "active" ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDelete(p._id)}
                            className="w-10 h-10 rounded-xl hover:bg-red-50 flex items-center justify-center text-surface-dark/40 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Product Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-surface-dark/40 backdrop-blur-sm z-99"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-100 overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-surface-light flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                         <Package className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-surface-dark">
                          {modalType === "create" ? "Add New Product" : modalType === "edit" ? "Edit Product" : "Product Details"}
                        </h3>
                        <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mt-1">Inventory Management</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-12 h-12 rounded-2xl hover:bg-surface-light flex items-center justify-center text-surface-dark/40 hover:text-surface-dark transition-all"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {modalType === "view" ? (
                      <div className="space-y-8">
                         {/* Media Gallery */}
                         <div className="space-y-4">
                            <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest">Product Media</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                               {selectedProduct?.media && selectedProduct.media.length > 0 ? (
                                 selectedProduct.media.map((item, idx) => (
                                   <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden border border-surface-light group">
                                      <Image 
                                        src={item.url} 
                                        alt={`Media ${idx}`} 
                                        fill 
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                        className="object-cover transition-transform group-hover:scale-105" 
                                      />
                                   </div>
                                 ))
                               ) : (
                                 <div className="col-span-full aspect-video bg-surface-light rounded-2xl flex flex-col items-center justify-center text-surface-dark/20 gap-2">
                                    <Package className="w-12 h-12" />
                                    <p className="text-sm font-medium">No media available</p>
                                 </div>
                               )}
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-8">
                            <div>
                               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-2">Product Name</p>
                               <p className="text-lg font-bold text-surface-dark">{selectedProduct?.name}</p>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-2">SKU</p>
                               <p className="text-lg font-bold text-brand-primary">{selectedProduct?.sku}</p>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-2">Category</p>
                               <p className="text-lg font-bold text-surface-dark">{selectedProduct?.category}</p>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-2">Packaging</p>
                               <p className="text-lg font-bold text-surface-dark">{selectedProduct?.packaging || "N/A"}</p>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-2">Dimensions</p>
                               <p className="text-lg font-bold text-surface-dark">{selectedProduct?.dimensions || "N/A"}</p>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-2">Sizes</p>
                               <p className="text-lg font-bold text-surface-dark">{selectedProduct?.sizes || "N/A"}</p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div>
                               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-2">Description</p>
                               <p className="text-surface-dark/70 font-medium leading-relaxed bg-surface-light/50 p-4 rounded-2xl border border-surface-light">{selectedProduct?.description}</p>
                            </div>
                            {selectedProduct?.shortDescription && (
                              <div>
                                 <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-2">Short Description</p>
                                 <p className="text-surface-dark/70 font-medium leading-relaxed">{selectedProduct.shortDescription}</p>
                              </div>
                            )}
                            {selectedProduct?.additionalInfo && (
                              <div>
                                 <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-2">Additional Info</p>
                                 <p className="text-surface-dark/70 font-medium leading-relaxed">{selectedProduct.additionalInfo}</p>
                              </div>
                            )}
                            {selectedProduct?.specialCare && (
                              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                                 <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                   <AlertCircle className="w-4 h-4" />
                                   Special Care
                                 </p>
                                 <p className="text-orange-900/70 font-medium text-sm leading-relaxed">{selectedProduct.specialCare}</p>
                              </div>
                            )}
                         </div>
                      </div>
                    ) : (
                     <form id="product-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                        {/* Media Upload Section */}
                        <div className="space-y-4">
                           <label className="text-sm font-bold text-surface-dark/60 ml-1">Product Media (Max 5)</label>
                           <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                              {/* Existing Media */}
                              {modalType === "edit" && selectedProduct?.media?.map((item, idx) => (
                                <div key={`existing-${idx}`} className="aspect-square relative rounded-xl overflow-hidden border border-brand-primary/20 group">
                                   <Image 
                                     src={item.url} 
                                     alt="Existing" 
                                     fill 
                                     sizes="100px"
                                     className="object-cover opacity-80" 
                                   />
                                   <button 
                                     type="button"
                                     onClick={() => handleRemoveExistingMedia(item.public_id)}
                                     className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                   >
                                     <X className="w-3 h-3" />
                                   </button>
                                   <div className="absolute bottom-0 inset-x-0 bg-brand-primary/80 text-[8px] text-white font-bold text-center py-1">EXISTING</div>
                                </div>
                              ))}

                              {/* New File Previews */}
                              {selectedFiles.map((file, idx) => (
                                <div key={`new-${idx}`} className="aspect-square relative rounded-xl overflow-hidden border border-brand-primary/40 group">
                                   <Image 
                                     src={URL.createObjectURL(file)} 
                                     alt="Preview" 
                                     fill 
                                     sizes="100px"
                                     className="object-cover" 
                                   />
                                   <button 
                                     type="button"
                                     onClick={() => removeFile(idx)}
                                     className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                   >
                                     <X className="w-3 h-3" />
                                   </button>
                                   <div className="absolute bottom-0 inset-x-0 bg-green-500/80 text-[8px] text-white font-bold text-center py-1">NEW</div>
                                </div>
                              ))}
                              
                              {(selectedFiles.length + (selectedProduct?.media?.length || 0)) < 5 && (
                                <button 
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="aspect-square rounded-xl border-2 border-dashed border-surface-light hover:border-brand-primary/40 hover:bg-brand-primary/5 flex flex-col items-center justify-center gap-2 text-surface-dark/20 hover:text-brand-primary transition-all group"
                                >
                                   <ImagePlus className="w-6 h-6 transition-transform group-hover:scale-110" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest">Add Image</span>
                                </button>
                              )}
                           </div>
                           <input 
                             type="file" 
                             ref={fileInputRef}
                             onChange={onFileChange}
                             className="hidden" 
                             accept="image/*"
                             multiple
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="text-sm font-bold text-surface-dark/60 ml-1">Product Name *</label>
                             <input 
                               {...register("name")}
                               className={cn(
                                 "w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 transition-all font-medium",
                                 errors.name ? "focus:ring-red-500/20 ring-1 ring-red-500/10" : "focus:ring-brand-primary/20"
                               )} 
                               placeholder="e.g. Paracetamol" 
                             />
                             {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.name.message}</p>}
                           </div>
                           <div className="space-y-2">
                             <label className="text-sm font-bold text-surface-dark/60 ml-1">SKU *</label>
                             <input 
                               {...register("sku")}
                               className={cn(
                                 "w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 transition-all font-medium",
                                 errors.sku ? "focus:ring-red-500/20 ring-1 ring-red-500/10" : "focus:ring-brand-primary/20"
                               )} 
                               placeholder="e.g. REN-001" 
                             />
                             {errors.sku && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.sku.message}</p>}
                           </div>
                           <div className="space-y-2">
                             <label className="text-sm font-bold text-surface-dark/60 ml-1">Category *</label>
                             <input 
                               {...register("category")}
                               className={cn(
                                 "w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 transition-all font-medium",
                                 errors.category ? "focus:ring-red-500/20 ring-1 ring-red-500/10" : "focus:ring-brand-primary/20"
                               )} 
                               placeholder="e.g. Tablets" 
                             />
                             {errors.category && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.category.message}</p>}
                           </div>
                           <div className="space-y-2">
                             <label className="text-sm font-bold text-surface-dark/60 ml-1">Packaging</label>
                             <input 
                               {...register("packaging")}
                               className="w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium" 
                               placeholder="e.g. 10x10 Tablets" 
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-sm font-bold text-surface-dark/60 ml-1">Dimensions</label>
                             <input 
                               {...register("dimensions")}
                               className="w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium" 
                               placeholder="e.g. 12x4x6 cm" 
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-sm font-bold text-surface-dark/60 ml-1">Sizes</label>
                             <input 
                               {...register("sizes")}
                               className="w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium" 
                               placeholder="e.g. 500mg, 650mg" 
                             />
                           </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="bg-surface-light/50 p-6 rounded-3xl border border-surface-light flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-surface-dark">Product Status</p>
                              <p className="text-[10px] font-bold text-surface-dark/40 uppercase tracking-widest">Visibility on website</p>
                           </div>
                           <div className="flex bg-surface-light p-1 rounded-xl border border-surface-light">
                              <button 
                                type="button"
                                onClick={() => setValue("status", "active")}
                                className={cn(
                                  "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                                  currentStatus === "active" ? "bg-white text-green-600 shadow-sm" : "text-surface-dark/40 hover:text-surface-dark"
                                )}
                              >
                                ACTIVE
                              </button>
                              <button 
                                type="button"
                                onClick={() => setValue("status", "inactive")}
                                className={cn(
                                  "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                                  currentStatus === "inactive" ? "bg-white text-red-600 shadow-sm" : "text-surface-dark/40 hover:text-surface-dark"
                                )}
                              >
                                INACTIVE
                              </button>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-bold text-surface-dark/60 ml-1">Description *</label>
                           <textarea 
                             {...register("description")}
                             rows={4} 
                             className={cn(
                               "w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 transition-all font-medium resize-none",
                               errors.description ? "focus:ring-red-500/20 ring-1 ring-red-500/10" : "focus:ring-brand-primary/20"
                             )} 
                             placeholder="Detailed product indications and use cases..." 
                           />
                           {errors.description && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.description.message}</p>}
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-bold text-surface-dark/60 ml-1">Short Description</label>
                           <input 
                             {...register("shortDescription")}
                             className="w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium" 
                             placeholder="A brief summary for listings" 
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-bold text-surface-dark/60 ml-1">Additional Info</label>
                           <textarea 
                             {...register("additionalInfo")}
                             rows={2} 
                             className="w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium resize-none" 
                             placeholder="Storage conditions, shelf life, etc." 
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-bold text-orange-600 flex items-center gap-2 ml-1">
                             <AlertCircle className="w-4 h-4" />
                             Special Care
                           </label>
                           <textarea 
                             {...register("specialCare")}
                             rows={2} 
                             className="w-full bg-orange-50/50 border border-orange-100/50 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium resize-none text-orange-900" 
                             placeholder="Precautions or contraindications..." 
                           />
                        </div>
                     </form>
                   )}
                </div>

                {modalType !== "view" && (
                  <div className="p-8 border-t border-surface-light flex items-center justify-end gap-4 bg-surface-light/30">
                     <button 
                       type="button"
                       onClick={() => setIsModalOpen(false)}
                       disabled={isSubmitting}
                       className="px-8 py-4 rounded-2xl font-bold text-surface-dark/40 hover:text-surface-dark transition-all"
                     >
                       Cancel
                     </button>
                     <button 
                       form="product-form"
                       type="submit"
                       disabled={isSubmitting}
                       className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                     >
                       {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                       {modalType === "create" ? "Create Product" : "Save Changes"}
                     </button>
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
