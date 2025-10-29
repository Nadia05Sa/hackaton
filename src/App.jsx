import './App.css';
import React, { useEffect, useState } from 'react';
import { Divider, useTheme, useMediaQuery } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authService } from './service/authService';

import Sidebar from './components/Utils/Sidebar.jsx';

// Pantallas de login
import LoginPage from './components/LoginPage.jsx';
import RecuperarContraseña from './components/RecuperarContraseña.jsx';

// Pantallas de perfil
import Profile from './components/Screens/ProfileScreens/Profile.jsx';

// Pantallas de operador
import Operador from './components/Screens/OperadorScreens/Operador.jsx';
import ConsultarOperador from './components/Screens/OperadorScreens/ConsultarOperador.jsx';
import CrearOperador from './components/Screens/OperadorScreens/CrearOperador.jsx';

// Pantallas de Equipo
import Equipo from './components/Screens/EquiposScreens/Equipo.jsx';
import AgregarEquipo from './components/Screens/EquiposScreens/AgregarEquipo.jsx';
import ConsultarEquipo from './components/Screens/EquiposScreens/DatosEquipo.jsx';
import GestionarEquipos from './components/Screens/EquiposScreens/GestionarEquipos.jsx';
import SeleccionarEmpleado from './components/Screens/EquiposScreens/SeleccionarEmpleado.jsx';
import DatosAsignacion from './components/Screens/EquiposScreens/DatosAsignacion.jsx';
import ConsultarLista from './components/Screens/EquiposScreens/ConsultarLista.jsx';

// Pantallas de empleado
import Empleado from './components/Screens/EmpleadoScreens/Empleado.jsx';
import CrearEmpleado from './components/Screens/EmpleadoScreens/CrearEmpleado.jsx';
import ConsultarEmpleado from './components/Screens/EmpleadoScreens/ConsultarEmpleado.jsx';
import LogResponsivas from './components/Screens/EmpleadoScreens/LogResponsivas.jsx';

// Pantallas de asignacion
import Asignacion from './components/Screens/AsignacionesScreens/Asignacion.jsx';
import ConsultarAsignacion from './components/Screens/AsignacionesScreens/ConsultarAsignacion.jsx';

// Pantallas de peticion
import Validacion from './components/Screens/PeticionesScreens/Validacion.jsx';

// Componente de ruta protegida por rol
function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getRole();

  /*if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/no-autorizado" replace />;
  }*/
  return children;
}

function App() {
  useEffect(() => {
    // Initialize authentication on app startup
    authService.initializeAuth();
  }, []); // Cerrar correctamente el useEffect

  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const location = useLocation();

  // Rutas donde NO mostrar el sidebar
  const hideSidebarRoutes = ['/', '/rePassword', '/no-autorizado'];
  const showSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="app d-flex text " style={{ height: '100%' }}>
      {showSidebar && <Sidebar />}
      <div
        className={`flex-grow-1 ${showSidebar ? 'content' : ''} ${isXs && showSidebar ? 'isXsClass' : 'is100Class'}`}
      >
        <Routes>
          {/* Login público */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/rePassword" element={<RecuperarContraseña />} />

          {/* Rutas accesibles para ambos roles */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}><Profile /></ProtectedRoute>
          } />

          <Route path="/equipo" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}><Equipo /></ProtectedRoute>
          } >
            <Route
              path="gestionar"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <GestionarEquipos />
                </ProtectedRoute>
              }
            >
              <Route
                path="seleccionarEmpleado"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                    <SeleccionarEmpleado />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="datosAsignacion"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                      <DatosAsignacion />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="consultarLista"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                      <ConsultarLista />
                    </ProtectedRoute>
                  }></Route>
              </Route>
            </Route>
            <Route
              path="agregarEquipo"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <AgregarEquipo />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="consultarEquipo"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <ConsultarEquipo />
                </ProtectedRoute>
              }
            ></Route>
          </Route>

          <Route path="/empleado" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}><Empleado /></ProtectedRoute>
          } >
            <Route
              path="consultarEmpleado"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <ConsultarEmpleado />
                </ProtectedRoute>
              }>
              <Route
                path="logResponsivas"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                    <LogResponsivas />
                  </ProtectedRoute>
                }></Route>
            </Route>
            <Route
              path="crearEmpleado"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <CrearEmpleado />
                </ProtectedRoute>
              }>
            </Route>
          </Route>

          <Route path="/asignacion" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}><Asignacion /></ProtectedRoute>
          }>
            <Route
              path="consultarAsignacion"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <ConsultarAsignacion />
                </ProtectedRoute>
              }></Route>
          </Route>

          <Route path="/validacion" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}><Validacion /></ProtectedRoute>
          } >
            <Route
              path="consultarOperador"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <ConsultarOperador />
                </ProtectedRoute>
              }></Route>

            <Route
              path="consultarLista"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <ConsultarLista />
                </ProtectedRoute>
              }></Route>

            <Route
              path="consultarEmpleado"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <ConsultarEmpleado />
                </ProtectedRoute>
              }></Route>

            <Route
              path="consultarAsignacion"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <ConsultarAsignacion />
                </ProtectedRoute>
              }></Route>

          </Route>

          {/* Rutas solo para admin */}
          <Route path="/operador" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><Operador /></ProtectedRoute>
          } >
            <Route
              path="crearOperador"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <CrearOperador />
                </ProtectedRoute>
              }></Route>
            <Route
              path="consultarOperador"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ConsultarOperador />
                </ProtectedRoute>
              }></Route>
          </Route>


          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
