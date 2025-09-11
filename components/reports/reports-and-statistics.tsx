"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Calendar, Target, Award, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { calculateDutyStats } from "@/lib/duty-utils";

export function ReportsAndStatistics() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState("all");
  const [duties, setDuties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const qs = user.role === "admin" ? "" : `?userId=${user.id}`;
        const res = await fetch(`/api/duties${qs}`);
        const data = await res.json();
        if (data && data.success) {
          setDuties(
            (data.duties || []).map((d: any) => ({
              ...d,
              date: new Date(d.date),
            }))
          );
        } else {
          setDuties([]);
        }
      } catch (e) {
        console.error(e);
        setDuties([]);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  // Calculate statistics
  const allStats = calculateDutyStats(duties);
  const students = useMemo(
    () => users.filter((u) => u.role === "student"),
    [users]
  );
  const classes = useMemo(
    () => [...new Set(students.map((s: any) => s.class).filter(Boolean))],
    [students]
  );

  // Completion rate by class
  const classStats = classes.map((className) => {
    const classSchedules = duties.filter(
      (s: any) => s.user?.class === className
    );
    const stats = calculateDutyStats(classSchedules);
    return { class: className, rate: stats.completionRate };
  });

  // Status distribution
  const statusData = [
    { name: "Hoàn thành", value: allStats.completed, color: "#10b981" },
    {
      name: "Đã lên lịch",
      value: duties.filter((s: any) => s.status === "scheduled").length,
      color: "#3b82f6",
    },
    { name: "Vắng mặt", value: allStats.missed, color: "#ef4444" },
  ];

  // Top performers
  const studentPerformance = students
    .map((student: any) => {
      const studentSchedules = duties.filter(
        (s: any) => s.userId === student.id
      );
      const stats = calculateDutyStats(studentSchedules);
      return { ...student, ...stats };
    })
    .sort((a, b) => b.completionRate - a.completionRate);

  const topPerformers = studentPerformance.slice(0, 5);
  const needsAttention = studentPerformance
    .filter((s: any) => s.completionRate < 80)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Lớp:</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {classes.map((className: any) => (
                  <SelectItem key={className} value={className || ""}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="students">Học sinh</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tổng ca trực
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allStats.totalScheduled}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Tỷ lệ hoàn thành
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {allStats.completionRate}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Học sinh tham gia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái ca trực</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => {
                        const p = typeof percent === "number" ? percent : 0;
                        return `${name} ${(p * 100).toFixed(0)}%`;
                      }}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiệu suất theo lớp</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={classStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top 5 học sinh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            Lớp {student.class}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        {student.completionRate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {needsAttention.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Cần cải thiện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {needsAttention.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            Lớp {student.class}
                          </p>
                        </div>
                        <Badge variant="destructive">
                          {student.completionRate}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Danh sách học sinh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentPerformance.slice(0, 10).map((student) => (
                  <div key={student.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-gray-500">
                          Lớp {student.class}
                        </p>
                      </div>
                      <Badge
                        variant={
                          student.completionRate >= 90
                            ? "default"
                            : student.completionRate >= 80
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {student.completionRate}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-center">
                      <div>
                        <div className="font-medium text-blue-600">
                          {student.totalScheduled}
                        </div>
                        <div className="text-gray-500">Tổng ca</div>
                      </div>
                      <div>
                        <div className="font-medium text-green-600">
                          {student.completed}
                        </div>
                        <div className="text-gray-500">Hoàn thành</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-600">
                          {student.missed}
                        </div>
                        <div className="text-gray-500">Vắng mặt</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
