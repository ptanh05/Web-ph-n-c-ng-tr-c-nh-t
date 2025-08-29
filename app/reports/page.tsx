"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { ReportsAndStatistics } from "@/components/reports/reports-and-statistics"

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "teacher"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Báo cáo & Thống kê</h2>
            <p className="text-gray-600 dark:text-gray-300">Theo dõi hiệu suất trực nhật</p>
          </div>
          <ReportsAndStatistics />
        </main>
      </div>
    </ProtectedRoute>
  )
}
