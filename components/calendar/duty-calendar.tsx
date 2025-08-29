"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { mockDutySchedules } from "@/lib/mock-data"
import { formatShift, formatStatus } from "@/lib/duty-utils"
import type { DutySchedule } from "@/lib/types"

export function DutyCalendar() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDuty, setSelectedDuty] = useState<DutySchedule | null>(null)

  if (!user) return null

  // Get user's schedules or all schedules for admin
  const userSchedules =
    user.role === "admin" ? mockDutySchedules : mockDutySchedules.filter((s) => s.userId === user.id)

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Calendar calculations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Get duties for a specific date
  const getDutiesForDate = (day: number) => {
    const date = new Date(year, month, day)
    return userSchedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date)
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "missed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "excused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  const today = new Date()
  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hôm nay
              </Button>
              <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {dayNames.map((dayName) => (
              <div key={dayName} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {dayName}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={index} className="p-2 h-24" />
              }

              const duties = getDutiesForDate(day)
              const isCurrentDay = isToday(day)

              return (
                <div
                  key={day}
                  className={`p-2 h-24 border rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    isCurrentDay
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isCurrentDay ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {day}
                  </div>

                  <div className="space-y-1">
                    {duties.slice(0, 2).map((duty) => (
                      <button
                        key={duty.id}
                        onClick={() => setSelectedDuty(duty)}
                        className={`w-full text-xs p-1 rounded text-left truncate ${getStatusColor(duty.status)} hover:opacity-80 transition-opacity`}
                      >
                        {formatShift(duty.shift)} - {duty.location}
                      </button>
                    ))}

                    {duties.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">+{duties.length - 2} khác</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Đã lên lịch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Hoàn thành</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Vắng mặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Có phép</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duty Detail Dialog */}
      <Dialog open={!!selectedDuty} onOpenChange={() => setSelectedDuty(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Chi tiết ca trực
            </DialogTitle>
            <DialogDescription>Thông tin chi tiết về ca trực được chọn</DialogDescription>
          </DialogHeader>

          {selectedDuty && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày trực</label>
                  <p className="text-sm font-medium">
                    {selectedDuty.date.toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ca trực</label>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatShift(selectedDuty.shift)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Địa điểm</label>
                <p className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedDuty.location}
                </p>
              </div>

              {user.role === "admin" && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Học sinh</label>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {selectedDuty.user.name} - {selectedDuty.user.class}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nhiệm vụ</label>
                <p className="text-sm">{selectedDuty.task}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedDuty.status === "completed"
                        ? "default"
                        : selectedDuty.status === "scheduled"
                          ? "secondary"
                          : selectedDuty.status === "missed"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {formatStatus(selectedDuty.status)}
                  </Badge>
                </div>
              </div>

              {selectedDuty.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ghi chú</label>
                  <p className="text-sm">{selectedDuty.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
