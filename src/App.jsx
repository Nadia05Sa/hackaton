import './App.css';
import React, { useEffect, useState } from 'react';
import { Divider, useTheme, useMediaQuery } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authService } from './service/authService';
import { DataProvider } from './context/DataContext';

import Sidebar from './components/Utils/Sidebar.jsx';

// Pantallas de login
import LoginPage from './components/LoginPage.jsx';
import RecuperarContraseña from './components/RecuperarContraseña.jsx';

// Pantallas de perfil
import Profile from './components/Screens/ProfileScreens/Profile.jsx';

// Pantallas de Dashboard/Estadísticas
import Dashboard from './components/Screens/DashboardScreens/Dashboard.jsx';

// Pantallas de Productos para Trueque
import Productos from './components/Screens/ProductosScreens/Productos.jsx';
import AgregarProducto from './components/Screens/ProductosScreens/AgregarProducto.jsx';
import DetalleProducto from './components/Screens/ProductosScreens/DetalleProducto.jsx';
import MisProductos from './components/Screens/ProductosScreens/MisProductos.jsx';

// Pantallas de Lugares Turísticos
import LugaresTuristicos from './components/Screens/LugaresTuristicos/LugaresTuristicos.jsx';
import AgregarLugarTuristico from './components/Screens/LugaresTuristicos/AgregarLugarTuristico.jsx';
import DetalleLugarTuristico from './components/Screens/LugaresTuristicos/DetalleLugarTuristico.jsx';
import EditarLugarTuristico from './components/Screens/LugaresTuristicos/EditarLugarTuristico.jsx';

// Pantallas de Lugares de Trueque
import LugaresTrueque from './components/Screens/LugaresTrueque/LugaresTrueque.jsx';
import AgregarLugarTrueque from './components/Screens/LugaresTrueque/AgregarLugarTrueque.jsx';
import DetalleLugarTrueque from './components/Screens/LugaresTrueque/DetalleLugarTrueque.jsx';
import EditarLugarTrueque from './components/Screens/LugaresTrueque/EditarLugarTrueque.jsx';

// Pantallas de Catálogos/Configuración (Admin)
import Catalogos from './components/Screens/CatalogosScreens/Catalogos.jsx';

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
  }, []);

  return (
    <DataProvider>
      <Router>
        <MainLayout />
      </Router>
    </DataProvider>
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
            <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}><Profile /></ProtectedRoute>
          } />

          {/* Dashboard - Solo Admin */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><Dashboard /></ProtectedRoute>
          } />

          {/* Productos para Trueque */}
          <Route path="/productos" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}><Productos /></ProtectedRoute>
          } />
          <Route path="/productos/agregar" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}><AgregarProducto /></ProtectedRoute>
          } />
          <Route path="/productos/detalle/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}><DetalleProducto /></ProtectedRoute>
          } />
          <Route path="/productos/mis-productos" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}><MisProductos /></ProtectedRoute>
          } />

          {/* Lugares Turísticos */}
          <Route path="/lugares-turisticos" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}><LugaresTuristicos /></ProtectedRoute>
          } />
          <Route path="/lugares-turisticos/agregar" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AgregarLugarTuristico /></ProtectedRoute>
          } />
          <Route path="/lugares-turisticos/detalle/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}><DetalleLugarTuristico /></ProtectedRoute>
          } />
          <Route path="/lugares-turisticos/editar/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><EditarLugarTuristico /></ProtectedRoute>
          } />

          {/* Lugares de Trueque */}
          <Route path="/lugares-trueque" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}><LugaresTrueque /></ProtectedRoute>
          } />
          <Route path="/lugares-trueque/agregar" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AgregarLugarTrueque /></ProtectedRoute>
          } />
          <Route path="/lugares-trueque/detalle/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USUARIO']}><DetalleLugarTrueque /></ProtectedRoute>
          } />
          <Route path="/lugares-trueque/editar/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><EditarLugarTrueque /></ProtectedRoute>
          } />

          {/* Catálogos/Configuración - Solo Admin */}
          <Route path="/catalogos" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><Catalogos /></ProtectedRoute>
          } />

          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
