/**
 * Course Detail Page - Ultra Modern Design
 * /dashboard/courses/[slug]
 * 
 * Shows full course information, enrollment, and now includes interactive course preview
 */

'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AntigravityBackground from '@/components/ui/antigravity-background'
import GlassmorphicBackground from '@/components/ui/glassmorphic-background'
import { useCourse } from '@/hooks/use-courses'
import { useAuth } from '@/hooks/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useMyEnrollments } from '@/hooks/hooks'
import {
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Video,
  FileText,
  Infinity,
  CheckCircle,
  ArrowRight,
  Play,
  MonitorPlay,
  X,
} from 'lucide-react'

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const { toast } = useToast()
  const { course, isLoading, error } = useCourse(slug)
  const { enrollments } = useMyEnrollments()

  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AntigravityBackground 
          opacity="low"
          ringCount={4}
          particleColor="rgba(1, 82, 190, 0.8)"
          rotationSpeed={0.0003}
          mouseInteraction={true}
          blurAmount={2}
        />
        <GlassmorphicBackground />
        <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
          <div className="h-96 bg-muted/50 rounded-xl mb-6" />
          <div className="h-10 bg-muted/50 rounded w-3/4 mb-4" />
          <div className="h-6 bg-muted/50 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AntigravityBackground 
          opacity="low"
          ringCount={4}
          particleColor="rgba(1, 82, 190, 0.8)"
          rotationSpeed={0.0003}
          mouseInteraction={true}
          blurAmount={2}
        />
        <GlassmorphicBackground />
        <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
          <Card className="glass-card border-white/20 animate-fade-in">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Course Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push('/dashboard/browse')}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isEnrolled = !!course && enrollments.some((e) => e.courseId === course.id)

  const handleEnroll = async () => {
    if (!course?.id) {
      toast({
        title: 'Course unavailable',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      })
      return
    }
    router.push(`/dashboard/checkout?courseId=${course.id}`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AntigravityBackground 
        opacity="low"
        ringCount={4}
        particleColor="rgba(1, 82, 190, 0.8)"
        rotationSpeed={0.0003}
        mouseInteraction={true}
        blurAmount={2}
      />
      <GlassmorphicBackground />

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Header */}
            <div className="relative">
              <Card className="glass-card-premium border-white/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
                <div className="relative h-96 overflow-hidden">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-white text-8xl">
                      📚
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <CardContent className="p-8 relative">
                  <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="success" className="animate-pulse">
                      Featured Course
                    </Badge>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3 animate-fade-in-up animation-delay-100">
                    {course.title}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-3xl animate-fade-in-up animation-delay-200">
                    {course.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Course Meta */}
            <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-300">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Level
                    </p>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {course.level}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Enrolled
                    </p>
                    <p className="font-semibold text-foreground mt-1">
                      {course.enrollmentCount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Rating
                    </p>
                    <p className="font-semibold text-foreground mt-1">
                      {course.rating || 'N/A'} / 5
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Duration
                    </p>
                    <p className="font-semibold text-foreground mt-1">
                      {course.duration || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            {course.objectives && course.objectives.length > 0 && (
              <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-400">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    What You'll Learn
                  </h2>
                  <ul className="space-y-3">
                    {course.objectives.map((objective, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Curriculum */}
            {course.modules && course.modules.length > 0 && (
              <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-primary" />
                      Curriculum
                    </h2>
                    <Badge variant="outline" className="gap-1">
                      <MonitorPlay className="w-3 h-3" />
                      Preview available
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {course.modules.map((module, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg group hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-primary font-bold text-lg w-8 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {module.title}
                          </h3>
                          {module.lessons && (
                            <p className="text-sm text-muted-foreground">
                              {module.lessons} lessons
                            </p>
                          )}
                        </div>
                        {idx === 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setIsPreviewOpen(true)}
                          >
                            Preview
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-600">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <ArrowRight className="w-6 h-6 text-primary" />
                    Requirements
                  </h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-4 space-y-4">
            <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-200">
              <CardContent className="p-6 space-y-6">
                {/* Price */}
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Course Price</p>
                  <p className="text-4xl font-bold text-foreground">
                    {course.currency || '$'} {course.price || '0.00'}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full group"
                    onClick={handleEnroll}
                    disabled={isEnrolling || isEnrolled}
                  >
                    {isEnrolling && <span className="mr-2">⏳</span>}
                    {isEnrolled ? '✓ Already Enrolled' : 'Enroll Now'}
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full glass-button group"
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Free Preview
                  </Button>

                  {isEnrolled && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full glass-button"
                      onClick={() => router.push('/dashboard/courses')}
                    >
                      Continue Learning
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>

                {/* Features */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    What's Included
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3">
                      <Video className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        {course.videoCount || '0'} videos
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        {course.resourceCount || '0'} resources
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        Certificate of completion
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Infinity className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        Lifetime access
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Interactive Course Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl p-0 glass-card-premium border-white/30 max-h-[92vh] overflow-hidden">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 rounded-full"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            <DialogHeader className="px-8 pt-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <MonitorPlay className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Course Preview</DialogTitle>
                  <p className="text-muted-foreground">Get a feel for the course before enrolling</p>
                </div>
              </div>
            </DialogHeader>

            <div className="p-8 space-y-8 overflow-auto max-h-[calc(92vh-140px)]">
              {/* Video Trailer */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Play className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Course Trailer</h3>
                </div>
                <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl">
                  {/* Replace with course.previewVideoUrl when available */}
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9wgxcq?autoplay=0"
                    title={`${course.title} Preview`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-2xl"
                  ></iframe>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur rounded-full p-6">
                      <Play className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">Sample trailer • 1:42</p>
              </div>

              {/* Preview Lessons */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Preview Lessons</h3>
                  <Badge variant="secondary">First 2 lessons free</Badge>
                </div>
                <div className="grid gap-3">
                  {course.modules?.slice(0, 2).map((module, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors rounded-xl p-5 group">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Video className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">{module.title}</p>
                          <p className="text-sm text-muted-foreground">12 minutes • Beginner</p>
                        </div>
                      </div>
                      <Button size="sm" className="group-hover:bg-primary group-hover:text-white">
                        Start Preview
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Demo */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Quick Knowledge Check</h3>
                </div>
                <div className="bg-muted/20 rounded-2xl p-6">
                  <p className="mb-4">What is one key benefit of completing this course?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start h-auto py-3 px-4">
                      Improves problem-solving skills
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 px-4">
                      Teaches basic programming
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 px-4">
                      Provides career certification
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 px-4">
                      None of the above
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Try answering — this is just for preview</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}