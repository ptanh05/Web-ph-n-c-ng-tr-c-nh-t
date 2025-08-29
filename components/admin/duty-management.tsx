"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarPlus, Edit, Trash2, Search, MapPin, Clock } from "lucide-react"
import { mockDutySchedules, mockUsers } from "@/lib/mock-data"
import { formatShift, formatStatus } from "@/lib/duty-utils"
import type { DutySchedule } from "@/lib/types"

export function AdminDutyManagement() {
  const [schedules, setSchedules] = useState<DutySchedule[]>(mockDutySchedules)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<DutySchedule | null>(null)
  const [newSchedule, setNewSchedule] = useState({
    userId: "",
    date: "",
    shift: "morning" as "morning" | "afternoon" | "evening",
    location: "",
    task: "",
    status: "scheduled" as "scheduled" | "completed" | "missed" | "excused",
    notes: "",
  })

  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.task.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddSchedule = () => {
    const user = mockUsers.find((u) => u.id === newSchedule.userId)
    if (!user) return

    const schedule: DutySchedule = {
      id: (schedules.length + 1).toString(),
      userId: newSchedule.userId,
      user,
      date: new Date(newSchedule.date),
      shift: newSchedule.shift,
      location: newSchedule.location,
      task: newSchedule.task,
      status: newSchedule.status,
      notes: newSchedule.notes || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSchedules([...schedules, schedule])
    setNewSchedule({
      userId: "",
      date: "",
      shift: "morning",
      location: "",
      task: "",
      status: "scheduled",
      notes: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditSchedule = (schedule: DutySchedule) => {
    setEditingSchedule(schedule)
    setNewSchedule({
      userId: schedule.userId,
      date: schedule.date.toISOString().split("T")[0],
      shift: schedule.shift,
      location: schedule.location,
      task: schedule.task,
      status: schedule.status,
      notes: schedule.notes || "",
    })
  }

  const handleUpdateSchedule = () => {
    if (!editingSchedule) return

    const user = mockUsers.find((u) => u.id === newSchedule.userId)
    if (!user) return

    const updatedSchedules = schedules.map((schedule) =>
      schedule.id === editingSchedule.id
        ? {
            ...schedule,
            userId: newSchedule.userId,
            user,
            date: new Date(newSchedule.date),
            shift: newSchedule.shift,
            location: newSchedule.location,
            task: newSchedule.task,
            status: newSchedule.status,
            notes: newSchedule.notes || undefined,
            updatedAt: new Date(),
          }
        : schedule,
    )
    setSchedules(updatedSchedules)
    setEditingSchedule(null)
    setNewSchedule({
      userId: "",
      date: "",
      shift: "morning",
      location: "",
      task: "",
      status: "scheduled",
      notes: "",
    })
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== scheduleId))
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "scheduled":
        return "secondary"
      case "missed":
        return "destructive"
      case "excused":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5" />
                Quản lý lịch trực
              </CardTitle>
              <CardDescription>Phân công và quản lý lịch trực nhật</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Tạo lịch trực
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tạo lịch trực mới</DialogTitle>
                  <DialogDescription>Phân công ca trực cho học sinh</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="user">Học sinh</Label>
                    <Select
                      value={newSchedule.userId}
                      onValueChange={(value) => setNewSchedule({ ...newSchedule, userId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn học sinh" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers
                          .filter((u) => u.role === "student")
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} - {user.class}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Ngày trực</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newSchedule.date}
                      onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="shift">Ca trực</Label>
                    <Select
                      value={newSchedule.shift}
                      onValueChange={(value: any) => setNewSchedule({ ...newSchedule, shift: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Sáng</SelectItem>
                        <SelectItem value="afternoon">Chiều</SelectItem>
                        <SelectItem value="evening">Tối</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Địa điểm</Label>
                    <Input
                      id="location"
                      value={newSchedule.location}
                      onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                      placeholder="Cổng chính, Thư viện, Sân trường..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="task">Nhiệm vụ</Label>
                    <Textarea
                      id="task"
                      value={newSchedule.task}
                      onChange={(e) => setNewSchedule({ ...newSchedule, task: e.target.value })}
                      placeholder="Mô tả nhiệm vụ cần thực hiện..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Textarea
                      id="notes"
                      value={newSchedule.notes}
                      onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                      placeholder="Ghi chú thêm (tùy chọn)..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddSchedule}>Tạo lịch trực</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên, địa điểm hoặc nhiệm vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Schedules Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Ngày trực</TableHead>
                  <TableHead>Ca trực</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Nhiệm vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{schedule.user.name}</p>
                        <p className="text-sm text-gray-500">{schedule.user.class}</p>
                      </div>
                    </TableCell>
                    <TableCell>{schedule.date.toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatShift(schedule.shift)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {schedule.location}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{schedule.task}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(schedule.status)}>{formatStatus(schedule.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleEditSchedule(schedule)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa lịch trực</DialogTitle>
                              <DialogDescription>Cập nhật thông tin ca trực</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label>Học sinh</Label>
                                <Select
                                  value={newSchedule.userId}
                                  onValueChange={(value) => setNewSchedule({ ...newSchedule, userId: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockUsers
                                      .filter((u) => u.role === "student")
                                      .map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                          {user.name} - {user.class}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label>Ngày trực</Label>
                                <Input
                                  type="date"
                                  value={newSchedule.date}
                                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Ca trực</Label>
                                <Select
                                  value={newSchedule.shift}
                                  onValueChange={(value: any) => setNewSchedule({ ...newSchedule, shift: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="morning">Sáng</SelectItem>
                                    <SelectItem value="afternoon">Chiều</SelectItem>
                                    <SelectItem value="evening">Tối</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label>Trạng thái</Label>
                                <Select
                                  value={newSchedule.status}
                                  onValueChange={(value: any) => setNewSchedule({ ...newSchedule, status: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                    <SelectItem value="missed">Vắng mặt</SelectItem>
                                    <SelectItem value="excused">Có phép</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label>Địa điểm</Label>
                                <Input
                                  value={newSchedule.location}
                                  onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Nhiệm vụ</Label>
                                <Textarea
                                  value={newSchedule.task}
                                  onChange={(e) => setNewSchedule({ ...newSchedule, task: e.target.value })}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleUpdateSchedule}>Cập nhật</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
