import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid, Chip, IconButton, Fade, Skeleton, Rating, Divider, TextField, Avatar } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StarIcon from "@mui/icons-material/Star";
import SendIcon from "@mui/icons-material/Send";
import Swal from "sweetalert2";
import { lugaresTuristicosData } from "../../../data/datosEstaticos";
import { authService } from "../../../service/authService";

const colors = { primary: '#2C3E50', accent: '#2EAA7F', gold: '#D4A574', goldLight: '#E8C9A0', surface: '#FFFFFF', background: '#F5F7FA', textSecondary: '#7F8C8D', border: '#E0E6ED' };

export default function DetalleLugarTuristico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lugar, setLugar] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaResena, setNuevaResena] = useState({ calificacion: 5, comentario: "" });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLugar(lugaresTuristicosData.obtenerPorId(id));
      setResenas(lugaresTuristicosData.obtenerResenas(id));
      setLoading(false);
    }, 300);
  }, [id]);

  const handleAgregarResena = () => {
    if (!nuevaResena.comentario.trim()) {
      Swal.fire({ icon: "warning", title: "Campo requerido", text: "Escribe un comentario" });
      return;
    }
    lugaresTuristicosData.crearResena(id, { ...nuevaResena, usuario: authService.getUserNombre() || "Usuario" });
    setResenas(lugaresTuristicosData.obtenerResenas(id));
    setLugar(lugaresTuristicosData.obtenerPorId(id));
    setNuevaResena({ calificacion: 5, comentario: "" });
    Swal.fire({ title: "¡Reseña agregada!", icon: "success", timer: 1500, showConfirmButton: false });
  };

  if (loading) return <Box sx={{ p: 3 }}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3, mb: 2 }} /></Box>;
  if (!lugar) return <Box sx={{ p: 3, textAlign: "center" }}><Typography variant="h6">Lugar no encontrado</Typography><Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button></Box>;

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ backgroundColor: colors.background }}><ArrowBackIcon sx={{ color: colors.primary }} /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>Detalle del Lugar Turístico</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <Card sx={{ borderRadius: 3, overflow: "hidden", border: `1px solid ${colors.border}`, mb: 3 }}>
              <CardMedia component="img" height={350} image={lugar.imagen} alt={lugar.nombre} sx={{ objectFit: "cover" }} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip label={lugar.categoria} sx={{ backgroundColor: colors.gold, color: "white", fontWeight: 600 }} />
                  <Chip label={lugar.costoEntrada > 0 ? `$${lugar.costoEntrada} MXN` : "Entrada Gratuita"} variant="outlined" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, mb: 1 }}>{lugar.nombre}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PlaceIcon sx={{ color: colors.textSecondary }} />
                    <Typography variant="body2" color="text.secondary">{lugar.ubicacion}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeIcon sx={{ color: colors.textSecondary }} />
                    <Typography variant="body2" color="text.secondary">{lugar.horario}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                  <Rating value={lugar.calificacion || 0} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary">({lugar.numResenas || 0} reseñas)</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>{lugar.descripcion}</Typography>
                <Typography variant="body2" sx={{ mt: 2, color: colors.textSecondary }}><strong>Dirección:</strong> {lugar.direccion}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 5 }}>
            {/* Nueva reseña */}
            <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}><StarIcon sx={{ color: colors.gold }} />Deja tu reseña</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Tu calificación</Typography>
                <Rating value={nuevaResena.calificacion} onChange={(_, v) => setNuevaResena({ ...nuevaResena, calificacion: v })} size="large" sx={{ mb: 2 }} />
                <TextField fullWidth multiline rows={3} placeholder="Escribe tu experiencia..." value={nuevaResena.comentario} onChange={(e) => setNuevaResena({ ...nuevaResena, comentario: e.target.value })} sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                <Button fullWidth variant="contained" startIcon={<SendIcon />} onClick={handleAgregarResena} sx={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, borderRadius: 2, height: 48, textTransform: "none", fontWeight: 600 }}>Publicar Reseña</Button>
              </CardContent>
            </Card>

            {/* Reseñas */}
            <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 2 }}>Reseñas ({resenas.length})</Typography>
                {resenas.length === 0 ? <Typography variant="body2" color="text.secondary">Aún no hay reseñas. ¡Sé el primero!</Typography>
                  : resenas.map((resena) => (
                    <Box key={resena.id} sx={{ mb: 2, pb: 2, borderBottom: `1px solid ${colors.border}` }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: `${colors.gold}30`, color: colors.gold, fontSize: "0.8rem" }}>{resena.usuario?.charAt(0)}</Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.primary }}>{resena.usuario}</Typography>
                          <Typography variant="caption" color="text.secondary">{resena.fecha}</Typography>
                        </Box>
                        <Rating value={resena.calificacion} size="small" readOnly />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{resena.comentario}</Typography>
                    </Box>
                  ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}
