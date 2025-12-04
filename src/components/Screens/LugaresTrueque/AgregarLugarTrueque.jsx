import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Card, CardContent, Grid, MenuItem, IconButton, Fade, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { lugaresTruequeData, catalogosData, IMAGENES_PLACEHOLDER } from "../../../data/datosEstaticos";

const colors = { primary: '#2C3E50', primaryLight: '#34495E', accent: '#2EAA7F', accentLight: '#4ECBA0', gold: '#D4A574', surface: '#FFFFFF', background: '#F5F7FA', textSecondary: '#7F8C8D', border: '#E0E6ED' };

const schema = yup.object().shape({
  nombre: yup.string().required("El nombre es requerido").min(3, "Mínimo 3 caracteres"),
  descripcion: yup.string().required("La descripción es requerida").min(20, "Mínimo 20 caracteres"),
  ubicacion: yup.string().required("La ubicación es requerida"),
  direccion: yup.string().required("La dirección es requerida"),
  tipo: yup.string().required("Selecciona un tipo"),
  horario: yup.string().required("El horario es requerido"),
});

const FormLabel = ({ children, required }) => (
  <Typography sx={{ display: "flex", alignItems: "center", fontSize: "1rem", fontWeight: 600, color: colors.primary, height: 44, mb: 0 }}>
    {children}{required && <span style={{ color: colors.accent, marginLeft: 4 }}>*</span>}
  </Typography>
);

export default function AgregarLugarTrueque() {
  const navigate = useNavigate();
  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => { setTipos(catalogosData.tiposLugarTrueque.listarActivos()); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setImagenPreview(reader.result); reader.readAsDataURL(file); }
  };

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      const tipoObj = tipos.find(t => t.id === parseInt(data.tipo));
      lugaresTruequeData.crear({
        nombre: data.nombre,
        descripcion: data.descripcion,
        ubicacion: data.ubicacion,
        direccion: data.direccion,
        tipo: tipoObj?.nombre || "Otro",
        tipoId: parseInt(data.tipo),
        horario: data.horario,
        imagen: imagenPreview || IMAGENES_PLACEHOLDER.trueque[Math.floor(Math.random() * IMAGENES_PLACEHOLDER.trueque.length)],
      });
      setLoading(false);
      Swal.fire({ title: "¡Lugar creado!", text: "El punto de trueque se ha agregado correctamente.", icon: "success", timer: 2000, showConfirmButton: false })
        .then(() => navigate("/lugares-trueque"));
    }, 500);
  };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4, maxWidth: 800, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ backgroundColor: colors.background, width: 44, height: 44 }}><ArrowBackIcon sx={{ color: colors.primary }} /></IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1 }}>
              <StorefrontIcon sx={{ fontSize: 28, color: colors.primary }} />Agregar Punto de Trueque
            </Typography>
            <Typography variant="body2" color="text.secondary">Registra un nuevo lugar para intercambios</Typography>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}` }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 3 }}>
                <FormLabel>Imagen del lugar</FormLabel>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <Box component="label" sx={{ width: "100%", maxWidth: 350, height: 180, borderRadius: 3, overflow: "hidden", backgroundColor: colors.background, display: "flex", alignItems: "center", justifyContent: "center", border: `2px dashed ${colors.border}`, cursor: "pointer", "&:hover": { borderColor: colors.primary } }}>
                    {imagenPreview ? <img src={imagenPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
                      <Box sx={{ textAlign: "center", color: colors.textSecondary }}><AddPhotoAlternateIcon sx={{ fontSize: 40 }} /><Typography variant="body2" sx={{ mt: 1 }}>Clic para subir imagen</Typography></Box>
                    )}
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={7}>
                  <FormLabel required>Nombre del lugar</FormLabel>
                  <TextField fullWidth placeholder="Ej: Tianguis del Chopo" {...register("nombre")} error={!!errors.nombre} helperText={errors.nombre?.message} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <FormLabel required>Tipo de lugar</FormLabel>
                  <TextField fullWidth select defaultValue="" {...register("tipo")} error={!!errors.tipo} helperText={errors.tipo?.message} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}>
                    <MenuItem value="" disabled>Seleccionar</MenuItem>
                    {tipos.map((tipo) => <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormLabel required>Ubicación</FormLabel>
                  <TextField fullWidth placeholder="Ej: Col. Buenavista, CDMX" {...register("ubicacion")} error={!!errors.ubicacion} helperText={errors.ubicacion?.message} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormLabel required>Horario</FormLabel>
                  <TextField fullWidth placeholder="Ej: Sábados 10:00 AM - 5:00 PM" {...register("horario")} error={!!errors.horario} helperText={errors.horario?.message} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />
                </Grid>
              </Grid>

              <Box sx={{ mb: 2 }}>
                <FormLabel required>Dirección completa</FormLabel>
                <TextField fullWidth placeholder="Calle, número, colonia, ciudad" {...register("direccion")} error={!!errors.direccion} helperText={errors.direccion?.message} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormLabel required>Descripción</FormLabel>
                <TextField fullWidth multiline rows={3} placeholder="Describe el lugar..." {...register("descripcion")} error={!!errors.descripcion} helperText={errors.descripcion?.message} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />
              </Box>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading} sx={{ borderRadius: 2, height: 48, px: 4, textTransform: "none", fontWeight: 600, borderColor: colors.border, color: colors.textSecondary }}>Cancelar</Button>
                <Button type="submit" variant="contained" startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} disabled={loading}
                  sx={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`, borderRadius: 2, height: 48, px: 4, textTransform: "none", fontWeight: 600 }}>
                  {loading ? "Guardando..." : "Guardar Lugar"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
}
