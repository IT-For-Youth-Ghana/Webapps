<script setup>
import { ref } from 'vue'

const features = ref([
  {
    title: 'Connect with Opportunities',
    description: 'Access exclusive job openings and internships tailored for young IT professionals in Ghana.'
  },
  {
    title: 'Build Your Profile',
    description: 'Create a comprehensive profile showcasing your skills, experience, and career aspirations.'
  },
  {
    title: 'Apply with Confidence',
    description: 'Submit applications directly through our platform and track your progress in real-time.'
  },
  {
    title: 'Professional Development',
    description: 'Access resources and guidance to accelerate your career growth in the technology sector.'
  }
])

const stats = ref([
  { number: '500+', label: 'Active Students' },
  { number: '100+', label: 'Partner Companies' },
  { number: '300+', label: 'Successful Placements' },
  { number: '95%', label: 'Success Rate' }
])
</script>

<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            Empowering Ghana's
            <span class="text-gradient">IT Future</span>
          </h1>
          <p class="hero-description">
            Connect with leading technology companies and discover career opportunities 
            that match your skills and ambitions. Join Ghana's premier IT talent incubator program.
          </p>
          <div class="hero-actions">
            <button class="btn-primary large">
              Get Started
            </button>
            <button class="btn-secondary large">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2 class="section-title">Why Choose Our Platform?</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Launch Your IT Career?</h2>
          <p class="cta-description">
            Join hundreds of successful graduates who have found their dream jobs through our platform.
          </p>
          <button class="btn-primary large">
            Join Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero-section {
  padding: 6rem 0 4rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.hero-content {
  text-align: center;
  max-width: 48rem;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.text-gradient {
  background: linear-gradient(135deg, #007aff 0%, #0066d6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary.large, .btn-secondary.large {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
}

.btn-primary {
  background: #007aff;
  color: white;
  box-shadow: 0 4px 14px rgba(0, 122, 255, 0.25);
}

.btn-primary:hover {
  background: #0066d6;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.35);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.stats-section {
  padding: 4rem 0;
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
}

.stat-item {
  padding: 1.5rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #007aff;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.features-section {
  padding: 4rem 0;
  background: #f8fafc;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.feature-description {
  color: #6b7280;
  line-height: 1.6;
}

.cta-section {
  padding: 4rem 0;
  background: #1f2937;
  color: white;
}

.cta-content {
  text-align: center;
  max-width: 32rem;
  margin: 0 auto;
}

.cta-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.125rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary.large, .btn-secondary.large {
    width: 100%;
    max-width: 20rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .feature-card {
    padding: 1.5rem;
  }
}
</style>