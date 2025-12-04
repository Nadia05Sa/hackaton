import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid, Chip, IconButton, Fade, Skeleton, Avatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import VerifiedIcon from "@mui/icons-material/Verified";
import SendIcon from "@mui/icons-material/Send";
import Swal from "sweetalert2";
import { productosData, propuestasData } from "../../../data/datosEstaticos";
import { authService } from "../../../service/authService";

const colors = { primary: '#2C3E50', accent: '#2EAA7F', accentLight: '#4ECBA0', gold: '#D4A574', goldLight: '#E8C9A0', surface: '#FFFFFF', background: '#F5F7FA', textSecondary: '#7F8C8D', border: '#E0E6ED' };

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const isAdmin = authService.getRole() === "ADMIN";

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducto(productosData.obtenerPorId(id));
      setLoading(false);
    }, 300);
  }, [id]);

  const handleProponer = () => {
    propuestasData.crear({
      productoOfrecido: { id: 1, nombre: "Mi producto", imagen: producto?.imagen },
      productoSolicitado: { id: producto?.id, nombre: producto?.nombre, imagen: producto?.imagen },
      usuarioOfrecido: authService.getUserNombre() || "Usuario",
      usuarioSolicitado: producto?.usuario,
      mensaje: mensaje || "Me interesa tu producto",
    });
    setDialogOpen(false);
    setMensaje("");
    Swal.fire({ title: "¡Propuesta enviada!", text: "El usuario recibirá tu propuesta de trueque.", icon: "success", timer: 2000, showConfirmButton: false });
  };

  if (loading) return <Box sx={{ p: 3 }}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3, mb: 2 }} /><Skeleton variant="text" height={40} /></Box>;
  if (!producto) return <Box sx={{ p: 3, textAlign: "center" }}><Typography variant="h6">Producto no encontrado</Typography><Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button></Box>;

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ backgroundColor: colors.background }}><ArrowBackIcon sx={{ color: colors.primary }} /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>Detalle del Producto</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md:6}}>
            <Card sx={{ borderRadius: 3, overflow: "hidden", border: `1px solid ${colors.border}` }}>
              <CardMedia component="img" height={350} image={producto.imagen} alt={producto.nombre} sx={{ objectFit: "cover" }} />
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md:6}}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip label={producto.categoria} sx={{ backgroundColor: colors.accent, color: "white", fontWeight: 600 }} />
                  <Chip label={producto.estado} variant="outlined" />
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, mb: 2 }}>{producto.nombre}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>{producto.descripcion}</Typography>

                <Box sx={{ backgroundColor: `${colors.accent}10`, borderRadius: 2, p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.textSecondary, mb: 0.5 }}>Busca intercambiar por:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.accent }}>{producto.intercambioPor}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Avatar sx={{ backgroundColor: `${colors.gold}30`, color: colors.gold }}>{producto.usuario?.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.primary, display: "flex", alignItems: "center", gap: 0.5 }}>{producto.usuario}<VerifiedIcon sx={{ fontSize: 16, color: colors.accent }} /></Typography>
                    <Typography variant="caption" color="text.secondary">Publicado el {producto.fechaCreacion}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                  <LocationOnIcon sx={{ color: colors.textSecondary }} />
                  <Typography variant="body2" color="text.secondary">{producto.ubicacion}</Typography>
                </Box>

                {!isAdmin && (
                  <Button fullWidth variant="contained" startIcon={<SwapHorizIcon />} onClick={() => setDialogOpen(true)}
                    sx={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, borderRadius: 2, height: 52, textTransform: "none", fontWeight: 600, fontSize: "1rem" }}>
                    Proponer Trueque
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700, color: colors.primary }}>Proponer Trueque</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Envía un mensaje al propietario explicando tu propuesta de intercambio.</Typography>
            <TextField fullWidth multiline rows={4} placeholder="Escribe tu mensaje..." value={mensaje} onChange={(e) => setMensaje(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: colors.textSecondary }}>Cancelar</Button>
            <Button variant="contained" startIcon={<SendIcon />} onClick={handleProponer} sx={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, borderRadius: 2 }}>Enviar Propuesta</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
