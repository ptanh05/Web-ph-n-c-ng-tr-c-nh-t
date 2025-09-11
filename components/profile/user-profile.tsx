"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Edit,
  Camera,
  Calendar,
  Clock,
  MapPin,
  BarChart3,
  Trophy,
  Target,
  Phone,
  Mail,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  calculateDutyStats,
  formatShift,
  formatStatus,
} from "@/lib/duty-utils";

export function UserProfile() {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    class: user?.class || "",
  });

  const [userSchedules, setUserSchedules] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/duties?userId=${user.id}`);
        const data = await res.json();
        if (data && data.success) {
          setUserSchedules(
            (data.duties || []).map((d: any) => ({
              ...d,
              date: new Date(d.date),
            }))
          );
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  const stats = calculateDutyStats(userSchedules);

  // Recent duty history (last 10)
  const recentDuties = userSchedules
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  const handleSaveProfile = () => {
    // In a real app, this would update the user in the database
    console.log("Saving profile:", editForm);
    setIsEditDialogOpen(false);
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: "Quản trị viên",
      teacher: "Giáo viên",
      student: "Học sinh",
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "scheduled":
        return "secondary";
      case "missed":
        return "destructive";
      case "excused":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="history">Lịch sử trực</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-transparent"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {user.email}
                    </span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {user.phone}
                      </span>
                    </div>
                  )}

                  {user.class && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Lớp {user.class}
                      </span>
                    </div>
                  )}
                </div>

                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full bg-transparent" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa thông tin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
                      <DialogDescription>
                        Cập nhật thông tin tài khoản của bạn
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                        />
                      </div>
                      {user.role === "student" && (
                        <div className="grid gap-2">
                          <Label htmlFor="class">Lớp</Label>
                          <Input
                            id="class"
                            value={editForm.class}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                class: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Thống kê trực nhật
                  </CardTitle>
                  <CardDescription>
                    Tổng quan về hoạt động trực nhật của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalScheduled}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Tổng ca trực
                      </div>
                    </div>

                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {stats.completed}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Hoàn thành
                      </div>
                    </div>

                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.completionRate}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Tỷ lệ hoàn thành
                      </div>
                    </div>

                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">
                        {stats.missed}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Vắng mặt
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Duties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Ca trực gần đây
                  </CardTitle>
                  <CardDescription>5 ca trực mới nhất của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentDuties.slice(0, 5).map((duty) => (
                      <div
                        key={duty.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">
                              {formatShift(duty.shift)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {duty.date.toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {duty.task}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {duty.location}
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(duty.status)}>
                          {formatStatus(duty.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lịch sử trực nhật
              </CardTitle>
              <CardDescription>Tất cả các ca trực của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDuties.map((duty) => (
                  <div
                    key={duty.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {duty.task}
                        </h4>
                        <Badge variant={getStatusBadgeVariant(duty.status)}>
                          {formatStatus(duty.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {duty.date.toLocaleDateString("vi-VN")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatShift(duty.shift)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {duty.location}
                        </div>
                      </div>

                      {duty.notes && (
                        <p className="text-sm text-gray-500 mt-2">
                          {duty.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt tài khoản</CardTitle>
              <CardDescription>
                Quản lý cài đặt và tùy chọn tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notifications">Thông báo email</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Nhận thông báo về lịch trực qua email
                  </p>
                  <Button variant="outline" size="sm">
                    Bật thông báo
                  </Button>
                </div>

                <div>
                  <Label htmlFor="reminders">Nhắc nhở</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Nhận nhắc nhở trước ca trực
                  </p>
                  <Button variant="outline" size="sm">
                    Cài đặt nhắc nhở
                  </Button>
                </div>

                <div>
                  <Label htmlFor="privacy">Quyền riêng tư</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Quản lý quyền riêng tư và bảo mật
                  </p>
                  <Button variant="outline" size="sm">
                    Cài đặt quyền riêng tư
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password">Đổi mật khẩu</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Cập nhật mật khẩu để bảo mật tài khoản
                    </p>
                    <Button variant="outline" size="sm">
                      Đổi mật khẩu
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="export">Xuất dữ liệu</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Tải xuống dữ liệu cá nhân của bạn
                    </p>
                    <Button variant="outline" size="sm">
                      Xuất dữ liệu
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
