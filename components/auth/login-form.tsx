"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validation
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    alert("Tính năng quên mật khẩu sẽ được cập nhật sớm!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Hệ thống quản lý trực nhật thông minh
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isSubmitting}
                className="h-12 px-4 text-base border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                onFocus={() => setError("")}
              />
            </div>

            <div className="space-y-3">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isSubmitting}
                  className="h-12 px-4 pr-12 text-base border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  onFocus={() => setError("")}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    setRememberMe(checked === true)
                  }
                  disabled={isLoading || isSubmitting}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto"
                onClick={handleForgotPassword}
                disabled={isLoading || isSubmitting}
              >
                Quên mật khẩu?
              </Button>
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

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <User className="mr-2 h-5 w-5" />
                  Đăng nhập
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Tài khoản demo:
            </p>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-center justify-between">
                <span className="font-medium">Admin:</span>
                <span className="font-mono text-xs">admin@school.edu.vn</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Học sinh:</span>
                <span className="font-mono text-xs">
                  tuan.le@student.edu.vn
                </span>
              </div>
              <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                <span className="font-medium">Mật khẩu:</span>
                <span className="font-mono text-xs ml-2">123456</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Chưa có tài khoản?{" "}
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto text-sm"
                onClick={() => (window.location.href = "/register")}
              >
                Đăng ký ngay
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
