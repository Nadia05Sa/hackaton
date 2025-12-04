import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, Grid, Avatar, Fade, CircularProgress,
  Chip, Paper, Tooltip, useTheme, useMediaQuery, IconButton, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EventIcon from '@mui/icons-material/Event';
import VerifiedIcon from '@mui/icons-material/Verified';
import { authService } from '../../../service/authService';
import { productosData, propuestasData } from '../../../data/datosEstaticos';
import Swal from 'sweetalert2';

const colors = {
  primary: '#2C3E50',
  primaryLight: '#34495E',
  accent: '#2EAA7F',
  accentLight: '#4ECBA0',
  gold: '#D4A574',
  goldLight: '#E8C9A0',
  surface: '#FFFFFF',
  background: '#F5F7FA',
  textSecondary: '#7F8C8D',
  border: '#E0E6ED',
  error: '#E74C3C',
};

// Usuario guardado en memoria (persistente durante la sesión)
let usuarioGuardado = null;

export default function Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [stats, setStats] = useState({ productos: 0, trueques: 0, reservas: 0 });
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      if (!usuarioGuardado) {
        usuarioGuardado = {
          id: 1,
          username: authService.getUsername() || 'usuario',
          nombre: authService.getUserNombre() || 'Usuario',
          apellidoPaterno: 'Viajero',
          apellidoMaterno: 'Demo',
          email: 'usuario@almaviajera.com',
          telefono: '55 1234 5678',
          direccion: 'Av. Principal #123',
          ciudad: 'Ciudad de México',
          codigoPostal: '06600',
          rol: authService.getRole() || 'USUARIO',
          activo: true,
          fechaRegistro: '2024-01-15',
          foto: null,
        };
      }
      
      setUsuario(usuarioGuardado);
      setFormData({
        nombre: usuarioGuardado.nombre,
        apellidoPaterno: usuarioGuardado.apellidoPaterno,
        apellidoMaterno: usuarioGuardado.apellidoMaterno,
        email: usuarioGuardado.email,
        telefono: usuarioGuardado.telefono,
        direccion: usuarioGuardado.direccion || '',
        ciudad: usuarioGuardado.ciudad || '',
        codigoPostal: usuarioGuardado.codigoPostal || '',
      });
      
      const misProductos = productosData.listar().filter(p => p.usuarioId === 1 || p.usuarioId === 2);
      const propuestas = propuestasData.listar();
      setStats({
        productos: misProductos.length,
        trueques: propuestas.length,
        reservas: propuestas.filter(p => p.estado === 'ACEPTADO').length,
      });
      
      setLoading(false);
    }, 400);
  }, []);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCancelEdit = () => {
    setEditando(false);
    setPreview(null);
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        apellidoPaterno: usuario.apellidoPaterno,
        apellidoMaterno: usuario.apellidoMaterno,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion || '',
        ciudad: usuario.ciudad || '',
        codigoPostal: usuario.codigoPostal || '',
      });
    }
  };

  const handleSave = () => {
    if (!formData.nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'El nombre es obligatorio', confirmButtonColor: colors.accent });
      return;
    }
    if (!formData.email.includes('@')) {
      Swal.fire({ icon: 'warning', title: 'Email inválido', text: 'Ingresa un correo válido', confirmButtonColor: colors.accent });
      return;
    }

    setSaving(true);
    setTimeout(() => {
      usuarioGuardado = { ...usuarioGuardado, ...formData, foto: preview || usuarioGuardado.foto };
      setUsuario(usuarioGuardado);
      setEditando(false);
      setSaving(false);
      Swal.fire({ icon: 'success', title: '¡Perfil actualizado!', timer: 1500, showConfirmButton: false });
    }, 600);
  };

  const handleCambiarContrasena = () => authService.cambiarContrasenaConSwal();

  const getImageSrc = () => {
    if (preview) return preview;
    if (usuario?.foto) return usuario.foto;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario?.nombre || 'U')}&background=2EAA7F&color=fff&size=200&bold=true&font-size=0.4`;
  };

  // Componente de tarjeta de métrica
  const MetricCard = ({ icon, value, label, color }) => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        textAlign: 'center',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          borderColor: color,
        },
      }}
    >
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: 2,
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 1.5,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, mb: 0.5, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
        {label}
      </Typography>
    </Paper>
  );

  // Componente de campo de formulario
  const FormField = ({ label, value, onChange, disabled, icon, type = 'text', placeholder, fullWidth = true, gridSize = 6 }) => (
    <Grid item xs={12} sm={gridSize}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <TextField
        fullWidth={fullWidth}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        InputProps={{
          startAdornment: icon ? <Box sx={{ mr: 1.5, color: disabled ? colors.textSecondary : colors.accent, display: 'flex' }}>{icon}</Box> : null,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: disabled ? colors.background : colors.surface,
            height: 48,
            transition: 'all 0.2s ease',
            '&:hover fieldset': !disabled ? { borderColor: colors.accent } : {},
            '&.Mui-focused fieldset': { borderColor: colors.accent, borderWidth: 2 },
          },
          '& .MuiOutlinedInput-input': {
            py: 1.5,
          },
        }}
      />
    </Grid>
  );

  if (loading) {
    return (
      <Fade in={true}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
          <CircularProgress sx={{ color: colors.accent }} size={48} />
          <Typography variant="body2" color="text.secondary">Cargando perfil...</Typography>
        </Box>
      </Fade>
    );
  }

  const nombreCompleto = `${usuario?.nombre || ''} ${usuario?.apellidoPaterno || ''}`.trim();

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ pb: 4, maxWidth: 1000, mx: 'auto' }}>
        
        {/* ===== SECCIÓN 1: ENCABEZADO/PERFIL ===== */}
        <Card
          sx={{
            borderRadius: 4,
            border: `1px solid ${colors.border}`,
            mb: 3,
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: { xs: 2, sm: 3 },
              }}
            >
              {/* Avatar */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  src={getImageSrc()}
                  alt={nombreCompleto}
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: { xs: 100, sm: 120 },
                    border: `4px solid ${colors.accent}`,
                    boxShadow: '0 4px 20px rgba(46, 170, 127, 0.25)',
                  }}
                />
                {editando && (
                  <label htmlFor="foto-upload">
                    <input type="file" accept="image/*" id="foto-upload" style={{ display: 'none' }} onChange={handleImageChange} />
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        backgroundColor: colors.accent,
                        color: 'white',
                        width: 36,
                        height: 36,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        '&:hover': { backgroundColor: colors.accentLight },
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </label>
                )}
                {!editando && (
                  <VerifiedIcon
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      color: colors.gold,
                      fontSize: 28,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </Box>

              {/* Info del usuario */}
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, minWidth: 0 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: colors.primary,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  }}
                >
                  {nombreCompleto}
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 1.5 }}>
                  @{usuario?.username}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <Chip
                    icon={<BadgeIcon sx={{ fontSize: 16 }} />}
                    label={usuario?.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
                    size="small"
                    sx={{
                      backgroundColor: usuario?.rol === 'ADMIN' ? `${colors.gold}20` : `${colors.accent}15`,
                      color: usuario?.rol === 'ADMIN' ? colors.gold : colors.accent,
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: 'inherit' },
                    }}
                  />
                  <Chip
                    label={`Miembro desde ${usuario?.fechaRegistro}`}
                    size="small"
                    sx={{ backgroundColor: colors.background, color: colors.textSecondary, fontWeight: 500 }}
                  />
                </Box>
              </Box>

              {/* Botón Editar */}
              <Box sx={{ flexShrink: 0, display: 'flex', gap: 1.5, mt: { xs: 1, sm: 0 } }}>
                {!editando ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditando(true)}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                      borderRadius: 2.5,
                      px: 3,
                      py: 1.25,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 15px rgba(46, 170, 127, 0.3)',
                      '&:hover': { boxShadow: '0 6px 20px rgba(46, 170, 127, 0.4)' },
                    }}
                  >
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                      onClick={handleSave}
                      disabled={saving}
                      sx={{
                        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                        borderRadius: 2.5,
                        px: 2.5,
                        py: 1.25,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {saving ? 'Guardando' : 'Guardar'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                      disabled={saving}
                      sx={{
                        borderColor: colors.border,
                        color: colors.textSecondary,
                        borderRadius: 2.5,
                        px: 2.5,
                        py: 1.25,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { borderColor: colors.textSecondary, backgroundColor: colors.background },
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ===== SECCIÓN 2: MÉTRICAS/TARJETAS ===== */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <MetricCard
              icon={<InventoryIcon sx={{ fontSize: 26, color: colors.accent }} />}
              value={stats.productos}
              label="Productos"
              color={colors.accent}
            />
          </Grid>
          <Grid item xs={4}>
            <MetricCard
              icon={<SwapHorizIcon sx={{ fontSize: 26, color: colors.primary }} />}
              value={stats.trueques}
              label="Trueques"
              color={colors.primary}
            />
          </Grid>
          <Grid item xs={4}>
            <MetricCard
              icon={<EventIcon sx={{ fontSize: 26, color: colors.gold }} />}
              value={stats.reservas}
              label="Reservas"
              color={colors.gold}
            />
          </Grid>
        </Grid>

        {/* ===== SECCIÓN 3: INFORMACIÓN PERSONAL ===== */}
        <Card sx={{ borderRadius: 4, border: `1px solid ${colors.border}` }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: colors.accent }} />
                Información Personal
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<LockIcon sx={{ fontSize: 16 }} />}
                onClick={handleCambiarContrasena}
                sx={{
                  borderColor: colors.gold,
                  color: colors.gold,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { borderColor: colors.gold, backgroundColor: `${colors.gold}10` },
                }}
              >
                Cambiar Contraseña
              </Button>
            </Box>

            <Grid container spacing={2.5}>
              {/* Fila 1: Nombre completo */}
              <FormField
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                disabled={!editando}
                icon={<PersonIcon sx={{ fontSize: 20 }} />}
                placeholder="Tu nombre"
                gridSize={4}
              />
              <FormField
                label="Apellido Paterno"
                value={formData.apellidoPaterno}
                onChange={(e) => handleInputChange('apellidoPaterno', e.target.value)}
                disabled={!editando}
                placeholder="Apellido paterno"
                gridSize={4}
              />
              <FormField
                label="Apellido Materno"
                value={formData.apellidoMaterno}
                onChange={(e) => handleInputChange('apellidoMaterno', e.target.value)}
                disabled={!editando}
                placeholder="Apellido materno"
                gridSize={4}
              />

              {/* Fila 2: Contacto */}
              <FormField
                label="Correo Electrónico"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!editando}
                icon={<EmailIcon sx={{ fontSize: 20 }} />}
                type="email"
                placeholder="correo@ejemplo.com"
                gridSize={6}
              />
              <FormField
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                disabled={!editando}
                icon={<PhoneIcon sx={{ fontSize: 20 }} />}
                placeholder="55 1234 5678"
                gridSize={6}
              />

              {/* Fila 3: Dirección */}
              <FormField
                label="Dirección"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                disabled={!editando}
                placeholder="Calle y número"
                gridSize={6}
              />
              <FormField
                label="Ciudad"
                value={formData.ciudad}
                onChange={(e) => handleInputChange('ciudad', e.target.value)}
                disabled={!editando}
                placeholder="Ciudad"
                gridSize={3}
              />
              <FormField
                label="Código Postal"
                value={formData.codigoPostal}
                onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                disabled={!editando}
                placeholder="00000"
                gridSize={3}
              />

              {/* Divider */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {/* Fila 4: Datos de cuenta (solo lectura) */}
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Usuario
                </Typography>
                <TextField
                  fullWidth
                  value={usuario?.username || ''}
                  disabled
                  InputProps={{
                    startAdornment: <BadgeIcon sx={{ mr: 1.5, color: colors.textSecondary, fontSize: 20 }} />,
                    endAdornment: (
                      <Tooltip title="No se puede modificar">
                        <LockIcon sx={{ color: colors.border, fontSize: 18 }} />
                      </Tooltip>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: colors.background,
                      height: 48,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Rol en el Sistema
                </Typography>
                <TextField
                  fullWidth
                  value={usuario?.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  disabled
                  InputProps={{
                    endAdornment: (
                      <Chip
                        label={usuario?.rol}
                        size="small"
                        sx={{
                          backgroundColor: usuario?.rol === 'ADMIN' ? `${colors.gold}20` : `${colors.accent}15`,
                          color: usuario?.rol === 'ADMIN' ? colors.gold : colors.accent,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: colors.background,
                      height: 48,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
}
