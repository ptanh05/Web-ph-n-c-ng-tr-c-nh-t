import type { DutySchedule, DutyStats } from "./types"

export function calculateDutyStats(schedules: DutySchedule[]): DutyStats {
  const totalScheduled = schedules.length
  const completed = schedules.filter((s) => s.status === "completed").length
  const missed = schedules.filter((s) => s.status === "missed").length
  const excused = schedules.filter((s) => s.status === "excused").length
  const completionRate = totalScheduled > 0 ? (completed / totalScheduled) * 100 : 0

  return {
    totalScheduled,
    completed,
    missed,
    excused,
    completionRate: Math.round(completionRate * 100) / 100,
  }
}

export function getUpcomingDuties(schedules: DutySchedule[], days = 7): DutySchedule[] {
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  return schedules
    .filter((schedule) => schedule.date >= now && schedule.date <= futureDate && schedule.status === "scheduled")
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function formatShift(shift: string): string {
  const shifts = {
    morning: "Sáng",
    afternoon: "Chiều",
    evening: "Tối",
  }
  return shifts[shift as keyof typeof shifts] || shift
}

export function formatStatus(status: string): string {
  const statuses = {
    scheduled: "Đã lên lịch",
    completed: "Hoàn thành",
    missed: "Vắng mặt",
    excused: "Có phép",
  }
  return statuses[status as keyof typeof statuses] || status
}
