"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Home, User, Settings, Database } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!user) return null;

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Trang chủ",
      description: "Xem tổng quan hệ thống, thống kê và lịch trực sắp tới",
    },
    {
      href: "/calendar",
      icon: Calendar,
      label: "Lịch trực",
      description: "Xem lịch trực theo tháng, chi tiết ca trực và trạng thái",
    },
    {
      href: "/profile",
      icon: User,
      label: "Cá nhân",
      description:
        "Quản lý thông tin cá nhân, lịch sử trực và cài đặt tài khoản",
    },
    ...(user.role === "admin"
      ? [
          {
            href: "/data-management",
            icon: Database,
            label: "Quản lý dữ liệu",
            description:
              "Import/Export dữ liệu từ CSV, JSON, API và nhập liệu thủ công",
          },
        ]
      : []),
    ...(user.role === "admin"
      ? [
          {
            href: "/admin",
            icon: Settings,
            label: "Quản trị",
            description:
              "Quản lý người dùng, phân công lịch trực và cài đặt hệ thống",
          },
        ]
      : []),
  ];

  const currentItem = navItems.find((item) => item.href === pathname);
  const displayItem = hoveredItem
    ? navItems.find((item) => item.href === hoveredItem)
    : currentItem;

  return (
    <div className="bg-white dark:bg-gray-800 border-b">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            const onClick = (e: React.MouseEvent) => {
              // Nếu đang ở trang chủ, phát sự kiện để Home hiển thị section tương ứng
              if (
                pathname === "/" &&
                (item.href === "/calendar" || item.href === "/data-management")
              ) {
                e.preventDefault();
                const section = item.href === "/calendar" ? "calendar" : "data";
                window.dispatchEvent(
                  new CustomEvent("home:switch-section", {
                    detail: { section },
                  })
                );
                return;
              }
            };

            return (
              <Link key={item.href} href={item.href} onClick={onClick}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="flex items-center gap-2 h-12"
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {displayItem && (
          <div className="py-3 border-t border-gray-100 dark:border-gray-700 mt-2">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <displayItem.icon className="w-4 h-4 text-blue-500" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {displayItem.label}
                </span>
                <span className="ml-2">- {displayItem.description}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
