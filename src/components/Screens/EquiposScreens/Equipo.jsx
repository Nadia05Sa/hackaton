import React, { useState, useEffect, use } from 'react';
import { Divider, Box, MenuItem, Menu, Button, InputAdornment, TextField, useTheme, useMediaQuery, CardMedia, CardActionArea, IconButton, TablePagination } from '@mui/material';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

import { Card, CardContent, Typography } from '@mui/joy';

import SearchIcon from '@mui/icons-material/Search';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import { authService } from './../../../service/authService';

import AgregarEquipo from './AgregarEquipo';
import DatosEquipos from './DatosEquipo';
import imagenDefaul from './../../../assets/imagenDefaul.png';
import iamaLogo from './../../../assets/iamaLogo.png';
import iamaFondo from './../../../assets/fondo-iama-informes-vertical.jpg';


const filtros = ['Activos', 'Asignados', 'Pendientes'];

const headCells = [
    { id: 'no', numeric: true, center: true, xs: true, disablePadding: false, label: 'No.' },
    { id: 'tipo', numeric: false, center: false, xs: true, disablePadding: false, label: 'Tipo' },
    { id: 'no.serie', numeric: false, center: false, xs: false, disablePadding: false, label: 'No. Serie' },
    { id: 'marca', numeric: false, center: false, xs: false, disablePadding: false, label: 'Marca' },
    { id: 'modelo', numeric: false, center: false, xs: true, disablePadding: false, label: 'No. Modelo' },
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

                    ((Xs && headCell.xs) ? null :
                        <TableCell
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

const Equipo = () => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const navigate = useNavigate();

    const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [contenido, setContenido] = useState(true);

    const [listEquipos, setListEquipos] = useState([]);

    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(6);

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('no');
    const [dense, setDense] = useState(false);


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

    const equiposFiltrados = listEquipos.filter((equipo) => {
        let estado = filtroSeleccionado !== null ? (filtroSeleccionado === "Activos" ? "ACTIVO" : filtroSeleccionado === "Asignados" ? "ASIGNADO" : "PENDIENTE") : null;
        const coincideFiltro = estado !== null
            ? (estado === equipo.estado)
            : true;

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
        return (coincideBusqueda && coincideFiltro);
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

    const conteo = {};
    const contarPorTipo = () => {
        equiposFiltrados.forEach(equipo => {
            if (equipo.tipo) {
                conteo[equipo.tipo] = (conteo[equipo.tipo] || 0) + 1;
            }
        });
        return conteo;
    };

    const conteoTipos = contarPorTipo();

    const pdf = () => {
        if (equiposFiltrados <= 0) {
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
            var logo = new Image();
            //Logo
            logo.src = iamaFondo;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.addImage(logo, 'JPEG', 0, 0, pageWidth, pageHeight);
            doc.setFontSize(12);
            doc.text(new Date().toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric'
            }), 160, 20, { align: 'left' });

            // Título
            doc.setFontSize(16);
            doc.text('Informe sobre equipos ' + (filtroSeleccionado ? filtroSeleccionado : ''), 105, 30, { align: 'center' });

            // Tabla de operadores
            const dataEquipos = equiposFiltrados.map(op => [
                op.tipo,
                op.marca,
                op.modelo,
                op.numero_serie,
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['Tipo', 'No.Serie', 'Marca', 'Modelo']],
                body: dataEquipos,
            });

            const pdfFileName = 'Informe de Equipos';
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

    const agregarEquipo = () => {
        navigate('agregarEquipo', { state: { titulo: 'Agregar Equipo' } })

    }

    const verEquipo = (id) => {
        navigate('consultarEquipo', { state: { id: id, titulo: 'Datos Equipo' } })

    };

    const gestionarEquipos = () => {
        navigate('gestionar');

    }

    useEffect(() => {
        const cargarEquipos = async () => {
            const result = await authService.fetchEquipos();

            if (result.success) {
                setListEquipos(result.data);
                setError(null);
            } else {
                setError(result.message);
            }
        };

        cargarEquipos();
    }, [location.pathname, error]);

    if (location.pathname.includes('gestionar')) {
        return <Outlet />;
    }
    if (['agregarEquipo', 'consultarEquipo', 'gestionar']
        .some(ruta => location.pathname.includes(ruta))) {
        return <Outlet />;
    }

    return (
        <Box className="mt-3">
            <Box sx={{ display: 'flex', justifyContent: isXs ? 'center' : 'space-between', mb: isXs ? 2 : 0, alignItems: 'center', flexWrap: 'wrap', gap: 2, }}>
                <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>Equipos</h1>
                <Box className="botones-superiores" sx={{ paddingRight: isXs || isSm ? 0 : "3rem", display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: isXs || isSm ? 'center' : 'flex-end' }}>
                    <Button variant="contained" onClick={pdf}>Informe</Button>
                    <Button variant="contained" onClick={gestionarEquipos}>Gestionar</Button>
                    <Button variant="contained" onClick={agregarEquipo}>Agregar</Button>
                </Box>
            </Box>
            <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black', marginBottom: 3 }} />

            <Box sx={{ my: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {Object.entries(conteoTipos).map(([tipo, cantidad]) => (
                    <Typography key={tipo} variant="body2" sx={{ mr: 2 }}>
                        {tipo}: {cantidad}
                    </Typography>
                ))}
            </Box>

            <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black', marginBottom: 3 }} />

            {/* Buscador y Filtros */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    px: { xs: 1, sm: 2, md: 3 },
                    marginBottom: 2,
                }}
            >
                <TextField
                    size="small"
                    placeholder="Buscar equipo..."
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

                <Tooltip title={contenido ? "Tarjetas" : "Tabla"}>
                    <IconButton onClick={() => setContenido(!contenido)} sx={{ border: '1px solid rgb(145, 145, 145)', borderRadius: '50%' }} color="primary">
                        {contenido ? <GridViewIcon /> : <FormatListBulletedIcon />}
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Cards de equipos */}
            {listEquipos.length > 0 ? (
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
                                count={filtroSeleccionado !== null ? visibleRows.length : listEquipos.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPageOptions={[6, 12, 18, 24]}
                                getItemAriaLabel={(count) => (`Pagina ${count === 'next' ? 'Siguiente' : 'Anterior'}`)}
                                labelRowsPerPage="Filas"
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ padding: 0 }}
                            />
                        </Box>
                        {contenido ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: isXs ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
                                    gap: 2,
                                    justifyItems: 'center',
                                    width: '100%',
                                    marginTop: 3
                                }}>
                                    {visibleRows.map((item, index) => (
                                        <Tooltip title="Ver Equipo" arrow>

                                            <Card sx={{ width: isXs ? "80%" : 320 }} key={item.id}>
                                                <CardActionArea onClick={() => verEquipo(item.id)} sx={{ bgcolor: "#41514D", borderRadius: 5 }}>
                                                    <CardContent>
                                                        <Box sx={{ bgcolor: '#000', color: '#fff', p: 1, textAlign: 'center', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>
                                                                {item.tipo}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginY: 2 }}>
                                                            <Box sx={{ paddingX: 2 }}>
                                                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                                                    <b> Marca:</b> <br />{item.marca}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                                                    <b> Modelo: </b> <br />{item.modelo}
                                                                </Typography>
                                                            </Box>

                                                            <CardMedia
                                                                component="img"
                                                                height="140"
                                                                image={(item.fotoBase64 !== null && `data:image/png;base64,${item.fotoBase64}`) || imagenDefaul}
                                                                alt={item.tipo}
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
                                                            <Box sx={{ bgcolor: item.estado === "ACTIVO" ? '#78B82A' : (item.estado === "PENDIENTE" ? '#FFD700' : (item.estado === "ASIGNADO" ? '#4C7196' : "#FFF")), width: '60%', textAlign: 'center', borderBottomRightRadius: 10 }}>
                                                                <Typography
                                                                    variant="h6"
                                                                    sx={{
                                                                        fontWeight: 'bold',
                                                                        color: item.estado === "PENDIENTE" ? '#000' : '#fff'
                                                                    }}
                                                                >
                                                                    {item.estado}
                                                                </Typography>
                                                            </Box>

                                                        </Box>

                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Tooltip>

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
                                        <TableRow hover tabIndex={-1} key={item.id} onClick={() => isXs ? verEquipo(item.id) : null}>
                                            <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell align='left'>{item.tipo}</TableCell>
                                            {!isXs &&
                                                <TableCell align='left'>{item.numero_serie}</TableCell>
                                            }
                                            {!isXs &&
                                                <TableCell align='left'>{item.marca}</TableCell>
                                            }

                                            <TableCell align='left'>{item.modelo}</TableCell>

                                            {!isXs &&
                                                <TableCell align='center'>
                                                    <Tooltip title='Ver equipo'>
                                                        <IconButton onClick={() => verEquipo(item.id)} color="primary">
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
                                                {error ? error : "No hay equipos para mostrar."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}


                    </TableContainer>
                </Box>)
                : (
                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                        {error ? error : "Cargando información..."}
                        {error === null && <CircularProgress />}
                        {error && " Por favor, intenta recargar la página."}
                    </Typography>
                )}

            <Outlet />
        </Box>
    );
};
export default Equipo;