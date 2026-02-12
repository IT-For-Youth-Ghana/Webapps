'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/auth-context'
import { Loader2 } from 'lucide-react'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'super_admin') {
                router.push('/dashboard')
            }
        }
    }, [user, isAuthenticated, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated || !user || (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'super_admin')) {
        return null
    }

    return <>{children}</>
}
