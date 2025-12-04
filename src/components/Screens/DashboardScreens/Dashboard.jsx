import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Fade, Skeleton, Chip, Avatar, LinearProgress, Divider,
  ToggleButton, ToggleButtonGroup, useTheme, useMediaQuery, Tooltip, IconButton,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SpeedIcon from "@mui/icons-material/Speed";
import CategoryIcon from "@mui/icons-material/Category";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryArea, VictoryLine, VictoryTooltip } from "victory";
import { estadisticasData } from "../../../data/datosEstaticos";

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
  warning: '#F39C12',
  error: '#E74C3C',
  success: '#27AE60',
  info: '#3498DB',
};

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodoFiltro, setPeriodoFiltro] = useState('mes');

  const cargarDatos = () => {
    setLoading(true);
    setTimeout(() => {
      const resumen = estadisticasData.resumen();
      const truequesPorMes = estadisticasData.truequesPorMes();
      const categoriasPopulares = estadisticasData.categoriasPopulares();
      const lugaresActivos = estadisticasData.lugaresActivos();
      const ultimosTrueques = estadisticasData.ultimosTrueques();
      
      // Calcular promedio mensual
      const promedioMensual = truequesPorMes.length > 0 
        ? Math.round(truequesPorMes.reduce((acc, m) => acc + m.cantidad, 0) / truequesPorMes.length)
        : 0;
      
      // Calcular tasa de éxito
      const tasaExito = resumen.totalTrueques > 0 
        ? ((resumen.truequesCompletados / resumen.totalTrueques) * 100).toFixed(0)
        : 0;
      
      setStats({
        ...resumen,
        truequesPorMes,
        categoriasPopulares,
        lugaresActivos,
        ultimosTrueques,
        promedioMensual,
        tasaExito: parseFloat(tasaExito),
        // Trueques urgentes (pendientes que simulamos como urgentes)
        truequesPendientesUrgentes: Math.max(0, Math.floor(resumen.truequesPendientes / 2)),
      });
      
      setLoading(false);
    }, 400);
  };

  useEffect(() => { cargarDatos(); }, []);

  // Componente de Tarjeta de Métrica
  const MetricCard = ({ title, value, icon, color, tendencia, subtitle, destacado = false }) => (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${destacado ? color : colors.border}`,
        height: "100%",
        background: destacado ? `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)` : colors.surface,
        transition: "all 0.3s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: `0 8px 25px ${color}20` },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: destacado ? "rgba(255,255,255,0.8)" : colors.textSecondary, mb: 0.5, fontSize: "0.8rem" }}>
              {title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: destacado ? "white" : colors.primary, fontSize: { xs: "1.5rem", sm: "1.75rem" } }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
              {tendencia !== undefined && tendencia !== null && (
                <Chip
                  icon={tendencia >= 0 ? <TrendingUpIcon sx={{ fontSize: 14, color: "inherit !important" }} /> : <TrendingDownIcon sx={{ fontSize: 14, color: "inherit !important" }} />}
                  label={`${tendencia >= 0 ? '+' : ''}${tendencia}%`}
                  size="small"
                  sx={{
                    height: 22,
                    backgroundColor: destacado ? "rgba(255,255,255,0.2)" : (tendencia >= 0 ? `${colors.success}15` : `${colors.error}15`),
                    color: destacado ? "white" : (tendencia >= 0 ? colors.success : colors.error),
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              )}
            </Box>
            {subtitle && (
              <Typography variant="caption" sx={{ color: destacado ? "rgba(255,255,255,0.7)" : colors.textSecondary, mt: 0.5, display: "block" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ backgroundColor: destacado ? "rgba(255,255,255,0.2)" : `${color}15`, width: 48, height: 48 }}>
            {React.cloneElement(icon, { sx: { color: destacado ? "white" : color, fontSize: 24 } })}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Skeleton variant="text" width={300} height={50} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {Array.from(new Array(6)).map((_, i) => (
            <Grid item xs={6} sm={4} md={2} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ pb: 4 }}>
        {/* Header con filtro de tiempo */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1.5, fontSize: { xs: "1.5rem", md: "2rem" } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChartIcon sx={{ color: colors.surface, fontSize: 28 }} />
              </Box>
              Panel de Estadísticas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: { xs: 0, md: 7.5 } }}>
              Resumen de actividad • Datos en tiempo real
            </Typography>
          </Box>
          
          {/* Filtro de periodo */}
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <ToggleButtonGroup
              value={periodoFiltro}
              exclusive
              onChange={(_, v) => v && setPeriodoFiltro(v)}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  "&.Mui-selected": { backgroundColor: colors.accent, color: "white", "&:hover": { backgroundColor: colors.accentLight } },
                },
              }}
            >
              <ToggleButton value="semana">7 días</ToggleButton>
              <ToggleButton value="mes">30 días</ToggleButton>
              <ToggleButton value="año">Año</ToggleButton>
            </ToggleButtonGroup>
            <Tooltip title="Actualizar datos">
              <IconButton onClick={cargarDatos} sx={{ backgroundColor: colors.background, "&:hover": { backgroundColor: colors.border } }}>
                <RefreshIcon sx={{ color: colors.primary }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ===== SECCIÓN 1: MÉTRICAS DE TRUEQUES ===== */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" }}>
          📊 Actividad de Trueques
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <MetricCard 
              title="Total Trueques" 
              value={stats.totalTrueques} 
              icon={<SwapHorizIcon />} 
              color={colors.accent} 
              tendencia={stats.totalTrueques > 0 ? 12 : null}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <MetricCard 
              title="Completados" 
              value={stats.truequesCompletados} 
              icon={<CheckCircleIcon />} 
              color={colors.success}
              subtitle={`${stats.tasaExito}% de éxito`}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <MetricCard 
              title="Pendientes" 
              value={stats.truequesPendientes} 
              icon={<PendingIcon />} 
              color={colors.warning}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <MetricCard 
              title="Requieren Atención" 
              value={stats.truequesPendientesUrgentes} 
              icon={<WarningIcon />} 
              color={colors.error} 
              subtitle="> 7 días sin respuesta" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard 
              title="Tasa de Éxito" 
              value={`${stats.tasaExito}%`} 
              icon={<SpeedIcon />} 
              color={colors.accent} 
              destacado 
              subtitle="Meta: 80%" 
            />
          </Grid>
        </Grid>

        {/* ===== SECCIÓN 2: INVENTARIO Y COMUNIDAD ===== */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" }}>
          📦 Inventario y Comunidad
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <MetricCard 
              title="Productos Activos" 
              value={stats.totalProductos} 
              icon={<InventoryIcon />} 
              color={colors.info}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard 
              title="Usuarios" 
              value={stats.totalUsuarios} 
              icon={<PeopleIcon />} 
              color={colors.gold}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard 
              title="Puntos de Trueque" 
              value={stats.totalLugaresTrueque} 
              icon={<StorefrontIcon />} 
              color={colors.primary}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard 
              title="Lugares Turísticos" 
              value={stats.totalLugaresTuristicos} 
              icon={<PlaceIcon />} 
              color={colors.gold}
            />
          </Grid>
        </Grid>

        {/* ===== SECCIÓN 3: GRÁFICOS ===== */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Gráfico de Línea - Trueques por Mes */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, height: "100%" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: colors.accent }} />
                    Trueques por Mes
                  </Typography>
                  <Chip 
                    label={`Promedio: ${stats.promedioMensual}`} 
                    size="small" 
                    sx={{ backgroundColor: `${colors.accent}15`, color: colors.accent, fontWeight: 600 }} 
                  />
                </Box>
                <Box sx={{ height: { xs: 250, sm: 280 } }}>
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={20}
                    height={isMobile ? 250 : 280}
                    padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
                  >
                    <VictoryAxis 
                      tickValues={stats.truequesPorMes.map((d) => d.mes)} 
                      style={{ tickLabels: { fontSize: 10, fill: colors.textSecondary } }} 
                    />
                    <VictoryAxis 
                      dependentAxis 
                      style={{ 
                        tickLabels: { fontSize: 10, fill: colors.textSecondary }, 
                        grid: { stroke: colors.border, strokeDasharray: "4" } 
                      }} 
                    />
                    {/* Línea de promedio */}
                    <VictoryLine 
                      data={stats.truequesPorMes.map(d => ({ ...d, cantidad: stats.promedioMensual }))} 
                      x="mes" 
                      y="cantidad" 
                      style={{ data: { stroke: colors.gold, strokeWidth: 2, strokeDasharray: "6,4" } }} 
                    />
                    {/* Área principal */}
                    <VictoryArea
                      data={stats.truequesPorMes}
                      x="mes"
                      y="cantidad"
                      style={{ data: { fill: `${colors.accent}20`, stroke: colors.accent, strokeWidth: 3 } }}
                      labels={({ datum }) => datum.cantidad}
                      labelComponent={<VictoryTooltip style={{ fontSize: 10 }} flyoutStyle={{ fill: "white", stroke: colors.border }} />}
                      animate={{ duration: 500 }}
                    />
                  </VictoryChart>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 20, height: 3, backgroundColor: colors.accent, borderRadius: 1 }} />
                    <Typography variant="caption" color="text.secondary">Trueques</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 20, height: 2, backgroundColor: colors.gold, borderRadius: 1 }} />
                    <Typography variant="caption" color="text.secondary">Promedio</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de Barras Horizontal - Categorías Populares */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, height: "100%" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <CategoryIcon sx={{ color: colors.gold }} />
                  Categorías con Productos
                </Typography>
                {stats.categoriasPopulares.length > 0 ? (
                  <Box sx={{ height: { xs: 250, sm: 280 } }}>
                    <VictoryChart
                      theme={VictoryTheme.material}
                      horizontal
                      domainPadding={15}
                      height={isMobile ? 250 : 280}
                      padding={{ top: 10, bottom: 30, left: 90, right: 40 }}
                    >
                      <VictoryAxis 
                        style={{ 
                          tickLabels: { fontSize: 10, fill: colors.primary, fontWeight: 500 }, 
                          axis: { stroke: "transparent" } 
                        }} 
                      />
                      <VictoryAxis 
                        dependentAxis 
                        style={{ 
                          tickLabels: { fontSize: 9, fill: colors.textSecondary }, 
                          grid: { stroke: colors.border, strokeDasharray: "4" } 
                        }} 
                      />
                      <VictoryBar
                        data={stats.categoriasPopulares.sort((a, b) => a.cantidad - b.cantidad)}
                        x="categoria"
                        y="cantidad"
                        style={{
                          data: {
                            fill: ({ index }) => [colors.accent, colors.primary, colors.gold, colors.info, colors.success][index % 5],
                            width: 18,
                          },
                        }}
                        cornerRadius={{ top: 4, bottom: 4 }}
                        labels={({ datum }) => datum.cantidad}
                        labelComponent={<VictoryTooltip style={{ fontSize: 10 }} flyoutStyle={{ fill: "white", stroke: colors.border }} />}
                        animate={{ duration: 500 }}
                      />
                    </VictoryChart>
                  </Box>
                ) : (
                  <Box sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography color="text.secondary">No hay datos de categorías</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ===== SECCIÓN 4: LUGARES Y ÚLTIMOS TRUEQUES ===== */}
        <Grid container spacing={3}>
          {/* Lugares Más Activos */}
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, height: "100%" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                  <StorefrontIcon sx={{ color: colors.primary }} />
                  Puntos de Trueque Activos
                </Typography>
                {stats.lugaresActivos.length > 0 ? (
                  stats.lugaresActivos.slice(0, 5).map((lugar, i) => (
                    <Box key={i} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              backgroundColor: `${[colors.accent, colors.gold, colors.info, colors.primary, colors.success][i]}20`, 
                              fontSize: "0.75rem", 
                              fontWeight: 700, 
                              color: [colors.accent, colors.gold, colors.info, colors.primary, colors.success][i] 
                            }}
                          >
                            {i + 1}
                          </Avatar>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              color: colors.primary, 
                              maxWidth: 180, 
                              overflow: "hidden", 
                              textOverflow: "ellipsis", 
                              whiteSpace: "nowrap" 
                            }}
                          >
                            {lugar.nombre}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${lugar.trueques} trueques`} 
                          size="small" 
                          sx={{ backgroundColor: colors.background, color: colors.textSecondary, fontWeight: 500, height: 24 }} 
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(lugar.trueques / (stats.lugaresActivos[0]?.trueques || 1)) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: colors.border,
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: [colors.accent, colors.gold, colors.info, colors.primary, colors.success][i],
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    No hay puntos de trueque activos
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Últimos Trueques */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, height: "100%" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon sx={{ color: colors.accent }} />
                    Últimos Trueques
                  </Typography>
                  <Chip 
                    icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />} 
                    label="Recientes" 
                    size="small" 
                    sx={{ backgroundColor: `${colors.accent}15`, color: colors.accent, fontWeight: 600 }} 
                  />
                </Box>
                
                {stats.ultimosTrueques.length > 0 ? (
                  stats.ultimosTrueques.map((trueque, i) => (
                    <Box key={i}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, flexWrap: "wrap", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                          <Avatar 
                            sx={{ 
                              backgroundColor: trueque.estado === "ACEPTADO" ? `${colors.success}15` : `${colors.warning}15`, 
                              color: trueque.estado === "ACEPTADO" ? colors.success : colors.warning, 
                              width: 40, 
                              height: 40 
                            }}
                          >
                            {trueque.estado === "ACEPTADO" ? <CheckCircleIcon sx={{ fontSize: 20 }} /> : <PendingIcon sx={{ fontSize: 20 }} />}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {trueque.producto1} <SwapHorizIcon sx={{ fontSize: 14, mx: 0.5, verticalAlign: "middle", color: colors.textSecondary }} /> {trueque.producto2}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {trueque.usuario1} ↔ {trueque.usuario2}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                          <Chip
                            label={trueque.estado === "ACEPTADO" ? "Completado" : trueque.estado === "RECHAZADO" ? "Rechazado" : "Pendiente"}
                            size="small"
                            sx={{
                              backgroundColor: trueque.estado === "ACEPTADO" ? colors.success : trueque.estado === "RECHAZADO" ? colors.error : colors.warning,
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                              height: 24,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {trueque.fecha}
                          </Typography>
                        </Box>
                      </Box>
                      {i < stats.ultimosTrueques.length - 1 && <Divider sx={{ borderColor: colors.border }} />}
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    No hay trueques registrados
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}
