import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Drawer as MuiDrawer, 
  Divider, 
  IconButton, 
  useTheme, 
  styled, 
  Box, 
  Tooltip, 
  Fab, 
  useMediaQuery,
  Typography,
  Avatar
} from "@mui/material";

// Iconos
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

// Logo
import logoMenu from "./../../assets/LogoMenu.png";
import { authService } from "./../../service/authService";

// Colores de la paleta basados en el logo
const colors = {
  primary: '#2C3E50',
  primaryDark: '#1a252f',
  accent: '#2EAA7F',
  accentLight: '#4ECBA0',
  gold: '#D4A574',
  textLight: '#BDC3C7',
  surface: '#FFFFFF',
};

// Medidas del drawer
const drawerWidth = 280;
const drawerCollapsedWidth = 80;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: drawerCollapsedWidth,
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  })
);

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const rol = authService.getRole();
  const username = authService.getUsername();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isAdmin = rol === "ADMIN";

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isXs) {
      setOpen(true);
      setMobileOpen(false);
    } else if (isSm) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isXs, isSm]);

  const toggleDrawer = () => {
    if (isXs) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleMobileClose = () => {
    if (isXs) {
      setMobileOpen(false);
    }
  };

  // Menú para ADMIN - Incluye todas las funciones de gestión
  const adminNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: <BarChartOutlinedIcon />, section: "principal" },
    { type: "divider", label: "Gestión de Trueques" },
    { to: "/productos", label: "Ver Trueques", icon: <SwapHorizOutlinedIcon />, section: "trueques" },
    { type: "divider", label: "Lugares Turísticos" },
    { to: "/lugares-turisticos", label: "Ver Lugares", icon: <PlaceOutlinedIcon />, section: "turisticos" },
    { to: "/lugares-turisticos/agregar", label: "Agregar Lugar", icon: <AddLocationAltOutlinedIcon />, section: "turisticos" },
    { type: "divider", label: "Puntos de Trueque" },
    { to: "/lugares-trueque", label: "Ver Puntos", icon: <StorefrontOutlinedIcon />, section: "puntos" },
    { to: "/lugares-trueque/agregar", label: "Agregar Punto", icon: <AddBusinessOutlinedIcon />, section: "puntos" },
    { type: "divider", label: "Configuración" },
    { to: "/catalogos", label: "Catálogos", icon: <SettingsOutlinedIcon />, section: "config" },
    { type: "divider", label: "Mi Cuenta" },
    { to: "/profile", label: "Mi Perfil", icon: <PersonOutlineOutlinedIcon />, section: "cuenta" },
  ];

  // Menú para USUARIO
  const userNavItems = [
    { to: "/productos", label: "Trueques", icon: <SwapHorizOutlinedIcon /> },
    { to: "/productos/mis-productos", label: "Mis Productos", icon: <InventoryOutlinedIcon /> },
    { to: "/lugares-turisticos", label: "Lugares Turísticos", icon: <PlaceOutlinedIcon /> },
    { to: "/lugares-trueque", label: "Puntos de Trueque", icon: <StorefrontOutlinedIcon /> },
    { to: "/profile", label: "Mi Perfil", icon: <PersonOutlineOutlinedIcon /> },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const DrawerContent = () => (
    <>
      {/* Header del Sidebar con Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          minHeight: 80,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <img 
            src={logoMenu} 
            alt="Logo" 
            style={{ 
              width: open ? 50 : 45, 
              height: open ? 50 : 45,
              objectFit: "contain",
            }} 
          />
          {open && (
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: colors.surface,
                  fontSize: "1.1rem",
                  lineHeight: 1.2,
                }}
              >
                Alma
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: colors.accent,
                  fontSize: "1.1rem",
                  lineHeight: 1.2,
                }}
              >
                Viajera
              </Typography>
            </Box>
          )}
        </Box>
        
        {!isXs && (
          <IconButton 
            onClick={toggleDrawer}
            sx={{ 
              position: "absolute",
              right: 8,
              color: colors.textLight,
              "&:hover": { 
                backgroundColor: "rgba(255,255,255,0.1)",
                color: colors.surface 
              }
            }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
        
        {isXs && (
          <IconButton 
            onClick={handleMobileClose}
            sx={{ 
              position: "absolute",
              right: 8,
              color: colors.textLight,
              "&:hover": { 
                backgroundColor: "rgba(255,255,255,0.1)",
                color: colors.surface 
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      {open && username && (
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.accent} 100%)`,
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              {username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{ color: colors.surface, fontWeight: 600, fontSize: "0.95rem" }}
              >
                {username}
              </Typography>
              <Typography
                variant="caption"
                sx={{ 
                  color: isAdmin ? colors.gold : colors.accent, 
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.5px",
                }}
              >
                {isAdmin ? "Administrador" : "Usuario"}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <Box component="nav" sx={{ flex: 1, py: 1, overflowY: "auto" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {navItems.map((item, index) => {
            // Divisor/Sección
            if (item.type === "divider") {
              if (!open) return null;
              return (
                <li key={`divider-${index}`} style={{ margin: "12px 16px 8px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.textLight,
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {item.label}
                  </Typography>
                </li>
              );
            }

            const isActive = location.pathname === item.to;
            
            return (
              <li key={item.label} style={{ margin: "2px 12px" }}>
                <Tooltip title={!open ? item.label : ""} placement="right" arrow>
                  <NavLink
                    to={item.to}
                    onClick={handleMobileClose}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: open ? "12px 16px" : "12px",
                      gap: "12px",
                      justifyContent: open ? "flex-start" : "center",
                      textDecoration: "none",
                      borderRadius: "10px",
                      transition: "all 0.2s ease",
                      backgroundColor: isActive ? "rgba(46, 170, 127, 0.2)" : "transparent",
                      borderLeft: isActive ? `3px solid ${colors.accent}` : "3px solid transparent",
                      color: isActive ? colors.accentLight : colors.textLight,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = colors.surface;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = colors.textLight;
                      }
                    }}
                  >
                    {React.cloneElement(item.icon, { 
                      sx: { 
                        fontSize: 22,
                        color: isActive ? colors.accent : "inherit"
                      } 
                    })}
                    {open && (
                      <span style={{ 
                        fontSize: "0.9rem", 
                        fontWeight: isActive ? 600 : 500,
                      }}>
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2 }} />

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <Tooltip title={!open ? "Cerrar Sesión" : ""} placement="right" arrow>
          <NavLink
            to="/"
            onClick={handleMobileClose}
            style={{
              display: "flex",
              alignItems: "center",
              padding: open ? "12px 16px" : "12px",
              gap: "12px",
              justifyContent: open ? "flex-start" : "center",
              textDecoration: "none",
              borderRadius: "10px",
              transition: "all 0.2s ease",
              color: colors.textLight,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(231, 76, 60, 0.15)";
              e.currentTarget.style.color = "#E74C3C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.textLight;
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 22 }} />
            {open && (
              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                Cerrar Sesión
              </span>
            )}
          </NavLink>
        </Tooltip>
      </Box>
    </>
  );

  // Mobile FAB button
  if (isXs) {
    return (
      <>
        <Fab
          color="primary"
          aria-label="menu"
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            boxShadow: '0 4px 20px rgba(44, 62, 80, 0.3)',
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
            }
          }}
        >
          <MenuIcon />
        </Fab>

        <MuiDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: 300,
              background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
              boxSizing: 'border-box',
            },
          }}
        >
          <DrawerContent />
        </MuiDrawer>
      </>
    );
  }

  // Desktop/Tablet Drawer
  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        '& .MuiDrawer-paper': {
          background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(44, 62, 80, 0.15)',
        },
      }}
    >
      <DrawerContent />
    </Drawer>
  );
};

export default Sidebar;
