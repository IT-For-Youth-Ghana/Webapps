<script setup>
import { onMounted, ref, computed } from 'vue'
import { useApplicationsStore } from '../../stores/applications.js'
import ApplicationDetailModal from '../../components/applications/ApplicationDetailModal.vue'
import { COLORS } from '../../constants/colors.js'

const applicationsStore = useApplicationsStore()

const search = ref('')
const status = ref('')
const showDetail = ref(false)
const selected = ref(null)

const loading = computed(() => applicationsStore.loading)
const applications = computed(() => {
  let list = [...applicationsStore.myApplications]
  if (status.value) list = list.filter(a => a.status === status.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(a =>
      a.job?.title?.toLowerCase().includes(q) ||
      `${a.student?.user?.first_name || ''} ${a.student?.user?.last_name || ''}`.toLowerCase().includes(q)
    )
  }
  return list
})

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interviewed', label: 'Interviewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' }
]

onMounted(() => {
  applicationsStore.fetchMyApplications().catch(() => {})
})

const openDetail = (app) => {
  selected.value = app
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  selected.value = null
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'

const withdraw = async (app) => {
  if (!confirm('Withdraw this application?')) return
  await applicationsStore.withdrawApplication(app._id)
}
</script>

<template>
  <div class="page">
    <header class="header">
      <div>
        <h1 class="title">My Applications</h1>
        <p class="subtitle">Track your job applications and statuses</p>
      </div>
      <div class="filters">
        <div class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" placeholder="Search by job or company" />
        </div>
        <select v-model="status" class="select">
          <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
    </header>

    <section class="card">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>Loading applications...</span>
      </div>
      <div v-else-if="applications.length === 0" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
        <h3>No applications yet</h3>
        <p>Start applying to jobs to see them here.</p>
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Company</th>
              <th>Applied</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in applications" :key="app._id">
              <td>{{ app.job?.title || '-' }}</td>
              <td>{{ app.job?.company?.name || '-' }}</td>
              <td>{{ formatDate(app.createdAt) }}</td>
              <td><span class="badge" :data-status="app.status">{{ app.status }}</span></td>
              <td>
                <div class="actions">
                  <button class="btn secondary" @click="openDetail(app)">Details</button>
                  <button class="btn danger" @click="withdraw(app)">Withdraw</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <ApplicationDetailModal :show="showDetail" :application="selected" @close="closeDetail" />
  </div>
</template>

<style scoped>
.page{padding:2rem;max-width:1200px;margin:0 auto}
.header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-end;margin-bottom:1.25rem}
.title{margin:0 0 .25rem;font-size:1.5rem;color: v-bind('COLORS.TEXT.PRIMARY')}
.subtitle{margin:0;color: v.bind('COLORS.TEXT.SECONDARY')}
.filters{display:flex;gap:.5rem;align-items:center}
.search{display:flex;align-items:center;gap:.5rem;background: v.bind('COLORS.BACKGROUND.CARD');border:1px solid v.bind('COLORS.BACKGROUND.BORDER');border-radius:8px;padding:0 .75rem}
.search svg{width:16px;height:16px;color: v.bind('COLORS.TEXT.MUTED')}
.search input{border:none;background:transparent;padding:.6rem 0;min-width:260px;color: v.bind('COLORS.TEXT.PRIMARY')}
.select{padding:.55rem .75rem;border:1px solid v.bind('COLORS.BACKGROUND.BORDER');border-radius:8px;background: v.bind('COLORS.BACKGROUND.PRIMARY');color: v.bind('COLORS.TEXT.PRIMARY')}
.card{background: v.bind('COLORS.BACKGROUND.CARD');border:1px solid v.bind('COLORS.BACKGROUND.BORDER');border-radius:12px;overflow:hidden}
.loading,.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem;color: v.bind('COLORS.TEXT.MUTED')}
.spinner{width:32px;height:32px;border:3px solid v.bind('COLORS.BACKGROUND.BORDER');border-top-color: v.bind('COLORS.BRAND.PRIMARY');border-radius:50%;animation:spin .8s linear infinite;margin-bottom:1rem}
@keyframes spin{to{transform:rotate(360deg)}}
.table-wrap{overflow-x:auto}
 table{width:100%;border-collapse:collapse}
 th,td{padding:1rem 1.25rem;border-bottom:1px solid v.bind('COLORS.BACKGROUND.BORDER');text-align:left}
 th{font-size:.75rem;text-transform:uppercase;color: v.bind('COLORS.TEXT.MUTED');background: v.bind('COLORS.BACKGROUND.PRIMARY')}
 .badge{padding:.25rem .6rem;border-radius:999px;font-size:.75rem;text-transform:capitalize;background: v.bind('COLORS.BACKGROUND.PRIMARY');color: v.bind('COLORS.TEXT.SECONDARY')}
 .badge[data-status="pending"]{background:rgba(214,158,46,.15);color:#d69e2e}
 .badge[data-status="reviewing"]{background:rgba(88,166,255,.15);color:#58a6ff}
 .badge[data-status="shortlisted"]{background:rgba(56,161,105,.15);color:#38a169}
 .badge[data-status="interviewed"]{background:rgba(168,85,247,.15);color:#a855f7}
 .badge[data-status="accepted"]{background:rgba(56,161,105,.15);color:#38a169}
 .badge[data-status="rejected"]{background:rgba(248,113,113,.15);color:#f87171}
 .actions{display:flex;gap:.5rem}
 .btn{padding:.5rem .75rem;border-radius:8px;border:1px solid v.bind('COLORS.BACKGROUND.BORDER');background: v.bind('COLORS.BACKGROUND.PRIMARY');color: v.bind('COLORS.TEXT.PRIMARY');cursor:pointer}
 .btn.secondary:hover{border-color: v.bind('COLORS.BRAND.PRIMARY');color: v.bind('COLORS.BRAND.PRIMARY')}
 .btn.danger{border-color: v.bind('COLORS.STATUS.ERROR');color: v.bind('COLORS.STATUS.ERROR')}
 .btn.danger:hover{background: v.bind('COLORS.STATUS.ERROR');color:#fff}
 @media(max-width:768px){.page{padding:1rem}.search input{min-width:140px}}
</style>
