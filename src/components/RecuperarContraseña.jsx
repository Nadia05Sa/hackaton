import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import Logo from './../assets/Logo.png';

// Colores de la paleta
const colors = {
  primary: '#2C3E50',
  primaryLight: '#34495E',
  primaryDark: '#1a252f',
  accent: '#2EAA7F',
  accentLight: '#4ECBA0',
  gold: '#D4A574',
  goldLight: '#E8C9A0',
  surface: '#FFFFFF',
  background: '#F5F7FA',
  textSecondary: '#7F8C8D',
};

const RecuperarContraseña = () => {
  const urlHost = "http://localhost:8080";

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isMd = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTokenStep, setIsTokenStep] = useState(false);

  const schema = yup.object({
    usuario: yup.string().required(isTokenStep ? 'El token es obligatorio' : 'El usuario es obligatorio'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRequest = async (data) => {
    setIsLoading(true);
    setError('');

    // GET /auth/token/{token} - Validar token de recuperación
    const endpoint = isTokenStep
      ? `${urlHost}/auth/token/${data.usuario}`
      : `${urlHost}/auth/${data.usuario}`;

    try {
      const response = await axios.get(endpoint, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Response: { success: true, data: {...}, message: "..." }
      if (response.data?.success) {
      Swal.fire({
        title: 'Éxito',
          text: response.data?.message || 'Proceso exitoso',
        icon: 'success',
          confirmButtonText: isTokenStep ? 'Volver al inicio' : 'Continuar',
        confirmButtonColor: colors.accent,
      }).then((result) => {
        if (result.isConfirmed) {
            if (isTokenStep) {
              navigate('/');
            } else {
              setIsTokenStep(true);
          }
        }
      });
      } else {
        throw new Error(response.data?.message || 'Error en el proceso');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al recuperar contraseña.';
      setError(errorMsg);
      Swal.fire({
        title: 'Error',
        text: errorMsg,
        icon: 'warning',
        confirmButtonText: 'Regresar',
        confirmButtonColor: colors.accent,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reset(); 
    reset({ usuario: '' });
  }, [isTokenStep]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 50%, ${colors.primaryLight} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, ${colors.accent} 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, ${colors.gold} 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Left Panel - Logo */}
      {!isXs && (
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              flex: isMd ? 0.4 : 0.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              position: 'relative',
            }}
          >
            {/* Decorative circles */}
            <Box
              sx={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.accent}30 0%, ${colors.accentLight}20 100%)`,
                filter: 'blur(40px)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '30%',
                right: '15%',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.gold}30 0%, ${colors.goldLight}20 100%)`,
                filter: 'blur(30px)',
              }}
            />

            <Box sx={{ textAlign: 'center', zIndex: 1 }}>
              <img 
                src={Logo} 
                alt="Alma Viajera" 
                style={{ 
                  width: "100%", 
                  maxWidth: 320, 
                  height: "auto",
                }} 
              />
            </Box>
          </Box>
        </Fade>
      )}

      {/* Right Panel - Form */}
      <Box
        sx={{
          flex: isXs ? 1 : isMd ? 0.6 : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 420,
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              backgroundColor: colors.surface,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Mobile Logo */}
            {isXs && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img 
                  src={Logo} 
                  alt="Alma Viajera" 
                  style={{ 
                    width: "100%", 
                    maxWidth: 180, 
                    height: "auto",
                  }} 
                />
              </Box>
            )}

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: colors.primary,
                mb: 0.5,
                textAlign: 'center',
              }}
            >
              {isTokenStep ? 'Verificar Token' : 'Recuperar Contraseña'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                mb: 4,
                textAlign: 'center',
              }}
            >
              {isTokenStep 
                ? 'Ingresa el token que recibiste' 
                : 'Ingresa tu usuario para recuperar tu acceso'}
            </Typography>

            <form onSubmit={handleSubmit(handleRequest)}>
              <Typography
                component="label"
                htmlFor="usuario"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: colors.primary,
                  mb: 1,
                  height: 28,
                }}
              >
                {isTokenStep ? 'Token' : 'Usuario'}
              </Typography>
              <TextField
                id="usuario"
                fullWidth
                placeholder={isTokenStep ? "Ingresa el token" : "Ingresa tu usuario"}
                {...register("usuario")}
                error={!!errors.usuario}
                helperText={errors.usuario?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {isTokenStep 
                        ? <VpnKeyOutlinedIcon sx={{ color: colors.textSecondary }} />
                        : <PersonOutlineOutlinedIcon sx={{ color: colors.textSecondary }} />
                      }
                    </InputAdornment>
                  ),
                  sx: { height: 48 }
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: colors.background,
                    '&:hover fieldset': { borderColor: colors.accent },
                    '&.Mui-focused fieldset': { borderColor: colors.accent },
                  },
                }}
              />

              {error && (
                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#DC2626', fontSize: "0.85rem" }}>
                    {error}
                  </Typography>
                </Box>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  height: 48,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  boxShadow: '0 4px 20px rgba(46, 170, 127, 0.3)',
                  transition: 'all 0.3s ease',
                  mb: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(46, 170, 127, 0.4)',
                  },
                  '&:disabled': {
                    background: colors.textSecondary,
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: colors.surface }} />
                ) : (
                  'Continuar'
                )}
              </Button>

              {isTokenStep && (
                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  onClick={() => setIsTokenStep(false)}
                  sx={{
                    height: 48,
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: colors.accent,
                    color: colors.accent,
                    mb: 2,
                    '&:hover': {
                      borderColor: colors.accentLight,
                      backgroundColor: 'rgba(46, 170, 127, 0.05)',
                    },
                  }}
                >
                  Volver a enviar
                </Button>
              )}

              <Button
                type="button"
                fullWidth
                variant="text"
                onClick={() => navigate('/')}
                startIcon={<ArrowBackOutlinedIcon />}
                sx={{
                  height: 48,
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  color: colors.textSecondary,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    color: colors.primary,
                  },
                }}
              >
                Volver al inicio
              </Button>
            </form>

            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                © 2024 Alma Viajera
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default RecuperarContraseña;
