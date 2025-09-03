import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Basic system information
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    }

    // Check database connectivity (mock)
    const dbStatus = {
      status: 'healthy',
      responseTime: Math.random() * 100, // Mock response time
      lastCheck: new Date().toISOString(),
    }

    // Check external services (mock)
    const externalServices = {
      email: { status: 'healthy', responseTime: 50 },
      storage: { status: 'healthy', responseTime: 30 },
      notifications: { status: 'healthy', responseTime: 25 },
    }

    const responseTime = Date.now() - startTime

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      system: systemInfo,
      database: dbStatus,
      externalServices,
      checks: {
        database: dbStatus.status === 'healthy',
        externalServices: Object.values(externalServices).every(service => service.status === 'healthy'),
        system: true,
      }
    }

    // Determine overall health status
    const allChecksPassed = Object.values(healthStatus.checks).every(check => check === true)
    const statusCode = allChecksPassed ? 200 : 503

    if (!allChecksPassed) {
      healthStatus.status = 'degraded'
    }

    return NextResponse.json(healthStatus, { status: statusCode })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

// POST endpoint để trigger health check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkType } = body || {}

    let checkResult = {}

    switch (checkType) {
      case 'database':
        checkResult = await performDatabaseHealthCheck()
        break
      case 'external':
        checkResult = await performExternalServicesHealthCheck()
        break
      case 'system':
        checkResult = await performSystemHealthCheck()
        break
      case 'full':
        checkResult = await performFullHealthCheck()
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Loại kiểm tra không hợp lệ',
          validTypes: ['database', 'external', 'system', 'full']
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      checkType,
      timestamp: new Date().toISOString(),
      result: checkResult
    })

  } catch (error) {
    console.error('Custom health check error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions for specific health checks
async function performDatabaseHealthCheck() {
  // Mock database health check
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    status: 'healthy',
    responseTime: '100ms',
    connections: Math.floor(Math.random() * 10) + 5,
    lastQuery: new Date().toISOString(),
  }
}

async function performExternalServicesHealthCheck() {
  // Mock external services health check
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    email: { status: 'healthy', responseTime: '50ms' },
    storage: { status: 'healthy', responseTime: '30ms' },
    notifications: { status: 'healthy', responseTime: '25ms' },
    overall: 'healthy'
  }
}

async function performSystemHealthCheck() {
  // Mock system health check
  await new Promise(resolve => setTimeout(resolve, 50))
  
  return {
    cpu: Math.random() * 30 + 10, // 10-40%
    memory: Math.random() * 20 + 60, // 60-80%
    disk: Math.random() * 15 + 70, // 70-85%
    status: 'healthy'
  }
}

async function performFullHealthCheck() {
  // Perform all health checks
  const [dbCheck, externalCheck, systemCheck] = await Promise.all([
    performDatabaseHealthCheck(),
    performExternalServicesHealthCheck(),
    performSystemHealthCheck()
  ])

  return {
    database: dbCheck,
    externalServices: externalCheck,
    system: systemCheck,
    overall: 'healthy',
    timestamp: new Date().toISOString()
  }
}
