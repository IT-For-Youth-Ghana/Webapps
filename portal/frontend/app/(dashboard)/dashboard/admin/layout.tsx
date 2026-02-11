'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/auth-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            if (user.role !== 'admin' && user.role !== 'super_admin') {
                router.push('/dashboard')
            }
        }
    }, [user, isAuthenticated, isLoading, router])

    if (isLoading) {
        return null // Or a loading spinner
    }

    if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return null
    }

    return <>{children}</>
}
