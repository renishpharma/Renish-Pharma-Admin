"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  MoreVertical,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  X,
  Loader2,
  RefreshCw,
  Copy,
  CheckCircle2,
  Trash2,
  Edit2,
  Key
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { User } from "@/types";

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  userId: z.string().min(3, "User ID must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric and underscores allowed"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["admin", "manager"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: "manager"
    }
  });

  const nameValue = watch("name");
  const generatedPassword = watch("password");

  useEffect(() => {
    if (modalType === "create" && nameValue && nameValue.length >= 2) {
      const suggestedId = `REN${nameValue.replace(/\s+/g, "").toUpperCase().slice(0, 8)}${Math.floor(100 + Math.random() * 900)}`;
      setValue("userId", suggestedId);
    }
  }, [nameValue, modalType, setValue]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/user", {
        params: { search: searchTerm, role: roleFilter }
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const pass = Array.from({ length: 10 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    setValue("password", pass);
    return pass;
  };

  const generateRandomUserId = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `REN${random}`;
  };

  const handleOpenModal = (type: "create" | "edit", user?: User) => {
    setModalType(type);
    if (type === "edit" && user) {
      setSelectedUser(user);
      reset({
        name: user.name,
        userId: user.userId,
        email: user.email || "",
        role: user.role,
        password: "", // Don't show password on edit
      });
    } else {
      setSelectedUser(null);
      reset({
        name: "",
        userId: generateRandomUserId(),
        email: "",
        role: "manager",
        password: generateRandomPassword(),
      });
    }
    setIsModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      if (modalType === "create") {
        await api.post("/user", data);
      } else if (modalType === "edit" && selectedUser) {
        // Only send password if it was changed
        const updateData = { ...data };
        if (!updateData.password) delete updateData.password;
        await api.patch(`/user/${selectedUser._id}`, updateData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/user/${id}`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-surface-light shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-brand-primary" />
             </div>
             <div>
               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-1">Total Users</p>
               <p className="text-2xl font-bold text-surface-dark tracking-tight">{users.length}</p>
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-surface-light shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-600" />
             </div>
             <div>
               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-1">Admins</p>
               <p className="text-2xl font-bold text-surface-dark tracking-tight">{users.filter(u => u.role === "admin").length}</p>
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-surface-light shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-orange-600" />
             </div>
             <div>
               <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mb-1">Managers</p>
               <p className="text-2xl font-bold text-surface-dark tracking-tight">{users.filter(u => u.role === "manager").length}</p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Header Actions */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-4">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-dark/40 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or user ID..." 
                className="w-full bg-white border border-surface-light rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium placeholder:text-surface-dark/20"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="relative">
              <select 
                className="appearance-none bg-white border border-surface-light rounded-2xl py-3.5 pl-4 pr-10 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold text-[10px] uppercase tracking-widest text-surface-dark/60 cursor-pointer"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admins</option>
                <option value="manager">Managers</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-dark/40 pointer-events-none" />
           </div>
        </div>

        {currentUser?.role === "admin" && (
          <button 
            onClick={() => handleOpenModal("create")}
            className="bg-brand-primary text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center gap-2 hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add New User</span>
          </button>
        )}
      </section>

      {/* Users List */}
      <section className="bg-white rounded-4xl border border-surface-light shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-light bg-surface-light/30">
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest">User Details</th>
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest">Access Role</th>
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest">Member Since</th>
                <th className="px-8 py-5 text-xs font-bold text-surface-dark/40 uppercase tracking-widest text-right whitespace-nowrap">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-light">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                       <span className="font-bold text-surface-dark/20 uppercase tracking-widest text-[10px]">Synchronizing Directory...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-surface-dark/40 font-medium">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <UsersIcon className="w-12 h-12 mb-2" />
                      <p>No user accounts found matching your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={u._id} 
                    className="hover:bg-surface-light/30 group transition-colors"
                  >
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center font-bold text-brand-primary shadow-xs">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-surface-dark group-hover:text-brand-primary transition-colors">{u.name || "N/A"}</p>
                            <p className="text-[10px] font-bold text-surface-dark/40 uppercase tracking-tight">{u.userId}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className={cn(
                         "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                         u.role === "admin" ? "bg-green-50 text-green-600 border border-green-100/50" : "bg-orange-50 text-orange-600 border border-orange-100/50"
                       )}>
                         {u.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                         {u.role}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-surface-dark/60">
                      {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal("edit", u)}
                            className="w-9 h-9 rounded-xl bg-surface-light text-surface-dark/60 hover:text-brand-primary hover:bg-brand-primary/10 flex items-center justify-center transition-all"
                          >
                             <Edit2 className="w-4 h-4" />
                          </button>
                          {currentUser?.userId !== u.userId && (
                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              className="w-9 h-9 rounded-xl bg-surface-light text-surface-dark/60 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                       </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-surface-dark/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-xl bg-white rounded-4xl shadow-2xl overflow-hidden border border-white/20"
             >
                <div className="px-8 py-6 border-b border-surface-light flex items-center justify-between bg-surface-light/30">
                   <div>
                      <h2 className="text-xl font-bold text-surface-dark">{modalType === "create" ? "Create New Account" : "Edit User Profile"}</h2>
                      <p className="text-xs font-bold text-surface-dark/40 uppercase tracking-widest mt-1">
                        {modalType === "create" ? "Setup a new administrative access" : `Updating ${selectedUser?.name}`}
                      </p>
                   </div>
                   <button 
                     onClick={() => setIsModalOpen(false)}
                     className="w-10 h-10 rounded-2xl hover:bg-white flex items-center justify-center text-surface-dark/40 hover:text-surface-dark transition-all"
                   >
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-surface-dark/60 ml-1">Full Name *</label>
                        <input 
                          {...register("name")}
                          className={cn(
                            "w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 transition-all font-medium",
                            errors.name ? "focus:ring-red-500/20 ring-1 ring-red-500/10" : "focus:ring-brand-primary/20"
                          )} 
                          placeholder="e.g. Monish Ranjan" 
                        />
                        {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-sm font-bold text-surface-dark/60">User ID *</label>
                          {modalType === "create" && (
                            <button 
                              type="button"
                              onClick={() => setValue("userId", generateRandomUserId())}
                              className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Reset
                            </button>
                          )}
                        </div>
                        <div className="relative group">
                          <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-dark/20 group-focus-within:text-brand-primary transition-colors" />
                          <input 
                            {...register("userId")}
                            disabled={modalType === "edit"}
                            className={cn(
                              "w-full bg-surface-light border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 transition-all font-bold tracking-widest disabled:opacity-50",
                              errors.userId ? "focus:ring-red-500/20 ring-1 ring-red-500/10" : "focus:ring-brand-primary/20"
                            )} 
                            placeholder="REN1234" 
                          />
                        </div>
                        {errors.userId && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.userId.message}</p>}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-sm font-bold text-surface-dark/60 ml-1">Email Address</label>
                      <input 
                        {...register("email")}
                        className="w-full bg-surface-light border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium" 
                        placeholder="e.g. user@renishpharma.com" 
                      />
                      {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.email.message}</p>}
                   </div>

                   <div className="space-y-2">
                      <label className="text-sm font-bold text-surface-dark/60 ml-1">Access Role *</label>
                      <div className="flex bg-surface-light p-1.5 rounded-2xl border border-surface-light">
                         <button 
                           type="button"
                           onClick={() => setValue("role", "manager")}
                           className={cn(
                             "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                             watch("role") === "manager" ? "bg-white text-orange-600 shadow-sm" : "text-surface-dark/40 hover:text-surface-dark"
                           )}
                         >
                           <ShieldAlert className="w-4 h-4" />
                           MANAGER
                         </button>
                         <button 
                           type="button"
                           onClick={() => setValue("role", "admin")}
                           className={cn(
                             "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                             watch("role") === "admin" ? "bg-white text-green-600 shadow-sm" : "text-surface-dark/40 hover:text-surface-dark"
                           )}
                         >
                           <ShieldCheck className="w-4 h-4" />
                           ADMIN
                         </button>
                      </div>
                      <p className="text-[9px] font-bold text-surface-dark/30 uppercase tracking-widest text-center mt-1">
                        {watch("role") === "admin" ? "Can manage users, products, and system settings" : "Can view and manage products and enquiries"}
                      </p>
                   </div>

                   <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-bold text-surface-dark/60">{modalType === "create" ? "Security Password *" : "Reset Password (Optional)"}</label>
                        <button 
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Generate
                        </button>
                      </div>
                      <div className="relative group">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-dark/20 group-focus-within:text-brand-primary transition-colors" />
                        <input 
                          {...register("password")}
                          type="text"
                          className={cn(
                            "w-full bg-surface-light border-none rounded-2xl py-4 pl-12 pr-12 outline-none focus:ring-2 transition-all font-mono text-sm tracking-widest",
                            errors.password ? "focus:ring-red-500/20 ring-1 ring-red-500/10" : "focus:ring-brand-primary/20"
                          )} 
                          placeholder={modalType === "edit" ? "Leave blank to keep current" : "••••••••"} 
                        />
                        {generatedPassword && (
                          <button 
                            type="button"
                            onClick={() => copyToClipboard(generatedPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary hover:scale-110 transition-transform"
                          >
                             {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                      {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.password.message}</p>}
                      <p className="text-[9px] font-bold text-surface-dark/30 uppercase tracking-widest text-center">
                        Secure passwords should contain letters, numbers and symbols
                      </p>
                   </div>

                   <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                      >
                         {isSubmitting ? (
                           <Loader2 className="w-5 h-5 animate-spin" />
                         ) : (
                           modalType === "create" ? <UserPlus className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />
                         )}
                         {modalType === "create" ? "Create Account" : "Update Profile"}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
