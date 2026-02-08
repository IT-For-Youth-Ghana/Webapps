/**
 * Realtime Socket Client
 * Singleton socket.io client for the portal frontend
 */

'use client'

import { io, Socket } from 'socket.io-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || API_BASE_URL.replace(/\/api\/?$/, '')

let socket: Socket | null = null

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem('accessToken')

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token: token || undefined,
      },
    })
  } else {
    socket.auth = { token: token || undefined }
    if (!socket.connected) {
      socket.connect()
    }
  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
