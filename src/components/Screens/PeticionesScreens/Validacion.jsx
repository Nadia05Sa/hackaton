import React, { useState, useEffect } from 'react';
import { Divider, Box, MenuItem, Menu, Button, InputAdornment, TextField, useTheme, useMediaQuery, IconButton, TablePagination, Icon } from '@mui/material';
import { Typography } from '@mui/joy';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../../../service/authService';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

//Iconos
import SearchIcon from '@mui/icons-material/Search';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RestorePageIcon from '@mui/icons-material/RestorePage';
import CircularProgress from '@mui/material/CircularProgress';

const filtros = ['ACEPTADA', 'PENDIENTE', 'RECHAZADA'];

const headCells = [
    { id: 'no', numeric: true, center: true, xs: false, sm: false, disablePadding: false, label: 'No.' },
    { id: 'estado', numeric: false, center: false, xs: false, sm: false, disablePadding: false, label: 'Estado' },
    { id: 'operador', numeric: false, center: false, xs: true, sm: true, disablePadding: false, label: 'Operador' },
    { id: 'tipo', numeric: false, center: false, xs: false, sm: false, disablePadding: false, label: 'Tipo' },
    { id: 'categoria', numeric: false, center: false, xs: false, sm: false, disablePadding: false, label: 'Categoria' },
    { id: 'anexo', numeric: false, center: true, xs: true, sm: true, disablePadding: false, label: 'Anexo' },
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
                        {headCell.id !== 'opciones' && headCell.id !== 'anexo' ? (
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

const Validacion = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));

    const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);

    const rolUsuario = authService.getRole();
    const [userId, setUserId] = useState(0);
    const [listPeticiones, setlistPeticiones] = useState([]);
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

    const peticionesFiltrados = listPeticiones.filter((peticion) => {
        const coincideFiltro = filtroSeleccionado !== null
            ? (filtroSeleccionado === peticion.estado)
            : true;

        const coincideBusqueda = busqueda
            ? (
                (peticion.operadorName?.toLowerCase() || '') +
                ' ' +
                (peticion.tipo_peticion?.toLowerCase() || '') +
                ' ' +
                (peticion.categoria?.toLowerCase() || '')
            ).includes(busqueda.toLowerCase())
            : true;

        return coincideFiltro && coincideBusqueda;
    });

    const visibleRows = React.useMemo(() => {
        let sortedRows;
        if (orderBy === 'no') {
            // Ordena por el índice original
            const indexed = peticionesFiltrados.map((row, idx) => ({ row, idx }));
            sortedRows = indexed
                .sort((a, b) => getComparator(order, orderBy)(a.row, b.row, a.idx, b.idx))
                .map(({ row }) => row);
        } else {
            sortedRows = [...peticionesFiltrados].sort(getComparator(order, orderBy));
        }
        return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [order, orderBy, page, rowsPerPage, peticionesFiltrados]);

    const cargarPeticiones = async () => {
        const result = await authService.fetchPeticiones();

        if (result.success) {
            setlistPeticiones(result.data);
            setError(null);
        } else {
            setError(result.message);
        }
    };

    const cargarPerfil = async () => {
        const result = await authService.fetchPerfil();
        if (result.success) {
            setUserId(result.data.id);
        } else {
            setError(result.message);
        }
    };

    useEffect(() => {
        cargarPeticiones();
        if (userId === 0) {
            cargarPerfil();
        }
    }, [location.pathname]);

    const gestionarPeticion = async (id, estado) => {
        await authService.GestionarPeticion(id, estado, navigate)
        fetchPeticiones();
    };

    const eliminarPeticion = async (id) => {
        await authService.EliminarPeticion(id, navigate)
        fetchPeticiones();
    };

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

    const verPeticion = (categoria, id, peticion, comentario, actualizar, idPeticion, estadoPeticion) => {
        switch (categoria) {
            case 'EMPLEADOS':
                navigate('consultarEmpleado', { state: { id: id, titulo: 'Datos Empleado', peticion: true, idPeticion: idPeticion } })
                break;
            case 'LISTAS':
                navigate('consultarLista', { state: { id: id, peticion: true, comentario: comentario, actualizar: actualizar, idPeticion: idPeticion } })
                break;
            case 'ASIGNACIONES':
                navigate('consultarAsignacion', { state: { idAsignacion: id, peticion: peticion, comentario: comentario, actualizar: actualizar, idPeticion: idPeticion } })
                break;
            case 'OPERADOR':
                navigate('consultarOperador', { state: { id: id, titulo: 'Datos Operador', peticion: true, idPeticion: idPeticion, estadoPeticion: estadoPeticion } })
                break;
            default:
                break;
        }
    }

    if (['consultarEmpleado', 'consultarAsignacion', 'consultarOperador', 'consultarLista']
        .some(ruta => location.pathname.includes(ruta))) {
        return <Outlet />;
    }


    return (
        <Box className="mt-3">
            <Box sx={{ display: 'flex', justifyContent: isXs ? 'center' : 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, }}>
                <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>Peticiones</h1>
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
                    placeholder="Buscar peticion..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    sx={{
                        minWidth: 170,
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
                    {filtroSeleccionado || 'Filtros'}
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

            {/* Tabla de peticiones */}
            {listPeticiones.length > 0 ? (
                <Box>
                    <TableContainer component={Paper} sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingX: isXs ? 2 : 3, borderBottom: "1px solid #000", width: isXs ? "100%" : null, }}>

                            <Tooltip title="Espaciado">
                                <FormControlLabel
                                    control={<Switch checked={dense} onChange={handleChangeDense} />}
                                />
                            </Tooltip>

                            {/* Paginacion */}
                            <TablePagination
                                component="div"
                                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                                count={peticionesFiltrados.length}
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
                            sx={{ minWidth: 300 }}
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
                                    <TableRow hover
                                        tabIndex={-1}
                                        key={item.id}
                                        onClick={() => isXs ? (
                                            verPeticion(item.categoria,
                                                item.categoria === "OPERADOR" ? item.operadorId : item.id_entidad,
                                                userId === item.operadorId && item.estado !== "ACEPTADA",
                                                item.comentario !== null ? item.comentario : null,
                                                userId === item.operadorId ? (item.estado === "RECHAZADA" ? true : false) : false,
                                                item.id,
                                                item.estado === "ACEPTADA" ? true : false)) : null}>
                                        <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell align='left'>{item.estado}</TableCell>
                                        {(isXs || isSm) ? null : (
                                            <TableCell align='left'>{item.operadorName}</TableCell>
                                        )}
                                        <TableCell align='left'>{item.tipo_peticion}</TableCell>
                                        <TableCell align='left'>{item.categoria}</TableCell>
                                        {(isXs || isSm) ? null : (
                                            <TableCell align='center'>
                                                {item.pdfBase64 && (
                                                    <Tooltip title="Ver anexo">
                                                        <IconButton onClick={() => mostrarAnexo(item.pdfBase64)} color="primary">
                                                            <FileOpenIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        )}
                                        {!isXs && (
                                            <TableCell align='center'>
                                                {((item.categoria !== "ASIGNACIONES" && item.categoria !== "LISTAS") ||
                                                    (rolUsuario === 'ADMIN' ? (userId !== item.operadorId || item.estado === "ACEPTADA" || item.tipo_peticion === "DESHACER" || (item.categoria === "LISTAS" && (item.estado === "PENDIENTE" || item.comentario === null))) : (item.estado === "ACEPTADA" || (item.categoria === "LISTAS" && item.comentario === null)))) && (
                                                        <Tooltip title="Ver peticion">
                                                            <IconButton onClick={() => verPeticion(item.categoria,
                                                                item.categoria === "OPERADOR" ? item.operadorId : item.id_entidad,
                                                                true,
                                                                item.comentario !== null && userId === item.operadorId ? item.comentario : null,
                                                                userId === item.operadorId ? (item.estado === "RECHAZADA" ? true : false) : false,
                                                                item.id,
                                                                item.estado === "ACEPTADA" ? true : false
                                                            )} color="primary">
                                                                <VisibilityOutlinedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}

                                                {((item.categoria === "ASIGNACIONES" || (item.categoria === "LISTAS" && (item.estado === "RECHAZADA" && item.comentario !== null))) &&
                                                    (userId === item.operadorId && item.estado !== "ACEPTADA" && item.tipo_peticion !== "DESHACER")) && (
                                                        <Tooltip title="Actualizar">
                                                            <IconButton onClick={() => verPeticion(item.categoria,
                                                                item.categoria === "OPERADOR" ? item.operadorId : item.id_entidad,
                                                                true,
                                                                item.comentario !== null ? item.comentario : null,
                                                                userId === item.operadorId ? (item.estado === "RECHAZADA" ? true : false) : false,
                                                                item.id,
                                                                item.estado === "ACEPTADA" ? true : false)} color="primary">
                                                                <RestorePageIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                {rolUsuario === 'ADMIN' && item.estado !== "ACEPTADA" && (
                                                    <Tooltip title="Aceptar">
                                                        <IconButton onClick={() => gestionarPeticion(item.id, true, navigate)} color="primary">
                                                            <TaskAltIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {((item.categoria === "ASIGNACIONES" || item.categoria === "LISTAS") &&
                                                    (rolUsuario === 'ADMIN' && item.estado !== "ACEPTADA" && item.tipo_peticion !== "DESHACER")) && (
                                                        <Tooltip title="Rechazar">
                                                            <IconButton onClick={() => gestionarPeticion(item.id, false, navigate)} color="primary">
                                                                <HighlightOffIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                {rolUsuario === 'ADMIN' && (
                                                    <Tooltip title="Eliminar">
                                                        <IconButton onClick={() => eliminarPeticion(item.id, navigate)} color="primary">
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
                                            {error ? error : "No hay peticiones " + (filtroSeleccionado === 'ACEPTADA' ? "aceptadas" : (filtroSeleccionado === 'PENDIENTE' ? "pendientes" : "rechazadas")) + " para mostrar."}
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
                    </Typography>
                )}
            <Outlet />
        </Box >

    )
};
export default Validacion;