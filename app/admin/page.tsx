"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, CalendarPlus } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { useAuth } from "@/lib/auth-context"
import { mockUsers, mockDutySchedules } from "@/lib/mock-data"
import { AdminUserManagement } from "@/components/admin/user-management"
import { AdminDutyManagement } from "@/components/admin/duty-management"
import { useState } from "react"

function AdminDashboardContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "duties">("overview")

  if (!user) return null

  const totalUsers = mockUsers.length
  const totalSchedules = mockDutySchedules.length
  const completedSchedules = mockDutySchedules.filter((s) => s.status === "completed").length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quản trị hệ thống</h2>
          <p className="text-gray-600 dark:text-gray-300">Quản lý người dùng và lịch trực</p>
        </div>

        <div className="mb-8">
          <div className="flex space-x-2">
            <Button variant={activeTab === "overview" ? "default" : "outline"} onClick={() => setActiveTab("overview")}>
              Tổng quan
            </Button>
            <Button variant={activeTab === "users" ? "default" : "outline"} onClick={() => setActiveTab("users")}>
              Người dùng
            </Button>
            <Button variant={activeTab === "duties" ? "default" : "outline"} onClick={() => setActiveTab("duties")}>
              Lịch trực
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Tổng người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Tổng lịch trực</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSchedules}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Đã hoàn thành</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedSchedules}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    className="h-16 flex flex-col gap-2 bg-transparent"
                    variant="outline"
                    onClick={() => setActiveTab("users")}
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Quản lý người dùng</span>
                  </Button>

                  <Button
                    className="h-16 flex flex-col gap-2 bg-transparent"
                    variant="outline"
                    onClick={() => setActiveTab("duties")}
                  >
                    <CalendarPlus className="w-5 h-5" />
                    <span>Quản lý lịch trực</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === "users" && <AdminUserManagement />}

        {/* Duties Management Tab */}
        {activeTab === "duties" && <AdminDutyManagement />}
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
