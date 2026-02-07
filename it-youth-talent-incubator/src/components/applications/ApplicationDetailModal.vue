<script setup>
import { computed } from 'vue'
import { COLORS } from '../../constants/colors.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  application: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'update-status'])

const candidateName = computed(() => {
  const u = props.application?.student?.user
  return u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : 'Candidate'
})

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interviewed', label: 'Interviewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' }
]

const handleBackdrop = (e) => {
  if (e.target === e.currentTarget) emit('close')
}

const handleUpdateStatus = (status) => {
  emit('update-status', { id: props.application._id, status })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="backdrop" @click="handleBackdrop">
        <div class="modal">
          <header class="header">
            <h2>Application Details</h2>
            <button class="icon-btn" @click="$emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <section class="body">
            <div class="row">
              <div class="col">
                <h3 class="sub">Candidate</h3>
                <p class="primary">{{ candidateName }}</p>
                <p class="muted">{{ application?.student?.user?.email }}</p>
              </div>
              <div class="col">
                <h3 class="sub">Position</h3>
                <p class="primary">{{ application?.job?.title || '-' }}</p>
                <p class="muted">Applied: {{ new Date(application?.createdAt).toLocaleDateString() }}</p>
              </div>
            </div>

            <div class="section" v-if="application?.cover_letter">
              <h3 class="sub">Cover Letter</h3>
              <div class="cover-letter">{{ application.cover_letter }}</div>
            </div>

            <div class="section">
              <h3 class="sub">Resume</h3>
              <div class="resume">
                <a v-if="application?.resume_url" :href="application.resume_url" target="_blank" rel="noopener" class="link">View/Download Resume</a>
                <span v-else class="muted">No resume provided</span>
              </div>
            </div>
          </section>

          <footer class="footer">
            <div class="status-group">
              <span class="muted">Status:</span>
              <select class="select" :value="application?.status" @change="handleUpdateStatus($event.target.value)" :disabled="saving">
                <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <button class="btn" @click="$emit('close')" :disabled="saving">Close</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:flex-start;justify-content:center;padding:2rem;overflow:auto;z-index:1000}
.modal{width:100%;max-width:800px;background: v-bind('COLORS.BACKGROUND.PRIMARY');border-radius:14px;display:flex;flex-direction:column}
.header{display:flex;justify-content:space-between;align-items:center;padding:1rem 1.25rem;border-bottom:1px solid v-bind('COLORS.BACKGROUND.BORDER')}
.header h2{margin:0;font-size:1.125rem;color: v-bind('COLORS.TEXT.PRIMARY')}
.icon-btn{background:transparent;border:none;color: v.bind('COLORS.TEXT.MUTED');cursor:pointer;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.icon-btn svg{width:20px;height:20px}
.body{padding:1.25rem;display:flex;flex-direction:column;gap:1rem}
.row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.col{background: v.bind('COLORS.BACKGROUND.CARD');border:1px solid v.bind('COLORS.BACKGROUND.BORDER');border-radius:10px;padding:1rem}
.sub{margin:.25rem 0 .5rem;font-size:.875rem;color: v.bind('COLORS.TEXT.SECONDARY')}
.primary{margin:0 0 .25rem;color: v.bind('COLORS.TEXT.PRIMARY');font-weight:600}
.muted{color: v.bind('COLORS.TEXT.MUTED');font-size:.875rem}
.section{background: v.bind('COLORS.BACKGROUND.CARD');border:1px solid v.bind('COLORS.BACKGROUND.BORDER');border-radius:10px;padding:1rem}
.cover-letter{white-space:pre-wrap;line-height:1.5;color: v.bind('COLORS.TEXT.PRIMARY')}
.resume .link{color: v.bind('COLORS.BRAND.PRIMARY');text-decoration:none}
.footer{display:flex;justify-content:space-between;align-items:center;padding:1rem 1.25rem;border-top:1px solid v.bind('COLORS.BACKGROUND.BORDER')}
.status-group{display:flex;align-items:center;gap:.5rem}
.select{padding:.5rem .75rem;border:1px solid v.bind('COLORS.BACKGROUND.BORDER');border-radius:8px;background: v.bind('COLORS.BACKGROUND.PRIMARY');color: v.bind('COLORS.TEXT.PRIMARY')}
.btn{padding:.6rem 1rem;background: v.bind('COLORS.BRAND.PRIMARY');border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer}
@media(max-width:640px){.row{grid-template-columns:1fr}}
</style>
