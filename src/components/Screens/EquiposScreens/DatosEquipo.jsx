import React, { useState, useEffect } from 'react';
import { Divider, Box, Button, InputAdornment, TextField, useTheme, useMediaQuery, FormControl, InputLabel, Input } from '@mui/material';
import { Typography } from '@mui/joy';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import imagenDefaul from './../../../assets/imagenDefaul.png';
import { authService } from './../../../service/authService'
import axios from 'axios';
import Swal from 'sweetalert2';
import CircularProgress from '@mui/material/CircularProgress';

const DatosEquipo = () => {
  const urlHost = "http://localhost:8080"

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  const navigate = useNavigate();
  const location = useLocation();
  const { id, titulo } = location.state || {};

  const [equipo, setEquipo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const [equipoUpdate, setEquipoUpdate] = useState(false);
  const [actualizarEquipo, setActualizarEquipo] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleActualizarEquipo = async () => {
    setIsLoading(true);
    try {
      const dataEquipo = {
        tipo: equipo.tipo || '',
        numero_serie: equipo.numero_serie || '',
        marca: equipo.marca || '',
        modelo: equipo.modelo || '',
        sistema_operativo: equipo.sistema_operativo || '',
        procesador: equipo.procesador || '',
        ram: equipo.ram || '',
        almacenamiento: equipo.almacenamiento || '',
        comentario: equipo.comentario || ''
      };

      // Crea un solo FormData que combine todo
      const formData = new FormData();
      formData.append("equipoTecnologicoEntity", new Blob([JSON.stringify(dataEquipo)], { type: "application/json" }));

      if (equipo.fotoFile) {
        formData.append("file", equipo.fotoFile);
      } else {
        // Si no hay foto, puedes enviar un valor nulo o una cadena vacía
        formData.append("file", new Blob([], { type: "application/octet-stream" }));
      }

      const response = await axios.put(`${urlHost}/api/equipos/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        Swal.fire({
          title: 'Exito',
          text: 'Equipo actualizado correctamente',
          icon: 'success',
        }).then((result) => {
          if (result.isConfirmed) {
            setEquipoUpdate(false);
            setActualizarEquipo(false);
          }
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text:
          Array.isArray(err.response?.data?.metadata) && err.response.data.metadata[0]?.date
            ? err.response.data.metadata[0].date
            : 'Error al actualizar el equipo.',
        icon: 'warning',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEquipo = async () => {
    try {
      const response = await axios.get(`${urlHost}/api/equipos/${id}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
      });

      const resultado = response.data?.equiposResponse?.equipo;
      if (Array.isArray(resultado) && resultado.length > 0) {
        setEquipo(resultado[0]);
      } else {
        setEquipo(null);
      }
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos. Inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    if (!id) return;
    if (equipoUpdate) return;

    fetchEquipo();
  }, [id, equipoUpdate]);

  return (
    <Box className="mt-3">
      <Box
        sx={{
          display: 'flex',
          justifyContent: isXs ? 'center' : 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>{titulo}</h1>
      </Box>

      <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black', marginBottom: 3 }} />

      {/* Datos principales */}
      <Box sx={{ padding: 2 }}>

        {equipo ? (
          <Box>
            <h3 style={{ paddingLeft: isXs ? 0 : "1rem" }}>Datos Principales</h3>
            <Box sx={{
              display: isXs ? 'block' : 'flex',
              gap: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 2,
              borderRadius: 3,

            }}>
              {actualizarEquipo && (
                <input
                  type="file"
                  accept="image/*"
                  id="fotoFile"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    setEquipo({ ...equipo, fotoFile: file });
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPreview(reader.result);
                      reader.readAsDataURL(file);
                    } else {
                      setPreview(null);
                    }
                  }}
                />
              )}
              <label htmlFor="fotoFile" style={{ cursor: actualizarEquipo ? 'pointer' : 'default' }}>
                <img
                  src={preview || (equipo.fotoBase64 !== null && `data:image/png;base64,${equipo.fotoBase64}`) || imagenDefaul}
                  alt="Foto equipo"
                  width="180rem"
                  style={{ border: '1px solid #DDD', maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = imagenDefaul;
                  }}
                />
              </label>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fit, minmax(${isXs ? "100%" : "40%"}, 1fr))`,
                  gap: 2,
                  width: isXs ? '100%' : '80%',
                  marginTop: isXs ? 3 : 0
                }}
              >
                <TextField
                  label="Tipo de equipo"
                  variant="outlined"
                  sx={{ width: '100%' }}
                  disabled={!actualizarEquipo}
                  value={equipo.tipo}
                  onChange={(e) => setEquipo({ ...equipo, tipo: e.target.value })}
                />
                <TextField
                  label="Número de serie"
                  variant="outlined"
                  sx={{ width: '100%' }}
                  disabled={!actualizarEquipo}
                  value={equipo.numero_serie}
                  onChange={(e) => setEquipo({ ...equipo, numero_serie: e.target.value })}
                />
                <TextField
                  label="Marca"
                  variant="outlined"
                  sx={{ width: '100%' }}
                  disabled={!actualizarEquipo}
                  value={equipo.marca}
                  onChange={(e) => setEquipo({ ...equipo, marca: e.target.value })}
                />
                <TextField
                  label="Modelo"
                  variant="outlined"
                  sx={{ width: '100%' }}
                  disabled={!actualizarEquipo}
                  value={equipo.modelo}
                  onChange={(e) => setEquipo({ ...equipo, modelo: e.target.value })}
                />
              </Box>
            </Box>


            <h3 style={{ paddingLeft: isXs ? 0 : "1rem" }}>Caracteristicas</h3>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(${isXs ? "100%" : "40%"}, 1fr))`,
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: 2,
              borderRadius: 3,
              gap: 2,
            }}
            >
              <TextField
                label="Sistema operativo"
                variant="outlined"
                sx={{ width: '100%' }}
                disabled={!actualizarEquipo}
                value={equipo.sistema_operativo || ''}
                onChange={(e) => setEquipo({ ...equipo, sistema_operativo: e.target.value })}
              />
              <TextField
                label="Procesador"
                variant="outlined"
                sx={{ width: '100%' }}
                disabled={!actualizarEquipo}
                value={equipo.procesador || ''}
                onChange={(e) => setEquipo({ ...equipo, procesador: e.target.value })}
              />
              <TextField
                label="Ram"
                variant="outlined"
                sx={{ width: '100%' }}
                disabled={!actualizarEquipo}
                endAdornment={<InputAdornment position="end"> GB</InputAdornment>}
                value={equipo.ram || ''}
                onChange={(e) => setEquipo({ ...equipo, ram: e.target.value })}
              />
              <TextField
                label="Almacenamiento"
                variant="outlined"
                sx={{ width: '100%' }}
                disabled={!actualizarEquipo}
                endAdornment={<InputAdornment position="end"> GB</InputAdornment>}
                value={equipo.almacenamiento || ''}
                onChange={(e) => setEquipo({ ...equipo, almacenamiento: e.target.value })}
              />
              <TextField
                label="Comentario"
                variant="outlined"
                sx={{ width: isXs ? ('100%') : ('203%') }}
                disabled={!actualizarEquipo}
                value={equipo.comentario || ''}
                onChange={(e) => setEquipo({ ...equipo, comentario: e.target.value })}
              />
            </Box>
            <Box sx={{ paddingRight: isXs ? 0 : "3rem", justifyContent: 'flex-end', display: 'flex' }}>
              <Button variant="outlined" sx={{ marginX: isXs ? 1 : 2 }} onClick={() => actualizarEquipo ? (setEquipoUpdate(false), setActualizarEquipo(false), setPreview(null)) : navigate(-1)} disabled={isLoading}> {actualizarEquipo ? "Cancelar" : "Regresar"} </Button>
              <Button variant="contained" onClick={() => actualizarEquipo ? handleActualizarEquipo() : (setEquipoUpdate(true), setActualizarEquipo(true))} disabled={isLoading}> {actualizarEquipo ? (isLoading ? <CircularProgress size={24} /> : "Aceptar") : "Actualizar"} </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
            {error ? error : "Cargando información..."}
            {error === null && <CircularProgress />}
            {error && " Por favor, intenta recargar la página."}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DatosEquipo;
