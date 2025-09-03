"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "./types";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "student";
  class?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default users and passwords
const defaultUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@school.edu.vn",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Tuan Le",
    email: "tuan.le@student.edu.vn",
    role: "student",
    class: "12A1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultPasswords: Record<string, string> = {
  "admin@school.edu.vn": "123456",
  "tuan.le@student.edu.vn": "123456",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userDatabase, setUserDatabase] = useState<User[]>(defaultUsers);
  const [passwordDatabase, setPasswordDatabase] =
    useState<Record<string, string>>(defaultPasswords);

  useEffect(() => {
    try {
      // Load saved data from localStorage
      const savedUsers = localStorage.getItem("duty-app-users");
      const savedPasswords = localStorage.getItem("duty-app-passwords");

      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        setUserDatabase(users);
      } else {
        // Save default users to localStorage
        localStorage.setItem("duty-app-users", JSON.stringify(defaultUsers));
      }

      if (savedPasswords) {
        const passwords = JSON.parse(savedPasswords);
        setPasswordDatabase(passwords);
      } else {
        // Save default passwords to localStorage
        localStorage.setItem(
          "duty-app-passwords",
          JSON.stringify(defaultPasswords)
        );
      }

      // Check if user is logged in from localStorage
      const savedUser = localStorage.getItem("duty-app-user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
      localStorage.removeItem("duty-app-user");
      localStorage.removeItem("duty-app-users");
      localStorage.removeItem("duty-app-passwords");
      // Reset to defaults
      setUserDatabase(defaultUsers);
      setPasswordDatabase(defaultPasswords);
    }
    setIsLoading(false);
  }, []);

  const register = async (
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if email already exists
      const existingUser = userDatabase.find((u) => u.email === data.email);
      if (existingUser) {
        setIsLoading(false);
        return { success: false, error: "Email đã tồn tại trong hệ thống" };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        class: data.class,
        phone: data.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to database
      const updatedUsers = [...userDatabase, newUser];
      const updatedPasswords = {
        ...passwordDatabase,
        [data.email]: data.password,
      };

      setUserDatabase(updatedUsers);
      setPasswordDatabase(updatedPasswords);

      // Save to localStorage for persistence
      localStorage.setItem("duty-app-users", JSON.stringify(updatedUsers));
      localStorage.setItem(
        "duty-app-passwords",
        JSON.stringify(updatedPasswords)
      );

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Có lỗi xảy ra khi đăng ký" };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user exists in database
      const foundUser = userDatabase.find((u) => u.email === email);

      if (!foundUser) {
        setIsLoading(false);
        return {
          success: false,
          error: "Email không tồn tại trong hệ thống. Vui lòng đăng ký trước.",
        };
      }

      // Check password
      const storedPassword = passwordDatabase[email];
      if (password !== storedPassword) {
        setIsLoading(false);
        return { success: false, error: "Mật khẩu không chính xác" };
      }

      setUser(foundUser);
      localStorage.setItem("duty-app-user", JSON.stringify(foundUser));
      setIsLoading(false);

      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Có lỗi xảy ra khi đăng nhập" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("duty-app-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
