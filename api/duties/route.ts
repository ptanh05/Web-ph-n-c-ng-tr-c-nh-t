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

// In-memory store (khởi tạo rỗng, không còn dữ liệu mock)
let duties: any[] = []

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

    // Hỗ trợ tạo 1 bản ghi hoặc hàng loạt
    const items = Array.isArray(body) ? body : [body]

    const created: any[] = []
    const errors: any[] = []

    for (const item of items) {
      const validationResult = dutySchema.safeParse(item)
      if (!validationResult.success) {
        errors.push(validationResult.error.errors)
        continue
      }

      const dutyData = validationResult.data
      const newDuty = {
        id: (Date.now() + Math.floor(Math.random() * 100000)).toString(),
        ...dutyData,
        date: new Date(dutyData.date),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      duties.push(newDuty)
      created.push(newDuty)
    }

    if (created.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dữ liệu không hợp lệ',
          details: errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        duties: created,
        message: Array.isArray(body)
          ? `Tạo ${created.length} lịch trực thành công${errors.length ? `, ${errors.length} bản ghi lỗi` : ''}`
          : 'Tạo lịch trực thành công',
      },
      { status: 201 }
    )

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
