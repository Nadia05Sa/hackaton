import React, { useState, useEffect, use } from 'react';
import { useForm } from "react-hook-form";
import { Divider, Box, Button, Typography, InputAdornment, TextField, useTheme, useMediaQuery, IconButton, FormControl, TablePagination, Icon } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Tooltip, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';
import { AspectRatio, FormLabel, Stack, Card, Input } from '@mui/joy';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from './../../../service/authService';
import axios from 'axios';
import Swal from 'sweetalert2';

import iamaLogo from './../../../assets/fondo-iama-informes-vertical.jpg';

import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SearchIcon from '@mui/icons-material/Search';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CachedIcon from '@mui/icons-material/Cached';
import ImagenDefaul from './../../../assets/user.png';
import CircularProgress from '@mui/material/CircularProgress';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const DatosAsignacion = () => {
    const urlHost = "http://localhost:8080";
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const { idsLista, idEmpleado } = location.state || {};
    const username = authService.getUsername();

    const [ubicacionAsignacion, setUbicacionAsignacion] = useState('');

    const [listaEquipos, setListaEquipos] = useState(null);
    const [listEquiposActivos, setListEquiposActivos] = useState([]);

    const [empleado, setEmpleado] = useState(null);
    const [errorLista, setErrorLista] = useState(null);
    const [errorEmpleado, setErrorEmpleado] = useState(null);
    const [error, setError] = useState(null);
    const [usuario, setUsuario] = useState(null);

    const [busqueda, setBusqueda] = useState('');

    const [stateUpdate, setStateUpdate] = useState(false);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('no');
    const [dense, setDense] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [isLoading, setIsLoading] = useState(false);

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

    const equiposFiltrados = (stateUpdate ? listEquiposActivos : listaEquipos || []).filter((equipo) => {
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
            const indexed = equiposFiltrados.map((row, idx) => ({ row, idx }));
            sortedRows = indexed
                .sort((a, b) => getComparator(order, orderBy)(a.row, b.row, a.idx, b.idx))
                .map(({ row }) => row);
        } else {
            sortedRows = [...equiposFiltrados].sort(getComparator(order, orderBy));
        }
        return sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [order, orderBy, page, rowsPerPage, equiposFiltrados]);

    const fetchPerfil = async () => {
        try {
            const response = await axios.get(`${urlHost}/auth/buscar/${username}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                },
            });
            const resultado = response.data.userResponse.user;
            if (Array.isArray(resultado) && resultado.length > 0) {
                setUsuario(resultado[0]);
            } else {
                setUsuario(null);
            }
            setError(null);
        } catch (err) {
            setError("Error al cargar los datos. Inténtalo de nuevo.");
        }
    };

    const [nombreOperador, setNombreOperador] = useState()
    const obtenerNombre = async () => {
        fetchPerfil()
        if (usuario !== null) {
            setNombreOperador(usuario.nombre + " " + usuario.apellido_p + " " + usuario.apellido_m);
        }
    }

    const generarResponsivaPDF = (empleado, listaEquipos, ubicacionAsignacion) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });
        const nombreEmpleado = empleado.nombre + " " + empleado.apellido_p + " " + empleado.apellido_m;
        var logo = new Image();
        //Logo
        logo.src = iamaLogo;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.addImage(logo, 'JPEG', 0, 0, pageWidth, pageHeight);
        const fechaFormateada = new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        //Fecha
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(fechaFormateada, 160, 20, { align: 'left' });

        // Título
        doc.setFontSize(16);
        doc.text('RESPONSIVA DE EQUIPO', 105, 35, { align: 'center' });

        // Subtítulo
        doc.setFontSize(11);
        doc.text(`Sirva éste como comprobante de entrega del equipo que se detalla a continuación:`, 30, 45, { maxWidth: 150, align: 'justify' });


        // Tabla de equipos
        const dataEquipos = listaEquipos.map(eq => [
            eq.tipo,
            eq.marca,
            eq.modelo,
            eq.numero_serie
        ]);
        autoTable(doc, {
            theme: 'striped',
            halign: 'center',
            margin: { top: 40, right: 130, bottom: 0, left: 30 },
            startY: 50,
            head: [['Equipo', 'Marca', 'Modelo', 'No. Serie']],
            body: dataEquipos,
            columnStyles: {
                0: { cellWidth: 35 }, // Equipo
                1: { cellWidth: 35 }, // Marca
                2: { cellWidth: 40 }, // Modelo
                3: { cellWidth: 40 }, // No. Serie
            },
            // Opcional: para que el texto haga salto de línea si es muy largo
            styles: {
                cellWidth: 'wrap',
                fontSize: 10,
            },
        });

        // Usa la posición final de la tabla para colocar el texto debajo
        let y = doc.lastAutoTable.finalY + 10;

        doc.text(`El cual pertenece a la empresa Ingeniería del Agua y Medio Ambiente S.C. y se asigna a ${nombreEmpleado} a partir del ${fechaFormateada} en buenas condiciones para el mejor desarrollo de sus funciones en el área de ${empleado.departamento}, en ${ubicacionAsignacion} quien se compromete a resguardarlo y darle un uso estrictamente laboral.`, 30, y, { maxWidth: 150, align: 'justify' });

        doc.text(`Asimismo, hacemos de su conocimiento que no podrá modificar la configuración del equipo ni instalar software sin ser previamente autorizado por el área de sistemas.`, 30, y + 25, { maxWidth: 150, align: 'justify' })

        doc.text(`Sin más por el momento, quedo a sus órdenes.`, 30, y + 40, { align: 'justify' })

        let yText = doc.text.finalY > 200 ? (doc.text.finalY + 5) : 205
        let operadorNombre = usuario ? `${usuario.nombre} ${usuario.apellido_p} ${usuario.apellido_m}` : 'Nombre';

        // Pie
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('ATENTAMENTE', 105, yText, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        // Coordenadas para firma (centradas en la página)
        const otorganteX = 55;
        const receptorX = 155;
        const lineaY = yText + 45;
        const nombreY = lineaY + 5;
        const labelY = yText + 30;

        // Firmas
        doc.setFontSize(11);
        doc.text('OTORGANTE', otorganteX, labelY - 10, { align: 'center' });
        doc.text('RECEPTOR', receptorX, labelY - 10, { align: 'center' });

        doc.text('________________________', otorganteX, lineaY, { align: 'center' });
        doc.text('________________________', receptorX, lineaY, { align: 'center' });

        doc.text(operadorNombre, otorganteX, nombreY + 5, { align: 'center' });
        doc.text(`${empleado.nombre} ${empleado.apellido_p} ${empleado.apellido_m}`, receptorX, nombreY + 5, { align: 'center' });

        return doc.output('blob'); // Devuelve como Blob para adjuntarlo
    };

    const handleCrearListaEquipos = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            const idsActualizados = listaEquipos.map(e => e.id);
            formData.append("id", new Blob([JSON.stringify(idsActualizados)], { type: "application/json" }));

            formData.append("file", new Blob([], { type: "application/octet-stream" }));

            const response = await axios.post(`${urlHost}/api/equipos/ASIGNACION`, formData, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                let idListaCreada = response.data.listaEquipoResponse.listaEquipos[0].id;

                try {
                    const dataEquipo = {
                        listaEquipos: { id: idListaCreada },
                        empleado: { id: idEmpleado },
                        ubicacion: ubicacionAsignacion
                    };

                    const formData = new FormData();
                    formData.append("asignacion", new Blob(
                        [JSON.stringify(dataEquipo)], { type: "application/json" }
                    ));

                    const now = new Date();
                    const fechaHora = now.getFullYear() +
                        '-' + String(now.getMonth() + 1).padStart(2, '0') +
                        '-' + String(now.getDate()).padStart(2, '0') +
                        '_' + String(now.getHours()).padStart(2, '0') +
                        '-' + String(now.getMinutes()).padStart(2, '0') +
                        '-' + String(now.getSeconds()).padStart(2, '0');

                    const pdfFileName = `responsiva_${empleado.nombre}_${fechaHora}.pdf`;
                    await fetchPerfil(); // antes de generar PDF
                    const pdfBlob = generarResponsivaPDF(empleado, listaEquipos, ubicacionAsignacion);
                    formData.append("file", pdfBlob, pdfFileName);

                    const response = await axios.post(`${urlHost}/api/asignacion`, formData, {
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
                        });
                        navigate(-3);
                    } else {
                    }
                } catch (err) {
                    await axios.delete(`${urlHost}/api/listasEquipos/${idListaCreada}`, {
                        headers: {
                            'Authorization': `Bearer ${authService.getToken()}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    Swal.fire('Error', err?.response?.data?.metadata?.[0]?.date || 'Error al asignar equipo.', 'warning');
                }
            }
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.metadata?.[0]?.date || 'Error al crear la lista de equipos.',
                icon: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmpleado = async () => {
        try {
            const response = await axios.get(`${urlHost}/api/empleado/${idEmpleado}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json'
                },
            });


            const empleadoArr = response.data?.empleadoResponse?.empleado;
            setEmpleado(empleadoArr?.length > 0 ? empleadoArr[0] : null);
        } catch (err) {
            setErrorEmpleado("Error al cargar los datos del empleado.");
        }
    };

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

            // Separar por ID
            const equiposSeleccionados = allEquipos.filter(eq => idsLista.includes(eq.id));
            const equiposDisponibles = allEquipos.filter(eq => !idsLista.includes(eq.id));

            setListaEquipos(equiposSeleccionados);
            setListEquiposActivos(equiposDisponibles);
            setError(null);
        } catch (err) {
            setError("Error al cargar los datos. Inténtalo de nuevo.");
        }
    };

    useEffect(() => {
        if (idsLista && idEmpleado) {
            fetchEmpleado();
            fetchEquipos();
            fetchPerfil();
        }
    }, [idsLista, idEmpleado]);

    const handleSeleccionarEquipo = (equipo) => {
        if (listaEquipos.includes(equipo)) {
            setListaEquipos(listaEquipos.filter((e) => e !== equipo));
            setListEquiposActivos([...listEquiposActivos, equipo]);
        } else {
            setListEquiposActivos(listEquiposActivos.filter((e) => e !== equipo));
            setListaEquipos([...listaEquipos, equipo]);
        }
    };

    const Resetear = () => {
        fetchEquipos();
    }

    return (
        <Box className="mt-3">
            <h1 className="page-title" style={{ paddingLeft: isXs ? 0 : "3rem", textAlign: isXs ? 'center' : 'left' }}>Datos de la asignación</h1>
            <Divider variant="middle" sx={{ borderBottomWidth: 2, borderColor: 'black', mb: 4 }} />

            {/* Datos del empleado */}

            <Typography variant="h6" sx={{ marginLeft: isSm || isXs ? '0' : '3rem', textAlign: isSm || isXs ? 'center' : 'left' }}>
                Datos del empleado
            </Typography>
            {empleado !== null ? (
                <Box sx={{ px: { xs: 0, md: 6 } }}>
                    <Stack direction="row"
                        sx={{
                            display: 'flex',
                            maxWidth: '100%',
                            border: 'none',
                        }}
                    >
                        <Card sx={{
                            p: isXs ? 0 : 3,
                            py: isXs ? 2 : 3,
                            flex: 1,
                            border: 'none',
                            background: '#fff',
                        }}
                        >
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={3}
                                alignItems={'center'}
                                justifyContent={'center'}
                            >
                                <Box sx={{ position: 'relative', width: '10rem', flexShrink: 0 }}>
                                    <AspectRatio ratio="1" sx={{ borderRadius: '50%' }}>
                                        <img
                                            src={(empleado.fotoBase64 !== null && `data:image/png;base64,${empleado.fotoBase64}`) || ImagenDefaul}
                                            alt="Foto de perfil"
                                        />
                                    </AspectRatio>
                                </Box>

                                <Stack sx={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(auto-fit, minmax(${isXs ? "100%" : "30%"}, 1fr))`,
                                    gap: 2, width: isXs || isSm ? '100%' : '85%'
                                }}>
                                    <FormControl>
                                        <FormLabel>Nombre</FormLabel>
                                        <Input size="sm" value={empleado.nombre || ''} disabled />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Apellido Paterno</FormLabel>
                                        <Input size="sm" value={empleado.apellido_p || ''} disabled />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Apellido Materno</FormLabel>
                                        <Input size="sm" value={empleado.apellido_m || ''} disabled />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Puesto</FormLabel>
                                        <Input size="sm" value={empleado.puesto || ''} disabled />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Departamento</FormLabel>
                                        <Input size="sm" value={empleado.departamento || ''} disabled />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Teléfono</FormLabel>
                                        <Input size="sm" value={empleado.telefono || ''} disabled />
                                    </FormControl>
                                </Stack>
                            </Stack>
                        </Card>
                    </Stack>
                </Box>
            ) : (
                <Box>
                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                        {errorEmpleado || "Cargando información..."}
                        {errorEmpleado === null && <CircularProgress />}
                        {errorEmpleado && " Por favor, intenta recargar la página."}
                    </Typography>
                </Box>
            )}

            {/* Ubicación */}

            <Typography variant="h6" sx={{ marginLeft: isSm || isXs ? '0' : '3rem', textAlign: isSm || isXs ? 'center' : 'left' }}>
                Datos de la asignacion
            </Typography>
            <Box sx={{ px: { xs: 0, md: 6 } }}>
                <Card sx={{
                    p: isXs ? 0 : 3,
                    py: isXs ? 2 : 3,
                    flex: 1,
                    border: 'none',
                    background: '#fff',
                }}
                >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <FormControl fullWidth>
                            <FormLabel>Ubicación</FormLabel>
                            <Input
                                size="sm"
                                placeholder="Ej. Oficina 3er piso"
                                value={ubicacionAsignacion}
                                onChange={(e) => setUbicacionAsignacion(e.target.value)}
                            />
                        </FormControl>

                        <FormControl fullWidth>
                            <FormLabel>Fecha de registro</FormLabel>
                            <Input
                                size="sm"
                                value={new Date().toLocaleDateString()}
                                endDecorator={<LockRoundedIcon />}
                                disabled
                            />
                        </FormControl>
                    </Stack>
                </Card>
            </Box>

            {/* Equipos */}
            <Box sx={{
                display: isXs ? 'block' : 'flex', justifyContent: isXs ? 'center' : 'space-between', paddingRight: isXs ? 0 : 3,
            }}>
                <Typography variant="h6" sx={{ marginLeft: isSm || isXs ? '0' : '3rem', textAlign: isSm || isXs ? 'center' : 'left' }}>
                    Lista de equipos
                </Typography>

                {/* Buscador */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        px: { xs: 0, sm: 2, md: 3 },
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Buscar equipo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        sx={{
                            minWidth: 280,
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

                {/* Opciones */}
                <Box className="botones-superiores" sx={{ mr: isXs || isSm ? 0 : "3rem", display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isXs || isSm ? 'center' : 'flex-start' }}>
                    <Tooltip title={"Resetear lista"}>
                        <Button variant="outlined" onClick={() => Resetear()}>
                            <CachedIcon />
                        </Button>
                    </Tooltip>
                    <Button variant="outlined" onClick={() => setStateUpdate(!stateUpdate)}>
                        {stateUpdate ? 'Ver Seleccionados' : 'Ver Activos'}
                    </Button>
                </Box>

            </Box>


            {/* Tabla de equipos */}
            {(stateUpdate ? (listEquiposActivos.length >= 0) : (listaEquipos && listaEquipos.length >= 0)) ? (
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
                                count={stateUpdate ? listEquiposActivos.length : listaEquipos.length}
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

            {/* Botones */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { xs: 2, md: 6 }, mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mx: 1 }} disabled={isLoading}>
                    Regresar
                </Button>
                <Button variant="contained" onClick={handleCrearListaEquipos} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Aceptar'}
                </Button>
            </Box>
        </Box>
    );
};

export default DatosAsignacion;
