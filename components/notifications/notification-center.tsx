"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  MoreVertical,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { mockNotifications } from "@/lib/mock-data"
import type { Notification } from "@/lib/types"

export function NotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.filter((n) => n.userId === user?.id),
  )

  if (!user) return null

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
  }

  const markAsUnread = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n)))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "assignment":
        return <Calendar className="w-5 h-5 text-green-600" />
      case "change":
        return <Info className="w-5 h-5 text-orange-600" />
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    const types = {
      reminder: "Nhắc nhở",
      assignment: "Phân công",
      change: "Thay đổi",
      alert: "Cảnh báo",
    }
    return types[type as keyof typeof types] || type
  }

  const getNotificationTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "reminder":
        return "secondary"
      case "assignment":
        return "default"
      case "change":
        return "outline"
      case "alert":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      className={`p-4 border rounded-lg transition-colors ${
        notification.isRead
          ? "bg-white dark:bg-gray-800"
          : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={`font-medium ${notification.isRead ? "text-gray-900 dark:text-white" : "text-blue-900 dark:text-blue-100"}`}
                >
                  {notification.title}
                </h4>
                <Badge variant={getNotificationTypeBadgeVariant(notification.type)} className="text-xs">
                  {getNotificationTypeLabel(notification.type)}
                </Badge>
                {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
              </div>
              <p
                className={`text-sm ${notification.isRead ? "text-gray-600 dark:text-gray-300" : "text-blue-800 dark:text-blue-200"}`}
              >
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {notification.createdAt.toLocaleDateString("vi-VN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {notification.isRead ? (
                  <DropdownMenuItem onClick={() => markAsUnread(notification.id)}>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Đánh dấu chưa đọc
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Đánh dấu đã đọc
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => deleteNotification(notification.id)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa thông báo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Trung tâm thông báo
              </CardTitle>
              <CardDescription>Bạn có {unreadNotifications.length} thông báo chưa đọc</CardDescription>
            </div>
            {unreadNotifications.length > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tất cả ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Chưa đọc ({unreadNotifications.length})</TabsTrigger>
              <TabsTrigger value="read">Đã đọc ({readNotifications.length})</TabsTrigger>
              <TabsTrigger value="important">Quan trọng</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {notifications.length > 0 ? (
                notifications
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((notification) => <NotificationItem key={notification.id} notification={notification} />)
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Không có thông báo nào</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4 mt-6">
              {unreadNotifications.length > 0 ? (
                unreadNotifications
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((notification) => <NotificationItem key={notification.id} notification={notification} />)
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tất cả thông báo đã được đọc</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="read" className="space-y-4 mt-6">
              {readNotifications.length > 0 ? (
                readNotifications
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((notification) => <NotificationItem key={notification.id} notification={notification} />)
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Không có thông báo đã đọc</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="important" className="space-y-4 mt-6">
              {notifications
                .filter((n) => n.type === "alert" || n.type === "assignment")
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
