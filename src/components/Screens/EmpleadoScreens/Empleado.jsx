import React, { useState, useEffect } from 'react';
import { Divider, Box, Button, InputAdornment, TextField, useTheme, useMediaQuery, CardMedia, CardActionArea, IconButton, TablePagination } from '@mui/material';

import { Card, CardContent, Typography } from '@mui/joy';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

import SearchIcon from '@mui/icons-material/Search';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CircularProgress from '@mui/material/CircularProgress';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

import { authService } from './../../../service/authService';

import imagenDefaul from './../../../assets/imagenDefaul.png';
import iamaLogo from './../../../assets/iamalogo.png';
import iamaFondo from './../../../assets/fondo-iama-informes-vertical.jpg';

import CrearEmpleado from './CrearEmpleado';

const headCells = [
  { id: 'no', numeric: true, center: true, xs: true, disablePadding: false, label: 'No.' },
  { id: 'nombre', numeric: false, center: false, xs: true, disablePadding: false, label: 'Nombre' },
  { id: 'puesto', numeric: false, center: false, xs: false, disablePadding: false, label: 'Puesto' },
  { id: 'departamento', numeric: false, center: false, xs: false, disablePadding: false, label: 'Departamento' },
  { id: 'telefono', numeric: true, center: false, xs: false, disablePadding: false, label: 'No. Telefono' },
  { id: 'opciones', numeric: true, center: true, xs: false, disablePadding: false, label: 'Opciones' },
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
          ((!Xs || (Xs && headCell.xs)) &&
            <TableCell
              key={headCell.id}
              align={headCell.center ? 'center' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {headCell.id !== 'opciones' ? (
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

const Empleado = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const navigate = useNavigate();
  const location = useLocation();

  const [busqueda, setBusqueda] = useState('');
  const [contenido, setContenido] = useState(false);

  const [listEmpleados, setListEmpleados] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('no');
  const [dense, setDense] = useState(false);

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

  const empleadosFiltrados = listEmpleados.filter((empleado) => {
    const coincideBusqueda = (
      (empleado.nombre?.toLowerCase() || '') +
      ' ' +
      (empleado.apellido_p?.toLowerCase() || '') +
      ' ' +
      (empleado.apellido_m?.toLowerCase() || '') +
      ' ' +
      (String(empleado.telefono ?? '').toLowerCase()) +
      ' ' +
      (empleado.puesto?.toLowerCase() || '') +
      ' ' +
      (empleado.departamento?.toLowerCase() || '')
    ).includes(busqueda.toLowerCase())
    return coincideBusqueda;
  });

  const visibleRows = React.useMemo(() => {
    let sortedRows;
    if (orderBy === 'no') {
      // Ordena por el índice original
      const indexed = empleadosFiltrados.map((row, idx) => ({ row, idx }));
      sortedRows = indexed
        .sort((a, b) => getComparator(order, orderBy)(a.row, b.row, a.idx, b.idx))
        .map(({ row }) => row);
    } else {
      sortedRows = [...empleadosFiltrados].sort(getComparator(order, orderBy));
    }
    return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, page, rowsPerPage, empleadosFiltrados]);

  const cargarEmpleados = async () => {
    const result = await authService.fetchEmpleados();

    if (result.success) {
      setListEmpleados(result.data);
    } else {
      setError(result.message);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, [location.pathname, error]);

  const pdf = () => {
    if (empleadosFiltrados <= 0) {
      Swal.fire({
        title: 'Error',
        icon: 'warning',
        text: 'No se encontraron equipos para realizar el informe'
      });
    } else {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      const fechaHora = (fechaStr) => {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return '';
        return (
          fecha.getFullYear() +
          '-' + String(fecha.getMonth() + 1).padStart(2, '0') +
          '-' + String(fecha.getDate()).padStart(2, '0') +
          ' / ' + String(fecha.getHours()).padStart(2, '0') + "hrs" +
          '-' + String(fecha.getMinutes()).padStart(2, '0') + "min" +
          '-' + String(fecha.getSeconds()).padStart(2, '0') + "s"
        );
      };

      const fecha = new Date().toLocaleDateString();
      var logo = new Image();

      logo.src = iamaFondo;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.addImage(logo, 'JPEG', 0, 0, pageWidth, pageHeight);

      doc.setFontSize(12);
      doc.text(new Date().toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric'
      }), 160, 20);

      // Título
      doc.setFontSize(16);
      doc.text('Informe de empleados', 105, 30, { align: 'center' });

      // Tabla de operadores
      const dataEmpleados = empleadosFiltrados.map(op => [
        op.nombre + ' ' + op.apellido_p + ' ' + op.apellido_m,
        op.puesto,
        op.departamento,
        fechaHora(op.fecha_registro)
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Nombre', 'Puesto', 'Departamento', 'Fecha de registro']],
        body: dataEmpleados,
      });

      const pdfFileName = 'Informe de Empleados';
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const agregarEmpleado = () => {
    navigate('crearEmpleado', { state: { titulo: 'Agregar Empleado' } })
  }

  const verEmpleado = (id) => {
    navigate('consultarEmpleado', { state: { id: id, titulo: 'Datos Empleado', peticion: false } })
  }

  if (['consultarEmpleado', 'crearEmpleado']
    .some(ruta => location.pathname.includes(ruta))) {
    return <Outlet />;
  }

  return (
    <Box className="mt-3">
      <Box sx={{ display: 'flex', justifyContent: isXs ? 'center' : 'space-between', alignItems: 'center', mb: isXs ? 2 : 0, flexWrap: 'wrap', gap: 2, }}>
        <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>Empleados</h1>
        <Box className="botones-superiores" sx={{ paddingRight: isXs ? 0 : "3rem", gap: 2, display: 'flex', flexWrap: 'wrap', justifyContent: isXs ? 'center' : 'flex-end' }}>
          <Button variant="contained" onClick={pdf}>Informe</Button>
          <Button variant="contained" onClick={agregarEmpleado}>Agregar</Button>
        </Box>
      </Box>

      <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black', mb: 4 }} />

      {/* Buscador y Filtros */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar empleado..."
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
        <Tooltip title={contenido ? "Tarjetas" : "Tabla"}>
          <IconButton onClick={() => setContenido(!contenido)} sx={{ border: '1px solid rgb(145, 145, 145)', borderRadius: '50%' }} color="primary">
            {contenido ? <GridViewIcon /> : <FormatListBulletedIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabla de Empleados */}
      {listEmpleados.length > 0 ? (
        <Box>
          <TableContainer component={Paper} sx={{ mt: 3, width: isXs ? "100%" : null, minWidth: isXs ? 280 : 300 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingX: isXs ? 0 : 3, borderBottom: "1px solid #000", width: isXs ? "100%" : null, }}>
              {!isXs && (contenido ? <Box></Box> :
                <Tooltip title="Espaciado">
                  <FormControlLabel
                    control={<Switch checked={dense} onChange={handleChangeDense} />}
                  />
                </Tooltip>)
              }

              {/* Paginacion */}
              <TablePagination
                component="div"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                count={empleadosFiltrados.length}
                page={page}
                getItemAriaLabel={(count) => (`Pagina ${count === 'next' ? 'Siguiente' : 'Anterior'}`)}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[6, 12, 18, 24]}
                labelRowsPerPage="Filas"
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ padding: 0 }}
              />

            </Box>
            {contenido ? (
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 3 }}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 2,
                  justifyItems: 'center',
                  width: '100%'
                }}>
                  {visibleRows.map((item, index) => (
                    <Card sx={{ width: isXs ? "100%" : 320 }} key={item.id}>
                      <CardActionArea onClick={() => verEmpleado(item.id)} sx={{ bgcolor: "#41514D", borderRadius: 5 }}>
                        <CardContent>
                          <Box sx={{ bgcolor: '#000', color: '#fff', p: 1, textAlign: 'center', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>
                              {item.departamento}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginY: 2 }}>
                            <Box sx={{ paddingX: 2 }}>
                              <Typography variant="body2" sx={{ color: '#fff' }}>
                                {item.nombre}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#fff' }}>
                                {item.apellido_p}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#fff' }}>
                                {item.apellido_m}
                              </Typography>
                            </Box>

                            <CardMedia
                              component="img"
                              height="140"
                              image={(item.fotoBase64 !== null && `data:image/png;base64,${item.fotoBase64}`) || imagenDefaul}
                              alt={item.nombrePDF}
                              sx={{ width: '45%', bgcolor: "#fff", marginRight: 2, borderRadius: 3 }}
                              onError={e => {
                                e.target.onerror = null; // Previene bucle infinito si la imagen default también falla
                                e.target.src = imagenDefaul;
                              }}
                            />

                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'end', borderBottomLeftRadius: 10, marginTop: -4 }}>
                            <CardMedia
                              component='img'
                              image={iamaLogo}
                              alt='Logo IAMA'
                              sx={{ width: '40%', background: '#fff', padding: 1, borderBottomLeftRadius: 8, borderTopRightRadius: 20 }}
                            />
                            <Box sx={{ bgcolor: '#4C7196', width: '60%', textAlign: 'center', borderBottomRightRadius: 10 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#fff'
                                }}
                              >
                                {item.puesto}
                              </Typography>
                            </Box>

                          </Box>

                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}

                </Box>
              </Box>
            ) : (
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
                    <TableRow hover tabIndex={-1} key={item.id} onClick={() => isXs ? verEmpleado(item.id) : null}>
                      <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell align='left'>{item.nombre} {item.apellido_p} {item.apellido_m}</TableCell>
                      {!isXs &&
                        <TableCell align='left'>{item.puesto}</TableCell>
                      }
                      {!isXs &&
                        <TableCell align='left'>{item.departamento}</TableCell>
                      }
                      {!isXs &&
                        <TableCell align='left'>{item.telefono}</TableCell>
                      }
                      {!isXs &&
                        <TableCell align='center'>
                          <Tooltip title="Ver empleado">
                            <IconButton onClick={() => verEmpleado(item.id)} color="primary">
                              <VisibilityOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      }

                    </TableRow>
                  ))}
                  {visibleRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {error ? error : "No hay empleados para mostrar."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

              </Table>
            )}

          </TableContainer>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          {error ? error : "Cargando información..."}
          {error === null && <CircularProgress />}
          {error && " Por favor, intenta recargar la página."}
        </Typography>
      )}

      <Outlet />

    </Box>

  )
}
export default Empleado;