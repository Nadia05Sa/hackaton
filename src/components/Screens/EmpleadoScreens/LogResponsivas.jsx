import React, { useState, useEffect } from 'react';
import { Divider, Box, Button, InputAdornment, TextField, useTheme, useMediaQuery, IconButton, TablePagination } from '@mui/material';

import { Card, CardContent, Typography } from '@mui/joy';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

import SearchIcon from '@mui/icons-material/Search';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';

import { authService } from './../../../service/authService'

const headCells = [
    { id: 'no', numeric: true, center: true, disablePadding: false, label: 'No.' },
    { id: 'estado', numeric: false, center: false, disablePadding: false, label: 'Estado' },
    { id: 'fecha', numeric: false, center: false, disablePadding: false, label: 'Fecha' },
    { id: 'opciones', numeric: true, center: true, disablePadding: false, label: 'Opciones' },
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
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
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
                ))}
            </TableRow>
        </TableHead>
    );
}

const LogResponsivas = () => {
    const urlHost = "http://localhost:8080";
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = location.state || {};

    const [listResponsivas, setListResponsivas] = useState([]);
    const [nombreEmpleado, setNombreEmpleado] = useState("")
    const [error, setError] = useState(null);

    const [busqueda, setBusqueda] = useState('');

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

    const visibleRows = React.useMemo(() => {
        let sortedRows;
        if (orderBy === 'no') {
            // Ordena por el índice original
            const indexed = listResponsivas.map((row, idx) => ({ row, idx }));
            sortedRows = indexed
                .sort((a, b) => getComparator(order, orderBy)(a.row, b.row, a.idx, b.idx))
                .map(({ row }) => row);
        } else {
            sortedRows = [...listResponsivas].sort(getComparator(order, orderBy));
        }
        return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [order, orderBy, page, rowsPerPage, listResponsivas]);

    const fetchEmpleado = async () => {
        try {
            const response = await axios.get(`${urlHost}/api/empleado/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authService.getToken}`,
                        'Content-Type': 'application/json'
                    },
                }
            );
            setListResponsivas(Array.isArray(response.data.empleadoResponse.empleado) ? response.data.empleadoResponse.empleado[0].responsiva : []);
            setNombreEmpleado(response.data.empleadoResponse.empleado ? response.data.empleadoResponse.empleado[0].nombre : []);

            setError(null);
        } catch (err) {
            setError("Error al cargar los datos. Inténtalo de nuevo.");
        }
    };

    useEffect(() => {
        fetchEmpleado();
    }, [rowsPerPage, page, busqueda]);

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

    return (
        <Box className="mt-3">
            <Box sx={{ display: 'flex', justifyContent: isXs ? 'center' : 'space-between', alignItems: 'center', mb: isXs ? 2 : 0, flexWrap: 'wrap', gap: 2, }}>
                <h3 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>{"Responsivas de " + nombreEmpleado}</h3>
                <Box className="botones-superiores" sx={{ paddingRight: isXs || isSm ? 0 : "3rem", display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isXs || isSm ? 'center' : 'flex-start' }}>
                    <Button variant="outlined" onClick={() => navigate(-1)} sx={{}}>Regresar</Button>
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

            {/* Tabla de Empleados */}
            {listResponsivas.length > 0 ? (
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
                                count={listResponsivas.length}
                                page={page}
                                getItemAriaLabel={(count) => (`Pagina ${count === 'next' ? 'Siguiente' : 'Anterior'}`)}
                                onPageChange={handleChangePage}
                                rowsPerPageOptions={[6, 12, 18, 24]}
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
                            />

                            {/* Datos */}

                            <TableBody>
                                {visibleRows.map((item, index) => (
                                    <TableRow hover tabIndex={-1} key={item.id}>
                                        <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell align='left'>{item.estado ? "Activa" : "Inactiva"}</TableCell>
                                        <TableCell align='left'>{item.fecha_registro ? new Date(item.fecha_registro).toLocaleDateString() : ''}</TableCell>
                                        <TableCell align='center'>
                                            <Tooltip title="Responsiva">
                                                <IconButton onClick={() => mostrarAnexo(item.pdfBase64)} color="primary">
                                                    <FileOpenIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {visibleRows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            {error ? error : "No hay responsivas para mostrar."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                    {error ? error : "Cargando información..."}
                    {error === null && <CircularProgress />}
                    {error && " Por favor, intenta recargar la página."}
                </Typography>
            )}
        </Box>
    )
}
export default LogResponsivas;