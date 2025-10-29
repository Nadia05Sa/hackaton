import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { string } from 'yup';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8080';
const TOKEN_KEY = 'authToken';
const idUser = 0;
let axiosInterceptorId = null;

export const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.get(`${API_URL}/auth/login`, {
        params: { username, password },
        headers: { 'Content-Type': 'application/json' }
      });
      const token = response.data;
      if (!token) throw new Error('No se recibió token');
      localStorage.setItem(TOKEN_KEY, token);
      authService.setupAxiosInterceptor();
      return { success: true };
    } catch (error) {
      // Manejo de error de login
      return {
        success: false,
        message: error.response?.data?.metadata[0]?.date || 'Credenciales incorrectas'
      };
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
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
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      // Ajusta el nombre del campo según tu JWT
      if (decoded.rol) return decoded.rol;
      if (decoded.role) return decoded.role;
      if (decoded.authorities && Array.isArray(decoded.authorities)) {
        // Ejemplo: ["ROLE_ADMIN"]
        return decoded.authorities[0]?.replace('ROLE_', '');
      }
      return null;
    } catch {
      return null;
    }
  },

  getUsername: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      // Ajusta según el campo de tu JWT
      return decoded.sub || decoded.username || null;
    } catch {
      return null;
    }
  },

  setupAxiosInterceptor: () => {
    // Evita múltiples interceptores
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

  // Consultas para obtener datos del api
  // datos de usuario
  fetchPerfil: async () => {
    try {
      const username = authService.getUsername();
      const response = await axios.get(`${API_URL}/auth/buscar/${username}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'application/json'
        },
      });

      const resultado = response.data.userResponse.user;
      if (Array.isArray(resultado) && resultado.length > 0) {
        return { success: true, data: resultado[0] };
      } else {
        return { success: false, message: "No se encontró información del usuario." };
      }
    } catch (err) {
      return { success: false, message: "Error al cargar los datos. Inténtalo de nuevo." };
    }
  },
  // funciones de usuario
  actualizarPerfil: async (usuario) => {
    const dataUsuario = {
      nombre: usuario.nombre || '',
      apellido_p: usuario.apellido_p || '',
      apellido_m: usuario.apellido_m || '',
      username: usuario.username || '',
    };

    const formData = new FormData();
    formData.append("userEntity", new Blob([JSON.stringify(dataUsuario)], { type: "application/json" }));

    if (usuario.fotoFile) {
      formData.append("file", usuario.fotoFile);
    } else {
      formData.append("file", new Blob());
    }

    try {
      const response = await axios.put(`${API_URL}/usuarios/${usuario.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (err) {
      throw err;
    }
  },
  cambiarContrasenaConSwal: async () => {
    await Swal.fire({
      title: 'Cambiar contraseña',
      text: 'Por favor, ingresa tu nueva contraseña.',
      input: 'password',
      inputLabel: 'Nueva contraseña',
      inputPlaceholder: 'Ingresa nueva contraseña',
      inputAttributes: {
        minlength: 5,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: async (password) => {
        if (!password || password.length < 5) {
          Swal.showValidationMessage('La contraseña debe tener al menos 5 caracteres');
          return false;
        }

        try {
          const username = authService.getUsername();
          const response = await axios.put(
            `${API_URL}/usuarios/password/${username}/${password}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const meta = response.data.metadata?.[0];
          if (meta?.codigo === "-1") {
            Swal.showValidationMessage(meta.date || "Error desconocido");
            return false;
          }

          return true;

        } catch (error) {
          const mensajeError = error.response?.data?.metadata?.[0]?.date || 'Error al actualizar contraseña';
          Swal.showValidationMessage(mensajeError);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Éxito',
          text: 'Contraseña actualizada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  },
  cambiarUsuarioConSwal: async (navigate) => {
    await Swal.fire({
      title: 'Cambiar usuario',
      text: 'Por favor, ingresa tu nuevo usuario.',
      input: 'text',
      inputLabel: 'Nuevo usuario',
      inputPlaceholder: 'Ingresa nuevo usuario',
      inputAttributes: {
        minlength: 5,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: async (nuevoUsuario) => {
        try {
          const username = authService.getUsername();
          const response = await axios.put(
            `${API_URL}/usuarios/user/${username}/${nuevoUsuario}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const meta = response.data.metadata?.[0];
          if (meta?.codigo === "-1") {
            Swal.showValidationMessage(meta.date || "Error desconocido");
            return false;
          }

          return true;

        } catch (error) {
          const mensajeError = error.response?.data?.metadata?.[0]?.date || 'Error al actualizar usuario';
          Swal.showValidationMessage(mensajeError);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Éxito',
          text: 'El usuario se actualizó correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() =>
          Swal.fire({
            icon: 'info',
            title: 'Sesión Caducada',
            text: 'La sesión ha caducado, por favor vuelve a iniciar sesión.'
          }).then(() => navigate('/'))
        );
      }
    });
  },

  // datos de operadores
  fetchOperadores: async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios/operadores`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            'Content-Type': 'application/json'
          },
        }
      );
      const resultado = (Array.isArray(response.data.userResponse.user) ? response.data.userResponse.user : []);
      if (Array.isArray(resultado) && resultado.length > 0) {
        return { success: true, data: resultado };
      } else {
        return { success: false, message: "No se encontraron operadores activos." };
      }
    } catch (err) {
      return { success: false, message: "Error al cargar los datos. Inténtalo de nuevo." };
    }
  },
  fetchOperador: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/usuarios/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'application/json'
        },
      });

      const resultado = response.data.userResponse.user;
      if (Array.isArray(resultado) && resultado.length > 0) {
        return { success: true, data: resultado[0] };
      } else {
        return { success: false, message: "No se encontró información del usuario." };
      }
    } catch (err) {
      return { success: false, message: "Error al cargar los datos. Inténtalo de nuevo." };
    }
  },
  // funciones de operadores
  registrarOperador: async (usuario, navigate) => {
    const dataUsuario = {
      nombre: usuario.nombre || '',
      apellido_p: usuario.apellido_p || '',
      apellido_m: usuario.apellido_m || '',
      username: usuario.username || ''
    };

    const formData = new FormData();
    formData.append("userEntity", new Blob([JSON.stringify(dataUsuario)], { type: "application/json" }));

    if (usuario.fotoFile) {
      formData.append("file", usuario.fotoFile);
    } else {
      formData.append("file", new Blob());
    }

    try {
      const response = await axios.post(`${API_URL}/usuarios`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const meta = response.data.metadata?.[0];
      if (meta?.codigo === "-1") {
        await Swal.fire("Error", meta.date || "Error al registrar", "error");
      } else {
        await Swal.fire("Registrado", "Operador creado correctamente", "success");
        navigate(-1);
      }

    } catch (error) {
      const mensaje = error.response?.data?.metadata?.[0]?.date || "Error desconocido";
      Swal.fire("Error", mensaje, "error");
    }
  },
  deshabilitarOperador: async (id, navigate) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción deshabilitará al operador y no es posible revertirla.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        try {
          const response = await axios.delete(`${API_URL}/usuarios/deshabilitar/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
              'Content-Type': 'application/json'
            }
          });
          const meta = response.data.metadata?.[0];
          if (meta?.codigo === "-1") {
            Swal.showValidationMessage(meta.date || "Error desconocido");
            return false;
          }
        } catch (error) {
          const mensajeError = error.response?.data?.metadata?.[0]?.date || 'Error al deshabilitar operador';
          Swal.showValidationMessage(mensajeError);
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Éxito',
          text: 'Usuario deshabilitado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => navigate(-1));
      }
    });
  },
  actualizar: async (usuario) => {
    const dataUsuario = {
      nombre: usuario.nombre || '',
      apellido_p: usuario.apellido_p || '',
      apellido_m: usuario.apellido_m || '',
      username: usuario.username || '',
    };
    // Crea un solo FormData que combine todo
    const formData = new FormData();
    formData.append("userEntity", new Blob([JSON.stringify(dataUsuario)], { type: "application/json" }));

    if (usuario.fotoFile) {
      formData.append("file", usuario.fotoFile);
    } else {
      // Si no hay foto, puedes enviar un valor nulo o una cadena vacía
      formData.append("file", new Blob([], { type: "application/octet-stream" }));
    }
    // Si subió una nueva foto
    if (usuario.nuevaFoto) {
      formData.append("file", usuario.nuevaFoto);
    } else {
      // Si no manda foto nueva, manda un archivo vacío para evitar error 500
      formData.append("file", new Blob());
    }

    try {
      const response = await axios.put(`${API_URL}/usuarios/${usuario.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const meta = response.data.metadata?.[0];
      if (meta?.codigo === "-1") {
        await Swal.fire("Error", meta.date || "Error al actualizar", "error");
      } else {
        await Swal.fire("Actualizado", "Perfil actualizado correctamente", "success");
        return true; // Indica que la actualización fue exitosa
        // setUserUpdate(true); // Activa recarga
        // setActualizarMiPerfil(false); // Sal del modo edición
      }

    } catch (error) {
      const mensaje = error.response?.data?.metadata?.[0]?.date || "Error desconocido";
      Swal.fire("Error", mensaje, "error");
      return false; // Indica que hubo un error

    }
  },

  // datos de asignaciones
  fetchAsignaciones: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/asignacion`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            'Content-Type': 'application/json'
          },
        }
      );
      const resultado = (Array.isArray(response.data.asignacionResponse.asignacion) ? response.data.asignacionResponse.asignacion : []);
      if (Array.isArray(resultado) && resultado.length > 0) {
        return { success: true, data: resultado };
      } else {
        return { success: false, message: "No se encontraron asignaciones." };
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return { success: false, message: "No se encontraron asignaciones." };
      } else {
        return { success: false, message: "Error al cargar los datos. Inténtalo de nuevo." };

      }
    }
  },
  // Funciones de asignaciones
  eliminarAsignacionConSwal: async (id, navigate, consulta) => {
    await Swal.fire({
      title: '¿Quieres deshacer esta asignacion?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        try {
          const response = await axios.delete(`${API_URL}/api/asignacion/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
              'Content-Type': 'application/json'
            }
          });
          const mensaje = response?.data?.metadata?.[0]?.date || 'Petición eliminada correctamente.';
          return Swal.fire({
            title: 'Exito',
            text: mensaje,
            icon: 'success'
          }).then(() => consulta ? navigate(-1) : navigate(0));
        } catch (error) {
          return Swal.showValidationMessage(error.response.data?.metadata?.[0]?.date || 'Error al deshacer la peticion');
        }
      }
    });
  },

  // datos de equipos
  fetchEquipos: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/equipos`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            'Content-Type': 'application/json'
          },
        }
      );
      const resultado = (Array.isArray(response.data.equiposResponse.equipo) ? response.data.equiposResponse.equipo : []);

      if (Array.isArray(resultado) && resultado.length > 0) {
        return { success: true, data: resultado };
      } else {
        return { success: false, message: "No se encontraron equipos." };
      }
    } catch (err) {
      return { success: false, message: "Error al cargar los datos. Inténtalo de nuevo." };
    }
  },

  // datos de empleados
  fetchEmpleados: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/empleado`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            'Content-Type': 'application/json'
          },
        }
      );
      const resultado = (Array.isArray(response.data.empleadoResponse.empleado) ? response.data.empleadoResponse.empleado : []);
      if (Array.isArray(resultado) && resultado.length > 0) {
        return { success: true, data: resultado };
      } else {
        return { success: false, message: "No se encontraron empleados." };
      }
    } catch (err) {
      return { success: false, message: "Error al cargar los datos. Inténtalo de nuevo." };
    }
  },
  fetchEmpleado: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/empleado/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'application/json'
        },
      });

      const resultado = response.data.empleadoResponse.empleado;

      if (Array.isArray(resultado) && resultado.length > 0) {
        setEmpleado(resultado[0]);
      } else {
        setEmpleado(null);
      }
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos. Inténtalo de nuevo.");
    }
  },
  // Funciones de empleados
  deshabilitarEmpleado: async (id, navigate) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción deshabilitará al empleado y no es posible revertirla.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        try {
          const response = await axios.delete(`${API_URL}/api/empleado/deshabilitar/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.status === 200) {
            Swal.fire("Deshabilitado", "Empleado deshabilitado correctamente", "success").then(() => {
              navigate(0);
            });
          }
          const meta = response.data.metadata?.[0];
          if (meta?.codigo === "-1") {
            Swal.showValidationMessage(meta.date || "Error desconocido");
            return false;
          }
        } catch (error) {
          const mensajeError = error.response?.data?.metadata?.[0]?.date || 'Error al deshabilitar empleado';
          Swal.showValidationMessage(mensajeError);
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await Swal.fire('Éxito', 'Peticion para deshabilitar empleado enviada', 'success');
        navigate(-1);
      }
    });
  },
  actualizarEmpleado: async (empleado) => {
    const dataUsuario = {
      nombre: empleado.nombre || '',
      apellido_p: empleado.apellido_p || '',
      apellido_m: empleado.apellido_m || '',
      telefono: empleado.telefono || '',
      puesto: empleado.puesto || '',
      departamento: empleado.departamento || ''
    };

    // Crea un solo FormData que combine todo
    const formData = new FormData();
    formData.append("empleadoEntity", new Blob([JSON.stringify(dataUsuario)], { type: "application/json" }));

    if (empleado.fotoFile) {
      formData.append("file", empleado.fotoFile);
    } else {
      // Si no hay foto, puedes enviar un valor nulo o una cadena vacía
      formData.append("file", new Blob([], { type: "application/octet-stream" }));
    }
    // Si subió una nueva foto
    if (empleado.nuevaFoto) {
      formData.append("file", empleado.nuevaFoto);
    } else {
      // Si no manda foto nueva, manda un archivo vacío para evitar error 500
      formData.append("file", new Blob());
    }

    try {
      const response = await axios.put(`${API_URL}/api/empleado/${empleado.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      const meta = response.data.metadata?.[0];
      if (meta?.codigo === "-1") {
        await Swal.fire("Error", meta.date || "Error al actualizar", "error");
      } else {
        await Swal.fire("Actualizado", "Empleado actualizado correctamente", "success");
        setUserUpdate(true); // Activa recarga
        setActualizarEmpleado(false); // Sal del modo edición
      }

    } catch (error) {
      const mensaje = error.response?.data?.metadata?.[0]?.date || "Error desconocido";
      Swal.fire("Error", mensaje, "error");
    }
  },

  // datos de peticiones
  fetchPeticiones: async () => {
    try {
      let response = null;
      const rolUsuario = authService.getRole();

      if (rolUsuario === 'ADMIN') {
        response = await axios.get(`${API_URL}/api/peticiones`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
              'Content-Type': 'application/json'
            },
          }
        );
      } else {
        const operador = authService.getUsername();
        response = await axios.get(`${API_URL}/api/peticiones/todas/${operador}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
              'Content-Type': 'application/json'
            },
          }
        );
      }
      const resultado = (Array.isArray(response.data.peticionesResponse.peticion) ? response.data.peticionesResponse.peticion : []);
      if (Array.isArray(resultado) && resultado.length > 0) {
        return { success: true, data: resultado };
      } else {
        return { success: false, message: "No se encontraron peticiones." };
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return { success: false, message: "No se encontraron peticiones." };
      } else {
        return { success: false, message: "Error al cargar los datos. Inténtalo de nuevo." };

      }
    }
  },
  // Funciones de peticiones
  GestionarPeticion: async (idPeticion, estado, navigate) => {
    const confirmacion = await Swal.fire({
      title: estado ? 'Aceptar petición' : 'Rechazar petición',
      text: estado
        ? 'Esta acción aprobará la petición.'
        : '¿Estás seguro de rechazar esta petición?',
      icon: 'question',
      ...(estado ? {} : {
        input: 'text',
        inputLabel: 'Comentario',
        inputPlaceholder: 'Ingresa la razón por la cual rechazas la petición',
        inputAttributes: {
          minlength: 5,
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        inputValidator: (value) => {
          if (!value || value.length < 0) {
            return 'Debes ingresar una razon para rechazar la peticion';
          }
        }
      }),
      showCancelButton: true,
      confirmButtonText: estado ? 'Sí, aceptar' : 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      preConfirm: async (comentario) => {
        try {
          const body = estado ? {} : { comentario };

          const response = await axios.put(`${API_URL}/api/peticiones/${idPeticion}/${estado}`, body, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
              'Content-Type': 'application/json',
            },
          });
          return response;
        } catch (error) {
          Swal.showValidationMessage(
            error?.response?.data?.metadata?.[0]?.date || 'Error al gestionar la petición.'
          );
          return null;
        }
      }
    });

    // Solo continuar si se confirmó y no hubo error
    if (confirmacion.isConfirmed && confirmacion.value) {
      const mensaje = confirmacion.value?.data?.metadata?.[0]?.date || 'Petición gestionada exitosamente.';
      Swal.fire('Éxito', mensaje, 'success').then(() => {
        navigate('/validacion');
        navigate(0);
      });
    }
  },
  
  EliminarPeticion: async (idPeticion, navigate) => {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar petición?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmacion.isConfirmed) {
      try {
        const response = await axios.delete(`${API_URL}/api/peticiones/${idPeticion}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            'Content-Type': 'application/json',
          },
        });
        const mensaje = response?.data?.metadata?.[0]?.date || 'Petición eliminada correctamente.';
        Swal.fire('Eliminada', mensaje, 'success').then(() => {
          navigate('/validacion');
          navigate(0);
        });
      } catch (error) {
        Swal.fire(
          'Error',
          error?.response?.data?.metadata?.[0]?.date || 'Error al eliminar la petición.',
          'error'
        );
      }
    }
  },

};