import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

// Mock database (trong thực tế sẽ kết nối database thật)
const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@school.edu.vn',
    role: 'admin',
    password: '123456', // Trong thực tế sẽ hash password
    class: undefined,
    phone: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Tuan Le',
    email: 'tuan.le@student.edu.vn',
    role: 'student',
    password: '123456',
    class: '12A1',
    phone: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = loginSchema.safeParse(body)
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

    const { email, password } = validationResult.data

    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email không tồn tại trong hệ thống. Vui lòng đăng ký trước.' 
        },
        { status: 404 }
      )
    }

    // Check password
    if (user.password !== password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Mật khẩu không chính xác' 
        },
        { status: 401 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // In real app, generate JWT token here
    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Đăng nhập thành công'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi đăng nhập' 
      },
      { status: 500 }
    )
  }
}
