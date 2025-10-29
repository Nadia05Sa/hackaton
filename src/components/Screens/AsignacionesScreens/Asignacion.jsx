import React, { useState, useEffect } from 'react';
import { Divider, Box, MenuItem, Menu, Button, InputAdornment, TextField, useTheme, useMediaQuery, Typography, IconButton, TablePagination } from '@mui/material';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

//Iconos
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RestorePageIcon from '@mui/icons-material/RestorePage';
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from './../../../service/authService';

const headCells = [
    { id: 'no', numeric: true, center: true, xs: false, sm: false, disablePadding: false, label: 'No.' },
    { id: 'estado', numeric: false, center: false, xs: false, sm: false, disablePadding: false, label: 'Estado' },
    { id: 'nombre', numeric: false, center: false, xs: false, sm: false, disablePadding: false, label: 'Nombre' },
    { id: 'puesto', numeric: false, center: false, xs: true, sm: false, disablePadding: false, label: 'Puesto' },
    { id: 'departamento', numeric: false, center: false, xs: true, sm: true, disablePadding: false, label: 'Departamento' },
    { id: 'equipos', numeric: true, center: false, xs: true, sm: true, disablePadding: false, label: 'No. Equipos' },
    { id: 'responsiva', numeric: false, center: true, xs: true, sm: true, disablePadding: false, label: 'Responsiva' },
    { id: 'opciones', numeric: false, center: true, xs: true, sm: false, disablePadding: false, label: 'Opciones' },
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
    const { order, orderBy, onRequestSort, xs, sm } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) =>
                    ((xs && headCell.xs) || (sm && headCell.sm)) ? (
                        null
                    ) : (<TableCell
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
                )}
            </TableRow>
        </TableHead>
    );
}

const filtros = ['ACTIVO', 'PENDIENTE'];

const Asignacion = () => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);

    const [listAsignaciones, setListAsignaciones] = useState([]);
    const [error, setError] = useState(null);

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

    const abrirMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const cerrarMenu = () => {
        setAnchorEl(null);
    };

    const seleccionarFiltro = (filtro) => {
        setFiltroSeleccionado(filtro);
        cerrarMenu();
    };

    const asignacionFiltrados = listAsignaciones.filter((asignacion) => {
        const coincideFiltro = filtroSeleccionado !== null
            ? String(asignacion.estado) === filtroSeleccionado
            : true;

        const coincideBusqueda = busqueda ? (
            (asignacion.empleado.nombre?.toLowerCase() || '') +
            ' ' +
            (asignacion.empleado.apellido_p?.toLowerCase() || '') +
            ' ' +
            (asignacion.empleado.apellido_m?.toLowerCase() || '') +
            ' ' +
            (asignacion.empleado.puesto?.toLowerCase() || '') +
            ' ' +
            (asignacion.empleado.departamento?.toLowerCase() || '')
        ).includes(busqueda.toLowerCase())
            : true;
        return coincideBusqueda, coincideFiltro;
    });

    const visibleRows = React.useMemo(() => {
        let sortedRows;
        if (orderBy === 'no') {
            // Ordena por el índice original
            const indexed = asignacionFiltrados.map((row, idx) => ({ row, idx }));
            sortedRows = indexed
                .sort((a, b) => getComparator(order, orderBy)(a.row, b.row, a.idx, b.idx))
                .map(({ row }) => row);
        } else {
            sortedRows = [...asignacionFiltrados].sort(getComparator(order, orderBy));
        }
        return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [order, orderBy, page, rowsPerPage, asignacionFiltrados]);

    const cargarAsignaciones = async () => {
        const result = await authService.fetchAsignaciones();

        if (result.success) {
            setListAsignaciones(result.data);
            setError(null);
        } else {
            setError(result.message);
        }
    };

    useEffect(() => {
        cargarAsignaciones();
    }, [location.pathname]);

    const mostrarAnexo = (anexo) => {
        if (anexo) {
            // Decodificar Base64 a bytes
            const byteCharacters = atob(anexo);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            // Crear Blob PDF
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const blobUrl = URL.createObjectURL(blob);

            // Abrir PDF en nueva pestaña
            window.open(blobUrl, "_blank");
        }
    };

    const seleccionar = (id, actualizar, estado) => {
        navigate('consultarAsignacion', { state: { idAsignacion: id, peticion: false, estado: estado, comentario: null, actualizar: actualizar } });
    };

    if (location.pathname.includes('consultarAsignacion')) {
        return <Outlet />;
    }

    return (
        <>
            <Box className="mt-3">
                <Box sx={{ display: 'flex', justifyContent: isXs ? 'center' : 'space-between', mb: isXs ? 2 : 0, alignItems: 'center', flexWrap: 'wrap', gap: 2, }}>
                    <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>Asignaciones</h1>
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
                        placeholder="Buscar asignacion..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        sx={{
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
                    <Button
                        variant="outlined"
                        onClick={abrirMenu}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        {filtroSeleccionado ? filtroSeleccionado : 'Filtros'}
                    </Button>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={cerrarMenu}
                    >
                        {filtros.map((filtro) => (
                            <MenuItem
                                key={filtro}
                                selected={filtroSeleccionado === filtro}
                                onClick={() => seleccionarFiltro(filtro)}
                            >
                                {filtro}
                            </MenuItem>
                        ))}
                        <MenuItem
                            onClick={() => {
                                setFiltroSeleccionado(null);
                                cerrarMenu();
                            }}
                        >
                            Limpiar filtros
                        </MenuItem>
                    </Menu>
                </Box>

                {listAsignaciones.length > 0 ? (
                    <Box>
                        <TableContainer component={Paper} sx={{ mt: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingX: isXs ? 0 : 3, borderBottom: "1px solid #000", width: isXs ? "100%" : null, }}>
                                {!isXs && (
                                    <Tooltip title="Espaciado">
                                        <FormControlLabel
                                            control={<Switch checked={dense} onChange={handleChangeDense} />}
                                        />
                                    </Tooltip>
                                )}
                                {/* Paginacion */}
                                <TablePagination
                                    component="div"
                                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                                    count={asignacionFiltrados.length}
                                    page={page}
                                    getItemAriaLabel={(count) => (`Pagina ${count === 'next' ? 'Siguiente' : 'Anterior'}`)}
                                    onPageChange={handleChangePage}
                                    rowsPerPageOptions={[5, 10, 15, 20]}
                                    labelRowsPerPage="Filas"
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </Box>
                            <Table
                                sx={{ width: isXs ? "100%" : null, }}
                                size={dense ? 'small' : 'medium'}
                            >
                                {/* Titulos */}
                                <EnhancedTableHead
                                    order={order}
                                    orderBy={orderBy}
                                    onRequestSort={handleRequestSort}
                                    xs={isXs}
                                    sm={isSm}
                                />
                                {/* Datos */}
                                <TableBody>
                                    {visibleRows.map((item, index) => (
                                        <TableRow hover tabIndex={-1} key={item.id} onClick={() => isXs ? seleccionar(item.id, false, item.estado === "ACTIVA" ? true : false) : null}>
                                            <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell align='left'>{item.estado}</TableCell>
                                            <TableCell align='left'>{item.empleado.nombre} {item.empleado.apellido_p} {item.empleado.apellido_m}</TableCell>
                                            {isSm || !isXs && (
                                                <TableCell align='left'>{item.empleado.puesto}</TableCell>
                                            )}
                                            {!isXs && (
                                                <TableCell align='left'>{item.empleado.departamento}</TableCell>
                                            )}
                                            {isSm || !isXs && (
                                                <TableCell align='left'>{item.listaEquipos && item.listaEquipos.equipoTecnologico !== null && item.listaEquipos.equipoTecnologico.length || 0}</TableCell>
                                            )}
                                            {isSm || !isXs && (
                                                <TableCell align='center'>
                                                    <Tooltip title="Responsiva">
                                                        <IconButton onClick={() => mostrarAnexo(item.responsivaActiva.pdfBase64)} color="primary">
                                                            <FileOpenIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            )}

                                            {!isXs && (
                                                <TableCell align='center'>
                                                    {!isXs && item.estado === "ACTIVA" && (
                                                        <Tooltip title="Actualizar">
                                                            <IconButton onClick={() => seleccionar(item.id, true, item.estado === "ACTIVA" ? true : false)} color="primary">
                                                                <RestorePageIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}

                                                    <Tooltip title="Ver asignación">
                                                        <IconButton onClick={() => seleccionar(item.id, false, item.estado === "ACTIVA" ? true : false)} color="primary">
                                                            <VisibilityOutlinedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {!isXs && item.estado === "ACTIVA" && (
                                                        <Tooltip title="Deshacer">
                                                            <IconButton onClick={() => authService.eliminarAsignacionConSwal(item.id, navigate, false)} color="primary">
                                                                <DeleteOutlineIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                    {visibleRows.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                {error ? error : "No hay asignaciones para mostrar."}
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
            </Box >
            <Outlet />
        </>
    )
}
export default Asignacion;