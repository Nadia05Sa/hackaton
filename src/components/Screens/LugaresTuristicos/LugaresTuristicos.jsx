import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Card, CardContent, CardMedia, CardActions, Grid, Chip, IconButton, TextField,
  InputAdornment, Rating, Skeleton, Fade, useTheme, useMediaQuery, Tooltip,
} from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StarIcon from "@mui/icons-material/Star";
import { authService } from "../../../service/authService";
import { lugaresTuristicosData } from "../../../data/datosEstaticos";
import Swal from "sweetalert2";

const colors = {
  primary: '#2C3E50',
  accent: '#2EAA7F',
  accentLight: '#4ECBA0',
  gold: '#D4A574',
  goldLight: '#E8C9A0',
  surface: '#FFFFFF',
  background: '#F5F7FA',
  textSecondary: '#7F8C8D',
  border: '#E0E6ED',
  error: '#E74C3C',
  favorite: '#E91E63',
};

let favoritosGuardados = new Set();

export default function LugaresTuristicos() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [favoritos, setFavoritos] = useState(favoritosGuardados);
  const rol = authService.getRole();
  const isAdmin = rol === "ADMIN";

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const lista = isAdmin ? lugaresTuristicosData.listar() : lugaresTuristicosData.listarActivos();
      setLugares(lista);
      setLoading(false);
    }, 400);
  }, [isAdmin]);

  const recargar = () => {
    const lista = isAdmin ? lugaresTuristicosData.listar() : lugaresTuristicosData.listarActivos();
    setLugares(lista);
  };

  const lugaresFiltrados = lugares.filter((lugar) =>
    lugar.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    lugar.ubicacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    lugar.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const toggleFavorito = (id) => {
    const nuevosFavoritos = new Set(favoritos);
    if (nuevosFavoritos.has(id)) nuevosFavoritos.delete(id);
    else nuevosFavoritos.add(id);
    favoritosGuardados = nuevosFavoritos;
    setFavoritos(nuevosFavoritos);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({ title: "¿Eliminar lugar?", icon: "warning", showCancelButton: true, confirmButtonColor: colors.error });
    if (result.isConfirmed) { lugaresTuristicosData.eliminar(id); recargar(); Swal.fire({ title: "¡Eliminado!", icon: "success", timer: 1500, showConfirmButton: false }); }
  };

  const handleCambiarEstado = (id) => { lugaresTuristicosData.cambiarEstado(id); recargar(); Swal.fire({ title: "¡Actualizado!", icon: "success", timer: 1500, showConfirmButton: false }); };

  const getCategoriaColor = (cat) => {
    const colores = { Arqueológico: colors.gold, Natural: '#27AE60', Cultural: '#3498DB', Gastronómico: '#E74C3C', Religioso: '#9B59B6' };
    return colores[cat] || colors.gold;
  };

  const LugarCard = ({ lugar }) => {
    const esFavorito = favoritos.has(lugar.id);

  return (
                  <Card
                    sx={{
          borderRadius: 3,
                      overflow: "hidden",
          border: `1px solid ${colors.border}`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          opacity: lugar.activo ? 1 : 0.6,
                      transition: "all 0.3s ease",
          "&:hover": { transform: isMobile ? "none" : "translateY(-6px)", boxShadow: "0 12px 40px rgba(44, 62, 80, 0.12)" },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
          <CardMedia component="img" height={isMobile ? 220 : 180} image={lugar.imagen} alt={lugar.nombre} sx={{ objectFit: "cover", cursor: "pointer" }} onClick={() => navigate(`/lugares-turisticos/detalle/${lugar.id}`)} />
          
          <Chip label={lugar.categoria} size="small" sx={{ position: "absolute", top: 12, left: 12, backgroundColor: getCategoriaColor(lugar.categoria), color: "white", fontWeight: 600, fontSize: "0.7rem", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
          
          <IconButton
                        size="small"
            onClick={(e) => { e.stopPropagation(); toggleFavorito(lugar.id); }}
            sx={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.9)", color: esFavorito ? colors.favorite : colors.textSecondary, width: 34, height: 34, "&:hover": { backgroundColor: "white", color: colors.favorite } }}
          >
            {esFavorito ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
          </IconButton>
          
          {!lugar.activo && <Chip label="Deshabilitado" size="small" sx={{ position: "absolute", bottom: 12, left: 12, backgroundColor: colors.error, color: "white", fontWeight: 600 }} />}
                    </Box>

        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: { xs: 2, sm: 2.5 }, cursor: "pointer" }} onClick={() => navigate(`/lugares-turisticos/detalle/${lugar.id}`)}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: { xs: "1.1rem", sm: "1.15rem" } }}>
                        {lugar.nombre}
                      </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
            <PlaceIcon sx={{ fontSize: 16, color: colors.gold }} />
            <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 500, fontSize: "0.85rem" }}>{lugar.ubicacion}</Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", flex: 1, lineHeight: 1.5 }}>
                        {lugar.descripcion}
                      </Typography>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Rating value={lugar.calificacion || 0} precision={0.1} size="small" readOnly sx={{ color: colors.gold }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>({lugar.numResenas || 0})</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Tooltip title="Horario">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: colors.textSecondary }} />
                  <Typography variant="caption" color="text.secondary">{lugar.horario?.split(" ")[0]}</Typography>
                      </Box>
              </Tooltip>
              <Chip
                icon={<AttachMoneyIcon sx={{ fontSize: 14, color: "inherit !important" }} />}
                label={lugar.costoEntrada > 0 ? `${lugar.costoEntrada}` : "Gratis"}
                          size="small"
                sx={{ backgroundColor: lugar.costoEntrada > 0 ? `${colors.gold}20` : `${colors.accent}15`, color: lugar.costoEntrada > 0 ? colors.gold : colors.accent, fontWeight: 600, height: 24, "& .MuiChip-label": { px: 0.75 } }}
                        />
            </Box>
                      </Box>
                    </CardContent>

        <CardActions sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5, pt: 0, gap: 1 }}>
          <Button fullWidth variant="contained" startIcon={<VisibilityIcon />} onClick={() => navigate(`/lugares-turisticos/detalle/${lugar.id}`)}
            sx={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, borderRadius: 2, height: 44, textTransform: "none", fontWeight: 600, boxShadow: "0 4px 12px rgba(212, 165, 116, 0.3)" }}>
            Ver Detalles
                      </Button>
                      {isAdmin && (
                        <>
              <IconButton size="small" onClick={() => navigate(`/lugares-turisticos/editar/${lugar.id}`)} sx={{ color: colors.primary, backgroundColor: colors.background }}><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => handleCambiarEstado(lugar.id)} sx={{ color: lugar.activo ? colors.accent : colors.textSecondary, backgroundColor: colors.background }}>{lugar.activo ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}</IconButton>
              <IconButton size="small" onClick={() => handleEliminar(lugar.id)} sx={{ color: colors.error, backgroundColor: colors.background }}><DeleteIcon fontSize="small" /></IconButton>
                        </>
                      )}
                    </CardActions>
                  </Card>
    );
  };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, mb: 3, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1.5, fontSize: { xs: "1.5rem", md: "2rem" } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlaceIcon sx={{ color: colors.surface, fontSize: 28 }} />
              </Box>
              Lugares Turísticos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, ml: { xs: 0, md: 7.5 } }}>
              {isAdmin ? "Gestiona los destinos turísticos" : "Descubre lugares increíbles para visitar"}
            </Typography>
          </Box>
          {isAdmin && (
            <Button variant="contained" startIcon={<AddLocationAltIcon />} onClick={() => navigate("/lugares-turisticos/agregar")} fullWidth={isMobile}
              sx={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, borderRadius: 2, px: 3, height: 48, textTransform: "none", fontWeight: 600 }}>
              Agregar Lugar
            </Button>
          )}
        </Box>

        <TextField fullWidth size="small" placeholder="Buscar lugares turísticos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: colors.textSecondary }} /></InputAdornment>, sx: { height: 48 } }}
          sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
          {loading ? "Cargando..." : `${lugaresFiltrados.length} lugares encontrados`}
        </Typography>

        <Grid container spacing={{ xs: 2.5, sm: 3 }}>
          {loading
            ? Array.from(new Array(4)).map((_, i) => <Grid item xs={12} sm={6} md={6} lg={4} key={i}><Card sx={{ borderRadius: 3, height: 380 }}><Skeleton variant="rectangular" height={180} /><CardContent><Skeleton variant="text" height={32} /></CardContent></Card></Grid>)
            : lugaresFiltrados.map((lugar) => <Grid item xs={12} sm={6} md={6} lg={4} key={lugar.id}><LugarCard lugar={lugar} /></Grid>)
          }
        </Grid>

        {!loading && lugaresFiltrados.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}><PlaceIcon sx={{ fontSize: 80, color: colors.border, mb: 2 }} /><Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>No se encontraron lugares</Typography></Box>
        )}
      </Box>
    </Fade>
  );
}
