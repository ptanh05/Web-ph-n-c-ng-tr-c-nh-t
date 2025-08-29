"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Bell, Clock, MapPin } from "lucide-react"
import { mockDutySchedules, mockNotifications } from "@/lib/mock-data"
import { getUpcomingDuties, formatShift } from "@/lib/duty-utils"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

function DashboardContent() {
  const { user } = useAuth()

  if (!user) return null

  const userSchedules = mockDutySchedules.filter((s) => s.userId === user.id)
  const upcomingDuties = getUpcomingDuties(userSchedules)
  const unreadNotifications = mockNotifications.filter((n) => n.userId === user.id && !n.isRead)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xin chào, {user.name}!</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Lịch trực sắp tới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingDuties.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Thông báo mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unreadNotifications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng lịch trực</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{userSchedules.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch trực sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDuties.length > 0 ? (
                upcomingDuties.slice(0, 3).map((duty) => (
                  <div key={duty.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{formatShift(duty.shift)}</Badge>
                        <span className="text-sm text-gray-500">{duty.date.toLocaleDateString("vi-VN")}</span>
                      </div>
                      <p className="font-medium">{duty.task}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {duty.location}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Không có lịch trực nào sắp tới</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/calendar">
                <Button className="w-full h-16 flex flex-col gap-2 bg-transparent" variant="outline">
                  <Calendar className="w-5 h-5" />
                  <span>Xem lịch</span>
                </Button>
              </Link>
              <Link href="/notifications">
                <Button className="w-full h-16 flex flex-col gap-2 bg-transparent" variant="outline">
                  <Bell className="w-5 h-5" />
                  <span>Thông báo</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
