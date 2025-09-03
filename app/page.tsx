"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Bell, Clock, MapPin, GraduationCap } from "lucide-react"
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

function WelcomeContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Hệ thống quản lý trực nhật
          </CardTitle>
          <CardDescription className="text-xl text-gray-600 dark:text-gray-300">
            Quản lý lịch trực nhật một cách thông minh và hiệu quả
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                Chào mừng bạn đến với hệ thống quản lý trực nhật. 
                Vui lòng đăng nhập hoặc đăng ký để tiếp tục.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/login">
                <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                  Đăng ký
                </Button>
              </Link>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center justify-center">
                <Calendar className="w-4 h-4 mr-2" />
                Tài khoản demo có sẵn
              </p>
              <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300 text-center">
                <p><strong>Admin:</strong> admin@school.edu.vn / <strong>Mật khẩu:</strong> 123456</p>
                <p><strong>Học sinh:</strong> tuan.le@student.edu.vn / <strong>Mật khẩu:</strong> 123456</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return (
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    )
  }

  return <WelcomeContent />
}
