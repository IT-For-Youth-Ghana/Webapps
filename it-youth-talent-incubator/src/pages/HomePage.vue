<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs.js'
import { useTheme } from '../composables/useTheme.js'
import JobCardIntegrated from '../components/jobs/JobCardIntegrated.vue'
import JobDetailModal from '../components/jobs/JobDetailModal.vue'
import ThemeToggle from '../components/common/ThemeToggle.vue'

const router = useRouter()

const jobsStore = useJobsStore()
const { isDark } = useTheme()

const featuredJobs = computed(() => jobsStore.featuredJobs)
const isLoading = computed(() => jobsStore.isLoading)

const features = ref([
  {
    title: 'Industry-Relevant Training',
    description:
      'Master practical skills in software development, data science, UI/UX & digital marketing through intensive, hands-on bootcamps.',
    icon: 'code',
  },
  {
    title: 'Expert Mentorship',
    description:
      'Get personalized guidance from industry professionals who help you build both technical excellence and professional confidence.',
    icon: 'users',
  },
  {
    title: 'Real Job Placement',
    description:
      'We partner with leading companies across Ghana and beyond to help our graduates land meaningful, career-launching roles.',
    icon: 'briefcase',
  },
])

const stats = ref([
  { number: '1000+', label: 'Youth Trained' },
  { number: '50+', label: 'Corporate Partners' },
  { number: '85%', label: 'Employment Rate' },
  { number: '10+', label: 'Regions Impacted' },
])

onMounted(async () => {
  await jobsStore.fetchFeaturedJobs()
})

const showJobModal = ref(false)
const selectedJob = ref(null)

const handleJobDetails = (job) => {
  selectedJob.value = job
  showJobModal.value = true
}

const closeJobModal = () => {
  showJobModal.value = false
  setTimeout(() => {
    selectedJob.value = null
  }, 300)
}

const handleJobApply = () => {
  // Navigate to student registration
  router.push('/register/student')
}

const navigateToJobs = () => router.push('/jobs')
</script>

<template>
  <div class="landing-page">
    <nav class="landing-nav">
      <div class="container nav-container">
        <div class="nav-logo">
          <img src="/logo/logo.png" alt="ITFY" class="logo-image" />
          <span>IT Youth</span>
        </div>
        <div class="nav-actions">
          <router-link to="/jobs" class="nav-link">Find Jobs</router-link>
          <div class="nav-divider"></div>
          <ThemeToggle />
          <div class="nav-divider"></div>
          <router-link to="/login" class="nav-link">Log In</router-link>
          <router-link to="/register/student" class="btn btn-primary btn-sm"
            >Get Started</router-link
          >
        </div>
      </div>
    </nav>

    <!-- ================= HERO ================= -->
    <header class="hero">
      <div class="container hero-container">
        <div class="hero-content">
          <div class="hero-eyebrow">Empowering Ghana's Future</div>
          <h1>
            Launch Your Tech Career
            <span class="gradient-text">With Confidence</span>
          </h1>
          <p class="hero-subtitle">
            Real skills • Real mentors • Real opportunities.<br />
            From beginner to hired — we bridge the gap.
          </p>

          <div class="hero-actions">
            <button @click="navigateToJobs" class="btn btn-primary btn-lg">
              Find Your Next Job →
            </button>
            <a href="https://itforyouthghana.org" target="_blank" class="btn btn-outline btn-lg">
              Discover Our Programs
            </a>
          </div>

          <div class="trust-badges">
            <div class="badge">85%+ Employment Rate</div>
            <div class="badge">50+ Top Companies</div>
            <div class="badge">1,000+ Success Stories</div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-illustration">
            <div class="floating-shape shape-1"></div>
            <div class="floating-shape shape-2"></div>
            <div class="floating-shape shape-3"></div>
          </div>
        </div>
      </div>
    </header>

    <!-- ================= MISSION / FEATURES ================= -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2>Why Choose IT For Youth Ghana?</h2>
          <p>We don't just teach technology — we build futures.</p>
        </div>

        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-icon">
              <svg
                v-if="feature.icon === 'code'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                />
              </svg>
              <svg
                v-else-if="feature.icon === 'users'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
              <svg
                v-else-if="feature.icon === 'briefcase'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.111 48.111 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= FEATURED JOBS ================= -->
    <section class="jobs-section">
      <div class="container">
        <div class="section-header flex-between">
          <div>
            <h2>Featured Opportunities</h2>
            <p>Latest roles from companies actively hiring our graduates</p>
          </div>
          <button @click="navigateToJobs" class="btn btn-text">View All Jobs →</button>
        </div>

        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
        </div>

        <div v-else-if="featuredJobs.length === 0" class="empty-state">
          <p>No featured positions right now.<br />Check back soon or browse all opportunities!</p>
          <button @click="navigateToJobs" class="btn btn-primary">Browse All Jobs</button>
        </div>

        <div v-else class="jobs-grid">
          <JobCardIntegrated
            v-for="job in featuredJobs.slice(0, 3)"
            :key="job._id"
            :job="job"
            @view-details="handleJobDetails"
            @apply="handleJobApply"
          />
        </div>
      </div>
    </section>

    <!-- ================= STATS ================= -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= FINAL CTA ================= -->
    <section class="final-cta">
      <div class="container">
        <h2>Ready to Change Your Future?</h2>
        <p>
          Join hundreds of young Ghanaians who have already transformed their lives through tech.
        </p>

        <div class="cta-buttons">
          <button @click="router.push('/register/student')" class="btn btn-white btn-lg">
            Start as a Student
          </button>
          <button @click="router.push('/register/company')" class="btn btn-outline-white btn-lg">
            Partner With Us
          </button>
        </div>
      </div>
    </section>

    <!-- Job Detail Modal -->
    <JobDetailModal
      v-if="showJobModal && selectedJob"
      :job="selectedJob"
      @close="closeJobModal"
      @apply="handleJobApply"
    />
  </div>
</template>

<style scoped>
/* ──────────────────────────────────────────────
   Modern 2025-2026 Design Variables
────────────────────────────────────────────── */
:root {
  --primary: #1b65b2;
  --primary-dark: #195aa5;
  --primary-light: #3d7bc4;
  --secondary: #f59e0b;
  --accent: #8fb2d6;
  --teal: #0d9488;
  --purple: #7c3aed;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-600: #475569;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  --radius-lg: 1.5rem;
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 20, 60, 0.03);
  --shadow-float: 0 20px 40px -4px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.06);
  --shadow-glow: 0 0 40px rgba(27, 101, 178, 0.15);
  --transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.landing-page {
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
  color: #1e293b !important;
  background-color: #f0f4f8;
  line-height: 1.6;
}

/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── NAVIGATION ── */
.landing-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 1.5rem 0;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.9), transparent);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 800;
  font-size: 1.25rem;
  color: white;
}

.logo-image {
  height: 40px;
  width: auto;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
}

.nav-link {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-link:hover {
  color: white;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 2.2rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1rem;
  transition: var(--transition);
  white-space: nowrap;
  letter-spacing: 0.01em;
  cursor: pointer;
}

.btn-lg {
  padding: 1.1rem 2.5rem;
  font-size: 1.125rem;
}

.btn-sm {
  padding: 0.6rem 1.4rem;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(245, 158, 11, 0.5);
}

.btn-outline {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.4);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  border-color: white;
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary);
  padding: 0.5rem 1rem;
  font-weight: 700;
  border-radius: 0.5rem;
}

.btn-text:hover {
  background: rgba(27, 101, 178, 0.08);
  color: var(--primary-dark);
}

.btn-white {
  background: white;
  color: #d97706;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-weight: 700;
}

.btn-white:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.btn-outline-white {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.7);
  color: white;
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
  transform: translateY(-2px);
}

/* ── HERO ── */
.hero {
  padding: 11rem 0 9rem;
  background:
    linear-gradient(
      135deg,
      rgba(27, 101, 178, 0.95) 0%,
      rgba(25, 90, 165, 0.98) 50%,
      rgba(15, 23, 42, 0.95) 100%
    ),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 80%;
  height: 150%;
  background: radial-gradient(ellipse, rgba(245, 158, 11, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 60%;
  height: 80%;
  background: radial-gradient(ellipse, rgba(124, 58, 237, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-eyebrow {
  color: var(--secondary);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  background: rgba(245, 158, 11, 0.2);
  padding: 0.4rem 1rem;
  border-radius: 100px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.hero h1 {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.8rem;
  color: white;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, var(--secondary) 0%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.35rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2.8rem;
  max-width: 90%;
}

.trust-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 2.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.badge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.badge::before {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  background: var(--secondary);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--secondary);
}

/* Floating illustration */
.hero-visual {
  position: relative;
}

.hero-illustration {
  position: relative;
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.15));
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  z-index: 0;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -10%;
  left: -10%;
  background: rgba(143, 178, 214, 0.35);
  animation: float 8s ease-in-out infinite;
}
.shape-2 {
  width: 350px;
  height: 350px;
  bottom: -5%;
  right: -5%;
  background: rgba(245, 158, 11, 0.25);
  animation: float 10s ease-in-out infinite reverse;
}
.shape-3 {
  width: 200px;
  height: 200px;
  top: 40%;
  left: 40%;
  background: rgba(167, 139, 250, 0.25);
  animation: float 12s ease-in-out infinite 1s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(15px, -15px);
  }
}

/* ── FEATURES ── */
.features-section {
  padding: 9rem 0;
  background: linear-gradient(180deg, #f0f4f8 0%, #e8f0f8 100%);
  position: relative;
}

.features-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(27, 101, 178, 0.2), transparent);
}

.section-header {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 5rem;
}

.section-header h2 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.2rem;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.section-header p {
  font-size: 1.25rem;
  color: #475569;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2.5rem;
}

.feature-card {
  padding: 3.5rem 2.5rem;
  border-radius: 2rem;
  background: white;
  border: 1px solid rgba(27, 101, 178, 0.08);
  transition: var(--transition);
  box-shadow: 0 4px 20px rgba(27, 101, 178, 0.06);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(27, 101, 178, 0.15);
  border-color: rgba(27, 101, 178, 0.2);
}

.feature-icon {
  width: 4.5rem;
  height: 4.5rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border-radius: 1.25rem;
  display: grid;
  place-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(27, 101, 178, 0.25);
}

.feature-icon svg {
  width: 2.2rem;
  height: 2.2rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #0f172a;
}

.feature-card p {
  color: #475569;
  line-height: 1.7;
}

/* ── JOBS ── */
.jobs-section {
  padding: 9rem 0;
  background: white;
  position: relative;
}

.jobs-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(27, 101, 178, 0.15), transparent);
}

/* Decorative background text or pattern could go here */

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 4rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2.5rem;
}

/* ── STATS ── */
.stats-section {
  padding: 8rem 0;
  background: linear-gradient(135deg, var(--primary) 0%, rgba(15, 23, 42, 0.98) 100%);
  position: relative;
  overflow: hidden;
}

.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 0h40v40H0V0zm1 1v38h38V1H1z'/%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 3rem;
  position: relative;
  z-index: 1;
}

.stat-card {
  text-align: center;
  padding: 3.5rem 2rem;
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: var(--transition);
}

.stat-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.stat-number {
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fbbf24, var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1rem;
  letter-spacing: -0.03em;
}

.stat-label {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.9rem;
}

/* ── FINAL CTA ── */
.final-cta {
  padding: 10rem 0;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.95) 0%,
    rgba(217, 119, 6, 0.95) 50%,
    rgba(180, 83, 9, 0.98) 100%
  );
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Add texture or shapes to CTA if desired */
.final-cta::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 80%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

.final-cta::after {
  content: '';
  position: absolute;
  bottom: -50%;
  left: -30%;
  width: 80%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(27, 101, 178, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.final-cta h2 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: white;
  letter-spacing: -0.02em;
  position: relative;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.final-cta p {
  font-size: 1.4rem;
  opacity: 0.95;
  max-width: 680px;
  margin: 0 auto 3.5rem;
  line-height: 1.6;
  position: relative;
  color: rgba(255, 255, 255, 0.95);
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
}

/* ── LOADING / EMPTY ── */
.loading,
.empty-state {
  text-align: center;
  padding: 8rem 0;
  color: #475569;
  font-size: 1.1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #1b65b2;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── RESPONSIVE ── */
@media (max-width: 992px) {
  .hero {
    padding: 9rem 0 7rem;
    text-align: center;
  }
  .hero-container {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
  .hero-eyebrow {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }
  .trust-badges {
    justify-content: center;
    border-top: none;
    padding-top: 1rem;
  }
  .hero h1 {
    font-size: 3.2rem;
  }
  .hero-visual {
    display: none;
  }
  .flex-between {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
  .btn {
    width: auto;
  }
}

@media (max-width: 640px) {
  .hero h1 {
    font-size: 2.8rem;
  }
  .hero-subtitle {
    font-size: 1.2rem;
  }
  .btn {
    width: 100%;
  }
  .cta-buttons {
    flex-direction: column;
    gap: 1.2rem;
  }
  .section-header h2 {
    font-size: 2.4rem;
  }
  .stat-number {
    font-size: 3.2rem;
  }
  .final-cta {
    padding: 6rem 0;
  }
  .final-cta h2 {
    font-size: 2.4rem;
  }
}
</style>
