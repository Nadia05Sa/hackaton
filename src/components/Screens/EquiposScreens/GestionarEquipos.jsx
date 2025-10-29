import React, { useState, useEffect } from 'react';
import { Divider, Box, Button, Typography, InputAdornment, TextField, useTheme, useMediaQuery, IconButton, TablePagination, Icon } from '@mui/material';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CachedIcon from '@mui/icons-material/Cached';
import CircularProgress from '@mui/material/CircularProgress';

import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../../service/authService';
import iamaLogo from './../../../assets/iamalogo.png';
import { set } from 'react-hook-form';

const headCells = [
  { id: 'no', numeric: true, center: true, xs: false, disablePadding: false, label: 'No.' },
  { id: 'tipo', numeric: false, center: false, xs: true, disablePadding: false, label: 'Tipo' },
  { id: 'no.serie', numeric: false, center: false, xs: true, disablePadding: false, label: 'No. Serie' },
  { id: 'marca', numeric: false, center: false, xs: false, disablePadding: false, label: 'Marca' },
  { id: 'modelo', numeric: true, center: false, xs: true, disablePadding: false, label: 'No. Modelo' },
  { id: 'seleccionar', numeric: false, center: true, xs: false, disablePadding: false, label: 'Seleccionar' },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  if (orderBy === 'no') {
    return order === 'desc'
      ? (a, b, aIndex, bIndex) => bIndex - aIndex
      : (a, b, aIndex, bIndex) => aIndex - bIndex;
  }
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, Xs } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (

          (((!Xs) || (Xs && headCell.xs)) && <TableCell
            key={headCell.id}
            align={headCell.center ? 'center' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id !== 'opciones' && headCell.id !== 'responsiva' ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>)
        ))}
      </TableRow>
    </TableHead>
  );
}

const GestionarEquipos = () => {
  const urlHost = "http://localhost:8080"

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const [busqueda, setBusqueda] = useState('');

  const [listaEquipos, setListaEquipos] = useState([]);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);

  const [stateUpdate, setStateUpdate] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('no');
  const [dense, setDense] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDonar, setIsLoadingDonar] = useState(false);
  const [isLoadingDesechar, setIsLoadingDesechar] = useState(false);

  // Configuracion para la tabla 
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const equiposFiltrados = (stateUpdate ? equiposSeleccionados : listaEquipos || []).filter((equipo) => {
    const coincideBusqueda = busqueda ? (
      (equipo.tipo?.toLowerCase() || '') +
      ' ' +
      (equipo.marca?.toLowerCase() || '') +
      ' ' +
      (equipo.modelo?.toLowerCase() || '') +
      ' ' +
      (equipo.numero_serie?.toLowerCase() || '')
    ).includes(busqueda.toLowerCase())
      : true;
    return coincideBusqueda;
  });

  const visibleRows = React.useMemo(() => {
    let sortedRows;
    if (orderBy === 'no') {
      // Ordena por el índice original
      const indexed = equiposFiltrados.map((row, idx) => ({ row, idx }));
      sortedRows = indexed
        .sort((a, b) => getComparator(order, orderBy)(a.row, b.row, a.idx, b.idx))
        .map(({ row }) => row);
    } else {
      sortedRows = [...equiposFiltrados].sort(getComparator(order, orderBy));
    }
    return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, page, rowsPerPage, equiposFiltrados]);

  const fetchEquipos = async () => {
    try {
      const response = await axios.get(`${urlHost}/api/equipos/activos`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
      });

      const allEquipos = Array.isArray(response.data.equiposResponse.equipo)
        ? response.data.equiposResponse.equipo
        : [];

      setListaEquipos(allEquipos);
      setEquiposSeleccionados([])
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos. Inténtalo de nuevo.");
    }
  };

  const handleSeleccionarEquipo = (equipo) => {
    if (stateUpdate) {
      if (!listaEquipos.some(e => e.id === equipo.id)) {
        setListaEquipos(prev => [...prev, equipo]);
        setEquiposSeleccionados(prev => prev.filter(e => e.id !== equipo.id));
      }
    } else {
      setListaEquipos(prev => prev.filter(e => e.id !== equipo.id));
      setEquiposSeleccionados(prev => [...prev, equipo]);
    }
  };


  const Resetear = () => {
    fetchEquipos();
  }

  const crearListaEquipos = (tipo) => {


    if (equiposSeleccionados.length === 0) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Debe seleccionar al menos un equipo.',
        icon: 'warning',
      });
      return;
    }


    const ListaEquiposCreada = async () => {
      const idsList = equiposSeleccionados.map(e => e.id);
      const idsInvalidos = idsList.filter(id => typeof id !== 'number' || isNaN(id));
      if (idsInvalidos.length > 0) {
        Swal.fire({
          title: 'Error',
          text: `IDs inválidos: ${idsInvalidos.join(', ')}`,
          icon: 'error',
        });
        return;
      }
      if (tipo === "ASIGNACION") {
        navigate('seleccionarEmpleado', { state: { idsLista: idsList } });
      } else {
        try {
          const formData = new FormData();
          formData.append("id", new Blob([JSON.stringify(idsList)], { type: "application/json" }));

          let pdfBlob = null;
          let pdfFileName = "";

          // si la lista no es para asignacion crear el archivo con la lista de equipos
          if (tipo !== "ASIGNACION") {
            const doc = new jsPDF();
            const columnas = ["EQUIPO", "MARCA", "MODELO", "NO. SERIE"];
            const filas = equiposSeleccionados.map((equipo) => [
              equipo.tipo || '', equipo.marca || '', equipo.modelo || '', equipo.numero_serie || ''
            ]);

            var logo = new Image();
            logo.src = iamaLogo;
            doc.addImage(logo, 'JPEG', 15, 8, 43, 18);
            doc.setFontSize(12);
            doc.text(new Date().toLocaleDateString('es-MX', {
              day: 'numeric', month: 'long', year: 'numeric'
            }), 160, 20, { align: 'left' });

            doc.setFontSize(16);
            doc.text(`LISTA DE EQUIPOS TECNOLÓGICOS PARA ${tipo}`, 105, 35, { align: 'center' });

            autoTable(doc, {
              startY: 45,
              head: [columnas],
              body: filas,
              styles: { halign: 'center' },
              headStyles: { fillColor: [22, 160, 133] },
            });

            pdfBlob = doc.output('blob');
            const now = new Date();
            const fechaHora = now.getFullYear() +
              '-' + String(now.getMonth() + 1).padStart(2, '0') +
              '-' + String(now.getDate()).padStart(2, '0') +
              '_' + String(now.getHours()).padStart(2, '0') +
              '-' + String(now.getMinutes()).padStart(2, '0') +
              '-' + String(now.getSeconds()).padStart(2, '0');

            pdfFileName = `lista_equipos_${tipo.toLowerCase()}_${fechaHora}.pdf`;
            formData.append("file", pdfBlob, pdfFileName);
          } else {
            formData.append("file", new Blob([], { type: "application/octet-stream" }));
          }

          const response = await axios.post(`${urlHost}/api/equipos/${tipo}`, formData, {
            headers: {
              'Authorization': `Bearer ${authService.getToken()}`,
              'Content-Type': 'multipart/form-data'
            }
          });

          if (response.status === 200) {
            Swal.fire({
              title: 'Éxito',
              text: response.data.metadata[0].date,
              icon: 'success',
            }).then(() => {
              if (pdfBlob && pdfFileName) {
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = pdfFileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }
              if (tipo !== "ASIGNACION") {
                navigate(0);
              }
            });
          }
        } catch (err) {
          Swal.fire({
            title: 'Error',
            text: err.response?.data?.metadata?.[0]?.date || 'Error al crear la lista de equipos.',
            icon: 'error',
          });
        }
      }
      setIsLoading(false);
      setIsLoadingDonar(false);
      setIsLoadingDesechar(false);
    }

    if (equiposSeleccionados.length > 0) {
      if (tipo === "ASIGNACION") {
        ListaEquiposCreada();
      } else {
        Swal.fire({
          title: '¿Estas seguro de ' + (tipo === "DONACION" ? 'donar' : 'desechar') + ' estos equipos?',
          text: 'Esta accion no se puede deshacer.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: "Si, continuar",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            if (tipo === "DONACION") {
              setIsLoadingDonar(true);
            } else {
              setIsLoadingDesechar(true);
            }
            setIsLoading(true);
            ListaEquiposCreada();
          }
        });
      }
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, [location.pathname]);


  if (location.pathname.includes('seleccionarEmpleado')) {
    return <Outlet />;
  }
  return (
    <>
      <Box className="mt-3">
        <Box
          sx={{
            display: isXs || isSm ? 'block' : 'flex',
            justifyContent: isXs || isSm ? 'center' : 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            mb: isXs ? 2 : 0,
            gap: 2
          }}
        >
          <h1 className="page-title" style={{ paddingLeft: isXs || isSm ? 0 : "3rem", textAlign: isXs || isSm ? 'center' : 'left' }}>Gestionar Equipos</h1>
          <Box className="botones-superiores" sx={{ paddingLeft: isXs || isSm ? 0 : "3rem", display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: isXs || isSm ? 'center' : 'flex-start' }}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={isLoading}>Cancelar</Button>
            <Button variant="contained" onClick={() => crearListaEquipos("DONACION")} disabled={isLoading}> {isLoadingDonar ? <CircularProgress size={24}/> : 'Donar'}</Button>
            <Button variant="contained" onClick={() => crearListaEquipos("DESECHO")} disabled={isLoading}> {isLoadingDesechar ? <CircularProgress size={24} /> : 'Desechar'}</Button>
            <Button variant="contained" onClick={() => crearListaEquipos("ASIGNACION")} disabled={isLoading}> Asignar </Button>
          </Box>
        </Box>

        <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black', mb: 4 }} />

        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          {!stateUpdate ? "Equipos Activos" : "Equipos Seleccionados"}
        </Typography>

        {/* Tabla de equipos */}
        {listaEquipos.length >= 0 ? (
          <Box>
            <TableContainer component={Paper} sx={{ mt: 3, width: isXs ? "100%" : null, minWidth: isXs ? 280 : 300 }}>
              {/* Buscador y Filtros */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  px: { xs: 1, sm: 2, md: 3 },
                  mt: 1
                }}
              >
                <TextField
                  size="small"
                  placeholder="Buscar equipo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  sx={{
                    minWidth: 270,
                    flexGrow: 1,
                    maxWidth: 1350,
                    '& .MuiInputBase-root': {
                      paddingLeft: '8px',
                      paddingRight: '8px',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Opciones */}
                <Box className="botones-superiores" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isXs || isSm ? 'center' : 'flex-start' }}>
                  <Tooltip title={"Resetear lista"}>
                    <Button variant="outlined" onClick={() => Resetear()}>
                      <CachedIcon />
                    </Button>
                  </Tooltip>
                  <Button variant="outlined" onClick={() => setStateUpdate(!stateUpdate)}>
                    {!stateUpdate ? 'Ver Seleccionados' : 'Ver Activos'}
                  </Button>

                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingX: isXs ? 0 : 3, borderBottom: "1px solid #000", width: isXs ? "100%" : null, }}>
                {!isXs &&
                  <Tooltip title="Espaciado">
                    <FormControlLabel
                      control={<Switch checked={dense} onChange={handleChangeDense} />}
                    />
                  </Tooltip>
                }

                {/* Paginacion */}
                <TablePagination
                  component="div"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                  count={equiposFiltrados.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPageOptions={[5, 10, 15, 20]}
                  getItemAriaLabel={(count) => (`Pagina ${count === 'next' ? 'Siguiente' : 'Anterior'}`)}
                  labelRowsPerPage="Filas"
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
              <Table
                sx={{ width: isXs ? "100%" : null, minWidth: isXs ? 280 : 300 }}
                size={dense ? 'small' : 'medium'}
              >
                {/* Titulos */}
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  Xs={isXs}
                />
                {/* Datos */}
                <TableBody>
                  {visibleRows.map((item, index) => (
                    <TableRow hover tabIndex={-1} key={item.id} onClick={() => isXs ? handleSeleccionarEquipo(item) : null}>
                      {!isXs &&
                        <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                      }
                      <TableCell align='left'>{item.tipo}</TableCell>
                      <TableCell align='left'>{item.numero_serie}</TableCell>
                      {!isXs &&
                        <TableCell align='left'>{item.marca}</TableCell>
                      }
                      <TableCell align='left'>{item.modelo}</TableCell>
                      {!isXs &&
                        <TableCell align='center'>
                          <Tooltip title={!stateUpdate ? 'Agregar' : 'Quitar'}>
                            <IconButton onClick={() => handleSeleccionarEquipo(item)} color="primary">
                              {!stateUpdate ? (
                                <AddCircleOutlineIcon />
                              ) : (
                                <RemoveCircleOutlineIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      }
                    </TableRow>
                  ))}
                  {visibleRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {error ? error : "No hay equipos para mostrar."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

            </TableContainer>
          </Box>)
          : (
            <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
              {error ? error : "Cargando información..."}
              {error === null && <CircularProgress />}
              {error && " Por favor, intenta recargar la página."}
            </Typography>
          )}
      </Box>
      <Outlet />
    </>
  )
}
export default GestionarEquipos;