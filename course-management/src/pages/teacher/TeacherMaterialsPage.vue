<template>
  <div class="teacher-materials fade-in">
    <div class="content-wrapper">
      <MaterialsFilters
        v-model:search-query="searchQuery"
        v-model:type-filter="typeFilter"
        v-model:category-filter="categoryFilter"
        v-model:sort-by="sortBy"
      />


      <MaterialActions
        :selected-materials="selectedMaterials"
        @assign-to-course="handleAssignToCourse"
        @download-selected="handleDownloadSelected"
        @move-to-folder="handleMoveToFolder"
        @delete-selected="handleDeleteSelected"
        @create-assignment-template="handleCreateTemplate"
        @batch-convert-pdf="handleBatchConvert"
        @generate-qr-codes="handleGenerateQR"
        @schedule-release="handleScheduleRelease"
        @auto-organize="handleAutoOrganize"
        @create-collection="handleCreateCollection"
        @tag-materials="handleTagMaterials"
      />

      <MaterialsList 
        :materials="filteredMaterials"
        @upload-material="showUploadModal = true"
        @view-material="handleViewMaterial"
        @edit-material="handleEditMaterial"
        @delete-material="handleDeleteMaterial"
        @download-material="handleDownloadMaterial"
        @select-material="handleSelectMaterial"
      />

      <!-- Upload Modal -->
      <UploadModal
        v-if="showUploadModal"
        :courses="courses"
        @close="showUploadModal = false"
        @upload="handleUpload"
      />

      <!-- Material Preview Modal -->
      <MaterialPreview
        v-if="showPreview && selectedPreviewMaterial"
        :material="selectedPreviewMaterial"
        @close="showPreview = false"
        @download="handleDownloadMaterial"
        @edit="handleEditMaterial"
        @delete="handleDeleteMaterial"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import MaterialsFilters from '@/components/teacher/TeacherMaterialPage/MaterialsFilters.vue'
import MaterialActions from '@/components/teacher/TeacherMaterialPage/MaterialActions.vue'
import MaterialsList from '@/components/teacher/TeacherMaterialPage/MaterialsList.vue'
import UploadModal from '@/components/teacher/TeacherMaterialPage/UploadModal.vue'
import MaterialPreview from '@/components/teacher/TeacherMaterialPage/MaterialPreview.vue'

export default {
  name: 'TeacherMaterialsPage',
  components: {
    MaterialsFilters,
    MaterialActions,
    MaterialsList,
    UploadModal,
    MaterialPreview
  },
  setup() {
    // Reactive data
    const searchQuery = ref('')
    const typeFilter = ref('')
    const categoryFilter = ref('')
    const sortBy = ref('recent')
    const showUploadModal = ref(false)
    const showPreview = ref(false)
    const selectedPreviewMaterial = ref(null)
    const selectedMaterials = ref([])
    
    // Mock data
    const materials = ref([
      {
        id: 1,
        name: 'Introduction to Vue.js.pdf',
        type: 'document',
        category: 'lecture',
        size: 2048576,
        updatedAt: '2024-01-15',
        downloads: 45,
        course: 'Web Development Fundamentals'
      },
      {
        id: 2,
        name: 'Component Lifecycle Video.mp4',
        type: 'video',
        category: 'lecture',
        size: 51200000,
        updatedAt: '2024-01-14',
        downloads: 32,
        course: 'Vue.js Advanced'
      },
      {
        id: 3,
        name: 'Assignment 1 - Todo App.docx',
        type: 'document',
        category: 'assignment',
        size: 1024000,
        updatedAt: '2024-01-13',
        downloads: 67,
        course: 'Web Development Fundamentals'
      },
      {
        id: 4,
        name: 'Vue Router Presentation.pptx',
        type: 'presentation',
        category: 'lecture',
        size: 8192000,
        updatedAt: '2024-01-12',
        downloads: 28,
        course: 'Vue.js Advanced'
      }
    ])
    
    const courses = ref([
      { id: 1, name: 'Web Development Fundamentals' },
      { id: 2, name: 'Vue.js Advanced' },
      { id: 3, name: 'Database Design' }
    ])
    
    // Computed properties
    const filteredMaterials = computed(() => {
      let filtered = materials.value
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(material => 
          material.name.toLowerCase().includes(query)
        )
      }
      
      if (typeFilter.value) {
        filtered = filtered.filter(material => material.type === typeFilter.value)
      }
      
      if (categoryFilter.value) {
        filtered = filtered.filter(material => material.category === categoryFilter.value)
      }
      
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'name': return a.name.localeCompare(b.name)
          case 'size': return b.size - a.size
          case 'downloads': return b.downloads - a.downloads
          case 'modified': return new Date(b.updatedAt) - new Date(a.updatedAt)
          default: return new Date(b.updatedAt) - new Date(a.updatedAt)
        }
      })
      
      return filtered
    })
    
    const materialStats = computed(() => ({
      totalMaterials: materials.value.length,
      documents: materials.value.filter(m => m.type === 'document').length,
      videos: materials.value.filter(m => m.type === 'video').length,
      totalSize: materials.value.reduce((sum, m) => sum + m.size, 0)
    }))
    
    // Event handlers
    const handleViewMaterial = (material) => {
      selectedPreviewMaterial.value = material
      showPreview.value = true
    }
    
    const handleEditMaterial = (material) => {
      alert(`Editing ${material.name}`)
    }
    
    const handleDeleteMaterial = (material) => {
      if (confirm(`Delete ${material.name}?`)) {
        const index = materials.value.findIndex(m => m.id === material.id)
        if (index > -1) materials.value.splice(index, 1)
      }
    }
    
    const handleDownloadMaterial = (material) => {
      alert(`Downloading ${material.name}`)
    }
    
    const handleSelectMaterial = (material) => {
      const index = selectedMaterials.value.findIndex(m => m.id === material.id)
      if (index > -1) {
        selectedMaterials.value.splice(index, 1)
      } else {
        selectedMaterials.value.push(material)
      }
    }
    
    const handleUpload = (uploadData) => {
      uploadData.files.forEach(file => {
        const newMaterial = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: getFileType(file.name),
          category: uploadData.category,
          size: file.size,
          updatedAt: new Date().toISOString().split('T')[0],
          downloads: 0,
          course: uploadData.course
        }
        materials.value.unshift(newMaterial)
      })
      alert(`Uploaded ${uploadData.files.length} files successfully!`)
    }
    
    const getFileType = (filename) => {
      const ext = filename.split('.').pop().toLowerCase()
      if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document'
      if (['mp4', 'avi', 'mov'].includes(ext)) return 'video'
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
      if (['mp3', 'wav'].includes(ext)) return 'audio'
      if (['ppt', 'pptx'].includes(ext)) return 'presentation'
      return 'document'
    }
    
    // Teacher productivity handlers
    const handleAssignToCourse = () => alert('Assigning to course...')
    const handleDownloadSelected = () => alert('Creating ZIP download...')
    const handleMoveToFolder = () => alert('Moving to folder...')
    const handleDeleteSelected = () => alert('Deleting selected materials...')
    const handleCreateTemplate = () => alert('Creating assignment template...')
    const handleBatchConvert = () => alert('Converting to PDF...')
    const handleGenerateQR = () => alert('Generating QR codes...')
    const handleScheduleRelease = () => alert('Scheduling release...')
    const handleAutoOrganize = () => alert('Auto-organizing by course...')
    const handleCreateCollection = () => alert('Creating collection...')
    const handleTagMaterials = () => alert('Bulk tagging materials...')
    
    return {
      searchQuery,
      typeFilter,
      categoryFilter,
      sortBy,
      showUploadModal,
      showPreview,
      selectedPreviewMaterial,
      selectedMaterials,
      courses,
      filteredMaterials,
      handleViewMaterial,
      handleEditMaterial,
      handleDeleteMaterial,
      handleDownloadMaterial,
      handleSelectMaterial,
      handleUpload,
      handleAssignToCourse,
      handleDownloadSelected,
      handleMoveToFolder,
      handleDeleteSelected,
      handleCreateTemplate,
      handleBatchConvert,
      handleGenerateQR,
      handleScheduleRelease,
      handleAutoOrganize,
      handleCreateCollection,
      handleTagMaterials
    }
  }
}
</script>

<style scoped>
.teacher-materials {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
}
</style>