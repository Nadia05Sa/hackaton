import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Drawer as MuiDrawer, Divider, IconButton, useTheme, styled, Box, Tooltip, Fab, useMediaQuery } from "@mui/material";

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import iamatwo from "./../../assets/iamatwo.png";
import iamatwoLogo from "./../../assets/iamatwoLogo.png";
import { authService } from "./../../service/authService";
import MenuIcon from "@mui/icons-material/Menu";

// Medidas del drawer
const drawerWidth = 180;

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
  width: `64px`,
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
  const [open, setOpen] = useState(true);
  const rol = authService.getRole();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));

  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isXs) {
      setOpen(true);
      setActive(false);
    } else {
      setActive(true);
      if (isSm) setOpen(false);
    }
  }, [isXs]);

  const toggleDrawer = () => {

    if (isXs) {
      setActive(!active);
    } else {
      if (!isSm) setOpen(!open);
    }
  }

  const openMenu = () => {
    setActive(!active);
  }

  const navItems = [
    { to: "/profile", label: "Perfil", icon: <PersonOutlineOutlinedIcon size={26} /> },
    rol === "ADMIN" && { to: "/operador", label: "Operadores", icon: <ManageAccountsOutlinedIcon size={26} /> },
    { to: "/equipo", label: "Equipos", icon: <DesktopWindowsOutlinedIcon size={26} /> },
    { to: "/empleado", label: "Empleados", icon: <GroupsOutlinedIcon size={26} /> },
    { to: "/asignacion", label: "Asignaciones", icon: <AssignmentOutlinedIcon size={26} /> },
    { to: "/validacion", label: "Peticiones", icon: <LibraryAddCheckOutlinedIcon size={26} /> },
    { to: "/", label: "Salir", icon: <LogoutOutlinedIcon size={26} /> },
  ].filter(Boolean); // Filtra null si el rol no es admin

  return (
    <>
      {/* FAB flotante solo en xs */}
      {
        active ? (<Drawer
          variant="permanent"
          open={open}
          classes={{ paper: 'sidebar' }}
          sx={
            isXs
              ? {
                position: 'fixed',
                top: 24,
                left: 24,
                zIndex: 1,
              }
              : {
                zIndex: 1,
                position: 'relative',
              }
          }
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 1,
            }}
          >
            {/* Solo muestra el logo en pantallas grandes */}
            <IconButton onClick={toggleDrawer}>
              {open ? (
                <img src={iamatwo} alt="Logo" style={{ width: "35%" }} />
              ) : (
                <img src={iamatwoLogo} alt="Logo" style={{ width: "35%" }} />
              )}
            </IconButton>
          </Box>

          <Divider sx={{ borderColor: "#fff" }} />

          <ul style={{ listStyle: "none", padding: 0 }}>
            {navItems.map(({ to, label, icon }) => (
              <li key={label}>
                <Tooltip title={!open ? label : ""} placement="right">
                  <NavLink
                    to={to}
                    className="custom-btn w-100"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 16px",
                      gap: "10px",
                      justifyContent: open ? "flex-start" : "center",
                    }}
                  >
                    {icon}
                    {open && <span>{label}</span>}
                  </NavLink>
                </Tooltip>
              </li>
            ))}
          </ul>
        </Drawer>)
          : (isXs && (
            <Box>
              <Fab
                color="primary"
                aria-label="menu"
                onClick={openMenu}
                sx={{
                  position: 'fixed',
                  top: 24,
                  left: 24,
                  zIndex: 1,
                }}
              >
                <MenuIcon />
              </Fab>
            </Box>
          ))
      }
    </>
  );
};

export default Sidebar;
