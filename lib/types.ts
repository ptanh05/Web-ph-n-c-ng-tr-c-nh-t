export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "student"
  class?: string
  phone?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface DutySchedule {
  id: string
  userId: string
  user: User
  date: Date
  shift: "morning" | "afternoon" | "evening"
  location: string
  task: string
  status: "scheduled" | "completed" | "missed" | "excused"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "reminder" | "assignment" | "change" | "alert"
  isRead: boolean
  createdAt: Date
}

export interface DutyStats {
  totalScheduled: number
  completed: number
  missed: number
  excused: number
  completionRate: number
}
