"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  ChevronLeft,
  Image as ImageIcon
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { BlogPost } from "@/types";

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <div className="h-64 bg-surface-light animate-pulse rounded-2xl" /> });
import "react-quill-new/dist/quill.snow.css";

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'blockquote'],
    ['clean']
  ],
};

type ViewMode = "list" | "create" | "edit";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  
  // Form State
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/blogs", { params: { limit: 50 } });
      setBlogs(res.data.data);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setSelectedBlog(null);
    setTitle("");
    setContent("");
    setAuthor("");
    setStatus("draft");
    setTags("");
    setCoverImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenCreate = () => {
    resetForm();
    setViewMode("create");
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setAuthor(blog.author);
    setStatus(blog.status);
    setTags(blog.tags.join(", "));
    setCoverImage(null);
    setViewMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Title and Content are required");

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (author) formData.append("author", author);
      formData.append("status", status);
      
      // Send tags as a comma-separated string
      if (tags) {
        formData.append("tags", tags);
      }

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      if (viewMode === "create") {
        await api.post("/blogs", formData);
      } else if (viewMode === "edit" && selectedBlog) {
        await api.patch(`/blogs/${selectedBlog._id}`, formData);
      }

      await fetchBlogs();
      setViewMode("list");
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      await fetchBlogs();
    } catch {
      alert("Failed to delete blog");
    }
  };

  const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <button 
          onClick={() => { setViewMode("list"); resetForm(); }}
          className="flex items-center gap-2 text-surface-dark/60 hover:text-brand-primary font-semibold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Blogs
        </button>

        <div className="bg-white p-8 rounded-4xl border border-surface-light shadow-sm">
          <h2 className="text-2xl font-bold text-surface-dark mb-8">
            {viewMode === "create" ? "Create New Blog Post" : "Edit Blog Post"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2 md:col-span-2">
                 <label className="text-xs font-bold text-surface-dark/60 uppercase tracking-widest">Title *</label>
                 <input 
                   type="text" 
                   value={title}
                   onChange={e => setTitle(e.target.value)}
                   className="w-full bg-surface-light border border-surface-light rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                   required
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-surface-dark/60 uppercase tracking-widest">Author</label>
                 <input 
                   type="text" 
                   value={author}
                   onChange={e => setAuthor(e.target.value)}
                   placeholder="Leave blank for Renish Pharmaceuticals"
                   className="w-full bg-surface-light border border-surface-light rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-surface-dark/60 uppercase tracking-widest">Status</label>
                 <select 
                   value={status}
                   onChange={e => setStatus(e.target.value as "draft" | "published")}
                   className="w-full bg-surface-light border border-surface-light rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                 >
                   <option value="draft">Draft</option>
                   <option value="published">Published</option>
                 </select>
               </div>

               <div className="space-y-2 md:col-span-2">
                 <label className="text-xs font-bold text-surface-dark/60 uppercase tracking-widest">Tags (Comma Separated)</label>
                 <input 
                   type="text" 
                   value={tags}
                   onChange={e => setTags(e.target.value)}
                   placeholder="Healthcare, Innovation, Medicine"
                   className="w-full bg-surface-light border border-surface-light rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                 />
               </div>

               <div className="space-y-2 md:col-span-2">
                 <label className="text-xs font-bold text-surface-dark/60 uppercase tracking-widest">Cover Image</label>
                 <div className="flex items-center gap-4">
                   <input 
                     type="file" 
                     ref={fileInputRef}
                     onChange={e => setCoverImage(e.target.files?.[0] || null)}
                     accept="image/*"
                     className="hidden"
                   />
                   <button 
                     type="button"
                     onClick={() => fileInputRef.current?.click()}
                     className="bg-surface-light hover:bg-surface-light/80 text-surface-dark font-semibold px-4 py-3 rounded-2xl transition-colors border border-surface-light flex items-center gap-2"
                   >
                     <ImageIcon className="w-5 h-5" />
                     Choose Image
                   </button>
                   {coverImage && <span className="text-sm font-medium text-brand-primary truncate">{coverImage.name}</span>}
                   {!coverImage && selectedBlog?.coverImage && (
                     <div className="w-16 h-10 relative rounded-lg overflow-hidden border border-surface-light">
                       <Image src={selectedBlog.coverImage.url} alt="Current cover" fill className="object-cover" />
                     </div>
                   )}
                 </div>
               </div>
            </div>

            <div className="space-y-2 pb-12">
               <label className="text-xs font-bold text-surface-dark/60 uppercase tracking-widest">Content *</label>
               <div className="bg-white border border-surface-light rounded-2xl overflow-hidden">
                 <ReactQuill 
                   theme="snow" 
                   value={content} 
                   onChange={setContent} 
                   modules={quillModules}
                   className="min-h-[300px]"
                 />
               </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Blog Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-4">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-dark/40 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search blogs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-surface-light rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
              />
           </div>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="bg-brand-primary text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center gap-2 hover:bg-primary-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Write Post</span>
        </button>
      </section>

      {/* Blogs List */}
      <section className="bg-white rounded-4xl border border-surface-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-light bg-surface-light/30">
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest">Blog Post</th>
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest">Author</th>
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-light">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
                    <span className="font-bold text-surface-dark/40 uppercase tracking-widest text-xs">Loading Blogs...</span>
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-surface-dark/40 font-medium">
                    No blog posts found.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-surface-light/30 transition-colors group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-surface-light flex items-center justify-center overflow-hidden border border-surface-light relative shrink-0">
                             {blog.coverImage ? (
                               <Image src={blog.coverImage.url} alt={blog.title} fill sizes="48px" className="object-cover" />
                             ) : (
                               <FileText className="w-5 h-5 text-surface-dark/20" />
                             )}
                          </div>
                          <div>
                            <p className="font-bold text-surface-dark group-hover:text-brand-primary transition-colors line-clamp-1">{blog.title}</p>
                            <p className="text-xs font-medium text-surface-dark/40">{new Date(blog.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-sm font-semibold text-surface-dark/80">{blog.author}</span>
                    </td>
                    <td className="px-8 py-5">
                       <span className={cn(
                         "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit",
                         blog.status === "published" ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-orange-600 border border-orange-100"
                       )}>
                         <div className={cn("w-1 h-1 rounded-full", blog.status === "published" ? "bg-green-600" : "bg-orange-600")} />
                         {blog.status}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(blog)}
                            className="w-10 h-10 rounded-xl hover:bg-brand-primary/10 flex items-center justify-center text-surface-dark/40 hover:text-brand-primary transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(blog._id)}
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
    </div>
  );
}
