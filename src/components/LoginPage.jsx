import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
} from '@mui/material';
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from 'react-router-dom';
import { authService } from './../service/authService';
import axios from 'axios';
import Swal from 'sweetalert2';

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';

// Logo principal
import logo from './../assets/Logo.png';

// Colores de la paleta basados en el logo
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

// URL de la API
  const urlHost = "http://localhost:8080";

// Esquema de validación para Login
const loginSchema = yup.object().shape({
    usuario: yup.string().required("Ingresa un usuario"),
    password: yup.string().required("Ingresa una contraseña").min(4, "Mínimo 4 caracteres"),
  });

// Esquema de validación para Registro
const registerSchema = yup.object().shape({
  nombre: yup.string().required("El nombre es requerido").min(2, "Mínimo 2 caracteres"),
  apellidoPaterno: yup.string().required("El apellido paterno es requerido"),
  apellidoMaterno: yup.string(),
  email: yup.string().required("El email es requerido").email("Ingresa un email válido"),
  telefono: yup.string().required("El teléfono es requerido").min(10, "Mínimo 10 dígitos"),
  username: yup.string().required("El usuario es requerido").min(4, "Mínimo 4 caracteres"),
  password: yup.string().required("La contraseña es requerida").min(6, "Mínimo 6 caracteres"),
  confirmPassword: yup.string()
    .required("Confirma tu contraseña")
    .oneOf([yup.ref('password')], "Las contraseñas no coinciden"),
});

export default function LoginPage() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isMd = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forms
  const loginForm = useForm({ resolver: yupResolver(loginSchema) });
  const registerForm = useForm({ resolver: yupResolver(registerSchema) });

  useEffect(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }, []);

  // Cambiar entre login y registro
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormError('');
    loginForm.reset();
    registerForm.reset();
  };

  // Submit Login
  async function onLoginSubmit(data) {
    setIsLoading(true);
    setFormError('');

    try {
      const result = await authService.login(data.usuario, data.password);

      if (result.success) {
        const rol = await authService.getRole();
        
        if (data.password === '12345') {
          const { value: newPassword } = await Swal.fire({
            title: 'Contraseña temporal detectada',
            text: 'Por favor, cambia tu contraseña.',
            input: 'password',
            inputLabel: 'Nueva contraseña',
            inputPlaceholder: 'Ingresa nueva contraseña',
            inputAttributes: {
              minlength: 5,
              autocapitalize: 'off',
              autocorrect: 'off',
            },
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: colors.accent,
            preConfirm: async (password) => {
              if (!password || password.length < 5) {
                Swal.showValidationMessage('La contraseña debe tener al menos 5 caracteres');
                return false;
              }
              try {
                const username = authService.getUsername();
                // PUT /usuarios/password/{username}/{newPassword}
                await axios.put(
                  `${urlHost}/usuarios/password/${username}/${password}`,
                  {}, // cuerpo vacío
                  {
                    headers: {
                      'Authorization': `Bearer ${authService.getToken()}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                return password;
              } catch (error) {
                Swal.showValidationMessage(error.response?.data?.message || 'Error al actualizar contraseña');
                return false;
              }
            }
          });

          if (!newPassword) {
            authService.logout();
            return;
          }
        }

        if (rol === 'ADMIN') {
          navigate('/dashboard');
          } else {
          navigate('/productos');
          }
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  }

  // Submit Registro
  async function onRegisterSubmit(data) {
    setIsLoading(true);
    setFormError('');

    try {
      // Request: { username, password, nombre, apellidoPaterno, apellidoMaterno, email, telefono }
      const payload = {
        username: data.username,
        password: data.password,
        nombre: data.nombre,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno || "",
        email: data.email,
        telefono: data.telefono,
      };

      // POST /auth/registro
      const response = await axios.post(`${urlHost}/auth/registro`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Response: { success: true, data: {...}, message: "Usuario registrado correctamente" }
      if (response.data?.success) {
        Swal.fire({
          title: '¡Registro exitoso!',
          text: response.data?.message || 'Tu cuenta ha sido creada. Ya puedes iniciar sesión.',
          icon: 'success',
          confirmButtonText: 'Iniciar sesión',
          confirmButtonColor: colors.accent,
        }).then(() => {
          setIsLogin(true);
          registerForm.reset();
        });
      } else {
        setFormError(response.data?.message || 'Error al crear la cuenta.');
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                       'Error al crear la cuenta. Intenta de nuevo.';
      setFormError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  // Componente de campo de formulario
  const FormField = ({ label, children }) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        component="label"
        sx={{
          display: "block",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: colors.primary,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );

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

      {/* Left Panel - Logo (hidden on mobile) */}
      {!isXs && (
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              flex: isMd ? 0.4 : 0.45,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              position: 'relative',
            }}
          >
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
                src={logo} 
                alt="Alma Viajera" 
                style={{ width: "100%", maxWidth: 300, height: "auto" }} 
              />
            </Box>
          </Box>
        </Fade>
      )}

      {/* Right Panel - Forms */}
      <Box
        sx={{
          flex: isXs ? 1 : isMd ? 0.6 : 0.55,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3 },
          overflowY: 'auto',
        }}
      >
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: isLogin ? 420 : 500,
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              backgroundColor: colors.surface,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              my: 2,
            }}
          >
            {/* Mobile Logo */}
            {isXs && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img 
                  src={logo} 
                  alt="Alma Viajera" 
                  style={{ width: "100%", maxWidth: 180, height: "auto" }} 
                />
              </Box>
            )}

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: colors.primary,
                mb: 0.5,
                textAlign: 'center',
              }}
            >
              {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                mb: 3,
                textAlign: 'center',
              }}
            >
              {isLogin ? 'Inicia sesión para continuar' : 'Completa tus datos para registrarte'}
            </Typography>

            {/* Error Message */}
            {formError && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FECACA',
                }}
              >
                <Typography variant="body2" sx={{ color: '#DC2626', fontSize: '0.85rem' }}>
                  {formError}
                </Typography>
              </Box>
            )}

            {/* ============ LOGIN FORM ============ */}
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <FormField label="Usuario">
                  <TextField
                    fullWidth
                    placeholder="Ingresa tu usuario"
                    {...loginForm.register("usuario")}
                    error={!!loginForm.formState.errors.usuario}
                    helperText={loginForm.formState.errors.usuario?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineOutlinedIcon sx={{ color: colors.textSecondary }} />
                        </InputAdornment>
                      ),
                      sx: { height: 48 }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: colors.background,
                        '&:hover fieldset': { borderColor: colors.accent },
                        '&.Mui-focused fieldset': { borderColor: colors.accent },
                      },
                    }}
                  />
                </FormField>

                <FormField label="Contraseña">
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    {...loginForm.register("password")}
                    error={!!loginForm.formState.errors.password}
                    helperText={loginForm.formState.errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: colors.textSecondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { height: 48 }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: colors.background,
                        '&:hover fieldset': { borderColor: colors.accent },
                        '&.Mui-focused fieldset': { borderColor: colors.accent },
                      },
                    }}
                  />
                </FormField>

                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Button
                    onClick={() => navigate('/rePassword')}
                    sx={{
                      textTransform: 'none',
                      color: colors.accent,
                      fontWeight: 500,
                      fontSize: "0.85rem",
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={!isLoading && <LoginOutlinedIcon />}
                  sx={{
                    height: 48,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                    boxShadow: '0 4px 20px rgba(46, 170, 127, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(46, 170, 127, 0.4)',
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} sx={{ color: colors.surface }} /> : 'Iniciar Sesión'}
                </Button>

                {/* Link para registro */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                    ¿No tienes cuenta?
                  </Typography>
                  <Button
                    onClick={toggleForm}
                    sx={{
                      textTransform: 'none',
                      color: colors.accent,
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    Regístrate aquí
                  </Button>
                </Box>
              </form>
            ) : (
              /* ============ REGISTER FORM ============ */
              <Box>
                {/* Link para volver a login */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Button
                    onClick={toggleForm}
                    sx={{
                      textTransform: 'none',
                      color: colors.accent,
                      fontWeight: 500,
                      fontSize: "0.85rem",
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    Si ya estás registrado ingresa a tu cuenta
                  </Button>
                </Box>

                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  {/* Nombre */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: colors.textSecondary,
                        mb: 0.5,
                      }}
                    >
                      Nombre
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder=""
                      {...registerForm.register("nombre")}
                      error={!!registerForm.formState.errors.nombre}
                      helperText={registerForm.formState.errors.nombre?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          backgroundColor: colors.surface,
                          '& fieldset': { borderColor: colors.border || '#E0E0E0' },
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent },
                        },
                      }}
                    />
                  </Box>

                  {/* Apellidos en una fila */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography
                        component="label"
                        sx={{
                          display: "block",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: colors.textSecondary,
                          mb: 0.5,
                        }}
                      >
                        Apellido Paterno *
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        {...registerForm.register("apellidoPaterno")}
                        error={!!registerForm.formState.errors.apellidoPaterno}
                        helperText={registerForm.formState.errors.apellidoPaterno?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            backgroundColor: colors.surface,
                            '& fieldset': { borderColor: colors.border || '#E0E0E0' },
                            '&:hover fieldset': { borderColor: colors.accent },
                            '&.Mui-focused fieldset': { borderColor: colors.accent },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        component="label"
                        sx={{
                          display: "block",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: colors.textSecondary,
                          mb: 0.5,
                        }}
                      >
                        Apellido Materno
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        {...registerForm.register("apellidoMaterno")}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            backgroundColor: colors.surface,
                            '& fieldset': { borderColor: colors.border || '#E0E0E0' },
                            '&:hover fieldset': { borderColor: colors.accent },
                            '&.Mui-focused fieldset': { borderColor: colors.accent },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Correo electrónico */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: colors.textSecondary,
                        mb: 0.5,
                      }}
                    >
                      Correo electrónico *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      {...registerForm.register("email")}
                      error={!!registerForm.formState.errors.email}
                      helperText={registerForm.formState.errors.email?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          backgroundColor: colors.surface,
                          '& fieldset': { borderColor: colors.border || '#E0E0E0' },
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent },
                        },
                      }}
                    />
                  </Box>

                  {/* Contraseña */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: colors.textSecondary,
                        mb: 0.5,
                      }}
                    >
                      Contraseña
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                    type={showPassword ? "text" : "password"}
                      {...registerForm.register("password")}
                      error={!!registerForm.formState.errors.password}
                      helperText={registerForm.formState.errors.password?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                              {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          backgroundColor: colors.surface,
                          '& fieldset': { borderColor: colors.border || '#E0E0E0' },
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent },
                        },
                      }}
                    />
                  </Box>

                  {/* Repetir Contraseña */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: colors.textSecondary,
                        mb: 0.5,
                      }}
                    >
                      Repetir contraseña
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type={showConfirmPassword ? "text" : "password"}
                      {...registerForm.register("confirmPassword")}
                      error={!!registerForm.formState.errors.confirmPassword}
                      helperText={registerForm.formState.errors.confirmPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                              {showConfirmPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          backgroundColor: colors.surface,
                          '& fieldset': { borderColor: colors.border || '#E0E0E0' },
                          '&:hover fieldset': { borderColor: colors.accent },
                          '&.Mui-focused fieldset': { borderColor: colors.accent },
                        },
                      }}
                    />
                  </Box>

                  {/* Teléfono y Username en una fila */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography
                        component="label"
                        sx={{
                          display: "block",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: colors.textSecondary,
                          mb: 0.5,
                        }}
                      >
                        Teléfono *
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="10 dígitos"
                        {...registerForm.register("telefono")}
                        error={!!registerForm.formState.errors.telefono}
                        helperText={registerForm.formState.errors.telefono?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            backgroundColor: colors.surface,
                            '& fieldset': { borderColor: colors.border || '#E0E0E0' },
                            '&:hover fieldset': { borderColor: colors.accent },
                            '&.Mui-focused fieldset': { borderColor: colors.accent },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        component="label"
                        sx={{
                          display: "block",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: colors.textSecondary,
                          mb: 0.5,
                        }}
                      >
                        Usuario *
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        {...registerForm.register("username")}
                        error={!!registerForm.formState.errors.username}
                        helperText={registerForm.formState.errors.username?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            backgroundColor: colors.surface,
                            '& fieldset': { borderColor: colors.border || '#E0E0E0' },
                            '&:hover fieldset': { borderColor: colors.accent },
                            '&.Mui-focused fieldset': { borderColor: colors.accent },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Botón de Registro */}
                  <Button
                type="submit"
                    fullWidth
                    variant="contained"
                disabled={isLoading}
                    sx={{
                      mt: 1,
                      height: 44,
                      borderRadius: 2,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                      boxShadow: '0 4px 15px rgba(46, 170, 127, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(46, 170, 127, 0.4)',
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={22} sx={{ color: colors.surface }} /> : 'Registro'}
                  </Button>
            </form>
              </Box>
            )}

            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                © 2024 Alma Viajera. Todos los derechos reservados.
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
}
