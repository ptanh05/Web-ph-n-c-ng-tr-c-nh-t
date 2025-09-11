"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Bell, Clock, MapPin, GraduationCap } from "lucide-react";
import { getUpcomingDuties, formatShift } from "@/lib/duty-utils";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function DashboardContent() {
  const { user } = useAuth();

  if (!user) return null;

  const [userSchedules, setUserSchedules] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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
  }, [user.id]);

  const upcomingDuties = getUpcomingDuties(userSchedules);
  const unreadNotifications: any[] = [];

  const [assigneesText, setAssigneesText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [includeWeekend, setIncludeWeekend] = useState(false);
  const [locationInput, setLocationInput] = useState("Phòng trực");
  const [taskInput, setTaskInput] = useState("Trực nhật lớp");
  const [shiftInput, setShiftInput] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");

  const assignees = useMemo(
    () =>
      assigneesText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    [assigneesText]
  );

  function enumerateDatesInclusive(
    start: Date,
    end: Date,
    includeWeekendDays: boolean
  ) {
    const days: Date[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const day = cursor.getDay();
      const isWeekend = day === 0 || day === 6;
      if (includeWeekendDays || !isWeekend) {
        days.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  const generatedDuties = useMemo(() => {
    if (!startDate || !endDate || assignees.length === 0)
      return [] as Array<{ date: Date; assignee: string }>;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end)
      return [];
    const days = enumerateDatesInclusive(start, end, includeWeekend);
    const result: Array<{ date: Date; assignee: string }> = [];
    for (let i = 0; i < days.length; i++) {
      const assignee = assignees[i % assignees.length];
      result.push({ date: days[i], assignee });
    }
    return result;
  }, [startDate, endDate, assignees, includeWeekend]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Xin chào, {user.name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Lịch trực sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {upcomingDuties.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Thông báo mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {unreadNotifications.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tổng lịch trực
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userSchedules.length}
              </div>
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
                      <p className="font-medium">{duty.task}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {duty.location}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Không có lịch trực nào sắp tới
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Tạo lịch trực tự động
            </CardTitle>
            <CardDescription>
              Nhập danh sách người trực (mỗi dòng một tên) và khoảng ngày. Hệ
              thống sẽ luân phiên mỗi người trực một ngày.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Danh sách người trực
                </label>
                <textarea
                  className="w-full h-36 p-2 border rounded-md bg-transparent"
                  placeholder={`Nguyễn Văn A\nTrần Thị B\nLê Văn C`}
                  value={assigneesText}
                  onChange={(e) => setAssigneesText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Khoảng thời gian</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md bg-transparent"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md bg-transparent"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={includeWeekend}
                    onChange={(e) => setIncludeWeekend(e.target.checked)}
                  />
                  Bao gồm Thứ 7, Chủ nhật
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Địa điểm</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md bg-transparent"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Ca trực</label>
                    <select
                      className="w-full p-2 border rounded-md bg-transparent"
                      value={shiftInput}
                      onChange={(e) => setShiftInput(e.target.value as any)}
                    >
                      <option value="morning">Sáng</option>
                      <option value="afternoon">Chiều</option>
                      <option value="evening">Tối</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  <label className="text-sm font-medium">
                    Nội dung công việc
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md bg-transparent"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {generatedDuties.length > 0
                  ? `${generatedDuties.length} ngày trực sẽ được tạo`
                  : "Chưa có dữ liệu hợp lệ"}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {generatedDuties.slice(0, 10).map((g, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {formatShift(shiftInput as any)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {g.date.toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="font-medium">
                      {taskInput} - {g.assignee}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {locationInput}
                    </div>
                  </div>
                </div>
              ))}
              {generatedDuties.length > 10 && (
                <p className="text-xs text-gray-500">
                  … và {generatedDuties.length - 10} dòng nữa
                </p>
              )}
            </div>

            <div className="mt-4">
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                disabled={generatedDuties.length === 0 || isSaving}
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    const payload = generatedDuties.map((g) => ({
                      userId: user.id,
                      date: new Date(
                        Date.UTC(
                          g.date.getFullYear(),
                          g.date.getMonth(),
                          g.date.getDate(),
                          7,
                          0,
                          0
                        )
                      ).toISOString(),
                      shift: shiftInput,
                      location: locationInput,
                      task: `${taskInput} - ${g.assignee}`,
                      status: "scheduled" as const,
                    }));
                    const res = await fetch("/api/duties", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                      throw new Error(data?.error || "Lưu thất bại");
                    }
                    // refresh list
                    const res2 = await fetch(`/api/duties?userId=${user.id}`);
                    const data2 = await res2.json();
                    if (data2 && data2.success) {
                      setUserSchedules(
                        (data2.duties || []).map((d: any) => ({
                          ...d,
                          date: new Date(d.date),
                        }))
                      );
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? "Đang lưu..." : "Lưu lịch trực"}
              </Button>
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
                <Button
                  className="w-full h-16 flex flex-col gap-2 bg-transparent"
                  variant="outline"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Xem lịch</span>
                </Button>
              </Link>
              <Link href="/notifications">
                <Button
                  className="w-full h-16 flex flex-col gap-2 bg-transparent"
                  variant="outline"
                >
                  <Bell className="w-5 h-5" />
                  <span>Thông báo</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
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
                Chào mừng bạn đến với hệ thống quản lý trực nhật. Vui lòng đăng
                nhập hoặc đăng ký để tiếp tục.
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
                <p>
                  <strong>Admin:</strong> admin@school.edu.vn /{" "}
                  <strong>Mật khẩu:</strong> 123456
                </p>
                <p>
                  <strong>Học sinh:</strong> tuan.le@student.edu.vn /{" "}
                  <strong>Mật khẩu:</strong> 123456
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    );
  }

  return <WelcomeContent />;
}
