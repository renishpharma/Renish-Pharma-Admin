import "./globals.css";
import { Onest } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Renish Pharmaceuticals | Admin Dashboard",
  description: "Executive Administrative Dashboard for Renish Pharmaceuticals Management",
  icons: {
    icon: "/favicon_io/favicon.ico",
    shortcut: "/favicon_io/favicon-32x32.png",
    apple: "/favicon_io/apple-touch-icon.png",
  }
};

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={onest.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}