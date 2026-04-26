import { AdminLayout } from "@/components/layout/AdminLayout";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      <Toaster position="top-center" richColors />
      {children}
    </AdminLayout>
  );
}
