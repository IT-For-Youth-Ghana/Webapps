/**
 * Data Table Component
 * Reusable sortable, paginated data table built on shadcn/ui Table
 */

'use client'

import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown } from 'lucide-react'
import type { PaginationInfo } from '@/lib/types'

export interface Column<T> {
    key: string
    header: string
    sortable?: boolean
    className?: string
    render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    pagination?: PaginationInfo | null
    isLoading?: boolean
    searchPlaceholder?: string
    onSearch?: (query: string) => void
    onPageChange?: (page: number) => void
    onSort?: (key: string, direction: 'asc' | 'desc') => void
    emptyMessage?: string
    rowKey?: (item: T) => string
    onRowClick?: (item: T) => void
}

export default function DataTable<T extends Record<string, any>>({
    columns,
    data,
    pagination,
    isLoading = false,
    searchPlaceholder = 'Search...',
    onSearch,
    onPageChange,
    onSort,
    emptyMessage = 'No data found',
    rowKey,
    onRowClick,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        onSearch?.(value)
    }

    const handleSort = (key: string) => {
        const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
        setSortKey(key)
        setSortDirection(newDirection)
        onSort?.(key, newDirection)
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            {onSearch && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className={`font-semibold ${col.className || ''} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && (
                                            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    {columns.map((col) => (
                                        <TableCell key={col.key}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow
                                    key={rowKey ? rowKey(item) : index}
                                    className={onRowClick ? 'cursor-pointer' : ''}
                                    onClick={() => onRowClick?.(item)}
                                >
                                    {columns.map((col) => (
                                        <TableCell key={col.key} className={col.className}>
                                            {col.render ? col.render(item) : item[col.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {((pagination.page - 1) * pagination.limit) + 1}–
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={!pagination.hasPrevPage}
                            onClick={() => onPageChange?.(1)}
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={!pagination.hasPrevPage}
                            onClick={() => onPageChange?.(pagination.page - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="px-3 text-sm font-medium">
                            {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={!pagination.hasNextPage}
                            onClick={() => onPageChange?.(pagination.page + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={!pagination.hasNextPage}
                            onClick={() => onPageChange?.(pagination.totalPages)}
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
