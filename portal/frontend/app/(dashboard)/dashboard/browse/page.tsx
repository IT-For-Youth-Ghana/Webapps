/**
 * Course Browser Page - Ultra Modern Design
 * /dashboard/browse
 * 
 * Allows users to browse, search, and filter available courses
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import AntigravityBackground from '@/components/ui/antigravity-background'
import GlassmorphicBackground from '@/components/ui/glassmorphic-background'
import { useCourses, useCategories, usePopularCourses } from '@/hooks/use-courses'
import { useAuth } from '@/hooks/auth-context'
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  Grid3x3,
  List,
  X,
} from 'lucide-react'

export default function BrowseCoursesPage() {
  const router = useRouter()
  const { user } = useAuth()

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filters
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Hooks
  const { courses, pagination, isLoading, refetch } = useCourses({
    page,
    limit: 12,
    category: selectedCategory || undefined,
    level: selectedLevel || undefined,
    search: debouncedSearch || undefined,
  })

  const { categories, isLoading: isCategoriesLoading } = useCategories()
  const { courses: popularCourses } = usePopularCourses()

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
    setPage(1)
  }

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level === selectedLevel ? '' : level)
    setPage(1)
  }

  const handleViewCourse = (courseSlug: string) => {
    router.push(`/dashboard/courses/${courseSlug}`)
  }

  const clearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setSelectedCategory('')
    setSelectedLevel('')
    setPage(1)
  }

  // Show popular courses if no search/filters applied
  const displayCourses =
    !debouncedSearch && !selectedCategory && !selectedLevel && popularCourses.length > 0
      ? popularCourses
      : courses

  if (!user) {
    return null
  }

  const levels = ['beginner', 'intermediate', 'advanced']
  const hasActiveFilters = search || selectedCategory || selectedLevel

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Layered Backgrounds */}
      <AntigravityBackground 
        opacity="low"
        ringCount={4}
        particleColor="rgba(1, 82, 190, 0.8)"
        rotationSpeed={0.0003}
        mouseInteraction={true}
        blurAmount={2}
      />
      <GlassmorphicBackground />

      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8 space-y-8 animate-fade-in">
        
        {/* Hero Header */}
        <div className="relative">
          <Card className="glass-card-premium border-white/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
            <CardContent className="p-8 md:p-10 relative">
              <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="success" className="animate-pulse">
                  {pagination?.total || 0} Courses Available
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3 animate-fade-in-up animation-delay-100">
                Discover Your Next Course
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl animate-fade-in-up animation-delay-200">
                Explore our comprehensive catalog of courses designed to elevate your skills and advance your career
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters Section */}
        <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for courses, topics, or instructors..."
                  value={search}
                  onChange={handleSearch}
                  className="w-full h-14 pl-12 pr-12 text-base glass-button border-white/20 focus:border-primary/50"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Filters Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Category Pills */}
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {isCategoriesLoading ? (
                      <Badge variant="outline" className="animate-pulse">Loading...</Badge>
                    ) : (
                      <>
                        <Badge
                          variant={!selectedCategory ? "default" : "outline"}
                          className="cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setSelectedCategory('')}
                        >
                          All
                        </Badge>
                        {categories.slice(0, 6).map((cat) => (
                          <Badge
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            className="cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleCategoryChange(cat)}
                          >
                            {cat}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Level Filter */}
                <div className="lg:w-64">
                  <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Difficulty Level
                  </label>
                  <div className="flex gap-2">
                    {levels.map((level) => (
                      <Badge
                        key={level}
                        variant={selectedLevel === level ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform flex-1 justify-center"
                        onClick={() => handleLevelChange(level)}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters & Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <>
                      <span className="text-sm text-muted-foreground">Active filters:</span>
                      {search && (
                        <Badge variant="secondary" className="gap-1">
                          Search: {search.slice(0, 20)}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
                        </Badge>
                      )}
                      {selectedCategory && (
                        <Badge variant="secondary" className="gap-1">
                          {selectedCategory}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                        </Badge>
                      )}
                      {selectedLevel && (
                        <Badge variant="secondary" className="gap-1">
                          {selectedLevel}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedLevel('')} />
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-7 text-xs"
                      >
                        Clear All
                      </Button>
                    </>
                  )}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        {pagination && (
          <div className="flex items-center justify-between px-2 animate-fade-in-up animation-delay-400">
            <p className="text-sm text-muted-foreground">
              {pagination.total === 0
                ? 'No courses found'
                : `Showing ${(page - 1) * 12 + 1}-${Math.min(page * 12, pagination.total)} of ${pagination.total} courses`}
            </p>
            {!hasActiveFilters && popularCourses.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                Popular Picks
              </Badge>
            )}
          </div>
        )}

        {/* Courses Display */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card border-white/20 overflow-hidden animate-pulse">
                <div className="h-48 bg-gradient-to-br from-muted/50 to-muted/30" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-muted/50 rounded w-3/4" />
                  <div className="h-3 bg-muted/50 rounded w-full" />
                  <div className="h-3 bg-muted/50 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayCourses.length === 0 ? (
          <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-500">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you're looking for
              </p>
              <Button onClick={clearFilters}>
                View All Courses
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-500">
            {displayCourses.map((course, index) => (
              <Card
                key={course.id}
                className="glass-card hover-lift group cursor-pointer border-white/20 overflow-hidden flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${500 + index * 50}ms` }}
                onClick={() => handleViewCourse(course.slug || course.id)}
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary via-primary/80 to-primary/60 overflow-hidden">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                      📚
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Category Badge */}
                  <Badge 
                    variant="secondary" 
                    className="absolute top-4 left-4 glass-button"
                  >
                    {course.category}
                  </Badge>

                  {/* Rating */}
                  {course.rating && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 glass-button px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold">{course.rating}</span>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <CardContent className="p-6 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                    {course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span className="capitalize font-medium text-foreground">
                          {course.level}
                        </span>
                      </div>
                      {course.enrollmentCount && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{course.enrollmentCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-xl font-bold text-foreground">
                        {course.currency} {course.price}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="group-hover:bg-primary group-hover:scale-105 transition-all"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewCourse(course.slug || course.id)
                      }}
                    >
                      View Course
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4 animate-fade-in-up animation-delay-500">
            {displayCourses.map((course, index) => (
              <Card
                key={course.id}
                className="glass-card hover-lift cursor-pointer border-white/20 animate-fade-in-up"
                style={{ animationDelay: `${500 + index * 50}ms` }}
                onClick={() => handleViewCourse(course.slug || course.id)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-primary/60">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                          📚
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{course.category}</Badge>
                            <Badge variant="outline" className="capitalize">
                              {course.level}
                            </Badge>
                            {course.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-semibold">{course.rating}</span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Price</p>
                          <p className="text-2xl font-bold text-foreground">
                            {course.currency} {course.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {course.enrollmentCount && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{course.enrollmentCount.toLocaleString()} students</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewCourse(course.slug || course.id)
                          }}
                        >
                          View Course
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="glass-button"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const pageNum = i + 1
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.pages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          onClick={() => setPage(pageNum)}
                          className={pageNum === page ? '' : 'glass-button'}
                          size="sm"
                        >
                          {pageNum}
                        </Button>
                      )
                    }
                    // Show ellipsis for skipped pages
                    if (pageNum === 2 || pageNum === pagination.pages - 1) {
                      return (
                        <span key={pageNum} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="glass-button"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}