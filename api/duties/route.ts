import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const dutySchema = z.object({
  userId: z.string().min(1, 'User ID không được để trống'),
  date: z.string().datetime('Ngày không hợp lệ'),
  shift: z.enum(['morning', 'afternoon', 'evening'], {
    errorMap: () => ({ message: 'Ca trực phải là morning, afternoon hoặc evening' })
  }),
  location: z.string().min(1, 'Địa điểm không được để trống'),
  task: z.string().min(1, 'Nhiệm vụ không được để trống'),
  status: z.enum(['scheduled', 'completed', 'missed', 'excused'], {
    errorMap: () => ({ message: 'Trạng thái không hợp lệ' })
  }).default('scheduled'),
  notes: z.string().optional(),
})

const updateDutySchema = dutySchema.partial().extend({
  id: z.string().min(1, 'ID không được để trống'),
})

// Mock database
let duties = [
  {
    id: '1',
    userId: '2',
    user: {
      id: '2',
      name: 'Tuan Le',
      email: 'tuan.le@student.edu.vn',
      role: 'student',
      class: '12A1',
    },
    date: new Date('2024-01-15T07:00:00Z'),
    shift: 'morning',
    location: 'Sân trường',
    task: 'Quét sân trường',
    status: 'completed',
    notes: 'Hoàn thành tốt',
    createdAt: new Date('2024-01-10T00:00:00Z'),
    updatedAt: new Date('2024-01-15T07:00:00Z'),
  },
  {
    id: '2',
    userId: '2',
    user: {
      id: '2',
      name: 'Tuan Le',
      email: 'tuan.le@student.edu.vn',
      role: 'student',
      class: '12A1',
    },
    date: new Date('2024-01-20T07:00:00Z'),
    shift: 'afternoon',
    location: 'Lớp học 12A1',
    task: 'Lau bảng, dọn lớp',
    status: 'scheduled',
    notes: undefined,
    createdAt: new Date('2024-01-10T00:00:00Z'),
    updatedAt: new Date('2024-01-10T00:00:00Z'),
  },
]

// GET - Lấy danh sách lịch trực
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const shift = searchParams.get('shift')

    let filteredDuties = [...duties]

    // Filter by userId
    if (userId) {
      filteredDuties = filteredDuties.filter(d => d.userId === userId)
    }

    // Filter by status
    if (status) {
      filteredDuties = filteredDuties.filter(d => d.status === status)
    }

    // Filter by date
    if (date) {
      const filterDate = new Date(date)
      filteredDuties = filteredDuties.filter(d => {
        const dutyDate = new Date(d.date)
        return dutyDate.toDateString() === filterDate.toDateString()
      })
    }

    // Filter by shift
    if (shift) {
      filteredDuties = filteredDuties.filter(d => d.shift === shift)
    }

    // Sort by date (newest first)
    filteredDuties.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      success: true,
      duties: filteredDuties,
      total: filteredDuties.length,
      filters: { userId, status, date, shift }
    })

  } catch (error) {
    console.error('Get duties error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi lấy danh sách lịch trực' 
      },
      { status: 500 }
    )
  }
}

// POST - Tạo lịch trực mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = dutySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dữ liệu không hợp lệ',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const dutyData = validationResult.data

    // Create new duty
    const newDuty = {
      id: Date.now().toString(),
      ...dutyData,
      date: new Date(dutyData.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to database
    duties.push(newDuty)

    return NextResponse.json({
      success: true,
      duty: newDuty,
      message: 'Tạo lịch trực thành công'
    }, { status: 201 })

  } catch (error) {
    console.error('Create duty error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi tạo lịch trực' 
      },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật lịch trực
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = updateDutySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dữ liệu không hợp lệ',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { id, ...updateData } = validationResult.data

    // Find duty to update
    const dutyIndex = duties.findIndex(d => d.id === id)
    if (dutyIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy lịch trực' 
        },
        { status: 404 }
      )
    }

    // Update duty
    const updatedDuty = {
      ...duties[dutyIndex],
      ...updateData,
      date: updateData.date ? new Date(updateData.date) : duties[dutyIndex].date,
      updatedAt: new Date(),
    }

    duties[dutyIndex] = updatedDuty

    return NextResponse.json({
      success: true,
      duty: updatedDuty,
      message: 'Cập nhật lịch trực thành công'
    })

  } catch (error) {
    console.error('Update duty error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi cập nhật lịch trực' 
      },
      { status: 500 }
    )
  }
}

// DELETE - Xóa lịch trực
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID không được để trống' 
        },
        { status: 400 }
      )
    }

    // Find duty to delete
    const dutyIndex = duties.findIndex(d => d.id === id)
    if (dutyIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy lịch trực' 
        },
        { status: 404 }
      )
    }

    // Remove duty
    const deletedDuty = duties.splice(dutyIndex, 1)[0]

    return NextResponse.json({
      success: true,
      duty: deletedDuty,
      message: 'Xóa lịch trực thành công'
    })

  } catch (error) {
    console.error('Delete duty error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi xóa lịch trực' 
      },
      { status: 500 }
    )
  }
}
