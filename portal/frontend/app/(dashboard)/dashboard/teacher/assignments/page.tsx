'use client'

import PageHeader from '@/components/shared/page-header'
import EmptyState from '@/components/shared/empty-state'
import { FileText } from 'lucide-react'

export default function TeacherAssignmentsPage() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <PageHeader
                title="Assignments"
                description="Create and grade assignments for your courses"
            />

            <EmptyState
                icon={FileText}
                title="No assignments created"
                description="Get started by creating your first assignment."
                actionLabel="Create Assignment"
                onAction={() => { }}
            />
        </div>
    )
}
