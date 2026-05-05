"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import axios from "axios";

const loginSchema = z.z.object({
  userId: z.string().min(3, "User ID must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", data);
      const { token, user } = response.data.data;
      login(token, user);
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300 rounded-full blur-[120px] opacity-50 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-200 rounded-full blur-[120px] opacity-50 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 md:p-12 relative z-10">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-primary/10 mb-6"
            >
              <div className="w-10 h-10 bg-linear-to-tr from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-surface-dark mb-2">Renish Pharmaceuticals</h1>
            <p className="text-surface-dark/60 font-medium">Executive Administration Portal</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-dark/70 ml-1">User ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-dark/40 group-focus-within:text-brand-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  {...register("userId")}
                  className={cn(
                    "w-full bg-surface-light border-none rounded-2xl py-4 pl-12 pr-4 outline-none ring-2 ring-transparent focus:ring-brand-primary/20 focus:bg-white transition-all duration-200 font-medium",
                    errors.userId ? "ring-red-500/20 bg-red-50/10" : "hover:bg-surface-light/80"
                  )}
                  placeholder="Enter your user ID"
                />
              </div>
              {errors.userId && <p className="text-xs font-medium text-red-500 ml-1">{errors.userId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-dark/70 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-dark/40 group-focus-within:text-brand-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={cn(
                    "w-full bg-surface-light border-none rounded-2xl py-4 pl-12 pr-12 outline-none ring-2 ring-transparent focus:ring-brand-primary/20 focus:bg-white transition-all duration-200 font-medium",
                    errors.password ? "ring-red-500/20 bg-red-50/10" : "hover:bg-surface-light/80"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-dark/40 hover:text-surface-dark transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="w-full bg-brand-primary hover:bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Access Dashboard"
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-surface-light text-center">
            <p className="text-sm text-surface-dark/40 font-medium">
              Forgot password? Contact your administrator
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
