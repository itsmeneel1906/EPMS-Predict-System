import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { DemoBanner } from "@/components/layout/DemoBanner";

export const metadata: Metadata = {
  title: "EPMS Predict — Employee Performance Prediction System",
  description:
    "AI-powered predictive HR analytics and early delivery risk detection for web and mobile engineering teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8F5] text-[#34323D] flex flex-col font-sans">
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* Sticky Pastel Sidebar */}
            <Sidebar />

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <TopNavbar />
              <DemoBanner />
              <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
