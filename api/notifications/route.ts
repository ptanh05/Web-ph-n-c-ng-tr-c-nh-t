import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const notificationSchema = z.object({
  userId: z.string().min(1, 'User ID không được để trống'),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  message: z.string().min(1, 'Nội dung không được để trống'),
  type: z.enum(['reminder', 'assignment', 'change', 'alert'], {
    errorMap: () => ({ message: 'Loại thông báo không hợp lệ' })
  }),
  isRead: z.boolean().default(false),
})

const updateNotificationSchema = notificationSchema.partial().extend({
  id: z.string().min(1, 'ID không được để trống'),
})

// Mock database
let notifications = [
  {
    id: '1',
    userId: '2',
    title: 'Nhắc nhở trực nhật',
    message: 'Bạn có lịch trực nhật vào ngày mai lúc 7h sáng tại sân trường',
    type: 'reminder',
    isRead: false,
    createdAt: new Date('2024-01-14T08:00:00Z'),
  },
  {
    id: '2',
    userId: '2',
    title: 'Thay đổi lịch trực',
    message: 'Lịch trực nhật ngày 20/01 đã được thay đổi từ sáng sang chiều',
    type: 'change',
    isRead: true,
    createdAt: new Date('2024-01-13T10:00:00Z'),
  },
  {
    id: '3',
    userId: '1',
    title: 'Phân công mới',
    message: 'Bạn được phân công trực nhật lớp 12A1 vào tuần tới',
    type: 'assignment',
    isRead: false,
    createdAt: new Date('2024-01-12T14:00:00Z'),
  },
]

// GET - Lấy danh sách thông báo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const isRead = searchParams.get('isRead')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    let filteredNotifications = [...notifications]

    // Filter by userId
    if (userId) {
      filteredNotifications = filteredNotifications.filter(n => n.userId === userId)
    }

    // Filter by type
    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type)
    }

    // Filter by read status
    if (isRead !== null) {
      const readStatus = isRead === 'true'
      filteredNotifications = filteredNotifications.filter(n => n.isRead === readStatus)
    }

    // Sort by createdAt (newest first)
    filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      page,
      limit,
      totalPages: Math.ceil(filteredNotifications.length / limit),
      filters: { userId, type, isRead }
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi lấy danh sách thông báo' 
      },
      { status: 500 }
    )
  }
}

// POST - Tạo thông báo mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = notificationSchema.safeParse(body)
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

    const notificationData = validationResult.data

    // Create new notification
    const newNotification = {
      id: Date.now().toString(),
      ...notificationData,
      createdAt: new Date(),
    }

    // Add to database
    notifications.push(newNotification)

    return NextResponse.json({
      success: true,
      notification: newNotification,
      message: 'Tạo thông báo thành công'
    }, { status: 201 })

  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi tạo thông báo' 
      },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật thông báo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = updateNotificationSchema.safeParse(body)
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

    // Find notification to update
    const notificationIndex = notifications.findIndex(n => n.id === id)
    if (notificationIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy thông báo' 
        },
        { status: 404 }
      )
    }

    // Update notification
    const updatedNotification = {
      ...notifications[notificationIndex],
      ...updateData,
    }

    notifications[notificationIndex] = updatedNotification

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
      message: 'Cập nhật thông báo thành công'
    })

  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi cập nhật thông báo' 
      },
      { status: 500 }
    )
  }
}

// PATCH - Đánh dấu thông báo đã đọc
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isRead } = body

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID không được để trống' 
        },
        { status: 400 }
      )
    }

    // Find notification to update
    const notificationIndex = notifications.findIndex(n => n.id === id)
    if (notificationIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy thông báo' 
        },
        { status: 404 }
      )
    }

    // Update read status
    notifications[notificationIndex].isRead = isRead

    return NextResponse.json({
      success: true,
      notification: notifications[notificationIndex],
      message: isRead ? 'Đã đánh dấu đã đọc' : 'Đã đánh dấu chưa đọc'
    })

  } catch (error) {
    console.error('Mark notification read error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi cập nhật trạng thái thông báo' 
      },
      { status: 500 }
    )
  }
}

// DELETE - Xóa thông báo
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

    // Find notification to delete
    const notificationIndex = notifications.findIndex(n => n.id === id)
    if (notificationIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy thông báo' 
        },
        { status: 404 }
      )
    }

    // Remove notification
    const deletedNotification = notifications.splice(notificationIndex, 1)[0]

    return NextResponse.json({
      success: true,
      notification: deletedNotification,
      message: 'Xóa thông báo thành công'
    })

  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi xóa thông báo' 
      },
      { status: 500 }
    )
  }
}
