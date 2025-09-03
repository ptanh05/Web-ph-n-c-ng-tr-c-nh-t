"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
         role: "student" as "admin" | "student",
    class: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, isLoading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return false;
    }

    if (formData.name.length < 2) {
      setError("Tên phải có ít nhất 2 ký tự");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }

    if (formData.role === "student" && !formData.class) {
      setError("Vui lòng nhập lớp cho học sinh");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register(formData);
      if (result.success) {
        setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "student",
          class: "",
          phone: "",
        });
      } else {
        setError(result.error || "Đăng ký thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Đăng ký tài khoản
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Tạo tài khoản mới để sử dụng hệ thống quản lý trực nhật
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tên */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <User className="w-4 h-4 inline mr-2" />
                Họ và tên
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Nhập họ và tên đầy đủ"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isLoading || isSubmitting}
                className="h-11 px-4 text-base border-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@school.edu.vn"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading || isSubmitting}
                className="h-11 px-4 text-base border-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
              />
            </div>

            {/* Vai trò */}
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Vai trò
              </Label>
              <Select
                value={formData.role}
                                 onValueChange={(value: "admin" | "student") =>
                   handleInputChange("role", value)
                 }
                disabled={isLoading || isSubmitting}
              >
                <SelectTrigger className="h-11 text-base border-2 focus:border-green-500 focus:ring-2 focus:ring-green-200">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="student">Học sinh</SelectItem>
                   <SelectItem value="admin">Quản trị viên</SelectItem>
                 </SelectContent>
              </Select>
            </div>

            {/* Lớp (chỉ hiển thị cho học sinh) */}
            {formData.role === "student" && (
              <div className="space-y-2">
                <Label
                  htmlFor="class"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  <GraduationCap className="w-4 h-4 inline mr-2" />
                  Lớp
                </Label>
                <Input
                  id="class"
                  type="text"
                  placeholder="Ví dụ: 12A1, 11B2"
                  value={formData.class}
                  onChange={(e) => handleInputChange("class", e.target.value)}
                  disabled={isLoading || isSubmitting}
                  className="h-11 px-4 text-base border-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                />
              </div>
            )}

            {/* Số điện thoại */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Số điện thoại (tùy chọn)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0123456789"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={isLoading || isSubmitting}
                className="h-11 px-4 text-base border-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
              />
            </div>

            {/* Mật khẩu */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  disabled={isLoading || isSubmitting}
                  className="h-11 px-4 pr-12 text-base border-2 focus:border-green-500 focus:ring-green-200 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  disabled={isLoading || isSubmitting}
                  className="h-11 px-4 pr-12 text-base border-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading || isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50 dark:bg-red-950/50"
              >
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/50">
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Đăng ký
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Đã có tài khoản?{" "}
              <Button
                variant="link"
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-0 h-auto text-sm"
                onClick={() => (window.location.href = "/login")}
              >
                Đăng nhập ngay
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
