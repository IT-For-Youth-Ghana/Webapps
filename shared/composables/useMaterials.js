import { ref, computed, reactive } from 'vue'

export function useMaterials() {
  const materials = ref([
    {
      id: 1,
      name: 'Introduction to Web Development.pdf',
      type: 'pdf',
      category: 'lecture',
      folder: 'week1',
      size: 2400000,
      uploadDate: '2024-01-15',
      offlineAvailable: true,
      downloads: 45,
      views: 120
    },
    {
      id: 2,
      name: 'HTML Basics Assignment.docx',
      type: 'docx',
      category: 'assignment',
      folder: 'week1',
      size: 150000,
      uploadDate: '2024-01-16',
      offlineAvailable: false,
      downloads: 23,
      views: 67
    },
    {
      id: 3,
      name: 'CSS Fundamentals Video.mp4',
      type: 'mp4',
      category: 'video',
      folder: 'week2',
      size: 45000000,
      uploadDate: '2024-01-20',
      offlineAvailable: true,
      downloads: 78,
      views: 156
    }
  ])

  const materialStats = computed(() => ({
    total: materials.value.length,
    byCategory: {
      lecture: materials.value.filter(m => m.category === 'lecture').length,
      assignment: materials.value.filter(m => m.category === 'assignment').length,
      resource: materials.value.filter(m => m.category === 'resource').length,
      video: materials.value.filter(m => m.category === 'video').length,
      reading: materials.value.filter(m => m.category === 'reading').length
    },
    totalSize: materials.value.reduce((sum, m) => sum + m.size, 0),
    offlineCount: materials.value.filter(m => m.offlineAvailable).length
  }))

  const materialFilters = ref([
    { id: 'all', name: 'All Materials', count: materials.value.length },
    { id: 'lecture', name: 'Lectures', count: materialStats.value.byCategory.lecture },
    { id: 'assignment', name: 'Assignments', count: materialStats.value.byCategory.assignment },
    { id: 'resource', name: 'Resources', count: materialStats.value.byCategory.resource },
    { id: 'video', name: 'Videos', count: materialStats.value.byCategory.video },
    { id: 'reading', name: 'Reading', count: materialStats.value.byCategory.reading }
  ])

  const filterCounts = computed(() => ({
    all: materials.value.length,
    lecture: materialStats.value.byCategory.lecture,
    assignment: materialStats.value.byCategory.assignment,
    resource: materialStats.value.byCategory.resource,
    video: materialStats.value.byCategory.video,
    reading: materialStats.value.byCategory.reading
  }))

  const folders = ref([
    { id: 'root', name: 'Root Folder', parent: null, materials: 0 },
    { id: 'week1', name: 'Week 1', parent: 'root', materials: 2 },
    { id: 'week2', name: 'Week 2', parent: 'root', materials: 1 },
    { id: 'resources', name: 'Resources', parent: 'root', materials: 0 }
  ])

  const activeFilter = ref('all')
  const selectedFolder = ref('')
  const viewMode = ref('grid')
  const searchQuery = ref('')
  const selectedMaterials = ref([])

  const filteredMaterials = computed(() => {
    let filtered = materials.value

    if (activeFilter.value !== 'all') {
      filtered = filtered.filter(m => m.category === activeFilter.value)
    }

    if (selectedFolder.value) {
      filtered = filtered.filter(m => m.folder === selectedFolder.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  const toggleSelection = (material) => {
    const index = selectedMaterials.value.findIndex(m => m.id === material.id)
    if (index > -1) {
      selectedMaterials.value.splice(index, 1)
    } else {
      selectedMaterials.value.push(material)
    }
  }

  const editMaterial = (material) => {
    console.log('Edit material:', material)
  }

  const deleteMaterial = (material) => {
    const index = materials.value.findIndex(m => m.id === material.id)
    if (index > -1) {
      materials.value.splice(index, 1)
    }
  }

  const downloadMaterial = (material) => {
    console.log('Download material:', material)
  }

  const deleteSelected = () => {
    selectedMaterials.value.forEach(material => {
      const index = materials.value.findIndex(m => m.id === material.id)
      if (index > -1) {
        materials.value.splice(index, 1)
      }
    })
    selectedMaterials.value = []
  }

  const downloadSelected = () => {
    console.log('Download selected materials:', selectedMaterials.value)
  }

  const createFolder = (folderData) => {
    const newFolder = {
      id: Date.now().toString(),
      name: folderData.name,
      parent: folderData.parent || 'root',
      materials: 0
    }
    folders.value.push(newFolder)
  }

  const handleUpload = (uploadData) => {
    uploadData.files.forEach(file => {
      const newMaterial = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        category: uploadData.settings.category,
        folder: uploadData.settings.folder || 'root',
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        offlineAvailable: uploadData.settings.makeAvailableOffline,
        downloads: 0,
        views: 0
      }
      materials.value.push(newMaterial)
    })
  }

  const handleBulkUpload = (uploadData) => {
    console.log('Bulk upload:', uploadData)
    handleUpload(uploadData)
  }

  return {
    materials,
    materialStats,
    materialFilters,
    filterCounts,
    folders,
    activeFilter,
    selectedFolder,
    viewMode,
    searchQuery,
    selectedMaterials,
    filteredMaterials,
    toggleSelection,
    editMaterial,
    deleteMaterial,
    downloadMaterial,
    deleteSelected,
    downloadSelected,
    createFolder,
    handleUpload,
    handleBulkUpload
  }
}