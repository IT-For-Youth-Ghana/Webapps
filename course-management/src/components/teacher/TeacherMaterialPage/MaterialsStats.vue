<template>
  <div class="materials-stats">
    <div class="stat-card">
      <div class="stat-icon total">
        <!-- File Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.totalMaterials }}</div>
        <div class="stat-label">Total Materials</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon documents">
        <!-- Document Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.documents }}</div>
        <div class="stat-label">Documents</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon videos">
        <!-- Video Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.videos }}</div>
        <div class="stat-label">Videos</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon storage">
        <!-- Storage Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ formatStorage(stats.totalSize) }}</div>
        <div class="stat-label">Storage Used</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialsStats',
  props: {
    stats: {
      type: Object,
      default: () => ({
        totalMaterials: 0,
        documents: 0,
        videos: 0,
        totalSize: 0
      })
    }
  },
  methods: {
    formatStorage(bytes) {
      if (bytes === 0) return '0 MB'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.materials-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
}

.stat-icon.total {
  background: var(--primary);
}

.stat-icon.documents {
  background: var(--status-success-text);
}

.stat-icon.videos {
  background: var(--status-warning-text);
}

.stat-icon.storage {
  background: var(--brand-secondary);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>