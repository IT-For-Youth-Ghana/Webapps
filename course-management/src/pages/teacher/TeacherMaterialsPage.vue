<template>
  <DashboardLayout>
    <div class="dashboard fade-in">
      <DashboardHeader 
        title="Course Materials"
        subtitle="Upload, organize and manage learning resources"
      >
        <template #actions>
          <button class="btn btn-secondary" @click="showBulkUpload = true">
            Bulk Upload
          </button>
          <button class="btn btn-primary" @click="showUploadModal = true">
            Upload Material
          </button>
        </template>
      </DashboardHeader>

      <MaterialsStats :stats="materialStats" />

      <div class="materials-content">
        <div class="materials-sidebar">
          <MaterialsFilter 
            v-model="activeFilter"
            :filters="materialFilters"
            :counts="filterCounts"
          />
          
          <MaterialsOrganizer 
            v-model="selectedFolder"
            :folders="folders"
            @create-folder="createFolder"
          />
        </div>

        <div class="materials-main">
          <MaterialsToolbar 
            v-model:view="viewMode"
            v-model:search="searchQuery"
            :selected-count="selectedMaterials.length"
            @delete-selected="deleteSelected"
            @download-selected="downloadSelected"
          />

          <MaterialsList 
            :materials="filteredMaterials"
            :view-mode="viewMode"
            :selected="selectedMaterials"
            @select="toggleSelection"
            @edit="editMaterial"
            @delete="deleteMaterial"
            @download="downloadMaterial"
          />
        </div>
      </div>

      <UploadModal 
        v-if="showUploadModal"
        @close="showUploadModal = false"
        @upload="handleUpload"
      />

      <BulkUploadModal 
        v-if="showBulkUpload"
        @close="showBulkUpload = false"
        @upload="handleBulkUpload"
      />
    </div>
  </DashboardLayout>
</template>

<script>
import { ref, computed } from 'vue'
import DashboardLayout from '@shared/ui-components/layouts/DashboardLayout.vue'
import DashboardHeader from '@shared/ui-components/components/DashboardHeader.vue'
import MaterialsStats from '@shared/ui-components/components/MaterialsStats.vue'
import MaterialsFilter from '@shared/ui-components/components/MaterialsFilter.vue'
import MaterialsOrganizer from '@shared/ui-components/components/MaterialsOrganizer.vue'
import MaterialsToolbar from '@shared/ui-components/components/MaterialsToolbar.vue'
import MaterialsList from '@shared/ui-components/components/MaterialsList.vue'
import UploadModal from '@shared/ui-components/components/UploadModal.vue'
import BulkUploadModal from '@shared/ui-components/components/BulkUploadModal.vue'
import { useMaterials } from '@shared/composables/useMaterials.js'

export default {
  name: 'TeacherMaterialsPage',
  components: {
    DashboardLayout,
    DashboardHeader,
    MaterialsStats,
    MaterialsFilter,
    MaterialsOrganizer,
    MaterialsToolbar,
    MaterialsList,
    UploadModal,
    BulkUploadModal
  },
  setup() {
    const showUploadModal = ref(false)
    const showBulkUpload = ref(false)
    
    const {
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
    } = useMaterials()

    return {
      showUploadModal,
      showBulkUpload,
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
}
</script>

<style scoped>
.materials-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: start;
}

.materials-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.materials-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .materials-content {
    grid-template-columns: 1fr;
  }
  
  .materials-sidebar {
    order: 2;
  }
}
</style>