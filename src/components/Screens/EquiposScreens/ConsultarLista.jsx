import React, { useState, useEffect } from 'react';
import { Divider, Box, Button, Typography, InputAdornment, TextField, useTheme, useMediaQuery, IconButton, TablePagination, Icon } from '@mui/material';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CircularProgress from '@mui/material/CircularProgress';

import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../../service/authService';
import iamaLogo from './../../../assets/iamalogo.png';

const headCells = [
  { id: 'no', numeric: true, center: true, disablePadding: false, label: 'No.' },
  { id: 'tipo', numeric: false, center: false, disablePadding: false, label: 'Tipo' },
  { id: 'no.serie', numeric: false, center: false, disablePadding: false, label: 'No. Serie' },
  { id: 'marca', numeric: false, center: false, disablePadding: false, label: 'Marca' },
  { id: 'modelo', numeric: true, center: false, disablePadding: false, label: 'No. Modelo' },
  { id: 'seleccionar', numeric: false, center: true, disablePadding: false, label: 'Opciones' },
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
  const { order, orderBy, onRequestSort, state } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          (!state && headCell.id === "seleccionar" ? (
            null
          ) : (
            <TableCell
              key={headCell.id}
              align={headCell.center ? 'center' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {headCell.id !== 'seleccionar' ? (
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
          ))

        ))}
      </TableRow>
    </TableHead>
  );
}

const ConsultarLista = () => {
  const urlHost = "http://localhost:8080";
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { id, peticion, comentario, actualizar, idPeticion } = location.state || {};

  const [busqueda, setBusqueda] = useState('');

  const [listaEquipos, setListaEquipos] = useState([]);
  const [listEquiposActivos, setListEquiposActivos] = useState([]);
  const [stateUpdate, setStateUpdate] = useState(false);

  const rolUsuario = authService.getRole();
  const [estadoListado, setEstadoListado] = useState(false);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);
  const [tipo, setTipo] = useState(null)
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

  const equiposFiltrados = (stateUpdate ? listEquiposActivos : listaEquipos).filter((equipo) => {
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

  const fetchLista = async () => {
    try {
      const response = await axios.get(`${urlHost}/api/listasEquipos/${id}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
      });

      setListaEquipos(Array.isArray(response.data.listaEquipoResponse?.listaEquipos?.[0]?.equipoTecnologico) ? response.data.listaEquipoResponse.listaEquipos[0].equipoTecnologico : []);
      setEquiposSeleccionados(Array.isArray(response.data.listaEquipoResponse?.listaEquipos?.[0]?.equipoTecnologico) ? response.data.listaEquipoResponse.listaEquipos[0] : []);
      setEstadoListado(response.data.listaEquipoResponse?.listaEquipos?.[0]?.estado || false);
      setTipo(response.data.listaEquipoResponse?.listaEquipos?.[0]?.tipo) ? response.data.listaEquipoResponse.listaEquipos[0].tipo : [];
      setError(null);

    } catch (err) {
      setError("Error al cargar los datos. Inténtalo de nuevo.");
    }
  };

  const fetchEquipos = async () => {
    try {
      const response = await axios.get(`${urlHost}/api/equipos/activos`,
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      setListEquiposActivos(Array.isArray(response.data.equiposResponse.equipo) ? response.data.equiposResponse.equipo : []);
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos. Inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    if (actualizar) {
      fetchLista();
      fetchEquipos();
    } else {
      fetchLista();
    }
  }, [id]);

  const Comentario = () => {
    Swal.fire({
      title: 'Comentario',
      text: comentario,
      icon: 'info',
    }).then(

    )
  }

  useEffect(() => {
    if (comentario !== null && actualizar) {
      Comentario();
    }
  }, [comentario])

  const handleSeleccionarEquipo = (equipo) => {
    if (listaEquipos.includes(equipo)) {
      setListaEquipos(listaEquipos.filter((e) => e !== equipo));
      setListEquiposActivos([...listEquiposActivos, equipo]);
    } else {
      setListEquiposActivos(listEquiposActivos.filter((e) => e !== equipo));
      setListaEquipos([...listaEquipos, equipo]);
    }
  };

  const actualizarListaEquipos = async () => {
    if (listaEquipos.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'No hay equipos seleccionados.',
        icon: 'error',
      });
      return;
    }
    const equipoTecnologico = listaEquipos.map(e => ({ id: e.id }));
    const idsInvalidos = equipoTecnologico
      .map(obj => obj.id)
      .filter(id => typeof id !== 'number' || isNaN(id));
    if (idsInvalidos.length > 0) {
      Swal.fire({
        title: 'Error',
        text: `IDs inválidos: ${idsInvalidos.join(', ')}`,
        icon: 'error',
      });
      return;
    }
    Swal.fire({
      title: 'Confirmar',
      text: `¿Estás seguro de que deseas confirmar la actualización de la lista de equipos?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {

      if (result.isConfirmed) {

        try {
          const formData = new FormData();
          formData.append("listaEquiposEntity", new Blob([JSON.stringify({ equipoTecnologico })], { type: "application/json" }));

          let pdfBlob = null;
          let pdfFileName = "";

          // si la lista no es para asignacion crear el archivo con la lista de equipos
          if (tipo !== "ASIGNACION") {
            const doc = new jsPDF();
            const columnas = ["EQUIPO", "MARCA", "MODELO", "NO. SERIE"];
            const filas = listaEquipos.map((equipo) => [
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

          const response = await axios.put(`${urlHost}/api/listasEquipos/${id}/${idPeticion}`, formData, {
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
                navigate(-1);
              }
            });
          }
        } catch (err) {
          Swal.fire({
            title: 'Error',
            text: err.response?.data?.metadata?.[0]?.date || 'Error al actualizar la lista de equipos.',
            icon: 'error',
          });
        }
      }
    });
  };

  const GestionarPeticion = async (estado) => {
    const confirmacion = await Swal.fire({
      title: estado ? 'Aceptar petición' : 'Rechazar petición',
      text: estado
        ? 'Esta acción aprobará la petición.'
        : '¿Estás seguro de rechazar esta petición?',
      icon: 'question',
      ...(estado ? {} : {
        input: 'text',
        inputLabel: 'Comentario',
        inputPlaceholder: 'Ingresa la razón por la cual rechazas la petición',
        inputAttributes: {
          minlength: 5,
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        inputValidator: (value) => {
          if (!value || value.length < 0) {
            return 'Debes ingresar una razon para rechazar la peticion';
          }
        }
      }),
      showCancelButton: true,
      confirmButtonText: estado ? 'Sí, aceptar' : 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      preConfirm: async (comentario) => {
        try {
          const body = estado ? {} : { comentario };

          const response = await axios.put(`${urlHost}/api/peticiones/${idPeticion}/${estado}`, body, {
            headers: {
              Authorization: `Bearer ${authService.getToken}`,
              'Content-Type': 'application/json',
            },
          });

          return response;
        } catch (error) {
          Swal.showValidationMessage(
            error?.response?.data?.metadata?.[0]?.date || 'Error al gestionar la petición.'
          );
          return null;
        }
      }
    });

    // Solo continuar si se confirmó y no hubo error
    if (confirmacion.isConfirmed && confirmacion.value) {
      const mensaje = confirmacion.value?.data?.metadata?.[0]?.date || 'Petición gestionada exitosamente.';
      Swal.fire('Éxito', mensaje, 'success').then(() => navigate(-1));
    }
  };

  const EliminarPeticion = async () => {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar petición?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmacion.isConfirmed) {
      try {
        const response = await axios.delete(`${urlHost}/api/peticiones/${idPeticion}`, {
          headers: {
            Authorization: `Bearer ${authService.getToken}`,
            'Content-Type': 'application/json',
          },
        });

        const mensaje = response?.data?.metadata?.[0]?.date || 'Petición eliminada correctamente.';
        Swal.fire('Eliminada', mensaje, 'success').then(() => navigate(-1));
        fetchPeticiones();
      } catch (error) {
        Swal.fire(
          'Error',
          error?.response?.data?.metadata?.[0]?.date || 'Error al eliminar la petición.',
          'error'
        );
      }
    }
  };

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
          <h1 className="page-title" style={{ paddingLeft: isXs || isSm ? 0 : "3rem", textAlign: isXs || isSm ? 'center' : 'left' }}>Lista {(tipo !== null ? tipo.toLowerCase() : null)}</h1>

          <Box className="botones-superiores" sx={{ mr: isXs || isSm ? 0 : "3rem", display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isXs || isSm ? 'center' : 'flex-start' }}>
            {!stateUpdate && (
              <Button variant="outlined" onClick={() => navigate(-1)} >{comentario !== null ? "Cancelar" : "Regresar"}</Button>
            )}
            {!estadoListado && comentario !== null && (
              <Button variant="outlined" onClick={() => Comentario()} >Ver comentario</Button>
            )}
            {actualizar && comentario !== null && (
              <Button variant="contained" onClick={() => stateUpdate ? setStateUpdate(false) : setStateUpdate(true)}> {stateUpdate ? 'Regresar' : 'Agregar'}</Button>
            )}
            {actualizar && comentario !== null && !stateUpdate && (
              <Button variant="contained" onClick={() => actualizarListaEquipos()}>Aceptar</Button>
            )}

            {!estadoListado && !actualizar && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
              <Tooltip title="Aceptar">
                <Button variant="contained" sx={{ ml: 2 }} onClick={() => GestionarPeticion(true)}>
                  <TaskAltIcon />
                </Button>
              </Tooltip>
            )}
            {!estadoListado && !actualizar && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
              <Tooltip title="Rechazar">
                <Button variant="contained" sx={{ ml: 2 }} onClick={() => GestionarPeticion(false)}>
                  <HighlightOffIcon />
                </Button>
              </Tooltip>
            )}
            {!actualizar && peticion !== null && peticion && rolUsuario === 'ADMIN' && (
              <Tooltip title="Eliminar">
                <Button variant="contained" sx={{ ml: 2 }} onClick={() => EliminarPeticion()} >
                  <DeleteOutlineIcon />
                </Button>
              </Tooltip>
            )}
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
            placeholder="Buscar equipo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            sx={{
              minWidth: 300,
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

        {/* Tabla de equipos */}
        {(actualizar ? (stateUpdate ? listEquiposActivos.length >= 0 : listaEquipos.length >= 0) : listaEquipos.length >= 0) ? (
          <Box>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingX: isXs ? 2 : 3, borderBottom: "1px solid #000", width: isXs ? 390 : null, }}>

                <Tooltip title="Espaciado">
                  <FormControlLabel
                    control={<Switch checked={dense} onChange={handleChangeDense} />}
                  />
                </Tooltip>

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
                sx={{ minWidth: 300 }}
                size={dense ? 'small' : 'medium'}
              >
                {/* Titulos */}
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  state={actualizar}
                />
                {/* Datos */}
                <TableBody>
                  {visibleRows.map((item, index) => (
                    <TableRow hover tabIndex={-1} key={item.id}>
                      <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell align='left'>{item.tipo}</TableCell>
                      <TableCell align='left'>{item.numero_serie}</TableCell>
                      <TableCell align='left'>{item.marca}</TableCell>
                      <TableCell align='left'>{item.modelo}</TableCell>
                      {actualizar && (
                        <TableCell align='center'>
                          <Tooltip title={stateUpdate ? 'Agregar' : 'Quitar'}>
                            <IconButton onClick={() => handleSeleccionarEquipo(item)} color="primary">
                              {stateUpdate ? (
                                <AddCircleOutlineIcon />
                              ) : (
                                <RemoveCircleOutlineIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}

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
export default ConsultarLista;