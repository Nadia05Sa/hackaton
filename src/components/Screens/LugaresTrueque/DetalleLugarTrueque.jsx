import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid, Chip, IconButton, Fade, Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DirectionsIcon from "@mui/icons-material/Directions";
import { lugaresTruequeData } from "../../../data/datosEstaticos";

const colors = { primary: '#2C3E50', primaryLight: '#34495E', accent: '#2EAA7F', gold: '#D4A574', surface: '#FFFFFF', background: '#F5F7FA', textSecondary: '#7F8C8D', border: '#E0E6ED' };

export default function DetalleLugarTrueque() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lugar, setLugar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLugar(lugaresTruequeData.obtenerPorId(id));
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) return <Box sx={{ p: 3 }}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3, mb: 2 }} /></Box>;
  if (!lugar) return <Box sx={{ p: 3, textAlign: "center" }}><Typography variant="h6">Lugar no encontrado</Typography><Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button></Box>;

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4, maxWidth: 900, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ backgroundColor: colors.background }}><ArrowBackIcon sx={{ color: colors.primary }} /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>Detalle del Punto de Trueque</Typography>
        </Box>

        <Card sx={{ borderRadius: 3, overflow: "hidden", border: `1px solid ${colors.border}` }}>
          <CardMedia component="img" height={350} image={lugar.imagen} alt={lugar.nombre} sx={{ objectFit: "cover" }} />
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Chip icon={<StorefrontIcon sx={{ color: "white !important" }} />} label={lugar.tipo} sx={{ backgroundColor: colors.primary, color: "white", fontWeight: 600 }} />
              <Chip label={lugar.activo ? "Activo" : "Inactivo"} variant="outlined" sx={{ borderColor: lugar.activo ? colors.accent : colors.textSecondary, color: lugar.activo ? colors.accent : colors.textSecondary }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, mb: 2 }}>{lugar.nombre}</Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, backgroundColor: colors.background, p: 2, borderRadius: 2 }}>
                  <LocationOnIcon sx={{ color: colors.accent }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ubicación</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>{lugar.ubicacion}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, backgroundColor: colors.background, p: 2, borderRadius: 2 }}>
                  <AccessTimeIcon sx={{ color: colors.gold }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Horario</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>{lugar.horario}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary, mb: 1 }}>Descripción</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>{lugar.descripcion}</Typography>

            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary, mb: 1 }}>Dirección</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>{lugar.direccion}</Typography>

            <Button variant="contained" startIcon={<DirectionsIcon />} onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(lugar.direccion)}`, "_blank")}
              sx={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`, borderRadius: 2, height: 48, textTransform: "none", fontWeight: 600 }}>
              Ver en Google Maps
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
}
