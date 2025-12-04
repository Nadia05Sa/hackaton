import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8080';
const TOKEN_KEY = 'authToken';
let axiosInterceptorId = null;

export const authService = {
  // LOGIN - Conectado a la API real
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        usuario: username,
        password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = response.data?.data;
      const token = data?.token;
      
      if (!token) {
        console.error('Respuesta del servidor:', response.data);
        throw new Error('No se recibió token');
      }
      
      // Guardar token y datos del usuario
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userNombre', data.nombre);
      localStorage.setItem('userUsername', data.username);
      localStorage.setItem('userRol', data.rol);
      if (data.foto) localStorage.setItem('userFoto', data.foto);
      
      authService.setupAxiosInterceptor();
      return { success: true, data: data };
    } catch (error) {
      console.error('Error de login:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Credenciales incorrectas'
      };
    }
  },

  // REGISTRO - Conectado a la API real
  registro: async (datos) => {
    try {
      const response = await axios.post(`${API_URL}/auth/registro`, {
        username: datos.username,
        password: datos.password,
        nombre: datos.nombre,
        apellidoPaterno: datos.apellidoPaterno,
        apellidoMaterno: datos.apellidoMaterno,
        email: datos.email,
        telefono: datos.telefono
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return { success: response.data?.success, data: response.data?.data, message: response.data?.message };
    } catch (error) {
      console.error('Error de registro:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('userId');
    localStorage.removeItem('userNombre');
    localStorage.removeItem('userUsername');
    localStorage.removeItem('userRol');
    localStorage.removeItem('userFoto');
    if (axiosInterceptorId !== null) {
      axios.interceptors.request.eject(axiosInterceptorId);
      axiosInterceptorId = null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    try {
      const { exp } = jwtDecode(token);
      if (exp && Date.now() >= exp * 1000) {
        authService.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  getRole: () => {
    const rol = localStorage.getItem('userRol');
    if (rol) return rol;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.rol || decoded.role || null;
    } catch {
      return null;
    }
  },

  getUsername: () => {
    const username = localStorage.getItem('userUsername');
    if (username) return username;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.sub || decoded.username || null;
    } catch {
      return null;
    }
  },

  getUserId: () => localStorage.getItem('userId'),
  getUserNombre: () => localStorage.getItem('userNombre'),
  getUserFoto: () => localStorage.getItem('userFoto'),

  setupAxiosInterceptor: () => {
    if (axiosInterceptorId != null) {
      axios.interceptors.request.eject(axiosInterceptorId);
    }
    axiosInterceptorId = axios.interceptors.request.use(
      config => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
  },

  initializeAuth: () => {
    if (authService.isAuthenticated()) {
      authService.setupAxiosInterceptor();
    }
  },

  // Cambiar contraseña - Funcional localmente (simulado)
  cambiarContrasenaConSwal: async () => {
    await Swal.fire({
      title: 'Cambiar contraseña',
      text: 'Por favor, ingresa tu nueva contraseña.',
      input: 'password',
      inputLabel: 'Nueva contraseña',
      inputPlaceholder: 'Ingresa nueva contraseña',
      inputAttributes: { minlength: 5, autocapitalize: 'off', autocorrect: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: async (password) => {
        if (!password || password.length < 5) {
          Swal.showValidationMessage('La contraseña debe tener al menos 5 caracteres');
          return false;
        }
        // Simulación local - En producción conectar a API
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Éxito', text: 'Contraseña actualizada correctamente.', icon: 'success', confirmButtonText: 'Aceptar' });
      }
    });
  },
};
