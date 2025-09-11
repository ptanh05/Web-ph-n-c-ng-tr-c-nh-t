"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Thông báo
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Quản lý và xem tất cả thông báo của bạn
            </p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                <X className="w-4 h-4 mr-2" /> Đóng
              </Button>
            </div>
          </div>
          <NotificationCenter />
        </main>
      </div>
    </ProtectedRoute>
  );
}
