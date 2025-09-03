import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['admin', 'student'], { 
    errorMap: () => ({ message: 'Vai trò phải là admin hoặc student' }) 
  }),
  class: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => {
  // Nếu là học sinh thì phải có lớp
  if (data.role === 'student' && !data.class) {
    return false
  }
  return true
}, {
  message: 'Học sinh phải có lớp',
  path: ['class']
})

// Mock database (trong thực tế sẽ kết nối database thật)
let users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@school.edu.vn',
    role: 'admin',
    password: '123456',
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
    const validationResult = registerSchema.safeParse(body)
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

    const { name, email, password, role, class: className, phone } = validationResult.data

    // Check if email already exists
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email đã tồn tại trong hệ thống' 
        },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role,
      password, // Trong thực tế sẽ hash password
      class: className,
      phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to database
    users.push(newUser)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Đăng ký thành công'
    }, { status: 201 })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi đăng ký' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint để lấy danh sách users (chỉ admin)
export async function GET(request: NextRequest) {
  try {
    // Trong thực tế sẽ check JWT token và role
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không có quyền truy cập' 
        },
        { status: 401 }
      )
    }

    // Remove password from all users
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)

    return NextResponse.json({
      success: true,
      users: usersWithoutPasswords,
      total: usersWithoutPasswords.length
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi lấy danh sách người dùng' 
      },
      { status: 500 }
    )
  }
}
