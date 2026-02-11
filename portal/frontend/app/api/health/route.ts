import { NextRequest, NextResponse } from 'next/server'

// Health check endpoint for monitoring
export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      buildTime: process.env.BUILD_TIME,
    }

    // Check external services (optional)
    const services = await checkExternalServices()

    return NextResponse.json({
      ...health,
      services,
    })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      },
      { status: 500 }
    )
  }
}

// Check external services connectivity
async function checkExternalServices() {
  const services = {
    api: { status: 'unknown', responseTime: null },
    moodle: { status: 'unknown', responseTime: null },
  }

  // Check API connectivity
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (apiUrl) {
      const startTime = Date.now()
      const response = await fetch(`${apiUrl}/health`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'ITFY-Portal-Health-Check/1.0',
        },
      })
      const responseTime = Date.now() - startTime

      services.api = {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
      }
    }
  } catch (error) {
    services.api = {
      status: 'unhealthy',
      responseTime: null,
    }
  }

  // Check Moodle connectivity
  try {
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL
    if (moodleUrl) {
      const startTime = Date.now()
      const response = await fetch(moodleUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'ITFY-Portal-Health-Check/1.0',
        },
      })
      const responseTime = Date.now() - startTime

      services.moodle = {
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
      }
    }
  } catch (error) {
    services.moodle = {
      status: 'unhealthy',
      responseTime: null,
    }
  }

  return services
}

// Detailed health check endpoint
export async function POST(request: NextRequest) {
  try {
    const { detailed = false } = await request.json()

    if (!detailed) {
      return GET(request)
    }

    // Detailed health check with system information
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      buildTime: process.env.BUILD_TIME,
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    }

    // Check external services with more detail
    const services = await checkExternalServicesDetailed()

    return NextResponse.json({
      ...health,
      services,
    })
  } catch (error) {
    console.error('Detailed health check failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      },
      { status: 500 }
    )
  }
}

// Detailed external services check
async function checkExternalServicesDetailed() {
  const services = {
    api: {
      status: 'unknown',
      responseTime: null,
      endpoints: {},
    },
    moodle: {
      status: 'unknown',
      responseTime: null,
      endpoints: {},
    },
  }

  // Detailed API check
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (apiUrl) {
      const startTime = Date.now()

      // Check main health endpoint
      const healthResponse = await fetch(`${apiUrl}/health`, {
        timeout: 5000,
      })

      // Check detailed health endpoint
      const detailedResponse = await fetch(`${apiUrl}/health/detailed`, {
        timeout: 5000,
      })

      const responseTime = Date.now() - startTime

      services.api = {
        status: healthResponse.ok && detailedResponse.ok ? 'healthy' : 'degraded',
        responseTime,
        endpoints: {
          health: healthResponse.ok,
          detailed: detailedResponse.ok,
        },
      }
    }
  } catch (error) {
    services.api = {
      status: 'unhealthy',
      responseTime: null,
      endpoints: {},
    }
  }

  // Detailed Moodle check
  try {
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL
    if (moodleUrl) {
      const startTime = Date.now()
      const response = await fetch(moodleUrl, {
        timeout: 5000,
      })
      const responseTime = Date.now() - startTime

      services.moodle = {
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
        endpoints: {
          main: response.ok,
        },
      }
    }
  } catch (error) {
    services.moodle = {
      status: 'unhealthy',
      responseTime: null,
      endpoints: {},
    }
  }

  return services
}