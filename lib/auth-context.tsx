"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "./types"
import { mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("duty-app-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("duty-app-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - check against mock users
    const foundUser = mockUsers.find((u) => u.email === email)

    if (!foundUser) {
      setIsLoading(false)
      return { success: false, error: "Email không tồn tại trong hệ thống" }
    }

    // Simple password check (in real app, this would be hashed)
    if (password !== "123456") {
      setIsLoading(false)
      return { success: false, error: "Mật khẩu không chính xác" }
    }

    setUser(foundUser)
    localStorage.setItem("duty-app-user", JSON.stringify(foundUser))
    setIsLoading(false)

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("duty-app-user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
