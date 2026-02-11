/**
 * My Courses Page - Ultra Modern Design
 * /dashboard/courses
 * 
 * Displays all courses the user is enrolled in with progress tracking
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import AntigravityBackground from '@/components/ui/antigravity-background'
import GlassmorphicBackground from '@/components/ui/glassmorphic-background'
import { useAuth } from '@/hooks/auth-context'
import { useMyEnrollments } from '@/hooks'
import {
  BookOpen,
  Sparkles,
  Zap,
  ChevronRight,
  Clock,
  Award,
  Users,
  Star,
  TrendingUp,
} from 'lucide-react'

export default function MyCoursesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { enrollments, isLoading } = useMyEnrollments({ status: 'active' })

  if (!user) {
    return null
  }

  const enrolledCourses = enrollments.filter(
    (e) => e.enrollmentStatus === 'enrolled'
  )

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
      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">

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
                  {enrolledCourses.length} Courses Enrolled
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3 animate-fade-in-up animation-delay-100">
                My Learning Journey
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl animate-fade-in-up animation-delay-200">
                Track your progress and continue learning with your enrolled courses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-300">
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
        ) : enrolledCourses.length === 0 ? (
          /* Empty State */
          <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-300">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Courses Enrolled Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your learning journey by browsing our course catalog
              </p>
              <Button
                size="lg"
                onClick={() => router.push('/dashboard/browse')}
                className="gap-2"
              >
                <Zap className="w-4 h-4" />
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Course Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-300">
            {enrolledCourses.map((enrollment, index) => (
              <Card
                key={enrollment.id}
                className="glass-card hover-lift group cursor-pointer border-white/20 overflow-hidden flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 50}ms` }}
                onClick={() =>
                  router.push(`/dashboard/courses/${enrollment.course?.slug || enrollment.courseId}`)
                }
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary via-primary/80 to-primary/60 overflow-hidden">
                  {enrollment.course?.image ? (
                    <img
                      src={enrollment.course.image}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                      📚
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Category Badge */}
                  {enrollment.course?.category && (
                    <Badge
                      variant="secondary"
                      className="absolute top-4 left-4 glass-button"
                    >
                      {enrollment.course.category}
                    </Badge>
                  )}

                  {/* Rating */}
                  {enrollment.course?.rating && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 glass-button px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold">{enrollment.course.rating}</span>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <CardContent className="p-6 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {enrollment.course?.title || 'Course Title'}
                  </h3>

                  {/* Description */}
                  {enrollment.course?.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                      {enrollment.course.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span className="capitalize font-medium text-foreground">
                          {enrollment.course?.level || 'Unknown'}
                        </span>
                      </div>
                      {enrollment.course?.enrollmentCount && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{enrollment.course.enrollmentCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Progress
                      </span>
                      <span className="font-semibold text-primary">
                        {enrollment.progressPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={enrollment.progressPercentage}
                      className="h-2"
                    />
                  </div>

                  {/* Status and CTA */}
                  <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="capitalize"
                    >
                      {enrollment.enrollmentStatus}
                    </Badge>
                    <Button
                      size="sm"
                      className="group-hover:bg-primary group-hover:scale-105 transition-all"
                      onClick={(e) => {
                        e.stopPropagation()
                        const moonleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'https://lms.itforyouthghana.org'
                        if (enrollment.course?.moodleCourseId) {
                          window.open(`${moonleUrl}/course/view.php?id=${enrollment.course.moodleCourseId}`, '_blank')
                        } else {
                          router.push(`/dashboard/courses/${enrollment.course?.slug || enrollment.courseId}`)
                        }
                      }}
                    >
                      Continue Learning
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}