<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#fdf4f8]">

    <!-- Fondo líneas diagonales animadas -->
    <div class="stripe-bg absolute inset-0 pointer-events-none"></div>

    <!-- Card centrada -->
    <div class="relative z-10 w-full max-w-sm flex flex-col items-center">

      <!-- Logo -->
      <img
        src="/logo.webp"
        alt="Santiago Rítmica"
        class="w-64 h-64 object-contain drop-shadow-2xl logo-float mb-6"
      />

      <!-- Formulario -->
      <div class="w-full bg-white rounded-3xl shadow-xl shadow-pink-100 border border-pink-50 p-8">
        <h2 class="font-display text-2xl font-bold text-gray-800 mb-1">Bienvenida</h2>
        <p class="font-body text-gray-400 text-sm mb-7">Ingresá tus credenciales para continuar</p>

        <div class="space-y-5">
          <div>
            <label class="block font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              class="w-full px-5 py-4 rounded-2xl bg-[#fdf4f8] border-2 border-transparent text-gray-700 font-body text-sm
                     focus:outline-none focus:border-ritmica-pink focus:bg-white transition-all duration-200 placeholder:text-gray-300"
              @keyup.enter="login"
            />
          </div>
          <div>
            <label class="block font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contraseña</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full px-5 py-4 rounded-2xl bg-[#fdf4f8] border-2 border-transparent text-gray-700 font-body text-sm
                     focus:outline-none focus:border-ritmica-pink focus:bg-white transition-all duration-200 placeholder:text-gray-300"
              @keyup.enter="login"
            />
          </div>
        </div>

        <p v-if="error" class="text-red-400 text-xs font-body mt-4 bg-red-50 px-4 py-2.5 rounded-xl text-center">{{ error }}</p>

        <button
          @click="login"
          :disabled="cargando"
          class="w-full mt-7 py-4 rounded-2xl font-body font-bold text-sm text-white
                 bg-ritmica-pink hover:bg-ritmica-pink-dark
                 transition-all duration-300 hover:shadow-lg hover:shadow-pink-200
                 hover:-translate-y-0.5 active:translate-y-0
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!cargando">Ingresar →</span>
          <span v-else class="flex items-center justify-center gap-2">
            <span class="spinner"></span> Ingresando...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router   = useRouter()
const email    = ref('')
const password = ref('')
const error    = ref('')
const cargando = ref(false)

async function login() {
  error.value = ''
  if (!email.value || !password.value) { error.value = 'Completá los campos'; return }
  cargando.value = true
  try {
    const { data } = await axios.post('/api/auth/login', { email: email.value, password: password.value })
    localStorage.setItem('ritmica_token',  data.token)
    localStorage.setItem('ritmica_nombre', data.nombre)
    localStorage.setItem('ritmica_rol',    data.rol)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al ingresar'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.logo-float {
  animation: logoFloat 5s ease-in-out infinite;
}
@keyframes logoFloat {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50%       { transform: translateY(-14px) rotate(1deg); }
}

.stripe-bg {
  background: repeating-linear-gradient(
    -55deg,
    #fdf0f6 0px,
    #fdf0f6 20px,
    #fce7f3 20px,
    #fce7f3 22px
  );
  background-size: 200% 200%;
  animation: stripeMove 8s linear infinite;
}
@keyframes stripeMove {
  0%   { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
