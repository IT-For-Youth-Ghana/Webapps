'use client'

import PageHeader from '@/components/shared/page-header'
import EmptyState from '@/components/shared/empty-state'
import { Users } from 'lucide-react'

export default function TeacherStudentsPage() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <PageHeader
                title="My Students"
                description="Manage and track your students' progress"
            />

            <EmptyState
                icon={Users}
                title="No students found"
                description="You don't have any students enrolled in your courses yet."
            />
        </div>
    )
}
