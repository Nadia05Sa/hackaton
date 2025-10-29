import React, { useState, useEffect } from 'react';

import { Divider, Box, Typography, Button, InputAdornment, TextField, useTheme, useMediaQuery, IconButton, TablePagination } from '@mui/material';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SearchIcon from '@mui/icons-material/Search';

import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from './../../../service/authService';
import CircularProgress from '@mui/material/CircularProgress';

import iamalogo from './../../../assets/iamalogo.png';
import iamaFondo from './../../../assets/fondo-iama-informes-vertical.jpg';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const headCells = [
  { id: 'no', numeric: true, center: true, xs: true, disablePadding: false, label: 'No.' },
  { id: 'nombre', numeric: false, center: false, xs: true, disablePadding: false, label: 'Nombre' },
  { id: 'username', numeric: false, center: false, xs: false, disablePadding: false, label: 'Usuario' },
  { id: 'opciones', numeric: false, center: true, xs: false, disablePadding: false, label: 'Opciones' },
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
            </TableCell>
          )

        ))}
      </TableRow>
    </TableHead>
  );
}

export default function Operador() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const [busqueda, setBusqueda] = useState('');

  const [listOperadores, setListOperadores] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const operadoresFiltrados = listOperadores.filter((operador) => {
    const coincideBusqueda = busqueda ? (
      (operador.nombre?.toLowerCase() || '') +
      ' ' +
      (operador.apellido_p?.toLowerCase() || '') +
      ' ' +
      (operador.apellido_m?.toLowerCase() || '') +
      ' ' +
      (operador.username?.toLowerCase() || '')
    ).includes(busqueda.toLowerCase())
      : true;
    return coincideBusqueda;
  });

  const visibleRows = React.useMemo(() => {
    let sortedRows;
    if (orderBy === 'no') {
      // Ordena por el índice original
      const indexed = operadoresFiltrados.map((row, idx) => ({ row, idx }));
      sortedRows = indexed
        .sort((a, b) => getComparator(order, orderBy)(a.row, b.row, a.idx, b.idx))
        .map(({ row }) => row);
    } else {
      sortedRows = [...operadoresFiltrados].sort(getComparator(order, orderBy));
    }
    return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, page, rowsPerPage, operadoresFiltrados]);

  const cargarPerfil = async () => {
    const result = await authService.fetchOperadores();

    if (result.success) {
      setListOperadores(result.data);
      setError(null);
    } else {
      setError(result.message);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, [location.pathname, error]);

  const pdf = () => {
    if (operadoresFiltrados <= 0) {
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

      var logo = new Image();
      //Logo
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
      doc.text('Informe sobre operadores activos', 105, 30, { align: 'center' });

      // Tabla de operadores
      const dataOperadores = operadoresFiltrados.map(op => [
        op.nombre + ' ' + op.apellido_p + ' ' + op.apellido_m,
        op.username,
        fechaHora(op.fecha_registro)
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Nombre', 'Usuario', 'Fecha de registro']],
        body: dataOperadores,
      });
      const pdfFileName = 'Informe de operadores';
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

  const agregarOperador = () => {
    navigate('crearOperador', { state: { titulo: 'Agregar Operador' } })
  }

  const verOperador = (id) => {
    navigate('consultarOperador', { state: { id: id, titulo: 'Datos Operador' } })
  }

  if (location.pathname.includes('consultarOperador') || location.pathname.includes('crearOperador')) {
    return <Outlet />;
  }

  return (
    <Box className="mt-3">
      {/* Titulo y opciones */}
      <Box sx={{ display: 'flex', justifyContent: isXs ? 'center' : 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, }}>
        <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>Operadores</h1>
        <Box className="botones-superiores" sx={{ paddingRight: isXs ? 0 : "3rem", mb: isXs ? 2 : 0, gap: 1 }}>
          <Button variant="contained" onClick={pdf}>Informe</Button>
          <Button variant="contained" onClick={agregarOperador}>Agregar</Button>
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
          placeholder="Buscar operador..."
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
      </Box>

      {/* Tabla de Operadores */}
      {listOperadores.length > 0 ? (

        <Box>

          <TableContainer component={Paper} sx={{ mt: 3, width: isXs ? "100%" : null, minWidth: isXs ? 280 : 300 }}>
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
                count={operadoresFiltrados.length}
                page={page}
                getItemAriaLabel={(count) => (`Pagina ${count === 'next' ? 'Siguiente' : 'Anterior'}`)}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 15, 20]}
                labelRowsPerPage="Filas"
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ padding: 0 }}
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
                  <TableRow hover tabIndex={-1} key={item.id} onClick={() => isXs && verOperador(item.id)}>
                    <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell align='left'>{item.nombre} {item.apellido_p} {item.apellido_m}</TableCell>
                    {!isXs &&
                      <TableCell align='left'>{item.username}</TableCell>
                    }
                    {!isXs &&
                      <TableCell align='center'>
                        <Tooltip title="Ver operador">
                          <IconButton onClick={() => verOperador(item.id)} color="primary">
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
                      {error ? error : "No hay operadores para mostrar."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

          </TableContainer>
        </Box>
      )
        : (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
            {error ? error : "Cargando información..."}
            {error === null && <CircularProgress />}
          </Typography>
        )}
      <Outlet />
    </Box>
  )
}
