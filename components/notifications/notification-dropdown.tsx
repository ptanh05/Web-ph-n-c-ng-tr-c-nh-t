"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Clock, Calendar, AlertTriangle, Info, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { mockNotifications } from "@/lib/mock-data"
import type { Notification } from "@/lib/types"
import Link from "next/link"

export function NotificationDropdown() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.filter((n) => n.userId === user?.id),
  )

  if (!user) return null

  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const recentNotifications = notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5)

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "assignment":
        return <Calendar className="w-4 h-4 text-green-600" />
      case "change":
        return <Info className="w-4 h-4 text-orange-600" />
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadNotifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
              {unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Thông báo</span>
          {unreadNotifications.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadNotifications.length} mới
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {recentNotifications.length > 0 ? (
          <>
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className={`text-sm font-medium truncate ${
                        notification.isRead ? "text-gray-900 dark:text-white" : "text-blue-900 dark:text-blue-100"
                      }`}
                    >
                      {notification.title}
                    </p>
                    {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>}
                  </div>
                  <p
                    className={`text-xs line-clamp-2 ${
                      notification.isRead ? "text-gray-600 dark:text-gray-300" : "text-blue-800 dark:text-blue-200"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{notification.createdAt.toLocaleDateString("vi-VN")}</p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="flex items-center justify-center p-2 text-sm font-medium">
                <Eye className="w-4 h-4 mr-2" />
                Xem tất cả thông báo
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="p-4 text-center">
            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Không có thông báo mới</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
