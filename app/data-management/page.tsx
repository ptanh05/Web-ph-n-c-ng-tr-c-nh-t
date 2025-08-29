"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, Database, FileText, Users, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/auth/protected-route"
import { toast } from "@/hooks/use-toast"

function DataManagementContent() {
  const { user } = useAuth()
  const [importData, setImportData] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportData(content)
      }
      reader.readAsText(file)
    }
  }

  const processCSVData = () => {
    if (!importData) {
      toast({ title: "Lỗi", description: "Vui lòng chọn file hoặc nhập dữ liệu" })
      return
    }

    try {
      const lines = importData.split("\n")
      const headers = lines[0].split(",")
      const data = lines.slice(1).map((line) => {
        const values = line.split(",")
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim()
          return obj
        }, {} as any)
      })

      console.log("[v0] Processed CSV data:", data)
      toast({ title: "Thành công", description: `Đã xử lý ${data.length} bản ghi` })
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể xử lý dữ liệu CSV" })
    }
  }

  const exportData = (type: string) => {
    const data = {
      users: JSON.parse(localStorage.getItem("users") || "[]"),
      schedules: JSON.parse(localStorage.getItem("schedules") || "[]"),
      notifications: JSON.parse(localStorage.getItem("notifications") || "[]"),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `duty-schedule-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({ title: "Thành công", description: "Đã xuất dữ liệu thành công" })
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý dữ liệu</h1>
        <p className="text-gray-600 mt-2">Nhập và xuất dữ liệu theo nhiều cách khác nhau</p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import">Nhập dữ liệu</TabsTrigger>
          <TabsTrigger value="export">Xuất dữ liệu</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
          <TabsTrigger value="manual">Nhập thủ công</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Import từ CSV/Excel
                </CardTitle>
                <CardDescription>Tải lên file CSV hoặc Excel chứa dữ liệu người dùng và lịch trực</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Chọn file CSV/Excel</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>
                {selectedFile && <div className="text-sm text-gray-600">File đã chọn: {selectedFile.name}</div>}
                <Button onClick={processCSVData} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Xử lý dữ liệu
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Import từ JSON
                </CardTitle>
                <CardDescription>Nhập dữ liệu từ file JSON hoặc dán trực tiếp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="json-data">Dữ liệu JSON</Label>
                  <Textarea
                    id="json-data"
                    placeholder='{"users": [], "schedules": [], "notifications": []}'
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={() => {
                    try {
                      const data = JSON.parse(importData)
                      console.log("[v0] Imported JSON data:", data)
                      toast({ title: "Thành công", description: "Đã nhập dữ liệu JSON" })
                    } catch {
                      toast({ title: "Lỗi", description: "JSON không hợp lệ" })
                    }
                  }}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Nhập JSON
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Xuất người dùng
                </CardTitle>
                <CardDescription>Xuất danh sách tất cả người dùng</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => exportData("users")} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Users
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Xuất lịch trực
                </CardTitle>
                <CardDescription>Xuất tất cả lịch trực đã lên kế hoạch</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => exportData("schedules")} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Schedules
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Xuất tất cả
                </CardTitle>
                <CardDescription>Xuất toàn bộ dữ liệu hệ thống</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => exportData("all")} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất tất cả
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
              <CardDescription>Kết nối với hệ thống bên ngoài qua API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api-url">API URL</Label>
                  <Input id="api-url" placeholder="https://api.example.com/data" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" placeholder="Nhập API key" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="data-type">Loại dữ liệu</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn loại dữ liệu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Người dùng</SelectItem>
                    <SelectItem value="schedules">Lịch trực</SelectItem>
                    <SelectItem value="all">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Kết nối API
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nhập dữ liệu thủ công</CardTitle>
              <CardDescription>Tạo người dùng và lịch trực mới bằng form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Thêm người dùng mới</h3>
                  <div>
                    <Label htmlFor="user-name">Họ tên</Label>
                    <Input id="user-name" placeholder="Nguyễn Văn A" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="user-email">Email</Label>
                    <Input id="user-email" type="email" placeholder="email@example.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="user-role">Vai trò</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Học sinh</SelectItem>
                        <SelectItem value="teacher">Giáo viên</SelectItem>
                        <SelectItem value="admin">Quản trị</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Thêm người dùng
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Thêm lịch trực mới</h3>
                  <div>
                    <Label htmlFor="schedule-date">Ngày trực</Label>
                    <Input id="schedule-date" type="date" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="schedule-shift">Ca trực</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn ca trực" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Sáng</SelectItem>
                        <SelectItem value="afternoon">Chiều</SelectItem>
                        <SelectItem value="evening">Tối</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="schedule-location">Địa điểm</Label>
                    <Input id="schedule-location" placeholder="Cổng chính" className="mt-1" />
                  </div>
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Thêm lịch trực
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function DataManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "teacher"]}>
      <DataManagementContent />
    </ProtectedRoute>
  )
}
