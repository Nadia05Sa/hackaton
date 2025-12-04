import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Card, CardContent, CardMedia, CardActions, Grid, Chip, IconButton, TextField, InputAdornment, Fade, Skeleton,
  Avatar, Menu, MenuItem, ListItemIcon, Tabs, Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import Swal from "sweetalert2";
import { productosData, propuestasData } from "../../../data/datosEstaticos";

const colors = {
  primary: '#2C3E50', accent: '#2EAA7F', accentLight: '#4ECBA0', gold: '#D4A574', goldLight: '#E8C9A0',
  surface: '#FFFFFF', background: '#F5F7FA', textSecondary: '#7F8C8D', border: '#E0E6ED', error: '#E74C3C',
};

const CARD_HEIGHT = 430;
const CARD_IMAGE_HEIGHT = 180;

export default function MisProductos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [propuestas, setPropuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Simulamos que el usuario actual tiene los productos con usuarioId 2
      setProductos(productosData.listar().filter(p => p.usuarioId === 2 || p.usuarioId === 1));
      setPropuestas(propuestasData.listar());
      setLoading(false);
    }, 500);
  }, []);

  const recargar = () => {
    setProductos(productosData.listar().filter(p => p.usuarioId === 2 || p.usuarioId === 1));
    setPropuestas(propuestasData.listar());
  };

  const productosFiltrados = productos.filter((p) => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()));

  const handleMenuClick = (event, producto) => { setAnchorEl(event.currentTarget); setSelectedProduct(producto); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedProduct(null); };

  const handleToggleActivo = () => {
    productosData.cambiarEstado(selectedProduct.id);
    recargar();
    handleMenuClose();
    Swal.fire({ title: "¡Actualizado!", icon: "success", timer: 1500, showConfirmButton: false });
  };

  const handleDelete = async () => {
    const result = await Swal.fire({ title: "¿Eliminar?", icon: "warning", showCancelButton: true, confirmButtonColor: colors.error });
    if (result.isConfirmed) {
      productosData.eliminar(selectedProduct.id);
      recargar();
      Swal.fire({ title: "¡Eliminado!", icon: "success", timer: 1500, showConfirmButton: false });
    }
    handleMenuClose();
  };

  const getCategoriaColor = (cat) => {
    const colores = { Electrónica: colors.primary, Deportes: colors.accent, Música: "#8E44AD", Videojuegos: "#E74C3C", Fotografía: colors.gold, Hogar: "#16A085" };
    return colores[cat] || colors.accent;
  };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1.5, fontSize: { xs: "1.5rem", md: "2rem" } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <InventoryIcon sx={{ color: colors.surface, fontSize: 28 }} />
              </Box>
              Mis Productos y Trueques
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, ml: { xs: 0, md: 7.5 } }}>Gestiona tus productos e historial de trueques</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/productos/agregar")}
            sx={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, borderRadius: 3, px: 3, py: 1.5, textTransform: "none", fontWeight: 600 }}>
            Nuevo Producto
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, "& .Mui-selected": { color: `${colors.accent} !important` }, "& .MuiTabs-indicator": { backgroundColor: colors.accent } }}>
          <Tab label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><InventoryIcon sx={{ fontSize: 20 }} />Mis Productos<Chip label={productos.length} size="small" sx={{ ml: 1, height: 20, backgroundColor: `${colors.accent}20`, color: colors.accent }} /></Box>} />
          <Tab label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><SwapHorizIcon sx={{ fontSize: 20 }} />Mis Trueques<Chip label={propuestas.length} size="small" sx={{ ml: 1, height: 20, backgroundColor: `${colors.gold}30`, color: colors.gold }} /></Box>} />
        </Tabs>

        {tabValue === 0 && (
          <>
            <TextField size="small" placeholder="Buscar en mis productos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
              sx={{ mb: 3, minWidth: { xs: "100%", sm: 300 }, "& .MuiOutlinedInput-root": { borderRadius: 3, backgroundColor: colors.background } }} />

            <Grid container spacing={3}>
              {loading ? Array.from(new Array(4)).map((_, i) => <Grid item xs={12} sm={6} key={i}><Card sx={{ borderRadius: 4, height: CARD_HEIGHT }}><Skeleton variant="rectangular" height={CARD_IMAGE_HEIGHT} /><CardContent><Skeleton variant="text" height={32} /></CardContent></Card></Grid>)
                : productosFiltrados.map((producto) => (
                <Grid size={{ xs: 12, sm:6}} key={producto.id}>
                  <Card sx={{ borderRadius: 4, overflow: "hidden", height: CARD_HEIGHT, display: "flex", flexDirection: "column", opacity: producto.activo ? 1 : 0.7, border: `1px solid ${colors.border}`, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)" } }}>
                    <Box sx={{ position: "relative" }}>
                      <CardMedia component="img" height={CARD_IMAGE_HEIGHT} image={producto.imagen} alt={producto.nombre} sx={{ objectFit: "cover", filter: producto.activo ? "none" : "grayscale(50%)" }} />
                      <Chip label={producto.categoria} size="small" sx={{ position: "absolute", top: 12, left: 12, backgroundColor: getCategoriaColor(producto.categoria), color: "white", fontWeight: 600 }} />
                      {!producto.activo && <Chip icon={<VisibilityOffIcon sx={{ fontSize: 14, color: "white !important" }} />} label="Oculto" size="small" sx={{ position: "absolute", top: 12, right: 12, backgroundColor: colors.textSecondary, color: "white", fontWeight: 600 }} />}
                    </Box>
                    <CardContent sx={{ pb: 1, flex: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{producto.nombre}</Typography>
                        <IconButton size="small" onClick={(e) => handleMenuClick(e, producto)}><MoreVertIcon /></IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{producto.descripcion}</Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                        <Chip label={producto.estado} size="small" variant="outlined" sx={{ fontWeight: 500, borderColor: colors.accent, color: colors.accent }} />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button fullWidth variant="outlined" onClick={() => navigate(`/productos/detalle/${producto.id}`)} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: colors.accent, color: colors.accent }}>Ver Detalles</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {!loading && productosFiltrados.length === 0 && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <InventoryIcon sx={{ fontSize: 80, color: colors.background, mb: 2 }} />
                <Typography variant="h6" sx={{ color: colors.primary }}>No tienes productos publicados</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/productos/agregar")} sx={{ mt: 2, background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, borderRadius: 3, textTransform: "none", fontWeight: 600 }}>Publicar Producto</Button>
              </Box>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            {propuestas.map((propuesta) => (
              <Grid size={{ xs: 12, sm:6}} key={propuesta.id}>
                <Card sx={{ borderRadius: 4, border: `1px solid ${colors.border}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Chip icon={propuesta.estado === "ACEPTADO" ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <PendingIcon sx={{ fontSize: 14 }} />}
                        label={propuesta.estado === "ACEPTADO" ? "Completado" : "Pendiente"} size="small"
                        sx={{ backgroundColor: propuesta.estado === "ACEPTADO" ? `${colors.accent}20` : `${colors.gold}20`, color: propuesta.estado === "ACEPTADO" ? colors.accent : colors.gold, fontWeight: 600 }} />
                      <Typography variant="caption" color="text.secondary">{propuesta.fecha}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ flex: 1, textAlign: "center" }}>
                        <Box sx={{ width: 80, height: 80, borderRadius: 2, overflow: "hidden", mx: "auto", mb: 1 }}><img src={propuesta.productoOfrecido?.imagen} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{propuesta.productoOfrecido?.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">Tu producto</Typography>
                      </Box>
                      <SwapHorizIcon sx={{ fontSize: 32, color: colors.accent }} />
                      <Box sx={{ flex: 1, textAlign: "center" }}>
                        <Box sx={{ width: 80, height: 80, borderRadius: 2, overflow: "hidden", mx: "auto", mb: 1 }}><img src={propuesta.productoSolicitado?.imagen} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{propuesta.productoSolicitado?.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">de {propuesta.usuarioSolicitado}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {propuestas.length === 0 && (
              <Grid item xs={12}><Box sx={{ textAlign: "center", py: 8 }}><SwapHorizIcon sx={{ fontSize: 80, color: colors.background, mb: 2 }} /><Typography variant="h6" sx={{ color: colors.primary }}>No has realizado trueques aún</Typography></Box></Grid>
            )}
          </Grid>
        )}

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { borderRadius: 2 } }}>
          <MenuItem onClick={() => { navigate(`/productos/editar/${selectedProduct?.id}`); handleMenuClose(); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Editar</MenuItem>
          <MenuItem onClick={handleToggleActivo}><ListItemIcon>{selectedProduct?.activo ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</ListItemIcon>{selectedProduct?.activo ? "Ocultar" : "Mostrar"}</MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: colors.error }}><ListItemIcon><DeleteIcon fontSize="small" sx={{ color: colors.error }} /></ListItemIcon>Eliminar</MenuItem>
        </Menu>
      </Box>
    </Fade>
  );
}
