/**
 * Filters composable for search and filtering functionality
 * Reusable filtering logic for lists and tables
 */
import { ref, computed, readonly } from 'vue'

export function useFilters(data, initialFilters = {}) {
  const filters = ref({
    search: '',
    status: 'all',
    type: 'all',
    location: 'all',
    sortBy: 'newest',
    ...initialFilters
  })

  /**
   * Filter data based on search query
   */
  const searchFilter = computed(() => {
    if (!filters.value.search) return data.value

    const query = filters.value.search.toLowerCase()
    return data.value.filter(item => {
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query)
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(query)
          )
        }
        return false
      })
    })
  })

  /**
   * Apply status filter
   */
  const statusFilter = computed(() => {
    if (filters.value.status === 'all') return searchFilter.value
    return searchFilter.value.filter(item => item.status === filters.value.status)
  })

  /**
   * Apply type filter
   */
  const typeFilter = computed(() => {
    if (filters.value.type === 'all') return statusFilter.value
    return statusFilter.value.filter(item => item.type === filters.value.type)
  })

  /**
   * Apply location filter
   */
  const locationFilter = computed(() => {
    if (filters.value.location === 'all') return typeFilter.value
    return typeFilter.value.filter(item => 
      item.location && item.location.includes(filters.value.location)
    )
  })

  /**
   * Apply sorting
   */
  const sortedData = computed(() => {
    const filtered = [...locationFilter.value]
    
    switch (filters.value.sortBy) {
      case 'newest':
        return filtered.sort((a, b) => 
          new Date(b.createdAt || b.appliedDate || b.postedDate) - 
          new Date(a.createdAt || a.appliedDate || a.postedDate)
        )
      case 'oldest':
        return filtered.sort((a, b) => 
          new Date(a.createdAt || a.appliedDate || a.postedDate) - 
          new Date(b.createdAt || b.appliedDate || b.postedDate)
        )
      case 'name':
        return filtered.sort((a, b) => 
          (a.name || a.title).localeCompare(b.name || b.title)
        )
      case 'deadline':
        return filtered.sort((a, b) => 
          new Date(a.deadline) - new Date(b.deadline)
        )
      case 'salary-high':
        return filtered.sort((a, b) => {
          const salaryA = extractSalaryNumber(a.salary)
          const salaryB = extractSalaryNumber(b.salary)
          return salaryB - salaryA
        })
      case 'salary-low':
        return filtered.sort((a, b) => {
          const salaryA = extractSalaryNumber(a.salary)
          const salaryB = extractSalaryNumber(b.salary)
          return salaryA - salaryB
        })
      default:
        return filtered
    }
  })

  /**
   * Extract numeric value from salary string
   */
  const extractSalaryNumber = (salary) => {
    if (!salary) return 0
    const matches = salary.match(/[\d,]+/)
    return matches ? parseInt(matches[0].replace(/,/g, '')) : 0
  }

  /**
   * Update a specific filter
   */
  const updateFilter = (key, value) => {
    filters.value[key] = value
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    filters.value = {
      search: '',
      status: 'all',
      type: 'all',
      location: 'all',
      sortBy: 'newest',
      ...initialFilters
    }
  }

  /**
   * Get filter summary for display
   */
  const filterSummary = computed(() => {
    const activeFilters = []
    
    if (filters.value.search) {
      activeFilters.push(`Search: "${filters.value.search}"`)
    }
    if (filters.value.status !== 'all') {
      activeFilters.push(`Status: ${filters.value.status}`)
    }
    if (filters.value.type !== 'all') {
      activeFilters.push(`Type: ${filters.value.type}`)
    }
    if (filters.value.location !== 'all') {
      activeFilters.push(`Location: ${filters.value.location}`)
    }
    
    return activeFilters
  })

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    return filters.value.search ||
           filters.value.status !== 'all' ||
           filters.value.type !== 'all' ||
           filters.value.location !== 'all'
  })

  return {
    // State
    filters: readonly(filters),
    
    // Computed
    filteredData: sortedData,
    filterSummary,
    hasActiveFilters,
    
    // Methods
    updateFilter,
    clearFilters
  }
}