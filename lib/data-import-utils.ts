import type { User, DutySchedule } from "./types"

export interface ImportResult {
  success: boolean
  data?: any[]
  errors?: string[]
  count?: number
}

export class DataImporter {
  // Parse CSV data
  static parseCSV(csvContent: string): ImportResult {
    try {
      const lines = csvContent.trim().split("\n")
      if (lines.length < 2) {
        return { success: false, errors: ["File CSV phải có ít nhất 2 dòng (header + data)"] }
      }

      const headers = lines[0].split(",").map((h) => h.trim())
      const data = lines
        .slice(1)
        .map((line, index) => {
          const values = line.split(",").map((v) => v.trim())
          const row: any = {}

          headers.forEach((header, i) => {
            row[header] = values[i] || ""
          })

          row._lineNumber = index + 2 // +2 because we start from line 2
          return row
        })
        .filter((row) => Object.values(row).some((val) => val !== ""))

      return { success: true, data, count: data.length }
    } catch (error) {
      return { success: false, errors: ["Lỗi khi phân tích file CSV"] }
    }
  }

  // Validate user data
  static validateUserData(data: any[]): ImportResult {
    const errors: string[] = []
    const validUsers: Partial<User>[] = []

    data.forEach((row, index) => {
      const lineNum = row._lineNumber || index + 1

      if (!row.name || !row.email) {
        errors.push(`Dòng ${lineNum}: Thiếu tên hoặc email`)
        return
      }

      if (!["admin", "teacher", "student"].includes(row.role)) {
        errors.push(`Dòng ${lineNum}: Vai trò không hợp lệ (admin/teacher/student)`)
        return
      }

      validUsers.push({
        id: row.id || `user_${Date.now()}_${index}`,
        name: row.name,
        email: row.email,
        role: row.role as "admin" | "teacher" | "student",
        class: row.class || undefined,
        phone: row.phone || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    return {
      success: errors.length === 0,
      data: validUsers,
      errors: errors.length > 0 ? errors : undefined,
      count: validUsers.length,
    }
  }

  // Validate schedule data
  static validateScheduleData(data: any[], users: User[]): ImportResult {
    const errors: string[] = []
    const validSchedules: Partial<DutySchedule>[] = []

    data.forEach((row, index) => {
      const lineNum = row._lineNumber || index + 1

      if (!row.userId || !row.date || !row.shift || !row.location) {
        errors.push(`Dòng ${lineNum}: Thiếu thông tin bắt buộc`)
        return
      }

      const user = users.find((u) => u.id === row.userId || u.email === row.userId)
      if (!user) {
        errors.push(`Dòng ${lineNum}: Không tìm thấy người dùng`)
        return
      }

      if (!["morning", "afternoon", "evening"].includes(row.shift)) {
        errors.push(`Dòng ${lineNum}: Ca trực không hợp lệ (morning/afternoon/evening)`)
        return
      }

      validSchedules.push({
        id: row.id || `schedule_${Date.now()}_${index}`,
        userId: user.id,
        user: user,
        date: new Date(row.date),
        shift: row.shift as "morning" | "afternoon" | "evening",
        location: row.location,
        task: row.task || "Nhiệm vụ trực nhật",
        status: row.status || "scheduled",
        notes: row.notes || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    return {
      success: errors.length === 0,
      data: validSchedules,
      errors: errors.length > 0 ? errors : undefined,
      count: validSchedules.length,
    }
  }

  // Export data to JSON
  static exportToJSON(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Export data to CSV
  static exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// API integration helpers
export class APIIntegration {
  static async fetchData(url: string, apiKey?: string): Promise<ImportResult> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`
      }

      const response = await fetch(url, { headers })

      if (!response.ok) {
        return {
          success: false,
          errors: [`HTTP Error: ${response.status} ${response.statusText}`],
        }
      }

      const data = await response.json()
      return { success: true, data: Array.isArray(data) ? data : [data] }
    } catch (error) {
      return {
        success: false,
        errors: [`Network Error: ${error instanceof Error ? error.message : "Unknown error"}`],
      }
    }
  }

  static async postData(url: string, data: any, apiKey?: string): Promise<ImportResult> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        return {
          success: false,
          errors: [`HTTP Error: ${response.status} ${response.statusText}`],
        }
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        errors: [`Network Error: ${error instanceof Error ? error.message : "Unknown error"}`],
      }
    }
  }
}
