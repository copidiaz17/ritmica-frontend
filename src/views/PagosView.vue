<template>
  <div class="p-6 lg:p-8">
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="font-display text-3xl font-bold text-ritmica-dark">Pagos</h1>
        <p class="font-body text-gray-500 mt-1">Historial de cuotas</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 border-b border-gray-200">
      <button
        v-for="tab in tabs" :key="tab.id"
        @click="tabActivo = tab.id"
        class="px-4 py-2 font-body text-sm transition-colors border-b-2 -mb-px"
        :class="tabActivo === tab.id ? 'border-ritmica-pink text-ritmica-pink font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'"
      >{{ tab.label }}</button>
    </div>

    <!-- Tab: Listado de pagos -->
    <template v-if="tabActivo === 'listado'">

      <!-- Panel de filtros -->
      <div class="card mb-4 p-4">
        <p class="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filtros</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

          <!-- Modo fecha -->
          <div class="sm:col-span-2 lg:col-span-3">
            <div class="flex gap-4 items-center mb-3">
              <label class="flex items-center gap-2 font-body text-sm text-gray-600 cursor-pointer">
                <input type="radio" v-model="modoFecha" value="periodo" class="accent-ritmica-pink" />
                Por período (mes/año)
              </label>
              <label class="flex items-center gap-2 font-body text-sm text-gray-600 cursor-pointer">
                <input type="radio" v-model="modoFecha" value="rango" class="accent-ritmica-pink" />
                Por rango de fechas
              </label>
            </div>
          </div>

          <!-- Período -->
          <template v-if="modoFecha === 'periodo'">
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Mes</label>
              <select v-model.number="filtroMes" class="input">
                <option :value="null">Todos los meses</option>
                <option v-for="m in 12" :key="m" :value="m">{{ nombreMes(m) }}</option>
              </select>
            </div>
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Año</label>
              <select v-model.number="filtroAnio" class="input">
                <option :value="null">Todos los años</option>
                <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
          </template>

          <!-- Rango de fechas -->
          <template v-else>
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Desde</label>
              <input type="date" v-model="filtroDesde" class="input" />
            </div>
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Hasta</label>
              <input type="date" v-model="filtroHasta" class="input" />
            </div>
          </template>

          <!-- Grupo -->
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">Grupo</label>
            <select v-model="filtroActividad" class="input">
              <option value="">Todos los grupos</option>
              <option v-for="act in actividades" :key="act.id" :value="act.id">{{ act.nombre }}</option>
            </select>
          </div>

          <!-- Profesora (solo admin/recepcion) -->
          <div v-if="!esProfe">
            <label class="block font-body text-xs text-gray-500 mb-1">Profesora</label>
            <select v-model="filtroProfe" class="input">
              <option value="">Todas las profesoras</option>
              <option v-for="p in profesoras" :key="p.id" :value="p.id">{{ p.apellido }}, {{ p.nombre }}</option>
            </select>
          </div>

        </div>

        <div class="flex gap-2 mt-4">
          <button @click="cargarCuotas" class="btn-primary">Filtrar</button>
          <button @click="limpiarFiltros" class="btn-secondary">Limpiar</button>
          <button @click="exportarPDF" :disabled="exportando || !cuotas.length" class="btn-secondary flex items-center gap-2 text-sm ml-auto">
            <span>📄</span> {{ exportando ? 'Generando...' : 'Exportar PDF' }}
          </button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="card overflow-hidden">
        <div v-if="cargando" class="text-center py-12 text-gray-400 font-body">Cargando...</div>
        <div v-else-if="!cuotas.length" class="text-center py-12 text-gray-400 font-body">No hay pagos para el período seleccionado.</div>
        <table v-else class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Alumna</th>
              <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Período</th>
              <th class="text-right px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Monto</th>
              <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider hidden md:table-cell">Medio</th>
              <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider hidden md:table-cell">Fecha pago</th>
              <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in cuotas" :key="c.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="px-6 py-3 font-body text-sm font-semibold text-gray-900">
                {{ c.alumna?.apellido }}, {{ c.alumna?.nombre }}
              </td>
              <td class="px-6 py-3 font-body text-sm text-gray-500 text-center">{{ nombreMes(c.mes) }} {{ c.anio }}</td>
              <td class="px-6 py-3 font-body text-sm font-semibold text-gray-900 text-right font-mono">${{ fmt(c.monto) }}</td>
              <td class="px-6 py-3 font-body text-xs text-gray-500 text-center hidden md:table-cell capitalize">{{ c.medio_pago }}</td>
              <td class="px-6 py-3 font-body text-xs text-gray-500 text-center hidden md:table-cell">{{ c.fecha_pago }}</td>
              <td class="px-6 py-3 text-center">
                <button v-if="!esProfe" @click="eliminar(c)" class="text-red-400 hover:text-red-600 text-sm p-1 rounded hover:bg-red-50">🗑️</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-50">
              <td colspan="2" class="px-6 py-3 font-body text-sm font-bold text-gray-700">Total ({{ cuotas.length }} registros)</td>
              <td class="px-6 py-3 font-body text-sm font-bold text-ritmica-pink text-right font-mono">${{ fmt(totalMes) }}</td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </template>

    <!-- Tab: Deudoras -->
    <template v-if="tabActivo === 'vencidas'">
      <div class="card overflow-hidden">
        <div v-if="cargandoVenc" class="text-center py-12 text-gray-400 font-body">Cargando...</div>
        <div v-else-if="!vencidas.length" class="text-center py-12 text-gray-400 font-body">
          ¡Todas las alumnas están al día! 🎉
        </div>
        <table v-else class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Alumna</th>
              <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider hidden sm:table-cell">Actividades</th>
              <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in vencidas" :key="a.id" class="border-b border-gray-50 hover:bg-red-50">
              <td class="px-6 py-3 font-body text-sm font-semibold text-gray-900">{{ a.apellido }}, {{ a.nombre }}</td>
              <td class="px-6 py-3 hidden sm:table-cell">
                <div class="flex flex-wrap gap-1">
                  <span v-for="act in a.actividades" :key="act.id" class="text-xs bg-ritmica-pink/10 text-ritmica-pink px-2 py-0.5 rounded-full">{{ act.nombre }}</span>
                </div>
              </td>
              <td class="px-6 py-3 text-center">
                <button @click="pagarDesdeVencida(a)" class="btn-primary text-xs py-1.5 px-3">Cobrar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Modal pago -->
    <div v-if="modalPago" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-sm p-6">
        <div class="flex justify-between items-center mb-5">
          <h2 class="font-display text-lg font-bold text-ritmica-dark">Registrar cuota</h2>
          <button @click="modalPago = false" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>
        <p class="font-body text-sm text-gray-500 mb-4 font-semibold">{{ alumnaSeleccionada?.apellido }}, {{ alumnaSeleccionada?.nombre }}</p>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Mes</label>
              <select v-model.number="formPago.mes" class="input">
                <option v-for="m in 12" :key="m" :value="m">{{ nombreMes(m) }}</option>
              </select>
            </div>
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Año</label>
              <input v-model.number="formPago.anio" type="number" class="input" />
            </div>
          </div>
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">Monto $</label>
            <input v-model.number="formPago.monto" type="number" min="0" step="100" class="input" />
          </div>
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">Medio de pago</label>
            <select v-model="formPago.medio_pago" class="input">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="mercadopago">MercadoPago</option>
            </select>
          </div>
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">Fecha de pago</label>
            <input v-model="formPago.fecha_pago" type="date" class="input" />
          </div>
        </div>
        <p v-if="errorPago" class="text-red-500 text-sm mt-3 font-body">{{ errorPago }}</p>
        <div class="flex gap-3 mt-6">
          <button @click="modalPago = false" class="btn-secondary flex-1">Cancelar</button>
          <button @click="confirmarPago" :disabled="guardandoPago" class="btn-primary flex-1">
            {{ guardandoPago ? 'Guardando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { exportarCuotasPDF } from '../utils/pdf.js'

const esProfe   = localStorage.getItem('ritmica_rol') === 'profesora'
const exportando = ref(false)

async function exportarPDF() {
  exportando.value = true
  try {
    await exportarCuotasPDF({ cuotas: cuotas.value, mes: filtroMes.value, anio: filtroAnio.value })
  } finally {
    exportando.value = false
  }
}

const tabs = [
  { id: 'listado',  label: 'Listado de pagos' },
  { id: 'vencidas', label: 'Cuotas pendientes' },
]
const tabActivo  = ref('listado')
const cuotas     = ref([])
const vencidas   = ref([])
const cargando   = ref(false)
const cargandoVenc = ref(false)
const modalPago  = ref(false)
const guardandoPago = ref(false)
const errorPago  = ref('')
const alumnaSeleccionada = ref(null)

// Datos para dropdowns
const actividades = ref([])
const profesoras  = ref([])

// Filtros
const modoFecha     = ref('periodo')
const hoy           = new Date()
const filtroMes     = ref(hoy.getMonth() + 1)
const filtroAnio    = ref(hoy.getFullYear())
const filtroDesde   = ref('')
const filtroHasta   = ref('')
const filtroActividad = ref('')
const filtroProfe   = ref('')
const anios = Array.from({ length: 5 }, (_, i) => hoy.getFullYear() - i)

const formPago = ref({ mes: hoy.getMonth()+1, anio: hoy.getFullYear(), monto: 0, medio_pago:'efectivo', fecha_pago: hoy.toISOString().slice(0,10) })

const MESES_N = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
function nombreMes(m) { return MESES_N[m-1] }
function fmt(n) { return Number(n||0).toLocaleString('es-AR') }
function headers() { return { Authorization: `Bearer ${localStorage.getItem('ritmica_token')}` } }

const totalMes = computed(() => cuotas.value.reduce((s,c) => s + Number(c.monto), 0))

function limpiarFiltros() {
  modoFecha.value    = 'periodo'
  filtroMes.value    = hoy.getMonth() + 1
  filtroAnio.value   = hoy.getFullYear()
  filtroDesde.value  = ''
  filtroHasta.value  = ''
  filtroActividad.value = ''
  filtroProfe.value  = ''
  cargarCuotas()
}

async function cargarCuotas() {
  cargando.value = true
  try {
    const params = {}
    if (modoFecha.value === 'rango') {
      if (filtroDesde.value) params.fecha_desde = filtroDesde.value
      if (filtroHasta.value) params.fecha_hasta = filtroHasta.value
    } else {
      if (filtroMes.value)  params.mes  = filtroMes.value
      if (filtroAnio.value) params.anio = filtroAnio.value
    }
    if (filtroActividad.value) params.actividad_id = filtroActividad.value
    if (filtroProfe.value && !esProfe) params.profesora_id = filtroProfe.value

    const { data } = await axios.get('/api/cuotas', { params, headers: headers() })
    cuotas.value = data
  } finally {
    cargando.value = false
  }
}

async function cargarActividades() {
  const { data } = await axios.get('/api/actividades', { headers: headers() })
  actividades.value = data.sort((a,b) => a.nombre.localeCompare(b.nombre))
}

async function cargarProfesoras() {
  if (esProfe) return
  const { data } = await axios.get('/api/profesoras', { headers: headers() })
  profesoras.value = data
}

async function cargarVencidas() {
  cargandoVenc.value = true
  const { data } = await axios.get('/api/cuotas/vencidas', { headers: headers() })
  vencidas.value = data.alumnas
  cargandoVenc.value = false
}

async function eliminar(c) {
  if (!confirm(`¿Eliminar el pago de ${c.alumna?.nombre}?`)) return
  await axios.delete(`/api/cuotas/${c.id}`, { headers: headers() })
  await cargarCuotas()
}

function pagarDesdeVencida(a) {
  alumnaSeleccionada.value = a
  errorPago.value = ''
  formPago.value = { mes: hoy.getMonth()+1, anio: hoy.getFullYear(), monto: 0, medio_pago:'efectivo', fecha_pago: hoy.toISOString().slice(0,10) }
  modalPago.value = true
}

async function confirmarPago() {
  errorPago.value = ''
  if (!formPago.value.monto) { errorPago.value = 'El monto es obligatorio'; return }
  guardandoPago.value = true
  try {
    await axios.post('/api/cuotas', { ...formPago.value, alumna_id: alumnaSeleccionada.value.id }, { headers: headers() })
    modalPago.value = false
    cargarVencidas()
  } catch (err) {
    errorPago.value = err.response?.data?.error || 'Error'
  } finally {
    guardandoPago.value = false
  }
}

onMounted(() => {
  cargarCuotas()
  cargarVencidas()
  cargarActividades()
  cargarProfesoras()
})
</script>
