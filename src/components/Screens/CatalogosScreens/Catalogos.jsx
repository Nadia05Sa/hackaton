import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Button, TextField, IconButton, Chip, Fade, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel, InputAdornment,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PlaceIcon from "@mui/icons-material/Place";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import Swal from "sweetalert2";
import { catalogosData } from "../../../data/datosEstaticos";

const colors = {
  primary: '#2C3E50', accent: '#2EAA7F', accentLight: '#4ECBA0', gold: '#D4A574', goldLight: '#E8C9A0',
  surface: '#FFFFFF', background: '#F5F7FA', textSecondary: '#7F8C8D', border: '#E0E6ED', error: '#E74C3C',
};

export default function Catalogos() {
  const [tabActual, setTabActual] = useState(0);
  const [datos, setDatos] = useState({ categorias: [], estadosProducto: [], tiposLugarTrueque: [], categoriasTuristicas: [] });
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", activo: true });

  const tabs = [
    { label: "Categorías Productos", icon: <CategoryIcon />, key: "categorias", api: catalogosData.categorias },
    { label: "Estados Producto", icon: <InventoryIcon />, key: "estadosProducto", api: catalogosData.estadosProducto },
    { label: "Tipos Lugar Trueque", icon: <StorefrontIcon />, key: "tiposLugarTrueque", api: catalogosData.tiposLugarTrueque },
    { label: "Categorías Turísticas", icon: <PlaceIcon />, key: "categoriasTuristicas", api: catalogosData.categoriasTuristicas },
  ];

  const cargarDatos = () => {
    setDatos({
      categorias: catalogosData.categorias.listar(),
      estadosProducto: catalogosData.estadosProducto.listar(),
      tiposLugarTrueque: catalogosData.tiposLugarTrueque.listar(),
      categoriasTuristicas: catalogosData.categoriasTuristicas.listar(),
    });
  };

  useEffect(() => { cargarDatos(); }, []);

  const catalogoActual = tabs[tabActual].key;
  const apiActual = tabs[tabActual].api;
  const datosActuales = (datos[catalogoActual] || []).filter((item) =>
    item.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || item.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleOpenDialog = (item = null) => {
    if (item) { setItemEditando(item); setFormData({ nombre: item.nombre, descripcion: item.descripcion || "", activo: item.activo !== false }); }
    else { setItemEditando(null); setFormData({ nombre: "", descripcion: "", activo: true }); }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setItemEditando(null); setFormData({ nombre: "", descripcion: "", activo: true }); };

  const handleSave = () => {
    if (!formData.nombre.trim()) { Swal.fire({ icon: "warning", title: "Campo requerido", text: "El nombre es obligatorio", confirmButtonColor: colors.accent }); return; }
    if (itemEditando) { apiActual.actualizar(itemEditando.id, formData); }
    else { apiActual.crear(formData); }
    cargarDatos();
    handleCloseDialog();
    Swal.fire({ icon: "success", title: itemEditando ? "Actualizado" : "Creado", timer: 1500, showConfirmButton: false });
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({ title: "¿Eliminar?", text: `¿Eliminar "${item.nombre}"?`, icon: "warning", showCancelButton: true, confirmButtonColor: colors.error });
    if (result.isConfirmed) { apiActual.eliminar(item.id); cargarDatos(); Swal.fire({ icon: "success", title: "Eliminado", timer: 1500, showConfirmButton: false }); }
  };

  const handleToggleActivo = (item) => { apiActual.actualizar(item.id, { ...item, activo: !item.activo }); cargarDatos(); };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1.5, fontSize: { xs: "1.5rem", md: "2rem" } }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SettingsIcon sx={{ color: colors.surface, fontSize: 28 }} />
            </Box>
            Gestión de Catálogos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, ml: { xs: 0, md: 7.5 } }}>Administra las categorías y opciones del sistema</Typography>
        </Box>

        <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}` }}>
          <Tabs value={tabActual} onChange={(e, v) => { setTabActual(v); setBusqueda(""); }} variant="scrollable" scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider", "& .MuiTab-root": { textTransform: "none", fontWeight: 600, "&.Mui-selected": { color: colors.accent } }, "& .MuiTabs-indicator": { backgroundColor: colors.accent } }}>
            {tabs.map((tab) => <Tab key={tab.key} icon={tab.icon} iconPosition="start" label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{tab.label}<Chip label={datos[tab.key]?.length || 0} size="small" sx={{ height: 20, fontSize: "0.7rem", backgroundColor: `${colors.accent}20`, color: colors.accent }} /></Box>} />)}
          </Tabs>

          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
              <TextField size="small" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                sx={{ minWidth: 250, "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
                sx={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}>
                Agregar Nuevo
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${colors.border}`, boxShadow: "none" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: colors.background }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.primary }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.primary }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.primary, textAlign: "center" }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.primary, textAlign: "center" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datosActuales.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No se encontraron registros</Typography></TableCell></TableRow>
                  ) : datosActuales.map((item) => (
                    <TableRow key={item.id} sx={{ "&:hover": { backgroundColor: `${colors.accent}08` }, opacity: item.activo !== false ? 1 : 0.6 }}>
                      <TableCell><Typography sx={{ fontWeight: 600, color: colors.primary }}>{item.nombre}</Typography></TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{item.descripcion || "-"}</Typography></TableCell>
                      <TableCell align="center">
                        <Chip label={item.activo !== false ? "Activo" : "Inactivo"} size="small" sx={{ backgroundColor: item.activo !== false ? `${colors.accent}20` : `${colors.textSecondary}20`, color: item.activo !== false ? colors.accent : colors.textSecondary, fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleOpenDialog(item)} sx={{ color: colors.primary }}><EditIcon fontSize="small" /></IconButton>
                        <Switch size="small" checked={item.activo !== false} onChange={() => handleToggleActivo(item)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: colors.accent }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: colors.accent } }} />
                        <IconButton size="small" onClick={() => handleDelete(item)} sx={{ color: colors.error }}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">Total: <strong>{datos[catalogoActual]?.length || 0}</strong></Typography>
              <Typography variant="body2" color="text.secondary">Activos: <strong>{(datos[catalogoActual] || []).filter((i) => i.activo !== false).length}</strong></Typography>
            </Box>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ pb: 1 }}><Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>{itemEditando ? "Editar Registro" : "Nuevo Registro"}</Typography></DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography sx={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: colors.primary, mb: 1 }}>Nombre <span style={{ color: colors.accent }}>*</span></Typography>
              <TextField fullWidth placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />
              <Typography sx={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: colors.primary, mb: 1 }}>Descripción</Typography>
              <TextField fullWidth multiline rows={3} placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }} />
              <FormControlLabel control={<Switch checked={formData.activo} onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: colors.accent } }} />}
                label={<Typography sx={{ fontWeight: 500, color: colors.primary }}>{formData.activo ? "Activo" : "Inactivo"}</Typography>} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseDialog} sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600, color: colors.textSecondary }}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}
              sx={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}>
              {itemEditando ? "Guardar" : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
