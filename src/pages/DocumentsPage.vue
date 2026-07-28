<template>
  <div class="documents-page" :class="{ visible: mounted }">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Documentos</h1>
        <p class="page-subtitle">{{ filteredDocs.length }} archivos almacenados</p>
      </div>
      <button class="btn-upload" @click="openUploadModal">
        <Upload :size="17" /> Subir documento
      </button>
      <input ref="fileInput" type="file" class="hidden-input" multiple @change="handleFileSelect" />
    </div>

    <!-- ── Búsqueda ────────────────────────────────────────── -->
    <div class="search-box" :class="{ focused: searchFocused }">
      <Search :size="16" class="search-ico" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nombre o paciente..."
        @focus="searchFocused = true"
        @blur="searchFocused = false"
      />
      <Transition name="fade">
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''"><X :size="14" /></button>
      </Transition>
    </div>

    <!-- ── Tabla ───────────────────────────────────────────── -->
    <div class="table-wrapper">
      <table class="docs-table">
        <thead>
          <tr>
            <th class="th-doc">DOCUMENTO</th>
            <th>PACIENTE</th>
            <th>TIPO</th>
            <th>FECHA</th>
            <th>TAMAÑO</th>
            <th class="th-actions"></th>
          </tr>
        </thead>
        <tbody>
          <TransitionGroup name="row">
            <tr
              v-for="(doc, i) in filteredDocs"
              :key="doc.id"
              class="doc-row"
              :style="{ '--delay': `${i * 35}ms` }"
            >
              <!-- Documento -->
              <td class="td td-doc">
                <button class="doc-name-btn" @click="openPdf(doc)">
                  <span class="doc-icon"><FileText :size="16" /></span>
                  <span class="doc-name">{{ doc.fileName }}</span>
                </button>
              </td>

              <!-- Paciente -->
              <td class="td">
                <button class="patient-link" @click="viewPatient(doc)">
                  {{ doc.patientName }}
                </button>
              </td>

              <!-- Tipo -->
              <td class="td">
                <span class="type-badge" :class="typeClass(doc.type)">{{ doc.type }}</span>
              </td>

              <!-- Fecha -->
              <td class="td td-date">{{ formatDate(doc.date) }}</td>

              <!-- Tamaño -->
              <td class="td td-size">{{ doc.size }}</td>

              <!-- Acciones -->
              <td class="td td-actions" @click.stop>
                <div class="row-actions">
                  <button class="action-btn" @click="viewPatient(doc)" title="Ver paciente">
                    <UserRound :size="15" />
                  </button>
                  <button class="action-btn" @click="openPdf(doc)" title="Abrir PDF">
                    <ExternalLink :size="15" />
                  </button>
                  <button class="action-btn" @click="downloadPdf(doc)" title="Descargar">
                    <Download :size="15" />
                  </button>
                  <button class="action-btn danger" @click="askDelete(doc)" title="Eliminar">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>

          <!-- Empty state -->
          <tr v-if="filteredDocs.length === 0">
            <td colspan="6" class="empty-cell">
              <div class="empty-state">
                <FileSearch :size="34" />
                <p class="empty-title">Sin documentos</p>
                <p class="empty-sub">Intenta con otro nombre o paciente.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MODAL: Vista previa de PDF
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="pdfModal.open" class="modal-overlay" @click.self="pdfModal.open = false">
        <Transition name="modal-slide">
          <div v-if="pdfModal.open && pdfModal.doc" class="modal-card pdf-modal">
            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon-box"><FileText :size="18" /></div>
                <div>
                  <h2 class="modal-title">{{ pdfModal.doc.fileName }}</h2>
                  <p class="modal-sub">{{ pdfModal.doc.patientName }} · {{ formatDate(pdfModal.doc.date) }} · {{ pdfModal.doc.size }}</p>
                </div>
              </div>
              <button class="modal-close" @click="pdfModal.open = false"><X :size="18" /></button>
            </div>

            <div class="pdf-preview-body">
              <div class="pdf-mock-page">
                <FileText :size="48" class="pdf-mock-icon" />
                <p class="pdf-mock-text">Vista previa no disponible en este entorno.</p>
                <p class="pdf-mock-sub">Conecta el visor de PDF o el storage de Supabase para mostrar el documento real.</p>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="pdfModal.open = false">Cerrar</button>
              <button class="btn-primary" @click="downloadPdf(pdfModal.doc)">
                <Download :size="15" /> Descargar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════
         MODAL: Subir documento
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="uploadModal.open" class="modal-overlay" @click.self="uploadModal.open = false">
        <Transition name="modal-slide">
          <div v-if="uploadModal.open" class="modal-card">
            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon-box"><Upload :size="18" /></div>
                <div>
                  <h2 class="modal-title">Subir documento</h2>
                  <p class="modal-sub">Asocia el archivo a un paciente</p>
                </div>
              </div>
              <button class="modal-close" @click="uploadModal.open = false"><X :size="18" /></button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="confirmUpload" novalidate>

                <!-- Drop zone -->
                <div class="upload-drop" :class="{ filled: uf.files.length }" @click="fileInput?.click()">
                  <template v-if="uf.files.length === 0">
                    <UploadCloud :size="26" />
                    <p>Arrastra archivos aquí o <span>selecciona</span></p>
                  </template>
                  <template v-else>
                    <div v-for="(f, i) in uf.files" :key="i" class="upload-file-chip">
                      <FileText :size="14" />
                      <span>{{ f.name }}</span>
                      <button type="button" @click.stop="uf.files.splice(i, 1)"><X :size="12" /></button>
                    </div>
                  </template>
                </div>

                <div class="form-grid">
                  <div class="ff full">
                    <label>Paciente *</label>
                    <select v-model="uf.patientName" :class="{ err: ue.patientName }">
                      <option value="" disabled>Selecciona un paciente</option>
                      <option v-for="p in patientList" :key="p" :value="p">{{ p }}</option>
                    </select>
                    <span v-if="ue.patientName" class="ferr">{{ ue.patientName }}</span>
                  </div>
                  <div class="ff full">
                    <label>Tipo de documento *</label>
                    <select v-model="uf.type" :class="{ err: ue.type }">
                      <option value="" disabled>Selecciona el tipo</option>
                      <option v-for="t in docTypes" :key="t" :value="t">{{ t }}</option>
                    </select>
                    <span v-if="ue.type" class="ferr">{{ ue.type }}</span>
                  </div>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn-secondary" @click="uploadModal.open = false">Cancelar</button>
                  <button type="submit" class="btn-primary" :disabled="uploading">
                    <span v-if="uploading" class="spinner-sm" />
                    <Check v-else :size="15" />
                    Subir documento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════
         MODAL: Confirmar eliminación
    ═══════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="deleteModal.open" class="modal-overlay" @click.self="deleteModal.open = false">
        <div class="modal-card delete-modal">
          <div class="delete-icon-wrap"><Trash2 :size="26" /></div>
          <h3 class="delete-title">¿Eliminar documento?</h3>
          <p class="delete-sub">
            Se eliminará <strong>{{ deleteModal.doc?.fileName }}</strong> de forma permanente.
          </p>
          <div class="modal-footer centered">
            <button class="btn-secondary" @click="deleteModal.open = false">Cancelar</button>
            <button class="btn-danger" @click="deleteDoc"><Trash2 :size="14" /> Eliminar</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'
import {
  Upload,
  UploadCloud,
  Search,
  X,
  FileText,
  FileSearch,
  UserRound,
  ExternalLink,
  Download,
  Trash2,
  Check,
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const router = useRouter()

const toast = useToastStore()

/* ─────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────── */
interface PatientOption {
  id: string
  full_name: string
}

interface DocumentRow {
  id: string
  user_id: string
  patient_id: string | null
  meal_plan_id: string | null
  name: string
  type: string
  file_path: string | null
  file_size_kb: number | null
  created_at: string
  patients?: {
    full_name: string | null
  } | null
}

interface Doc {
  id: string
  fileName: string
  patientId: string | null
  patientName: string
  patientInitials: string
  patientColor: string
  type: string
  rawType: string
  date: string
  size: string
  filePath: string | null
}

/* ─────────────────────────────────────────────────────────
   ESTADO
───────────────────────────────────────────────────────── */
const mounted = ref(false)
const loading = ref(false)
const pageError = ref('')

const searchQuery = ref('')
const searchFocused = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const patients = ref<PatientOption[]>([])
const docs = ref<Doc[]>([])


const docTypes = [
  'Plan alimenticio',
  'Archivo subido',
  'Reporte',
  'Otro',
]

const pdfModal = reactive<{
  open: boolean
  doc: Doc | null
}>({
  open: false,
  doc: null,
})

const uploadModal = reactive({
  open: false,
})

const uf = reactive<{
  files: File[]
  patientName: string
  type: string
}>({
  files: [],
  patientName: '',
  type: '',
})

const ue = reactive({
  patientName: '',
  type: '',
})

const deleteModal = reactive<{
  open: boolean
  doc: Doc | null
  deleting: boolean
}>({
  open: false,
  doc: null,
  deleting: false,
})

const patientList = computed(() => {
  return patients.value.map((patient) => patient.full_name)
})

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const AVATAR_COLORS = ['#e74c7d', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#3E9B92']

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function colorFor(value: string | number) {
  const text = String(value)
  const sum = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  return AVATAR_COLORS[sum % AVATAR_COLORS.length] ?? '#3E9B92'
}

function formatFileSize(sizeKb: number | null) {
  if (!sizeKb) return '—'

  if (sizeKb >= 1024) {
    return `${Number((sizeKb / 1024).toFixed(1))} MB`
  }

  return `${Number(sizeKb.toFixed(1))} KB`
}

function documentTypeLabel(type: string) {
  const map: Record<string, string> = {
    meal_plan_pdf: 'Plan alimenticio',
    uploaded_file: 'Archivo subido',
    report: 'Reporte',
    other: 'Otro',
  }

  return map[type] ?? 'Otro'
}

function docTypeToDbType(type: string) {
  const map: Record<string, string> = {
    'Plan alimenticio': 'meal_plan_pdf',
    'Archivo subido': 'uploaded_file',
    'Reporte': 'report',
    'Otro': 'other',
  }

  return map[type] ?? 'other'
}

function typeClass(type: string) {
  const map: Record<string, string> = {
    'Plan alimenticio': 'green',
    'Archivo subido': 'blue',
    'Reporte': 'amber',
    'Otro': 'gray',
  }

  return map[type] ?? 'gray'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function ensureUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/* ─────────────────────────────────────────────────────────
   FILTRADO
───────────────────────────────────────────────────────── */
const filteredDocs = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  if (!q) return docs.value

  return docs.value.filter((doc) =>
    doc.fileName.toLowerCase().includes(q) ||
    doc.patientName.toLowerCase().includes(q) ||
    doc.type.toLowerCase().includes(q),
  )
})

/* ─────────────────────────────────────────────────────────
   CARGA DE DATOS
───────────────────────────────────────────────────────── */
async function loadPatients() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('user_id', user.id)
    .order('full_name', { ascending: true })

  if (error) {
    pageError.value = error.message
    return
  }

  patients.value = data ?? []
}

async function loadDocuments() {
  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  loading.value = true
  pageError.value = ''

  const { data, error } = await supabase
    .from('documents')
    .select(`
      id,
      user_id,
      patient_id,
      meal_plan_id,
      name,
      type,
      file_path,
      file_size_kb,
      created_at,
      patients (
        full_name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  loading.value = false

  if (error) {
    pageError.value = error.message
    return
  }

docs.value = (data ?? []).map((doc: any) => {
  const patientName = Array.isArray(doc.patients)
    ? doc.patients[0]?.full_name ?? 'Sin paciente'
    : doc.patients?.full_name ?? 'Sin paciente'

  return {
    id: doc.id,
    fileName: doc.name,
    patientId: doc.patient_id,
    patientName,
    patientInitials: initials(patientName),
    patientColor: colorFor(doc.patient_id ?? doc.id),
    type: documentTypeLabel(doc.type),
    rawType: doc.type,
    date: doc.created_at,
    size: formatFileSize(Number(doc.file_size_kb ?? 0)),
    filePath: doc.file_path,
  }
})
}

/* ─────────────────────────────────────────────────────────
   ACCIONES: ver paciente / abrir / descargar
───────────────────────────────────────────────────────── */
function viewPatient(doc: Doc) {
  if (!doc.patientId) {
    pageError.value = 'Este documento no tiene paciente asociado.'
    return
  }

  router.push(`/patients/${doc.patientId}`)
}

async function getSignedUrl(doc: Doc) {
  if (!doc.filePath) {
    throw new Error('Este documento no tiene archivo asociado.')
  }

  const { data, error } = await supabase.storage
    .from('nutria-files')
    .createSignedUrl(doc.filePath, 60)

  if (error) throw error

  return data.signedUrl
}

async function openPdf(doc: Doc) {
  pageError.value = ''

  try {
    const signedUrl = await getSignedUrl(doc)
    window.open(signedUrl, '_blank')
  } catch (err) {
    pageError.value =
      err instanceof Error ? err.message : 'No se pudo abrir el documento.'
  }
}

async function downloadPdf(doc: Doc | null) {
  if (!doc) return

  pageError.value = ''

  try {
    const signedUrl = await getSignedUrl(doc)

    const link = document.createElement('a')
    link.href = signedUrl
    link.download = doc.fileName
    link.target = '_blank'
    link.click()
  } catch (err) {
    pageError.value =
      err instanceof Error ? err.message : 'No se pudo descargar el documento.'
  }
}

/* ─────────────────────────────────────────────────────────
   SUBIR DOCUMENTO
───────────────────────────────────────────────────────── */
function openUploadModal() {
  uf.files = []
  uf.patientName = ''
  uf.type = ''
  Object.assign(ue, { patientName: '', type: '' })
  uploadModal.open = true
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files

  if (files) {
    uf.files.push(...Array.from(files))
    uploadModal.open = true
  }

  input.value = ''
}

function validateUpload() {
  let ok = true

  ue.patientName = uf.patientName ? '' : 'Selecciona un paciente.'
  ue.type = uf.type ? '' : 'Selecciona el tipo de documento.'

  if (!uf.files.length) {
    pageError.value = 'Selecciona al menos un archivo.'
    ok = false
  }

  if (ue.patientName || ue.type) ok = false

  return ok
}

async function confirmUpload() {
  if (!validateUpload()) return

  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    return
  }

  const patient = patients.value.find((item) => item.full_name === uf.patientName)

  if (!patient) {
    pageError.value = 'No se encontró el paciente seleccionado.'
    return
  }

  uploading.value = true
  pageError.value = ''

  try {
    const dbType = docTypeToDbType(uf.type)

    for (const file of uf.files) {
      const cleanFileName = file.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9._-]/g, '')

      const fileName = `${Date.now()}-${cleanFileName}`
      const filePath = `${user.id}/documents/${patient.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('nutria-files')
        .upload(filePath, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const fileSizeKb = Number((file.size / 1024).toFixed(2))

      const { error: documentError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          patient_id: patient.id,
          meal_plan_id: null,
          name: file.name,
          type: dbType,
          file_url: null,
          file_path: filePath,
          file_size_kb: fileSizeKb,
        })

      if (documentError) throw documentError
    }

    uploadModal.open = false
    uf.files = []
    uf.patientName = ''
    uf.type = ''

    await loadDocuments()
    toast.success('Documento subido correctamente.')
  } catch (err) {
    pageError.value =
      err instanceof Error ? err.message : 'No se pudo subir el documento.'
      toast.error(pageError.value)
  } finally {
    uploading.value = false
  }
}

/* ─────────────────────────────────────────────────────────
   ELIMINAR
───────────────────────────────────────────────────────── */
function askDelete(doc: Doc) {
  deleteModal.doc = doc
  deleteModal.open = true
}

async function deleteDoc() {
  const doc = deleteModal.doc

  if (!doc) return

  const user = await ensureUser()

  if (!user) {
    pageError.value = 'No hay una sesión activa.'
    toast.error(pageError.value)
    return
  }

  deleteModal.deleting = true
  pageError.value = ''

  try {
    if (doc.filePath) {
      const { error: storageError } = await supabase.storage
        .from('nutria-files')
        .remove([doc.filePath])

      if (storageError) throw storageError
    }

    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', doc.id)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    docs.value = docs.value.filter((item) => item.id !== doc.id)

    deleteModal.open = false
    deleteModal.doc = null

    toast.success('Documento eliminado correctamente.')
  } catch (err) {
    pageError.value =
      err instanceof Error ? err.message : 'No se pudo eliminar el documento.'

    toast.error(pageError.value)
  } finally {
    deleteModal.deleting = false
  }
}

onMounted(async () => {
  await Promise.all([loadPatients(), loadDocuments()])

  setTimeout(() => {
    mounted.value = true
  }, 80)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════
   BASE
══════════════════════════════════════════════════════════ */
.documents-page {
  padding: 2.2rem 2.4rem;
  min-height: 100vh;
  background: #f8fafb;
  font-family: 'Inter','Segoe UI',sans-serif;
  opacity: 0;
  transition: opacity .4s ease;
}
.documents-page.visible { opacity: 1; }

/* ── Header ───────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  animation: fadeDown .5s ease both;
}
.page-title    { font-size: 1.5rem; font-weight: 600; color: #0f1923; letter-spacing: -.5px; }
.page-subtitle { font-size: .9rem; color: #9ca3af; margin-top: 4px; }

.btn-upload {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 20px;
  background: #3E9B92; color: #fff;
  border: none; border-radius: 12px;
  font-size: .9rem; font-weight: 600;
  font-family: inherit; cursor: pointer;
  transition: .2s;
  white-space: nowrap;
}
.btn-upload:hover { background: #358e85; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(62,155,146,.38); }

.hidden-input { display: none; }

/* ── Búsqueda ─────────────────────────────────────────────── */
.search-box {
  display: flex; align-items: center; gap: 10px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 11px 15px;
  max-width: 420px;
  margin-bottom: 1.4rem;
  transition: .2s;
  animation: fadeDown .5s .05s ease both;
}
.search-box.focused { border-color: #3E9B92; box-shadow: 0 0 0 4px rgba(62,155,146,.1); }
.search-ico { color: #9ca3af; flex-shrink: 0; }
.search-box input { flex: 1; border: none; outline: none; font-size: .9rem; color: #0f1923; background: transparent; font-family: inherit; }
.search-box input::placeholder { color: #c0cad5; }
.clear-btn { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; padding: 2px; border-radius: 4px; transition: color .2s; }
.clear-btn:hover { color: #374151; }

/* ── Tabla ────────────────────────────────────────────────── */
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  overflow: hidden;
  box-shadow: 0 1px 12px rgba(0,0,0,.04);
  animation: fadeUp .5s .1s ease both;
}

.docs-table { width: 100%; border-collapse: collapse; }

.docs-table th {
  padding: 13px 16px;
  font-size: .68rem;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: .07em;
  text-align: left;
  border-bottom: 1px solid #f3f3f8;
  background: #fafafe;
  white-space: nowrap;
}
.th-doc { width: 280px; }
.th-actions { width: 130px; }

.doc-row {
  transition: background .15s;
  animation: rowIn .3s ease var(--delay, 0ms) both;
}
.doc-row:hover { background: #f6faf9; }
.doc-row:hover .row-actions { opacity: 1; }

.td {
  padding: 14px 16px;
  font-size: .87rem;
  color: #374151;
  border-bottom: 1px solid #f7f7fb;
  vertical-align: middle;
}
.docs-table tr:last-child td { border-bottom: none; }

/* Documento */
.doc-name-btn {
  display: flex; align-items: center; gap: 11px;
  background: none; border: none; cursor: pointer;
  font-family: inherit; text-align: left; padding: 0;
}
.doc-icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: #eef6f5;
  color: #3E9B92;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.doc-name {
  font-size: .88rem; font-weight: 500; color: #0f1923;
  transition: color .15s;
}
.doc-name-btn:hover .doc-name { color: #3E9B92; }

/* Paciente */
.patient-link {
  display: flex; align-items: center; gap: 9px;
  background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: .86rem; color: #374151;
  padding: 0; transition: color .15s; font-weight: 600;
}
.patient-link:hover { color: #3E9B92; }
.patient-avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .68rem; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

/* Tipo badge */
.type-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: .76rem;
  font-weight: 600;
  white-space: nowrap;
}
.type-badge.green  { background: #d1fae5; color: #065f46; }
.type-badge.blue   { background: #dbeafe; color: #1e40af; }
.type-badge.purple { background: #ede9fe; color: #5b21b6; }
.type-badge.amber  { background: #fef3c7; color: #92400e; }
.type-badge.gray   { background: #f3f4f6; color: #6b7280; }

.td-date, .td-size { color: #6b7280; white-space: nowrap; }

/* Acciones */
.row-actions {
  display: flex; align-items: center; gap: 3px;
  opacity: 0; transition: opacity .2s;
}
.action-btn {
  width: 29px; height: 29px;
  border: none; background: none; cursor: pointer;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af; transition: .15s;
}
.action-btn:hover        { background: #eef6f5; color: #3E9B92; }
.action-btn.danger:hover { background: #fff1f1; color: #ef4444; }

/* Empty */
.empty-cell { padding: 3.5rem !important; text-align: center; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #c0c5d0; }
.empty-title { font-size: .95rem; font-weight: 600; color: #374151; }
.empty-sub   { font-size: .82rem; color: #9ca3af; }

/* ══════════════════════════════════════════════════════════
   MODALES
══════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,25,35,.45);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  width: 100%; max-width: 480px;
  box-shadow: 0 24px 60px rgba(0,0,0,.18);
  overflow: hidden;
}
.pdf-modal { max-width: 560px; }

.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.4rem 1.4rem 1rem;
  border-bottom: 1px solid #f3f3f8;
}
.modal-title-group { display: flex; align-items: center; gap: 12px; min-width: 0; }
.modal-icon-box {
  width: 42px; height: 42px; border-radius: 12px;
  background: #eef6f5; color: #3E9B92;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-title { font-size: 1rem; font-weight: 700; color: #0f1923; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.modal-sub   { font-size: .78rem; color: #9ca3af; margin-top: 2px; }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; padding: 4px; border-radius: 8px; display: flex; transition: .2s; flex-shrink: 0;
}
.modal-close:hover { color: #374151; background: #f3f4f6; }

.modal-body { padding: 1.4rem; }

/* PDF preview body */
.pdf-preview-body { padding: 1.4rem; }
.pdf-mock-page {
  background: #fafafa;
  border: 1.5px dashed #e5e7eb;
  border-radius: 14px;
  padding: 3rem 1.5rem;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  color: #b0b8cc; text-align: center;
}
.pdf-mock-icon { color: #c8cdd6; }
.pdf-mock-text { font-size: .92rem; font-weight: 600; color: #6b7280; }
.pdf-mock-sub  { font-size: .8rem; color: #9ca3af; max-width: 320px; }

/* Upload drop */
.upload-drop {
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  min-height: 110px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px;
  color: #9ca3af; font-size: .85rem;
  cursor: pointer; transition: .2s;
  margin-bottom: 1.2rem;
  padding: 1rem;
}
.upload-drop:hover { border-color: #3E9B92; color: #3E9B92; background: #f6faf9; }
.upload-drop span { color: #3E9B92; font-weight: 600; }
.upload-drop.filled { flex-direction: row; flex-wrap: wrap; }

.upload-file-chip {
  display: flex; align-items: center; gap: 7px;
  background: #eef6f5; color: #1f7068;
  padding: 6px 11px; border-radius: 20px;
  font-size: .8rem; font-weight: 600;
}
.upload-file-chip button { background: none; border: none; cursor: pointer; color: #1f7068; display: flex; }

/* Form */
.form-grid { display: grid; gap: 12px; margin-bottom: .3rem; }
.ff { display: flex; flex-direction: column; gap: 5px; }
.ff.full { grid-column: 1 / -1; }
.ff label { font-size: .78rem; font-weight: 600; color: #374151; }
.ff select {
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb; border-radius: 10px;
  font-size: .88rem; color: #0f1923; background: #f9fafb;
  outline: none; font-family: inherit; transition: .2s;
}
.ff select:focus { border-color: #3E9B92; background: #fff; box-shadow: 0 0 0 4px rgba(62,155,146,.1); }
.ff select.err { border-color: #ef4444; }
.ferr { font-size: .73rem; color: #ef4444; }

/* Footer */
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding-top: 1rem; border-top: 1px solid #f3f3f8;
}
.modal-footer.centered { justify-content: center; }

.btn-secondary {
  padding: 10px 20px;
  border: 1.5px solid #e5e7eb; background: #fff;
  border-radius: 10px; font-size: .88rem; font-weight: 600;
  color: #374151; cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-secondary:hover { border-color: #9ca3af; }

.btn-primary {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: #3E9B92; color: #fff;
  border: none; border-radius: 10px; font-size: .88rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
  box-shadow: 0 3px 10px rgba(62,155,146,.3);
}
.btn-primary:hover:not(:disabled) { background: #358e85; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.btn-danger {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: #ef4444; color: #fff;
  border: none; border-radius: 10px; font-size: .88rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: .2s;
}
.btn-danger:hover { background: #dc2626; }

.spinner-sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .6s linear infinite; display: inline-block;
}

/* Delete modal */
.delete-modal { max-width: 380px; padding: 2rem; text-align: center; }
.delete-icon-wrap {
  width: 58px; height: 58px; border-radius: 50%;
  background: #fff1f1; color: #ef4444;
  display: flex; align-items: center; justify-content: center; margin: 0 auto .9rem;
}
.delete-title { font-size: 1.05rem; font-weight: 700; color: #0f1923; margin-bottom: 8px; }
.delete-sub   { font-size: .84rem; color: #6b7280; line-height: 1.5; margin-bottom: 1.4rem; }

/* ── Animaciones ──────────────────────────────────────────── */
@keyframes fadeDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeUp   { from { opacity:0; transform:translateY(12px);  } to { opacity:1; transform:translateY(0); } }
@keyframes rowIn    { from { opacity:0; transform:translateY(6px);   } to { opacity:1; transform:translateY(0); } }
@keyframes spin     { to { transform:rotate(360deg); } }

.row-enter-active { animation: rowIn .25s ease; }
.row-leave-active { transition: opacity .15s; }
.row-leave-to     { opacity: 0; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s ease; }
.modal-fade-enter-from,   .modal-fade-leave-to     { opacity: 0; }

.modal-slide-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.modal-slide-leave-active { transition: transform .2s ease, opacity .2s ease; }
.modal-slide-enter-from   { transform: scale(.92) translateY(16px); opacity: 0; }
.modal-slide-leave-to     { transform: scale(.96); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity .15s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }


.page-error {
  margin-bottom: 1rem;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fff1f1;
  color: #dc2626;
  border: 1px solid #fecaca;
  font-size: .85rem;
  font-weight: 700;
}

/* ── Responsive — reemplaza los bloques @media al final del style scoped ── */

/* ── Tablet ───────────────────────────────────────────────── */
@media (max-width: 900px) {
  .documents-page { padding: 1.6rem 1.4rem; }

  /* Ocultar tamaño en tablet */
  .docs-table thead th:nth-child(5),
  .doc-row td:nth-child(5) { display: none; }

  /* Acciones siempre visibles en touch */
  .row-actions { opacity: 1; }
}

/* ── Móvil ────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .documents-page { padding: 4.8rem 1rem 1.8rem; }

  /* Header: columna */
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: .75rem;
    margin-bottom: 1rem;
  }

  .btn-upload {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }

  /* Búsqueda: ancho completo */
  .search-box { max-width: 100%; }

  /* Tabla: ocultar fecha, tamaño y tipo — solo nombre, paciente y acciones */
  .docs-table thead th:nth-child(3), /* tipo */
  .docs-table thead th:nth-child(4), /* fecha */
  .docs-table thead th:nth-child(5)  /* tamaño */
  { display: none; }

  .doc-row td:nth-child(3),
  .doc-row td:nth-child(4),
  .doc-row td:nth-child(5)
  { display: none; }

  /* Celdas más compactas */
  .td { padding: 12px 10px; font-size: .83rem; }
  .th { padding: 11px 10px; font-size: .65rem; }

  /* Nombre de documento: limitar ancho */
  .td-doc { max-width: 180px; }
  .doc-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: 160px;
    font-size: .83rem;
  }

  /* Ícono doc más pequeño */
  .doc-icon { width: 28px; height: 28px; border-radius: 8px; }

  /* Avatar paciente más pequeño */
  .patient-avatar { width: 22px; height: 22px; font-size: .62rem; }

  /* Acciones siempre visibles */
  .row-actions { opacity: 1; gap: 2px; }
  .action-btn  { width: 26px; height: 26px; border-radius: 7px; }

  /* ── Modales ── */
  .modal-overlay {
    padding: 1.5rem;
    align-items: center;
    overflow-y: auto;
  }

  .modal-card {
    max-width: 100%;
    width: 100%;
    border-radius: 20px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Modal PDF preview */
  .pdf-modal .pdf-preview-body { padding: 1rem; }
  .pdf-mock-page { padding: 2rem 1rem; }

  /* Modal upload */
  .modal-card .modal-body { overflow-y: auto; flex: 1; }

  .upload-drop { min-height: 90px; }

  /* Botones en fila */
  .modal-footer {
    flex-direction: row;
    gap: 8px;
  }
  .modal-footer .btn-secondary,
  .modal-footer .btn-primary,
  .modal-footer .btn-danger {
    flex: 1;
    justify-content: center;
  }

  /* Delete modal centrado */
  .delete-modal {
    max-width: 100%;
    width: 100%;
    padding: 1.5rem;
  }
  .delete-modal .modal-footer {
    justify-content: center;
    flex-direction: row;
  }
}

/* ── Móvil pequeño ────────────────────────────────────────── */
@media (max-width: 480px) {
  .documents-page { padding: 4.8rem .75rem 1.5rem; }

  /* Ocultar también paciente — solo nombre y acciones */
  .docs-table thead th:nth-child(2),
  .doc-row td:nth-child(2) { display: none; }

  .doc-name { max-width: 200px; }

  /* Type badge más pequeño */
  .type-badge { font-size: .68rem; padding: 3px 8px; }
}
</style>