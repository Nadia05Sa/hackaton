import React, { useState } from 'react';
import {
  Box, Divider, Button, TextField, useMediaQuery, useTheme, InputAdornment
} from '@mui/material';
import { Typography } from '@mui/joy';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import imagenDefaul from './../../../assets/imagenDefaul.png';
import { authService } from './../../../service/authService';
import axios from 'axios';

import CircularProgress from '@mui/material/CircularProgress';

const schema = yup.object().shape({
  tipo: yup.string().required('El tipo es obligatorio'),
  numero_serie: yup.string().required('El número de serie es obligatorio'),
  marca: yup.string().required('La marca es obligatoria'),
  modelo: yup.string().required('El modelo es obligatorio'),
  sistema_operativo: yup.string(),
  procesador: yup.string(),
  ram: yup.string(),
  almacenamiento: yup.string(),
  comentario: yup.string()
});

const AgregarEquipo = () => {
  const urlHost = "http://localhost:8080";
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const navigate = useNavigate();
  const location = useLocation();
  const { titulo } = location.state || {};
  const [preview, setPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("equipoTecnologicoEntity", new Blob([JSON.stringify(data)], {
        type: "application/json"
      }));
      formData.append("file", fotoFile || new Blob([], { type: "application/octet-stream" }));

      const response = await axios.post(`${urlHost}/api/equipos`, formData, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        Swal.fire('¡Éxito!', 'Equipo registrado correctamente.', 'success')
          .then(() => navigate(-1));
      }

    } catch (err) {
      const mensaje = err.response?.data?.metadata?.[0]?.date || 'Error al registrar el equipo.';

      Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="mt-3">
      <Box sx={{
        display: 'flex',
        justifyContent: isXs ? 'center' : 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <h3 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'start' }}>{titulo}</h3>
      </Box>

      <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black', mb: 3 }} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ padding: isXs ? 0 : 2 , zIndex: 1 }}>
          <h3 style={{ paddingLeft: "1rem" }}>Datos Principales</h3>
          <Box sx={{
            display: isXs ? 'block' : 'flex',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 2,
            borderRadius: 3,
            width: "100%"
          }}>
            <input
              type="file"
              accept="image/*"
              id="fotoFile"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                setFotoFile(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setPreview(reader.result);
                  reader.readAsDataURL(file);
                } else {
                  setPreview(null);
                }
              }}
            />
            <label htmlFor="fotoFile" style={{ cursor: 'pointer' }}>
              <img
                src={preview || imagenDefaul}
                alt="Foto equipo"
                width="180rem"
                style={{ border: '1px solid #DDD' }}
              />
            </label>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(${isXs ? "100%" : "40%"}, 1fr))`,
              gap: 2,
              width: isXs ? '100%' : '80%',
              marginTop: isXs ? 3 : 0
            }}>
              <TextField
                label="Tipo de equipo"
                {...register('tipo')}
                error={!!errors.tipo}
                helperText={errors.tipo?.message}
              />
              <TextField
                label="Número de serie"
                {...register('numero_serie')}
                error={!!errors.numero_serie}
                helperText={errors.numero_serie?.message}
              />
              <TextField
                label="Marca"
                {...register('marca')}
                error={!!errors.marca}
                helperText={errors.marca?.message}
              />
              <TextField
                label="Modelo"
                {...register('modelo')}
                error={!!errors.modelo}
                helperText={errors.modelo?.message}
              />
            </Box>
          </Box>

          <h3 style={{ paddingLeft: "1rem" }}>Características</h3>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${isXs ? "100%" : "40%"}, 1fr))`,
            gap: 2,
            padding: 2
          }}>
            <TextField label="Sistema operativo" {...register('sistema_operativo')} />
            <TextField label="Procesador" {...register('procesador')} />
            <TextField label="RAM (GB)" {...register('ram')} />
            <TextField label="Almacenamiento (GB)" {...register('almacenamiento')} />
            <TextField label="Comentario" {...register('comentario')} sx={{ width: isXs ? ('100%') : ('203%') }} />
          </Box>

          <Box sx={{ justifyContent: 'flex-end', display: 'flex', pr: isXs ? 0 : "3rem" }}>
            <Button variant="outlined" sx={{ mx: 1 }} onClick={() => navigate(-1)} disabled={isLoading}>Cancelar</Button>
            <Button variant="contained" type="submit" disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : "Registrar"}</Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default AgregarEquipo;
