import { NextRequest, NextResponse } from 'next/server'

// Mock JWT verification (trong thực tế sẽ sử dụng thư viện JWT thật)
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    // Mock token format: mock-jwt-token-{userId}-{timestamp}
    if (token.startsWith('mock-jwt-token-')) {
      const parts = token.split('-')
      if (parts.length >= 4) {
        const userId = parts[3]
        // Mock role based on userId (trong thực tế sẽ lấy từ database)
        const role = userId === '1' ? 'admin' : 'student'
        return { userId, role }
      }
    }
    return null
  } catch (error) {
    return null
  }
}

// Middleware để xác thực API requests
export function authenticateRequest(request: NextRequest): { userId: string; role: string } | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  return verifyToken(token)
}

// Middleware để kiểm tra quyền admin
export function requireAdmin(request: NextRequest): { userId: string; role: string } | null {
  const auth = authenticateRequest(request)
  
  if (!auth || auth.role !== 'admin') {
    return null
  }

  return auth
}

// Middleware để kiểm tra quyền truy cập (admin hoặc chính user đó)
export function requireAccess(request: NextRequest, targetUserId?: string): { userId: string; role: string } | null {
  const auth = authenticateRequest(request)
  
  if (!auth) {
    return null
  }

  // Admin có thể truy cập tất cả
  if (auth.role === 'admin') {
    return auth
  }

  // User chỉ có thể truy cập dữ liệu của chính mình
  if (targetUserId && auth.userId === targetUserId) {
    return auth
  }

  return null
}

// Response helper functions
export function unauthorizedResponse(message: string = 'Không có quyền truy cập') {
  return NextResponse.json(
    { 
      success: false, 
      error: message 
    },
    { status: 401 }
  )
}

export function forbiddenResponse(message: string = 'Không có quyền thực hiện hành động này') {
  return NextResponse.json(
    { 
      success: false, 
      error: message 
    },
    { status: 403 }
  )
}

export function validationErrorResponse(details: any[]) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Dữ liệu không hợp lệ',
      details 
    },
    { status: 400 }
  )
}

export function notFoundResponse(message: string = 'Không tìm thấy dữ liệu') {
  return NextResponse.json(
    { 
      success: false, 
      error: message 
    },
    { status: 404 }
  )
}

export function serverErrorResponse(message: string = 'Có lỗi xảy ra') {
  return NextResponse.json(
    { 
      success: false, 
      error: message 
    },
    { status: 500 }
  )
}

// Success response helper
export function successResponse(data: any, message: string = 'Thành công', status: number = 200) {
  return NextResponse.json(
    { 
      success: true,
      data,
      message 
    },
    { status }
  )
}
