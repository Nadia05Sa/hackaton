import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8080';

// Helper para obtener headers con token
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${authService.getToken()}`,
  'Content-Type': 'application/json'
});

const getAuthHeadersMultipart = () => ({
  'Authorization': `Bearer ${authService.getToken()}`,
  'Content-Type': 'multipart/form-data'
});

// Helper para manejar respuestas de la API
// La API responde con: { success: true/false, data: {...}, message: "...", metadata: {...} }
const handleResponse = (response) => {
  if (response.data?.success) {
    return { success: true, data: response.data.data, message: response.data.message };
  }
  return { success: false, message: response.data?.message || 'Error desconocido' };
};

const handleError = (error) => ({
  success: false,
  message: error.response?.data?.message || error.message || 'Error de conexión'
});

// ============================================
// 🔐 AUTENTICACIÓN (/auth)
// ============================================
export const authApi = {
  // POST /auth/registro
  registro: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/registro`, {
        username: userData.username,
        password: userData.password,
        nombre: userData.nombre,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno || "",
        email: userData.email,
        telefono: userData.telefono
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /auth/token/{token} - Validar token
  validarToken: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/token/${token}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// 👤 USUARIOS (/usuarios)
// ============================================
export const usuariosApi = {
  // GET /usuarios/{id}
  obtenerPorId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/usuarios/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /usuarios/{id}
  actualizar: async (id, userData) => {
    try {
      const response = await axios.put(`${API_URL}/usuarios/${id}`, {
        nombre: userData.nombre,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno,
        email: userData.email,
        telefono: userData.telefono
      }, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /usuarios/password/{username}/{newPassword}
  cambiarPassword: async (username, newPassword) => {
    try {
      const response = await axios.put(
        `${API_URL}/usuarios/password/${username}/${newPassword}`,
        {},
        { headers: getAuthHeaders() }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// 📦 PRODUCTOS (/productos)
// ============================================
export const productosApi = {
  // GET /productos
  listar: async () => {
    try {
      const response = await axios.get(`${API_URL}/productos`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /productos/{id}
  obtenerPorId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/productos/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /productos/mis-productos
  misProductos: async () => {
    try {
      const response = await axios.get(`${API_URL}/productos/mis-productos`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /productos
  crear: async (productoData) => {
    try {
      const response = await axios.post(`${API_URL}/productos`, {
        nombre: productoData.nombre,
        descripcion: productoData.descripcion,
        categorias: productoData.categorias, // Array de IDs
        estado: productoData.estado, // ID del estado
        intercambioPor: productoData.intercambioPor,
        ubicacion: productoData.ubicacion,
        lugarTruequeId: productoData.lugarTruequeId,
        imagenes: productoData.imagenes // Array de nombres de archivos
      }, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /productos/{id}
  actualizar: async (id, productoData) => {
    try {
      const response = await axios.put(`${API_URL}/productos/${id}`, productoData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /productos/{id}
  eliminar: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/productos/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /productos/{id}/estado
  cambiarEstado: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/productos/${id}/estado`, {}, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// 🔄 PROPUESTAS DE TRUEQUE (/propuestas)
// ============================================
export const propuestasApi = {
  // GET /propuestas/recibidas
  recibidas: async () => {
    try {
      const response = await axios.get(`${API_URL}/propuestas/recibidas`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /propuestas/enviadas
  enviadas: async () => {
    try {
      const response = await axios.get(`${API_URL}/propuestas/enviadas`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /propuestas
  crear: async (propuestaData) => {
    try {
      const response = await axios.post(`${API_URL}/propuestas`, {
        productoOfrecidoId: propuestaData.productoOfrecidoId,
        productoSolicitadoId: propuestaData.productoSolicitadoId,
        mensaje: propuestaData.mensaje
      }, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /propuestas/{id}/aceptar
  aceptar: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/propuestas/${id}/aceptar`, {}, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /propuestas/{id}/rechazar
  rechazar: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/propuestas/${id}/rechazar`, {}, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /propuestas/{id}
  cancelar: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/propuestas/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// 📍 LUGARES TURÍSTICOS (/lugares-turisticos)
// ============================================
export const lugaresTuristicosApi = {
  // GET /lugares-turisticos
  listar: async () => {
    try {
      const response = await axios.get(`${API_URL}/lugares-turisticos`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /lugares-turisticos/{id}
  obtenerPorId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/lugares-turisticos/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /lugares-turisticos/activos
  listarActivos: async () => {
    try {
      const response = await axios.get(`${API_URL}/lugares-turisticos/activos`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /lugares-turisticos (ADMIN)
  crear: async (lugarData) => {
    try {
      const response = await axios.post(`${API_URL}/lugares-turisticos`, {
        nombre: lugarData.nombre,
        descripcion: lugarData.descripcion,
        ubicacion: lugarData.ubicacion,
        direccion: lugarData.direccion,
        categoria: lugarData.categoria, // ID de categoría (singular)
        horario: lugarData.horario,
        costoEntrada: lugarData.costoEntrada,
        imagen: lugarData.imagen,
        activo: lugarData.activo !== undefined ? lugarData.activo : true
      }, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /lugares-turisticos/{id} (ADMIN)
  actualizar: async (id, lugarData) => {
    try {
      const response = await axios.put(`${API_URL}/lugares-turisticos/${id}`, lugarData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /lugares-turisticos/{id}/estado (ADMIN)
  cambiarEstado: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/lugares-turisticos/${id}/estado`, {}, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /lugares-turisticos/{id} (ADMIN)
  eliminar: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/lugares-turisticos/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /lugares-turisticos/{id}/resenas
  obtenerResenas: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/lugares-turisticos/${id}/resenas`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /lugares-turisticos/{id}/resenas
  crearResena: async (id, resenaData) => {
    try {
      const response = await axios.post(`${API_URL}/lugares-turisticos/${id}/resenas`, {
        calificacion: resenaData.calificacion,
        comentario: resenaData.comentario
      }, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// ⭐ RESEÑAS (/resenas)
// ============================================
export const resenasApi = {
  // DELETE /resenas/{id}
  eliminar: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/resenas/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// 🏪 LUGARES DE TRUEQUE (/lugares-trueque)
// ============================================
export const lugaresTruequeApi = {
  // GET /lugares-trueque
  listar: async () => {
    try {
      const response = await axios.get(`${API_URL}/lugares-trueque`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /lugares-trueque/{id}
  obtenerPorId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/lugares-trueque/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /lugares-trueque/activos
  listarActivos: async () => {
    try {
      const response = await axios.get(`${API_URL}/lugares-trueque/activos`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /lugares-trueque (ADMIN)
  crear: async (lugarData) => {
    try {
      const response = await axios.post(`${API_URL}/lugares-trueque`, lugarData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /lugares-trueque/{id} (ADMIN)
  actualizar: async (id, lugarData) => {
    try {
      const response = await axios.put(`${API_URL}/lugares-trueque/${id}`, lugarData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /lugares-trueque/{id}/estado (ADMIN)
  cambiarEstado: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/lugares-trueque/${id}/estado`, {}, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /lugares-trueque/{id} (ADMIN)
  eliminar: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/lugares-trueque/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// ⚙️ CATÁLOGOS (/catalogos)
// ============================================

// Categorías de Productos
export const categoriasApi = {
  // GET /catalogos/categorias
  listar: async () => {
    try {
      const response = await axios.get(`${API_URL}/catalogos/categorias`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /catalogos/categorias/activas
  listarActivas: async () => {
    try {
      const response = await axios.get(`${API_URL}/catalogos/categorias/activas`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /catalogos/categorias (ADMIN)
  crear: async (categoriaData) => {
    try {
      const response = await axios.post(`${API_URL}/catalogos/categorias`, categoriaData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /catalogos/categorias/{id} (ADMIN)
  actualizar: async (id, categoriaData) => {
    try {
      const response = await axios.put(`${API_URL}/catalogos/categorias/${id}`, categoriaData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /catalogos/categorias/{id} (ADMIN)
  eliminar: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/catalogos/categorias/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// Estados de Producto
export const estadosProductoApi = {
  // GET /catalogos/estados-producto
  listar: async () => {
    try {
      const response = await axios.get(`${API_URL}/catalogos/estados-producto`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /catalogos/estados-producto/activos
  listarActivos: async () => {
    try {
      const response = await axios.get(`${API_URL}/catalogos/estados-producto/activos`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /catalogos/estados-producto (ADMIN)
  crear: async (estadoData) => {
    try {
      const response = await axios.post(`${API_URL}/catalogos/estados-producto`, estadoData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /catalogos/estados-producto/{id} (ADMIN)
  actualizar: async (id, estadoData) => {
    try {
      const response = await axios.put(`${API_URL}/catalogos/estados-producto/${id}`, estadoData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /catalogos/estados-producto/{id} (ADMIN)
  eliminar: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/catalogos/estados-producto/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// Tipos de Lugar de Trueque
export const tiposLugarTruequeApi = {
  // GET /catalogos/tipos-lugar-trueque
  listar: async () => {
    try {
      const response = await axios.get(`${API_URL}/catalogos/tipos-lugar-trueque`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /catalogos/tipos-lugar-trueque/activos
  listarActivos: async () => {
    try {
      const response = await axios.get(`${API_URL}/catalogos/tipos-lugar-trueque/activos`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /catalogos/tipos-lugar-trueque (ADMIN)
  crear: async (tipoData) => {
    try {
      const response = await axios.post(`${API_URL}/catalogos/tipos-lugar-trueque`, tipoData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /catalogos/tipos-lugar-trueque/{id} (ADMIN)
  actualizar: async (id, tipoData) => {
    try {
      const response = await axios.put(`${API_URL}/catalogos/tipos-lugar-trueque/${id}`, tipoData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /catalogos/tipos-lugar-trueque/{id} (ADMIN)
  eliminar: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/catalogos/tipos-lugar-trueque/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// Categorías Turísticas
export const categoriasTuristicasApi = {
  // GET /catalogos/categorias-turisticas
  listar: async () => {
    try {
      const response = await axios.get(`${API_URL}/catalogos/categorias-turisticas`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /catalogos/categorias-turisticas/activas
  listarActivas: async () => {
    try {
      const response = await axios.get(`${API_URL}/catalogos/categorias-turisticas/activas`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /catalogos/categorias-turisticas (ADMIN)
  crear: async (categoriaData) => {
    try {
      const response = await axios.post(`${API_URL}/catalogos/categorias-turisticas`, categoriaData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /catalogos/categorias-turisticas/{id} (ADMIN)
  actualizar: async (id, categoriaData) => {
    try {
      const response = await axios.put(`${API_URL}/catalogos/categorias-turisticas/${id}`, categoriaData, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /catalogos/categorias-turisticas/{id} (ADMIN)
  eliminar: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/catalogos/categorias-turisticas/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// 📊 ESTADÍSTICAS (/estadisticas) - Solo ADMIN
// ============================================
export const estadisticasApi = {
  // GET /estadisticas/resumen
  resumen: async () => {
    try {
      const response = await axios.get(`${API_URL}/estadisticas/resumen`, {
        headers: getAuthHeaders()
      });
      // Respuesta: { exito: true, datos: { totalTrueques, truequesCompletados, ... } }
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /estadisticas/trueques-por-mes
  truequesPorMes: async () => {
    try {
      const response = await axios.get(`${API_URL}/estadisticas/trueques-por-mes`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /estadisticas/categorias-populares
  categoriasPopulares: async () => {
    try {
      const response = await axios.get(`${API_URL}/estadisticas/categorias-populares`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /estadisticas/lugares-activos
  lugaresActivos: async () => {
    try {
      const response = await axios.get(`${API_URL}/estadisticas/lugares-activos`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /estadisticas/ultimos-trueques
  ultimosTrueques: async () => {
    try {
      const response = await axios.get(`${API_URL}/estadisticas/ultimos-trueques`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// Export por defecto con todos los servicios
export default {
  auth: authApi,
  usuarios: usuariosApi,
  productos: productosApi,
  propuestas: propuestasApi,
  lugaresTuristicos: lugaresTuristicosApi,
  resenas: resenasApi,
  lugaresTrueque: lugaresTruequeApi,
  categorias: categoriasApi,
  estadosProducto: estadosProductoApi,
  tiposLugarTrueque: tiposLugarTruequeApi,
  categoriasTuristicas: categoriasTuristicasApi,
  estadisticas: estadisticasApi,
};
