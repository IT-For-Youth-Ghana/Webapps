<template>
  <div class="regional-section">
    <h2 class="section-title">Regional Overview</h2>
    <div class="regional-grid">
      <div v-for="region in regions" :key="region.country" class="region-card card">
        <div class="region-header">
          <div class="region-flag">{{ region.flag }}</div>
          <div class="region-info">
            <h3>{{ region.country }}</h3>
            <p>{{ region.primaryLanguage }}</p>
          </div>
        </div>
        <div class="region-stats">
          <div class="region-stat">
            <span class="stat-label">Users:</span>
            <span class="stat-value">{{ region.userCount }}</span>
          </div>
          <div class="region-stat">
            <span class="stat-label">Institutions:</span>
            <span class="stat-value">{{ region.institutionCount }}</span>
          </div>
          <div class="region-stat">
            <span class="stat-label">Growth:</span>
            <span class="stat-value positive">+{{ region.growthRate }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegionalOverview',
  props: {
    regions: {
      type: Array,
      default: () => [
        {
          country: 'Ghana',
          flag: '🇬🇭',
          primaryLanguage: 'English, Akan',
          userCount: 8450,
          institutionCount: 45,
          growthRate: 18.2
        },
        {
          country: 'Nigeria',
          flag: '🇳🇬',
          primaryLanguage: 'English',
          userCount: 4320,
          institutionCount: 28,
          growthRate: 22.1
        },
        {
          country: 'Kenya',
          flag: '🇰🇪',
          primaryLanguage: 'English, Swahili',
          userCount: 2150,
          institutionCount: 12,
          growthRate: 15.7
        },
        {
          country: 'Senegal',
          flag: '🇸🇳',
          primaryLanguage: 'French',
          userCount: 500,
          institutionCount: 4,
          growthRate: 8.9
        }
      ]
    }
  }
}
</script>

<style scoped>
.regional-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.regional-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.region-card {
  padding: 1.5rem;
}

.region-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.region-flag {
  font-size: 2rem;
}

.region-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.region-info p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}

.region-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.region-stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.region-stat .stat-label {
  color: var(--text-secondary);
}

.region-stat .stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

.region-stat .stat-value.positive {
  color: #10b981;
}

@media (max-width: 768px) {
  .regional-grid {
    grid-template-columns: 1fr;
  }
}
</style>