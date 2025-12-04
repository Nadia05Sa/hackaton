import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Card, CardContent, CardMedia, CardActions, Grid, Chip, TextField, InputAdornment,
  Fade, Skeleton, Avatar, MenuItem, Select, FormControl, useTheme, useMediaQuery, IconButton, Collapse, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { authService } from "../../../service/authService";
import { useData } from "../../../context/DataContext";
import Swal from "sweetalert2";

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
  favorite: '#E91E63',
};

// Estado de favoritos (persistente en sesión)
let favoritosGuardados = new Set();

export default function Productos() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Usar el contexto global
  const { productos: productosCtx, catalogos, version } = useData();
  
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [favoritos, setFavoritos] = useState(favoritosGuardados);
  
  const rol = authService.getRole();
  const isAdmin = rol === "ADMIN";

  // Cargar datos iniciales y cuando cambie la versión (datos globales)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const productosLista = isAdmin ? productosCtx.listar() : productosCtx.listarActivos();
      setProductos(productosLista);
      setCategorias(catalogos.categorias.listarActivas());
      setEstados(catalogos.estadosProducto.listarActivos());
      setLoading(false);
    }, 400);
  }, [isAdmin, version]); // Se re-ejecuta cuando version cambia

  const recargarProductos = () => {
    const productosLista = isAdmin ? productosCtx.listar() : productosCtx.listarActivos();
    setProductos(productosLista);
  };

  const productosFiltrados = productos.filter((producto) => {
    const matchBusqueda =
      producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro === "Todas" || producto.categoria === categoriaFiltro;
    const matchEstado = estadoFiltro === "Todos" || producto.estado === estadoFiltro;
    return matchBusqueda && matchCategoria && matchEstado;
  });

  const getCategoriaColor = (categoria) => {
    const colores = {
      Electrónica: '#3498DB',
      Deportes: colors.accent,
      Música: '#9B59B6',
      Videojuegos: '#E74C3C',
      Fotografía: colors.gold,
      Hogar: '#1ABC9C',
      Ropa: '#E91E63',
      Libros: '#795548',
    };
    return colores[categoria] || colors.accent;
  };

  const toggleFavorito = (id) => {
    const nuevosFavoritos = new Set(favoritos);
    if (nuevosFavoritos.has(id)) {
      nuevosFavoritos.delete(id);
    } else {
      nuevosFavoritos.add(id);
    }
    favoritosGuardados = nuevosFavoritos;
    setFavoritos(nuevosFavoritos);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: colors.error,
    });
    if (result.isConfirmed) {
      productosCtx.eliminar(id); // Usa el contexto - notifica cambio global
      Swal.fire({ title: "¡Eliminado!", icon: "success", timer: 1500, showConfirmButton: false });
    }
  };

  const handleCambiarEstado = (id) => {
    productosCtx.cambiarEstado(id); // Usa el contexto - notifica cambio global
    Swal.fire({ title: "¡Actualizado!", icon: "success", timer: 1500, showConfirmButton: false });
  };

  // Componente de Tarjeta de Producto
  const ProductCard = ({ producto }) => {
    const esFavorito = favoritos.has(producto.id);
    
    return (
      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${colors.border}`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          opacity: producto.activo ? 1 : 0.6,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: isMobile ? "none" : "translateY(-6px)",
            boxShadow: "0 12px 40px rgba(44, 62, 80, 0.12)",
            borderColor: colors.accent,
          },
        }}
      >
        {/* Imagen con badges */}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height={isMobile ? 220 : 180}
            image={producto.imagen}
            alt={producto.nombre}
            sx={{ objectFit: "cover", cursor: "pointer" }}
            onClick={() => navigate(`/productos/detalle/${producto.id}`)}
          />
          
          {/* Badge Categoría - Arriba izquierda */}
          <Chip
            label={producto.categoria}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: getCategoriaColor(producto.categoria),
              color: "white",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 26,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
          
          {/* Badge Estado - Arriba derecha */}
          <Chip
            label={producto.estado}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 50,
              backgroundColor: "rgba(255,255,255,0.95)",
              color: colors.primary,
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 26,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          
          {/* Botón Favorito - Arriba derecha */}
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); toggleFavorito(producto.id); }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255,255,255,0.9)",
              color: esFavorito ? colors.favorite : colors.textSecondary,
              width: 34,
              height: 34,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": { backgroundColor: "white", color: colors.favorite },
            }}
          >
            {esFavorito ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
          </IconButton>
          
          {/* Badge Deshabilitado */}
          {!producto.activo && (
            <Chip
              label="Deshabilitado"
              size="small"
              sx={{
                position: "absolute",
                bottom: 12,
                left: 12,
                backgroundColor: colors.error,
                color: "white",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          )}
        </Box>

        {/* Contenido */}
        <CardContent
          sx={{ flex: 1, display: "flex", flexDirection: "column", p: { xs: 2, sm: 2.5 }, cursor: "pointer" }}
          onClick={() => navigate(`/productos/detalle/${producto.id}`)}
        >
          {/* Título - Grande y en negrita */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: colors.primary,
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: { xs: "1.1rem", sm: "1.15rem" },
              lineHeight: 1.3,
            }}
          >
            {producto.nombre}
          </Typography>

          {/* Descripción */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.5,
              minHeight: 42,
              fontSize: "0.875rem",
            }}
          >
            {producto.descripcion}
          </Typography>

          {/* Busca intercambiar por - Con icono */}
          <Box
            sx={{
              backgroundColor: `${colors.accent}08`,
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              border: `1px solid ${colors.accent}20`,
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <CompareArrowsIcon sx={{ color: colors.accent, fontSize: 20, mt: 0.25 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.textSecondary, display: "block", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Busca intercambiar por
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: colors.accent,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {producto.intercambioPor}
              </Typography>
            </Box>
          </Box>

          {/* Ubicación y Vendedor - Prioridad en ubicación */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", gap: 1.5 }}>
            {/* Ubicación - Más prominente */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flex: 1,
                minWidth: 0,
                cursor: "pointer",
                "&:hover": { color: colors.accent },
              }}
            >
              <LocationOnIcon sx={{ fontSize: 18, color: colors.accent }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: colors.primary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "0.8rem",
                }}
              >
                {producto.ubicacion}
              </Typography>
            </Box>
            
            {/* Vendedor - Secundario pero clicable */}
            <Tooltip title="Ver perfil del vendedor">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  "&:hover .vendedor-nombre": { color: colors.accent },
                }}
                onClick={(e) => { e.stopPropagation(); /* Aquí iría la navegación al perfil */ }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: `${colors.gold}30`,
                    fontSize: "0.7rem",
                    color: colors.gold,
                    fontWeight: 600,
                  }}
                >
                  {producto.usuario?.charAt(0) || "U"}
                </Avatar>
                <Typography
                  className="vendedor-nombre"
                  variant="caption"
                  sx={{
                    color: colors.textSecondary,
                    fontSize: "0.75rem",
                    transition: "color 0.2s",
                    maxWidth: 80,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {producto.usuario}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </CardContent>

        {/* Acciones */}
        <CardActions sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5, pt: 0, gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/productos/detalle/${producto.id}`)}
            sx={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
              borderRadius: 2,
              height: 44,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(46, 170, 127, 0.25)",
              "&:hover": { boxShadow: "0 6px 16px rgba(46, 170, 127, 0.35)" },
            }}
          >
            Ver Detalles
          </Button>
          {isAdmin && (
            <>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); navigate(`/productos/editar/${producto.id}`); }}
                sx={{ color: colors.primary, backgroundColor: colors.background, "&:hover": { backgroundColor: colors.border } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleCambiarEstado(producto.id); }}
                sx={{ color: producto.activo ? colors.accent : colors.textSecondary, backgroundColor: colors.background }}
              >
                {producto.activo ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleEliminar(producto.id); }}
                sx={{ color: colors.error, backgroundColor: colors.background }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </CardActions>
      </Card>
    );
  };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, mb: 3, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1.5, fontSize: { xs: "1.5rem", md: "2rem" } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SwapHorizIcon sx={{ color: colors.surface, fontSize: 28 }} />
              </Box>
              Productos para Trueque
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, ml: { xs: 0, md: 7.5 } }}>
              {isAdmin ? "Gestiona los productos disponibles" : "Encuentra productos y propón un intercambio"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/productos/agregar")}
            fullWidth={isMobile}
            sx={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
              borderRadius: 2,
              px: 3,
              height: 48,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 15px rgba(46, 170, 127, 0.3)",
            }}
          >
            Publicar Producto
          </Button>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${colors.border}` }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: showFilters ? 2 : 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilterListIcon sx={{ color: colors.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.primary }}>Filtros</Typography>
              </Box>
              {isMobile && (
                <IconButton onClick={() => setShowFilters(!showFilters)} size="small">
                  {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>
            <Collapse in={showFilters || !isMobile}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm:6, md:5}}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar productos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: colors.textSecondary }} /></InputAdornment>, sx: { height: 44 } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm:3, md:3.5}}>
                  <FormControl fullWidth size="small">
                    <Select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} sx={{ height: 44, borderRadius: 2, backgroundColor: colors.background }}>
                      <MenuItem value="Todas">Todas las categorías</MenuItem>
                      {categorias.map((cat) => <MenuItem key={cat.id} value={cat.nombre}>{cat.nombre}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm:3, md:3.5}}>
                  <FormControl fullWidth size="small">
                    <Select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} sx={{ height: 44, borderRadius: 2, backgroundColor: colors.background }}>
                      <MenuItem value="Todos">Todos los estados</MenuItem>
                      {estados.map((est) => <MenuItem key={est.id} value={est.nombre}>{est.nombre}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
          {loading ? "Cargando..." : `${productosFiltrados.length} productos encontrados`}
        </Typography>

        {/* Grid Responsivo: 1 col móvil, 2 col tablet, 2-3 col desktop */}
        <Grid container spacing={{ xs: 2.5, sm: 3 }}>
          {loading
            ? Array.from(new Array(4)).map((_, index) => (
                <Grid size={{ xs: 12, sm:6, md:6, lg:4}} key={index}>
                  <Card sx={{ borderRadius: 3, height: 400 }}>
                    <Skeleton variant="rectangular" height={180} />
                    <CardContent>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={60} />
                      <Skeleton variant="text" width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : productosFiltrados.map((producto) => (
                <Grid  size={{ xs: 12, sm:6, md:6, lg:4}} key={producto.id}>
                  <ProductCard producto={producto} />
                </Grid>
              ))}
        </Grid>

        {/* Sin resultados */}
        {!loading && productosFiltrados.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CategoryIcon sx={{ fontSize: 80, color: colors.border, mb: 2 }} />
            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>No se encontraron productos</Typography>
            <Button
              variant="contained"
              onClick={() => { setBusqueda(""); setCategoriaFiltro("Todas"); setEstadoFiltro("Todos"); }}
              sx={{ mt: 2, background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Limpiar Filtros
            </Button>
          </Box>
        )}
      </Box>
    </Fade>
  );
}
