import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const reportFilterSchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['scheduled', 'completed', 'missed', 'excused']).optional(),
  shift: z.enum(['morning', 'afternoon', 'evening']).optional(),
})

// Mock data for reports
const mockDuties = [
  {
    id: '1',
    userId: '2',
    user: { name: 'Tuan Le', class: '12A1' },
    date: new Date('2024-01-15T07:00:00Z'),
    shift: 'morning',
    location: 'Sân trường',
    task: 'Quét sân trường',
    status: 'completed',
    createdAt: new Date('2024-01-10T00:00:00Z'),
  },
  {
    id: '2',
    userId: '2',
    user: { name: 'Tuan Le', class: '12A1' },
    date: new Date('2024-01-20T07:00:00Z'),
    shift: 'afternoon',
    location: 'Lớp học 12A1',
    task: 'Lau bảng, dọn lớp',
    status: 'scheduled',
    createdAt: new Date('2024-01-10T00:00:00Z'),
  },
  {
    id: '3',
    userId: '2',
    user: { name: 'Tuan Le', class: '12A1' },
    date: new Date('2024-01-18T07:00:00Z'),
    shift: 'evening',
    location: 'Thư viện',
    task: 'Dọn dẹp thư viện',
    status: 'completed',
    createdAt: new Date('2024-01-10T00:00:00Z'),
  },
  {
    id: '4',
    userId: '2',
    user: { name: 'Tuan Le', class: '12A1' },
    date: new Date('2024-01-22T07:00:00Z'),
    shift: 'morning',
    location: 'Căng tin',
    task: 'Dọn dẹp căng tin',
    status: 'missed',
    createdAt: new Date('2024-01-10T00:00:00Z'),
  },
]

// GET - Lấy báo cáo thống kê
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryParams = {
      userId: searchParams.get('userId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      status: searchParams.get('status'),
      shift: searchParams.get('shift'),
    }

    const validationResult = reportFilterSchema.safeParse(queryParams)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tham số không hợp lệ',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { userId, startDate, endDate, status, shift } = validationResult.data

    let filteredDuties = [...mockDuties]

    // Apply filters
    if (userId) {
      filteredDuties = filteredDuties.filter(d => d.userId === userId)
    }

    if (startDate) {
      const start = new Date(startDate)
      filteredDuties = filteredDuties.filter(d => new Date(d.date) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      filteredDuties = filteredDuties.filter(d => new Date(d.date) <= end)
    }

    if (status) {
      filteredDuties = filteredDuties.filter(d => d.status === status)
    }

    if (shift) {
      filteredDuties = filteredDuties.filter(d => d.shift === shift)
    }

    // Calculate statistics
    const totalDuties = filteredDuties.length
    const completedDuties = filteredDuties.filter(d => d.status === 'completed').length
    const missedDuties = filteredDuties.filter(d => d.status === 'missed').length
    const excusedDuties = filteredDuties.filter(d => d.status === 'excused').length
    const scheduledDuties = filteredDuties.filter(d => d.status === 'scheduled').length

    const completionRate = totalDuties > 0 ? Math.round((completedDuties / totalDuties) * 100) : 0

    // Statistics by shift
    const shiftStats = {
      morning: filteredDuties.filter(d => d.shift === 'morning').length,
      afternoon: filteredDuties.filter(d => d.shift === 'afternoon').length,
      evening: filteredDuties.filter(d => d.shift === 'evening').length,
    }

    // Statistics by location
    const locationStats = filteredDuties.reduce((acc, duty) => {
      acc[duty.location] = (acc[duty.location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Monthly statistics (last 6 months)
    const monthlyStats = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
      
      const monthDuties = filteredDuties.filter(d => {
        const dutyDate = new Date(d.date)
        return dutyDate >= monthStart && dutyDate <= monthEnd
      })

      monthlyStats.push({
        month: month.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        total: monthDuties.length,
        completed: monthDuties.filter(d => d.status === 'completed').length,
        missed: monthDuties.filter(d => d.status === 'missed').length,
        excused: monthDuties.filter(d => d.status === 'excused').length,
      })
    }

    // Top performers (users with most completed duties)
    const userStats = filteredDuties.reduce((acc, duty) => {
      if (!acc[duty.userId]) {
        acc[duty.userId] = {
          userId: duty.userId,
          userName: duty.user.name,
          userClass: duty.user.class,
          total: 0,
          completed: 0,
          missed: 0,
          excused: 0,
        }
      }
      
      acc[duty.userId].total++
      if (duty.status === 'completed') acc[duty.userId].completed++
      else if (duty.status === 'missed') acc[duty.userId].missed++
      else if (duty.status === 'excused') acc[duty.userId].excused++
      
      return acc
    }, {} as Record<string, any>)

    const topPerformers = Object.values(userStats)
      .sort((a: any, b: any) => b.completed - a.completed)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      report: {
        summary: {
          totalDuties,
          completedDuties,
          missedDuties,
          excusedDuties,
          scheduledDuties,
          completionRate,
        },
        shiftStats,
        locationStats,
        monthlyStats,
        topPerformers,
        filters: { userId, startDate, endDate, status, shift }
      }
    })

  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi lấy báo cáo' 
      },
      { status: 500 }
    )
  }
}

// POST - Tạo báo cáo tùy chỉnh
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.reportType || !body.filters) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Thiếu thông tin báo cáo' 
        },
        { status: 400 }
      )
    }

    const { reportType, filters } = body

    // Generate custom report based on type
    let customReport = {}
    
    switch (reportType) {
      case 'performance':
        customReport = generatePerformanceReport(filters)
        break
      case 'attendance':
        customReport = generateAttendanceReport(filters)
        break
      case 'location':
        customReport = generateLocationReport(filters)
        break
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Loại báo cáo không hợp lệ' 
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      report: customReport,
      reportType,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Create custom report error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi tạo báo cáo tùy chỉnh' 
      },
      { status: 500 }
    )
  }
}

// Helper functions for custom reports
function generatePerformanceReport(filters: any) {
  // Implementation for performance report
  return {
    title: 'Báo cáo hiệu suất',
    data: mockDuties.filter(d => {
      if (filters.userId && d.userId !== filters.userId) return false
      if (filters.status && d.status !== filters.status) return false
      return true
    }).map(d => ({
      date: d.date,
      user: d.user.name,
      task: d.task,
      status: d.status,
      shift: d.shift,
    }))
  }
}

function generateAttendanceReport(filters: any) {
  // Implementation for attendance report
  return {
    title: 'Báo cáo điểm danh',
    data: mockDuties.filter(d => {
      if (filters.userId && d.userId !== filters.userId) return false
      return true
    }).reduce((acc, duty) => {
      const date = duty.date.toDateString()
      if (!acc[date]) acc[date] = []
      acc[date].push({
        user: duty.user.name,
        status: duty.status,
        shift: duty.shift,
      })
      return acc
    }, {} as Record<string, any[]>)
  }
}

function generateLocationReport(filters: any) {
  // Implementation for location report
  return {
    title: 'Báo cáo theo địa điểm',
    data: mockDuties.filter(d => {
      if (filters.userId && d.userId !== filters.userId) return false
      return true
    }).reduce((acc, duty) => {
      if (!acc[duty.location]) acc[duty.location] = []
      acc[duty.location].push({
        date: duty.date,
        user: duty.user.name,
        task: duty.task,
        status: duty.status,
      })
      return acc
    }, {} as Record<string, any[]>)
  }
}
