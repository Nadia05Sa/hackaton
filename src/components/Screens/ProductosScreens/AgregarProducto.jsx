import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid, MenuItem, IconButton, Fade, Chip, Autocomplete, CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { productosData, catalogosData, lugaresTruequeData, IMAGENES_PLACEHOLDER } from "../../../data/datosEstaticos";

const colors = {
  primary: '#2C3E50', accent: '#2EAA7F', accentLight: '#4ECBA0', gold: '#D4A574', surface: '#FFFFFF', background: '#F5F7FA', textSecondary: '#7F8C8D', border: '#E0E6ED',
};

const schema = yup.object().shape({
  nombre: yup.string().required("El nombre es requerido"),
  descripcion: yup.string().required("La descripción es requerida").min(20, "Mínimo 20 caracteres"),
  categorias: yup.array().min(1, "Selecciona al menos una categoría"),
  estado: yup.string().required("Selecciona el estado del producto"),
  intercambioPor: yup.string().required("Indica qué te gustaría recibir a cambio"),
  ubicacion: yup.string().required("La ubicación es requerida"),
});

const FormLabel = ({ children, required }) => (
  <Typography sx={{ display: "flex", alignItems: "center", fontSize: "0.95rem", fontWeight: 600, color: colors.primary, height: 28, mb: 0.5 }}>
    {children}{required && <span style={{ color: colors.accent, marginLeft: 4 }}>*</span>}
  </Typography>
);

export default function AgregarProducto() {
  const navigate = useNavigate();
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [lugaresTrueque, setLugaresTrueque] = useState([]);

  const { register, handleSubmit, control, formState: { errors } } = useForm({ resolver: yupResolver(schema), defaultValues: { categorias: [] } });

  useEffect(() => {
    setCategorias(catalogosData.categorias.listarActivas());
    setEstados(catalogosData.estadosProducto.listarActivos());
    setLugaresTrueque(lugaresTruequeData.listarActivos());
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevas = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImagenes(prev => [...prev, ...nuevas].slice(0, 5));
  };

  const handleRemoveImage = (index) => setImagenes(prev => prev.filter((_, i) => i !== index));

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      const categoria = categorias.find(c => data.categorias.includes(c.nombre));
      const estado = estados.find(e => e.nombre === data.estado);
      productosData.crear({
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: categoria?.nombre || data.categorias[0],
        categoriaId: categoria?.id || 1,
        estado: estado?.nombre || data.estado,
        estadoId: estado?.id || 1,
        intercambioPor: data.intercambioPor,
        ubicacion: data.ubicacion,
        lugarTruequeId: data.lugarTrueque ? parseInt(data.lugarTrueque) : null,
        usuario: "Usuario Actual",
        usuarioId: 1,
        imagen: imagenes.length > 0 ? imagenes[0].preview : IMAGENES_PLACEHOLDER.productos[Math.floor(Math.random() * IMAGENES_PLACEHOLDER.productos.length)],
      });
      setLoading(false);
      Swal.fire({ title: "¡Producto creado!", text: "Tu producto ha sido publicado correctamente.", icon: "success", timer: 2000, showConfirmButton: false })
        .then(() => navigate("/productos"));
    }, 500);
  };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4, maxWidth: 900, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ backgroundColor: colors.background, width: 44, height: 44 }}><ArrowBackIcon sx={{ color: colors.primary }} /></IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1 }}>
              <SwapHorizIcon sx={{ fontSize: 28, color: colors.accent }} />Publicar Producto
            </Typography>
            <Typography variant="body2" color="text.secondary">Completa la información de tu producto para trueque</Typography>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}` }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Imágenes */}
              <Box sx={{ mb: 3 }}>
                <FormLabel>Imágenes del producto (máx. 5)</FormLabel>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                  {imagenes.map((img, index) => (
                    <Box key={index} sx={{ position: "relative", width: 100, height: 100, borderRadius: 2, overflow: "hidden" }}>
                      <img src={img.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <IconButton size="small" onClick={() => handleRemoveImage(index)} sx={{ position: "absolute", top: 2, right: 2, backgroundColor: "rgba(0,0,0,0.5)", color: "white", p: 0.5 }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Box>
                  ))}
                  {imagenes.length < 5 && (
                    <Box component="label" sx={{ width: 100, height: 100, borderRadius: 2, border: `2px dashed ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { borderColor: colors.accent } }}>
                      <AddPhotoAlternateIcon sx={{ fontSize: 32, color: colors.textSecondary }} />
                      <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
                    </Box>
                  )}
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <FormLabel required>Nombre del producto</FormLabel>
                  <TextField fullWidth placeholder="Ej: iPhone 13 Pro" {...register("nombre")} error={!!errors.nombre} helperText={errors.nombre?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background, height: 48 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormLabel required>Estado</FormLabel>
                  <TextField fullWidth select defaultValue="" {...register("estado")} error={!!errors.estado} helperText={errors.estado?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background, height: 48 } }}>
                    <MenuItem value="" disabled>Seleccionar</MenuItem>
                    {estados.map((est) => <MenuItem key={est.id} value={est.nombre}>{est.nombre}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12}}>
                  <FormLabel required>Categorías</FormLabel>
                  <Controller name="categorias" control={control} render={({ field }) => (
                    <Autocomplete multiple options={categorias.map(c => c.nombre)} value={field.value} onChange={(_, v) => field.onChange(v)}
                      renderTags={(value, getTagProps) => value.map((option, index) => <Chip label={option} {...getTagProps({ index })} size="small" sx={{ backgroundColor: `${colors.accent}20`, color: colors.accent }} />)}
                      renderInput={(params) => <TextField {...params} placeholder="Selecciona categorías" error={!!errors.categorias} helperText={errors.categorias?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />} />
                  )} />
                </Grid>
                <Grid size={{ xs: 12}}>
                  <FormLabel required>Descripción</FormLabel>
                  <TextField fullWidth multiline rows={3} placeholder="Describe tu producto..." {...register("descripcion")} error={!!errors.descripcion} helperText={errors.descripcion?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />
                </Grid>
                <Grid size={{ xs: 12}}>
                  <FormLabel required>¿Qué te gustaría recibir a cambio?</FormLabel>
                  <TextField fullWidth placeholder="Ej: MacBook, cámara, o cualquier oferta interesante" {...register("intercambioPor")} error={!!errors.intercambioPor} helperText={errors.intercambioPor?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background, height: 48 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormLabel required>Ubicación</FormLabel>
                  <TextField fullWidth placeholder="Ej: Ciudad de México" {...register("ubicacion")} error={!!errors.ubicacion} helperText={errors.ubicacion?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background, height: 48 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormLabel>Lugar preferido para trueque</FormLabel>
                  <TextField fullWidth select defaultValue="" {...register("lugarTrueque")}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background, height: 48 } }}>
                    <MenuItem value="">Sin preferencia</MenuItem>
                    {lugaresTrueque.map((lugar) => <MenuItem key={lugar.id} value={lugar.id}>{lugar.nombre}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: 2, height: 48, px: 4, textTransform: "none", fontWeight: 600, borderColor: colors.border, color: colors.textSecondary }}>Cancelar</Button>
                <Button type="submit" variant="contained" startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} disabled={loading}
                  sx={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, borderRadius: 2, height: 48, px: 4, textTransform: "none", fontWeight: 600 }}>
                  {loading ? "Publicando..." : "Publicar Producto"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
}
