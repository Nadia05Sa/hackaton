import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Card, CardContent, Grid, MenuItem, IconButton, Fade, CircularProgress, Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PlaceIcon from "@mui/icons-material/Place";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { lugaresTuristicosData, catalogosData } from "../../../data/datosEstaticos";

const colors = { primary: '#2C3E50', accent: '#2EAA7F', gold: '#D4A574', goldLight: '#E8C9A0', surface: '#FFFFFF', background: '#F5F7FA', textSecondary: '#7F8C8D', border: '#E0E6ED' };

const schema = yup.object().shape({
  nombre: yup.string().required("Requerido"),
  descripcion: yup.string().required("Requerida").min(20, "Mínimo 20 caracteres"),
  ubicacion: yup.string().required("Requerida"),
  direccion: yup.string().required("Requerida"),
  categoria: yup.string().required("Selecciona una categoría"),
});

const FormLabel = ({ children, required }) => (
  <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: colors.primary, height: 44, display: "flex", alignItems: "center" }}>
    {children}{required && <span style={{ color: colors.gold, marginLeft: 4 }}>*</span>}
  </Typography>
);

export default function EditarLugarTuristico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lugar, setLugar] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    setCategorias(catalogosData.categoriasTuristicas.listarActivas());
    setTimeout(() => {
      const data = lugaresTuristicosData.obtenerPorId(id);
      if (data) {
        setLugar(data);
        setImagenPreview(data.imagen);
        reset({ nombre: data.nombre, descripcion: data.descripcion, ubicacion: data.ubicacion, direccion: data.direccion, categoria: data.categoriaId?.toString(), horario: data.horario, costoEntrada: data.costoEntrada });
      }
      setLoading(false);
    }, 300);
  }, [id, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setImagenPreview(reader.result); reader.readAsDataURL(file); }
  };

  const onSubmit = (data) => {
    setSaving(true);
    setTimeout(() => {
      const cat = categorias.find(c => c.id === parseInt(data.categoria));
      lugaresTuristicosData.actualizar(id, { ...data, categoria: cat?.nombre, categoriaId: parseInt(data.categoria), imagen: imagenPreview, costoEntrada: parseInt(data.costoEntrada) || 0 });
      setSaving(false);
      Swal.fire({ title: "¡Actualizado!", icon: "success", timer: 1500, showConfirmButton: false }).then(() => navigate("/lugares-turisticos"));
    }, 500);
  };

  if (loading) return <Box sx={{ p: 3 }}><Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 2 }} /><Skeleton variant="text" height={50} /></Box>;
  if (!lugar) return <Box sx={{ p: 3, textAlign: "center" }}><Typography variant="h6">Lugar no encontrado</Typography><Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button></Box>;

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4, maxWidth: 800, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ backgroundColor: colors.background }}><ArrowBackIcon sx={{ color: colors.primary }} /></IconButton>
          <Box><Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1 }}><PlaceIcon sx={{ color: colors.gold }} />Editar Lugar Turístico</Typography></Box>
        </Box>

        <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}` }}>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 3 }}>
                <FormLabel>Imagen</FormLabel>
                <Box component="label" sx={{ width: "100%", maxWidth: 350, height: 180, borderRadius: 3, overflow: "hidden", backgroundColor: colors.background, display: "flex", alignItems: "center", justifyContent: "center", border: `2px dashed ${colors.border}`, cursor: "pointer", mx: "auto" }}>
                  {imagenPreview ? <img src={imagenPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <AddPhotoAlternateIcon sx={{ fontSize: 40, color: colors.textSecondary }} />}
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm:5}}><FormLabel required>Nombre</FormLabel><TextField fullWidth {...register("nombre")} error={!!errors.nombre} helperText={errors.nombre?.message} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} /></Grid>
                <Grid size={{ xs: 12, sm:5}}><FormLabel required>Categoría</FormLabel><TextField fullWidth select {...register("categoria")} error={!!errors.categoria} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}>{categorias.map((c) => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}</TextField></Grid>
                <Grid size={{ xs: 12, sm:6}}><FormLabel required>Ubicación</FormLabel><TextField fullWidth {...register("ubicacion")} error={!!errors.ubicacion} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} /></Grid>
                <Grid size={{ xs: 12, sm:6}}><FormLabel required>Dirección</FormLabel><TextField fullWidth {...register("direccion")} error={!!errors.direccion} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} /></Grid>
                <Grid size={{ xs: 12}}><FormLabel required>Descripción</FormLabel><TextField fullWidth multiline rows={3} {...register("descripcion")} error={!!errors.descripcion} helperText={errors.descripcion?.message} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} /></Grid>
                <Grid size={{ xs: 12, sm:6}}><FormLabel>Horario</FormLabel><TextField fullWidth {...register("horario")} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} /></Grid>
                <Grid size={{ xs: 12, sm:6}}><FormLabel>Costo entrada</FormLabel><TextField fullWidth type="number" {...register("costoEntrada")} InputProps={{ sx: { height: 48 } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} /></Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving} sx={{ borderRadius: 2, height: 48, px: 4, color: colors.textSecondary }}>Cancelar</Button>
                <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} disabled={saving} sx={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, borderRadius: 2, height: 48, px: 4, fontWeight: 600 }}>{saving ? "Guardando..." : "Guardar"}</Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
}
