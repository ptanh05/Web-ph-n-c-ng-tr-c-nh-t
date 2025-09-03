import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const calendarFilterSchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'Năm phải có 4 chữ số').optional(),
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Tháng phải từ 1-12').optional(),
  userId: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'missed', 'excused']).optional(),
})

// Mock data for calendar
const mockCalendarDuties = [
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
  {
    id: '5',
    userId: '2',
    user: { name: 'Tuan Le', class: '12A1' },
    date: new Date('2024-01-25T07:00:00Z'),
    shift: 'afternoon',
    location: 'Phòng thí nghiệm',
    task: 'Dọn dẹp phòng thí nghiệm',
    status: 'scheduled',
    createdAt: new Date('2024-01-10T00:00:00Z'),
  },
]

// GET - Lấy lịch trực nhật theo tháng
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryParams = {
      year: searchParams.get('year'),
      month: searchParams.get('month'),
      userId: searchParams.get('userId'),
      status: searchParams.get('status'),
    }

    const validationResult = calendarFilterSchema.safeParse(queryParams)
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

    const { year, month, userId, status } = validationResult.data

    // Set default values
    const currentYear = year ? parseInt(year) : new Date().getFullYear()
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1

    let filteredDuties = [...mockCalendarDuties]

    // Filter by userId
    if (userId) {
      filteredDuties = filteredDuties.filter(d => d.userId === userId)
    }

    // Filter by status
    if (status) {
      filteredDuties = filteredDuties.filter(d => d.status === status)
    }

    // Filter by year and month
    filteredDuties = filteredDuties.filter(d => {
      const dutyDate = new Date(d.date)
      return dutyDate.getFullYear() === currentYear && dutyDate.getMonth() + 1 === currentMonth
    })

    // Generate calendar structure
    const calendar = generateCalendarStructure(currentYear, currentMonth, filteredDuties)

    return NextResponse.json({
      success: true,
      calendar: {
        year: currentYear,
        month: currentMonth,
        monthName: new Date(currentYear, currentMonth - 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
        weeks: calendar,
        totalDuties: filteredDuties.length,
        completedDuties: filteredDuties.filter(d => d.status === 'completed').length,
        missedDuties: filteredDuties.filter(d => d.status === 'missed').length,
        scheduledDuties: filteredDuties.filter(d => d.status === 'scheduled').length,
      },
      filters: { year: currentYear, month: currentMonth, userId, status }
    })

  } catch (error) {
    console.error('Get calendar error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi lấy lịch' 
      },
      { status: 500 }
    )
  }
}

// POST - Tạo lịch trực nhật cho tháng
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.year || !body.month || !body.duties) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Thiếu thông tin tạo lịch' 
        },
        { status: 400 }
      )
    }

    const { year, month, duties } = body

    // Validate duties array
    if (!Array.isArray(duties)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Danh sách lịch trực không hợp lệ' 
        },
        { status: 400 }
      )
    }

    // Create duties for the month
    const createdDuties = []
    
    for (const duty of duties) {
      const newDuty = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...duty,
        date: new Date(duty.date),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      // Add to mock database
      mockCalendarDuties.push(newDuty)
      createdDuties.push(newDuty)
    }

    return NextResponse.json({
      success: true,
      message: `Đã tạo ${createdDuties.length} lịch trực cho tháng ${month}/${year}`,
      duties: createdDuties
    }, { status: 201 })

  } catch (error) {
    console.error('Create calendar duties error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi tạo lịch trực' 
      },
      { status: 500 }
    )
  }
}

// Helper function to generate calendar structure
function generateCalendarStructure(year: number, month: number, duties: any[]) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDate = new Date(firstDay)
  
  // Adjust start date to beginning of week (Monday)
  const dayOfWeek = firstDay.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startDate.setDate(startDate.getDate() - daysToSubtract)

  const weeks = []
  let currentWeek = []
  let currentDate = new Date(startDate)

  // Generate 6 weeks (42 days) to cover all possible month layouts
  for (let i = 0; i < 42; i++) {
    const dayData = {
      date: new Date(currentDate),
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      isCurrentMonth: currentDate.getMonth() + 1 === month,
      isToday: isToday(currentDate),
      duties: duties.filter(d => {
        const dutyDate = new Date(d.date)
        return dutyDate.toDateString() === currentDate.toDateString()
      }),
      totalDuties: 0,
      completedDuties: 0,
      missedDuties: 0,
      scheduledDuties: 0,
    }

    // Calculate duty statistics for this day
    dayData.totalDuties = dayData.duties.length
    dayData.completedDuties = dayData.duties.filter(d => d.status === 'completed').length
    dayData.missedDuties = dayData.duties.filter(d => d.status === 'missed').length
    dayData.scheduledDuties = dayData.duties.filter(d => d.status === 'scheduled').length

    currentWeek.push(dayData)

    // Start new week after 7 days
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return weeks
}

// Helper function to check if date is today
function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// GET - Lấy thống kê theo tháng
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.year || !body.month) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Thiếu thông tin năm và tháng' 
        },
        { status: 400 }
      )
    }

    const { year, month, userId } = body

    // Filter duties for the specified month
    const monthDuties = mockCalendarDuties.filter(d => {
      const dutyDate = new Date(d.date)
      const matchesMonth = dutyDate.getFullYear() === parseInt(year) && dutyDate.getMonth() + 1 === parseInt(month)
      
      if (userId) {
        return matchesMonth && d.userId === userId
      }
      
      return matchesMonth
    })

    // Calculate monthly statistics
    const totalDuties = monthDuties.length
    const completedDuties = monthDuties.filter(d => d.status === 'completed').length
    const missedDuties = monthDuties.filter(d => d.status === 'missed').length
    const excusedDuties = monthDuties.filter(d => d.status === 'excused').length
    const scheduledDuties = monthDuties.filter(d => d.status === 'scheduled').length

    const completionRate = totalDuties > 0 ? Math.round((completedDuties / totalDuties) * 100) : 0

    // Statistics by shift
    const shiftStats = {
      morning: monthDuties.filter(d => d.shift === 'morning').length,
      afternoon: monthDuties.filter(d => d.shift === 'afternoon').length,
      evening: monthDuties.filter(d => d.shift === 'evening').length,
    }

    // Statistics by location
    const locationStats = monthDuties.reduce((acc, duty) => {
      acc[duty.location] = (acc[duty.location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      monthlyStats: {
        year: parseInt(year),
        month: parseInt(month),
        monthName: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
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
      }
    })

  } catch (error) {
    console.error('Get monthly stats error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi lấy thống kê tháng' 
      },
      { status: 500 }
    )
  }
}
